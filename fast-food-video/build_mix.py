#!/usr/bin/env python3
"""Mix voice, synthesised effects and the placeholder groove for section 1. Writes audio/s1-mix.m4a."""
import json, os, subprocess, wave
import numpy as np
from sfxlib import *
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.loads(open(HERE + '/s1-tl.js').read()[len('window.TL='):-2]); LN = {l['i']: l for l in TL['lines']}; DUR = TL['DUR']; N = int(DUR * SR)
T0 = lambda i: LN[i]['t0']; T1 = lambda i: LN[i]['t1']
def wt(i, word, nth=0):
    m = [w for w in LN[i]['w'] if word.lower() in w[2].lower()]; return (m[nth] if nth < len(m) else m[-1] if m else [T0(i)])[0]
w = wave.open(HERE + '/audio/s1-voice.wav'); voice = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
cuts = [T0(1) - .1, wt(1, 'For') - .08, T0(2) - .1, T0(3) - .1, wt(4, 'McDonald') - .1, T0(5) - .1, T0(6) - .1, T1(6) + .25, T0(7) - .35, wt(8, 'Somebody') - .08, wt(8, 'We') - .08, T1(8) + .25, T0(9) - .45, T0(10) - .1, T0(11) - .1, T0(12) - .1, T0(13) - .1, T0(14) - .1]
def impact():
    x = np.zeros(int(.6 * SR)); a = thud_(.5); x[:len(a)] += a * 1.2; n = int(.12 * SR); x[:n] += rng.standard_normal(n) * env(n, .001, .03) * .6
    tt = np.arange(len(x)) / SR; x += np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / .18) * .9; return x
def snap(f0=500, f1=1100):
    x = pop_(f0, f1, .11) + .5 * pop_(f0 * 2, f1 * 2, .11); n = int(.012 * SR); x[:n] += rng.standard_normal(n) * .5; return x
thud_ = thud; thud = lambda d=.3: impact(); pop_ = pop; pop = lambda a=420, b=980, d=.09: snap(a, b)
S = [(c - .12, whoosh(.26), .75) for c in cuts]
tO = wt(0, 'ordered'); a4, b4 = wt(4, 'rose'), wt(4, 'forty')
S += [(.2 + k * .12, tick(), .16) for k in range(15)] + [(tO - .15, whoosh(.3), .4), (tO + .7, kaching(), .45), (T0(0), pop(), .4)]
S += [(wt(1, 'Eleven') + .05, thud(), .8)] + [(wt(1, x), pop(420 + k * 120, 900 + k * 150), .5) for k, x in enumerate(['burger', 'fries', 'drink'])]
S += [(T0(2) + .1, pop(), .45), (wt(3, 'dollar'), ding(1568), .3), (wt(4, 'wasn') + .1, thud(.35), .9)]
S += [(a4 - .5 + k * (b4 - a4 + .5) / 14, tick(), .12) for k in range(14)] + [(b4 - .8, riser(.8), .3), (b4, thud(.4), .9), (b4 + .06, kaching(), .28), (wt(5, 'where'), pop(), .4)]
S += [(T0(6) + .12 + k * .36, pop(420 + k * 110, 820 + k * 150), .5) for k in range(3)]
S += [(T1(6) + 1.0, pop(700, 1300), .5), (T1(6) + 1.15, boing(), .45), (T1(6) + 1.75, keys(), .4), (wt(7, 'Who'), thud(.3), .5)]
S += [(wt(8, 'taking'), whoosh(.6), .5), (wt(8, 'eleven') - .1, thud(), .7)] + [(wt(8, 'four') + .15 + k * .22, pop(400 + k * 90, 800 + k * 120), .5) for k in range(4)] + [(wt(8, 'never'), thud(.4), .9), (wt(8, 'never') + .05, boing(), .25)]
S += [(T1(8) + x, thud(.35), .8) for x in (.3, .55, .85)] + [(T1(8) + .9, kaching(), .4), (wt(9, 'Talk'), thud(.4), 1.0)]
S += [(wt(10, 'Suspect'), thud(.3), .7)] + [(wt(10, x), pop(450 + k * 80, 900 + k * 100), .5) for k, x in enumerate(['Beef', 'bun', 'cheese', 'cup', 'wrapper'])]
S += [(T0(11) + .1, pop(), .5), (wt(12, 'thirty') - .5, whoosh(.5), .35), (wt(12, 'thirty') + .1, pop(), .5), (wt(12, 'three'), kaching(), .32), (wt(13, 'Three'), tick(), .4), (wt(13, 'paid'), tick(), .4), (wt(14, 'guilty'), thud(.4), 1.0), (wt(14, 'only'), whoosh(.4), .35)]
sfx = np.zeros(N)
for t0, x, gain in S:
    i = max(0, int(t0 * SR)); x = x[:N - i]; sfx[i:i + len(x)] += x * gain
music = groove(DUR); tt = np.arange(N) / SR; gate = np.ones(N)
for a, b in [(T1(6) + .25, wt(8, 'Somebody') - .1), (T1(8) + 2.0, T0(10) - .1)]: gate[(tt > a) & (tt < b)] = 0
k = int(.05 * SR); gate = np.convolve(gate, np.ones(k) / k, 'same') * np.clip(tt / .4, 0, 1) * np.clip((DUR - tt) / 1.2, 0, 1)
e = np.sqrt(np.convolve(voice ** 2, np.ones(int(.25 * SR)) / int(.25 * SR), 'same')); music *= gate * (1 - .5 * np.clip(e / .12, 0, 1)) * .27
mix = np.tanh((voice + sfx * .8 + music) * 1.15) / 1.15; print('peak', np.abs(mix).max())
o = wave.open(HERE + '/audio/s1-mix.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', HERE + '/audio/s1-mix.wav', '-af', 'alimiter=limit=0.89', '-ac', '2', '-c:a', 'aac', '-b:a', '192k', HERE + '/audio/s1-mix.m4a'], check=True)
