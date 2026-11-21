#!/usr/bin/env python3
"""Assemble dialogue for a range of script lines from the long takes, using word timings.
usage: build_full.py <first line> <last line> <name>
Writes audio/<name>-voice.wav and <name>-tl.js (line and word times for the picture)."""
import json, os, re, subprocess, sys, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); A = HERE + '/audio/full/'
L = json.load(open(HERE + '/lines.json'))
TAKE = lambda l: {'N': 'n0' if l['i'] < 21 else 'n1' if l['i'] < 43 else 'n2', 'F': 'f', 'L': 'l', 'D': 'd', 'O': 'o'}[l['who']]
# pause after a line (seconds); extra beats where the picture needs room
GAP = {0: .15, 6: 2.9, 7: .3, 8: 2.3, 9: .35, 14: .5, 20: .3, 21: .5, 32: 1.7, 37: 2.2, 42: .4, 46: .25, 47: .4, 53: .35, 58: .5, 60: .6, 61: .5, 64: 1.0, 65: 1.3}
SPEED = {'N': 1.10, 'F': 1.15, 'L': 1.0, 'D': 1.08, 'O': 1.08}   # tempo lift per voice (pitch kept)
wav, words = {}, {}
def load(take):
    if take in wav: return
    p = A + take + '.mp3'
    if not os.path.exists(p): wav[take] = None; return
    sp = SPEED[{'n': 'N', 'f': 'F', 'l': 'L', 'd': 'D', 'o': 'O'}[take[0]]]
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', p, '-af', f'atempo={sp}', '-ac', '1', '-ar', str(SR), A + take + '.wav'], check=True)
    w = wave.open(A + take + '.wav'); wav[take] = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    wp = A + take + '.words.json'
    words[take] = [dict(x, start=x['start'] / sp, end=x['end'] / sp) for x in json.load(open(wp))['words'] if x['type'] == 'word'] if os.path.exists(wp) else None
ptr = {}
def span(l):
    """word list for this line within its take (tags in [brackets] skipped)"""
    take = TAKE(l); ws = words[take]; k = ptr.get(take, 0); n = len(l['say'].replace('...', ' ').split()); out = []; inb = False
    while len(out) < n and k < len(ws):
        t = ws[k]['text']
        if t.startswith('['): inb = not t.endswith(']')
        elif inb: inb = not t.endswith(']')
        else: out.append(ws[k])
        k += 1
    ptr[take] = k; return out
for l in L:  # walk every line so pointers stay in step
    load(TAKE(l)); l['w'] = span(l) if wav[TAKE(l)] is not None and words.get(TAKE(l)) else None
a, b, name = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
t = 1.25; clips = []; tl = []
for l in L[a:b + 1]:
    if l['w']:
        take = TAKE(l); ws = words[take]; i0 = ws.index(l['w'][0]); i1 = ws.index(l['w'][-1])
        prev = max([w['end'] for w in ws[:i0] if not w['text'].startswith('[')] or [0]); nxt = ws[i1 + 1]['start'] if i1 + 1 < len(ws) else len(wav[take]) / SR
        s0 = max(prev + .02, l['w'][0]['start'] - .09) if prev < l['w'][0]['start'] - .04 else max(0, l['w'][0]['start'] - .01)
        s1 = min(l['w'][-1]['end'] + .16, max(l['w'][-1]['end'] + .03, nxt - .03))
        x = wav[take][int(s0 * SR):int(s1 * SR)].copy(); f = int(.012 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        x *= .11 / np.sqrt(np.mean(x ** 2) + 1e-9)
        clips.append((t, x)); wl = [[round(t + w['start'] - s0, 3), round(t + w['end'] - s0, 3), w['text']] for w in l['w']]; d = len(x) / SR
    else:  # voice not recorded yet: hold a silent slot
        n = len(l['say'].split()); d = .4 + n * .24; wl = [[round(t + .15 + k * .24, 3), round(t + .15 + k * .24 + .18, 3), w] for k, w in enumerate(l['say'].split())]
    tl.append({'i': l['i'], 'who': l['who'], 't0': round(t, 3), 't1': round(t + d, 3), 'w': wl, 'silent': not l['w']})
    t += d + GAP.get(l['i'], .14)
DUR = round(t + 1.5, 2); N = int(DUR * SR); v = np.zeros(N)
for t0, x in clips: i = int(t0 * SR); v[i:i + len(x)] += x[:N - i]
w = wave.open(f'{HERE}/audio/{name}-voice.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(v * 2.6, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
open(f'{HERE}/{name}-tl.js', 'w').write('window.TL=' + json.dumps({'DUR': DUR, 'lines': tl}) + ';\n')
for x in tl: print(x['i'], x['who'], x['t0'], x['t1'], 'SILENT' if x['silent'] else '', ' '.join(w[2] for w in x['w'])[:60])
print('DUR', DUR)
