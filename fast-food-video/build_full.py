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
GAP = {0: .3, 6: 3.4, 7: .5, 8: 3.0, 9: .6, 14: .8}
wav, words = {}, {}
def load(take):
    if take in wav: return
    p = A + take + '.mp3'
    if not os.path.exists(p): wav[take] = None; return
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', p, '-ac', '1', '-ar', str(SR), A + take + '.wav'], check=True)
    w = wave.open(A + take + '.wav'); wav[take] = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    wp = A + take + '.words.json'
    words[take] = [x for x in json.load(open(wp))['words'] if x['type'] == 'word'] if os.path.exists(wp) else None
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
t = 1.9; clips = []; tl = []
for l in L[a:b + 1]:
    if l['w']:
        take = TAKE(l); ws = words[take]; i0 = ws.index(l['w'][0]); i1 = ws.index(l['w'][-1])
        prev = max([w['end'] for w in ws[:i0] if not w['text'].startswith('[')] or [0]); nxt = ws[i1 + 1]['start'] if i1 + 1 < len(ws) else len(wav[take]) / SR
        s0 = max(prev + .02, l['w'][0]['start'] - .09) if prev < l['w'][0]['start'] - .04 else max(0, l['w'][0]['start'] - .01)
        s1 = min(l['w'][-1]['end'] + .22, max(l['w'][-1]['end'] + .03, nxt - .03))
        x = wav[take][int(s0 * SR):int(s1 * SR)].copy(); f = int(.012 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        x *= .11 / np.sqrt(np.mean(x ** 2) + 1e-9)
        clips.append((t, x)); wl = [[round(t + w['start'] - s0, 3), round(t + w['end'] - s0, 3), w['text']] for w in l['w']]; d = len(x) / SR
    else:  # voice not recorded yet: hold a silent slot
        n = len(l['say'].split()); d = .5 + n * .3; wl = [[round(t + .2 + k * .3, 3), round(t + .2 + k * .3 + .22, 3), w] for k, w in enumerate(l['say'].split())]
    tl.append({'i': l['i'], 'who': l['who'], 't0': round(t, 3), 't1': round(t + d, 3), 'w': wl, 'silent': not l['w']})
    t += d + GAP.get(l['i'], .32)
DUR = round(t + 1.5, 2); N = int(DUR * SR); v = np.zeros(N)
for t0, x in clips: i = int(t0 * SR); v[i:i + len(x)] += x[:N - i]
w = wave.open(f'{HERE}/audio/{name}-voice.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(v * 2.6, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
open(f'{HERE}/{name}-tl.js', 'w').write('window.TL=' + json.dumps({'DUR': DUR, 'lines': tl}) + ';\n')
for x in tl: print(x['i'], x['who'], x['t0'], x['t1'], 'SILENT' if x['silent'] else '', ' '.join(w[2] for w in x['w'])[:60])
print('DUR', DUR)
