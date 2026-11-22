#!/usr/bin/env python3
"""Mix for the cold-open sampler: narration, score, atmosphere and effects placed from the picture's cue list."""
import json, os, subprocess, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.loads(open(HERE + '/film-tl.js').read()[len('window.TL='):-2]); DUR = TL['DUR']; N = int(DUR * SR); W = TL['w']; CH = {c['i']: c for c in TL['ch']}
norm = lambda s: ''.join(c for c in s.lower() if c.isalnum() or c in "'-")
def wt(ch, word, nth=0):
    W0 = [w for w in W if w[3] == ch]; m = [w for w in W0 if norm(w[2]) == norm(word)] or [w for w in W0 if norm(w[2]).startswith(norm(word))]; return m[min(nth, len(m) - 1)][0]
def dec(path, trim=True, tempo=1):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-af', f'atempo={tempo}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    if trim: e = np.abs(x) > .02 * np.abs(x).max(); i = np.argmax(e); j = len(x) - np.argmax(e[::-1]); x = x[max(0, i - 200):j]
    return x / (np.abs(x).max() + 1e-9)
def put(buf, t0, x, g):
    i = max(0, int(t0 * SR)); x = x[:len(buf) - i]; buf[i:i + len(x)] += x * g
def fade(x, a=.05, b=.2):
    x = x.copy(); n = int(a * SR); m = int(b * SR); x[:n] *= np.linspace(0, 1, n); x[-m:] *= np.linspace(1, 0, m); return x
S = {k: dec(f'{HERE}/audio/sfx/{k}.mp3') for k in ['hatch', 'drips', 'hit', 'riser', 'ticker', 'paper', 'slap', 'typewriter', 'whoosh', 'stamp']}
voice = np.zeros(N)
for c in TL['ch']:
    v = dec(f"{HERE}/audio/full/ch{c['i']}.mp3", trim=False, tempo=c.get('sp', 1)); v *= .13 / np.sqrt(np.mean(v ** 2)); put(voice, c['t0'], v, 2.4)
sfx = np.zeros(N); last = {}
MAP = {'hatch': ('hatch', .5), 'drips': ('drips', .55), 'hit': ('hit', .75), 'riser': ('riser', .4), 'ticker': ('ticker', .3), 'paper': ('paper', .45), 'type': ('paper', .12), 'tick': ('paper', .10), 'slap': ('slap', .6), 'typewriter': ('typewriter', .3), 'whoosh': ('whoosh', .4), 'stamp': ('stamp', .6)}
for c in sorted(json.load(open(HERE + '/cues.json'))['cues'], key=lambda s: float(s.split('@')[1])):
    k, t0 = c.split('@')[0], float(c.split('@')[1]); smp, gain = MAP[k]
    if t0 - last.get(k, -9) < .12: continue
    last[k] = t0; put(sfx, t0, fade(S[smp], .005, .15), gain)
# atmosphere: the harbour under the two night scenes and the ending
h = dec(HERE + '/audio/sfx/harbour.mp3', trim=False); amb = np.zeros(N + len(h)); xf = int(.8 * SR); pos = 0
while pos < N: seg = h.copy(); seg[:xf] *= np.linspace(0, 1, xf); seg[-xf:] *= np.linspace(1, 0, xf); amb[pos:pos + len(seg)] += seg; pos += len(h) - xf
amb = amb[:N]; tt = np.arange(N) / SR; ag = np.zeros(N)
for a, b in [(0, wt(0, 'Oil') - .2), (wt(0, 'In', 1) - .5, wt(0, 'Forty') - .3), (wt(0, 'This', 1) - .4, CH[0]['t1'] + 3), (wt(1, 'After') - .4, wt(1, 'In', 3) - .4), (wt(1, 'Two', 1) - .4, DUR)]: ag[(tt >= a) & (tt < b)] = 1
k = int(.8 * SR); ag = np.convolve(ag, np.ones(k) / k, 'same'); amb *= ag * .22
# score: ducked under the voice, cut to silence while the line goes down, back on "water"
m = dec(HERE + '/audio/music-open.mp3', trim=False); music = np.zeros(N + len(m))
music[:len(m)] += m   # cold open cue
m1 = dec(HERE + '/audio/music-ch1.mp3', trim=False); pos = int((CH[1]['t0'] - 1.2) * SR); m1 = m1[:len(music) - pos]; music[pos:pos + len(m1)] += m1 * 1.05   # chapter 1: the driving case-file cue
music = music[:N]; gate = np.ones(N); gate[(tt > wt(0, 'drained') + .3) & (tt < wt(0, 'Forty') - .05)] = .05; gate[(tt > CH[0]['t1'] + 3.2) & (tt < CH[1]['t0'] - 1.2)] = 0; gate[(tt > wt(1, 'exist') + .1) & (tt < wt(1, 'Two', 1) - 1.2)] = .12; k = int(.3 * SR); gate = np.convolve(gate, np.ones(k) / k, 'same')
e = np.sqrt(np.convolve(voice ** 2, np.ones(int(.3 * SR)) / int(.3 * SR), 'same')); music *= gate * (1 - .5 * np.clip(e / .12, 0, 1)) * .46 * np.clip(tt / 1.5, 0, 1) * np.clip((DUR - tt) / 2.5, 0, 1)
mix = np.tanh((voice + sfx + amb + music) * 1.1) / 1.1; print('peak', round(float(np.abs(mix).max()), 3))
o = wave.open(HERE + '/audio/film-mix.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', HERE + '/audio/film-mix.wav', '-af', 'alimiter=limit=0.89', '-ac', '2', '-c:a', 'aac', '-b:a', '192k', HERE + '/audio/film-mix.m4a'], check=True)
