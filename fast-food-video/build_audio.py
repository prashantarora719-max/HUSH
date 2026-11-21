#!/usr/bin/env python3
"""Assemble the 60-second opening: dialogue, synthesised sound effects and a placeholder groove.
Writes audio/voice.wav, audio/mix.wav and tl.js (cue times shared with the picture)."""
import json, os, subprocess, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'audio')
rng = np.random.default_rng(7)


def load(name):
    w = wave.open(os.path.join(A, name + '.wav'))
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return x


SRC = {k: load(k) for k in 'nfd'}
# (id, source, start, end, gap after, inner cues {name: offset})
LINES = [
    ('N1', 'n', 0.00, 2.70, 0.25, {'lunch': 1.22}),
    ('F1', 'f', 0.00, 2.31, 0.25, {'forthis': 1.61}),
    ('D1', 'd', 0.00, 2.83, 0.30, {'cost': 1.82}),
    ('F2', 'f', 2.91, 4.64, 0.40, {'dollar': 1.28}),
    ('N2', 'n', 3.06, 12.39, 0.30, {'notmuch': 1.64, 'since': 3.29, 'forty': 8.37}),
    ('N3', 'n', 12.70, 16.63, 0.30, {}),
    ('D2', 'd', 3.29, 7.20, 0.25, {'beef': 1.84, 'wages': 2.54, 'rent': 3.15}),
    ('N4', 'n', 17.06, 25.02, 0.25, {'but': 0.93, 'company': 3.71, 'cents': 5.64, 'every': 6.66}),
    ('F3', 'f', 4.97, 7.16, 0.30, {'onburger': 1.32}),
    ('N5', 'n', 25.30, 28.03, 0.80, {'onrent': 1.84}),
    ('F4', 'f', 7.71, 8.26, 0.70, {}),
    ('N6', 'n', 28.38, 35.32, 0.0, {'isnt': 2.22, 'who': 4.64}),
]
TAIL = 2.2


def rms(x):
    return np.sqrt(np.mean(x ** 2) + 1e-12)


def seg(src, a, b):
    x = SRC[src][int((a - .02) * SR) if a > .02 else 0:int((b + .08) * SR)].copy()
    f = int(.012 * SR)
    x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x * (0.11 / rms(x))


t = 0.4
cues, clips = {}, []
for lid, src, a, b, gap, inner in LINES:
    x = seg(src, a, b)
    cues[lid] = round(t, 3)
    for k, off in inner.items():
        cues[lid + '.' + k] = round(t + off, 3)
    clips.append((t, x))
    t += len(x) / SR
    cues[lid + '.end'] = round(t, 3)
    t += gap
DUR = round(t + TAIL, 2)
N = int(DUR * SR)
voice = np.zeros(N)
for t0, x in clips:
    i = int(t0 * SR); voice[i:i + len(x)] += x


# ---------- sound effects ----------
def env(n, a=.003, d=.2):
    tt = np.arange(n) / SR
    return np.minimum(tt / a, 1) * np.exp(-tt / d)


def pop(f0=420, f1=980, dur=.09):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 + (f1 - f0) * (tt / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .03)


def whoosh(dur=.32, up=True):
    n = int(dur * SR); x = rng.standard_normal(n)
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR)
    out = np.zeros(n)
    # sweep a band-pass through the noise in 8 slices
    k = 8
    for j in range(k):
        c = 500 * (9 ** ((j if up else k - 1 - j) / (k - 1)))
        Y = X * np.exp(-((np.log(fr + 1) - np.log(c)) ** 2) / .18)
        y = np.fft.irfft(Y, n)
        w = np.exp(-((np.arange(n) / n - (j + .5) / k) ** 2) / .012)
        out += y * w
    out *= np.sin(np.pi * np.arange(n) / n) ** 1.5
    return out / np.max(np.abs(out))


def ding(f=1975, dur=.9):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt / d) for m, a, d in ((1, 1, .28), (2.76, .5, .16), (5.4, .25, .08)))
    return x * np.minimum(tt / .001, 1)


def kaching():
    n = int(1.1 * SR); x = np.zeros(n)
    c = rng.standard_normal(int(.05 * SR)) * env(int(.05 * SR), .001, .012)
    x[:len(c)] += c * .7
    for off, f in ((.06, 2093), (.17, 2637)):
        d = ding(f, .9); i = int(off * SR); x[i:i + len(d)] += d[:n - i]
    return x


def thud(dur=.3):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 150 * np.exp(-tt / .05) + 48
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .09)
    c = rng.standard_normal(n) * env(n, .001, .008) * .5
    return x + c


def tick():
    n = int(.03 * SR)
    return np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * env(n, .001, .006)


def boing(dur=.45):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 260 + 140 * np.sin(2 * np.pi * 9 * tt) * np.exp(-tt / .15)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .003, .16)


def riser(dur=.9):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 200 * (6 ** (tt / dur))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / dur) ** 2 * .6 + whoosh(dur) * (tt / dur) * .5


def keys():
    n = int(.6 * SR); x = np.zeros(n)
    for off in (0, .07, .13, .22, .3):
        d = ding(3300 + rng.uniform(-500, 900), .25) * .5; i = int(off * SR); x[i:i + len(d)] += d[:n - i]
    return x


C = cues
SFX = [  # (time, sound, gain)
    (C['N1'] - .05, pop(), .5), (C['N1'] + .55, pop(600, 1200), .35),
    (C['N1.lunch'] - .1, whoosh(), .4), (C['N1.lunch'] + .75, kaching(), .32),
    (C['F1'] - .12, whoosh(.22), .45), (C['F1'] + .05, thud(), .7),
    (C['F1.forthis'] - .1, whoosh(.2, False), .4), (C['F1.forthis'] + .05, boing(), .3),
    (C['D1'] - .12, whoosh(.22), .45), (C['D1'] + .02, pop(), .45), (C['D1.cost'], pop(500, 900), .4),
    (C['F2'] - .15, whoosh(.3), .4), (C['F2.dollar'] + .2, ding(1568), .3),
    (C['N2'] - .12, whoosh(.22), .45), (C['N2'] + .25, thud(), .6), (C['N2.notmuch'], pop(), .4),
    (C['N2.since'] - .15, whoosh(.3), .45),
    (C['N2.forty'] - .85, riser(.85), .32), (C['N2.forty'] + .02, thud(.4), .9), (C['N2.forty'] + .08, kaching(), .28),
    (C['N3'] - .12, whoosh(.22), .45), (C['N3'] + 2.9, pop(700, 1400), .4),
    (C['D2'] - .12, whoosh(.22), .45), (C['D2'], pop(), .4),
    (C['D2.beef'], pop(420, 800), .5), (C['D2.wages'], pop(520, 950), .5), (C['D2.rent'], pop(640, 1150), .5),
    (C['N4'] + .05, ding(2637, .5), .25),
    (C['N4.but'] - .15, whoosh(.3, False), .5), (C['N4.but'] + .05, thud(.35), .5),
    (C['N4.company'] - .12, whoosh(.22), .45),
    (C['N4.cents'], kaching(), .3), (C['N4.every'] + .1, pop(), .3),
    (C['F3'] - .12, whoosh(.2), .45), (C['F3'] + .04, thud(), .8), (C['F3.onburger'], boing(), .3),
    (C['N5'] - .12, whoosh(.22), .4), (C['N5'] + .75, thud(.25), .7),
    (C['N5.onrent'] - .15, whoosh(.3), .5), (C['N5.onrent'] + .1, keys(), .4), (C['N5.onrent'] + .55, kaching(), .25),
    (C['F4'] - .25, pop(300, 220, .12), .4),
    (C['N6'] - .15, whoosh(.3), .5), (C['N6'] + .02, thud(.3), .6),
    (C['N6.isnt'] + .5, thud(.25), .6),
    (C['N6.who'] - .7, riser(.7), .3), (C['N6.who'] + .02, thud(.4), .9),
    (C['N6.end'] + .3, kaching(), .3),
]
for i in range(18):  # counter ticks while the percentage climbs
    SFX.append((C['N2.since'] + .9 + i * (C['N2.forty'] - C['N2.since'] - 1.8) / 18, tick(), .12))
for i in range(4):  # coins sliding across
    SFX.append((C['N4.cents'] + .15 + i * .12, ding(2400 + i * 180, .3), .14))
sfx = np.zeros(N)
for t0, x, g in SFX:
    i = max(0, int(t0 * SR)); x = x[:N - i]; sfx[i:i + len(x)] += x * g


# ---------- placeholder groove (to be replaced by a proper track) ----------
BPM = 104; beat = 60 / BPM; s16 = beat / 4
music = np.zeros(N)
CH = [(48, [60, 64, 67, 71]), (45, [57, 60, 64, 67]), (41, [53, 57, 60, 64]), (43, [55, 59, 62, 65])]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def add(buf, t0, x, g):
    i = int(t0 * SR)
    if i >= len(buf): return
    x = x[:len(buf) - i]; buf[i:i + len(x)] += x * g


def marimba(m, dur=.35):
    n = int(dur * SR); tt = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * tt) * np.exp(-tt / .12) + .35 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt / .03)) * np.minimum(tt / .002, 1)


def bass(m, dur=.28):
    n = int(dur * SR); tt = np.arange(n) / SR; f = hz(m)
    x = np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / .06) + .15 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / .04)
    return x * np.minimum(tt / .004, 1) * np.exp(-tt / .16)


def kick():
    n = int(.22 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tt / .035) + 46) / SR) * np.exp(-tt / .08)


def clap():
    n = int(.14 * SR); x = rng.standard_normal(n)
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR)
    x = np.fft.irfft(X * np.exp(-((fr - 1500) / 900) ** 2), n)
    e = sum(np.exp(-np.maximum(np.arange(n) / SR - o, 0) / .02) * (np.arange(n) / SR >= o) for o in (0, .011, .022))
    return x / np.max(np.abs(x)) * e / 3


def shaker():
    n = int(.05 * SR); x = np.diff(rng.standard_normal(n + 1))
    return x / np.max(np.abs(x)) * env(n, .004, .012)


BASS_PAT = [0, None, None, 0, None, 0, None, None, 12, None, 0, None, None, 7, None, 10]
MAR_PAT = [0, None, 2, None, 1, None, 3, 2, None, 1, None, 2, 3, None, 1, None]
bars = int(DUR / (beat * 4)) + 1
for b in range(bars):
    root, chord = CH[b % 4]
    for s in range(16):
        tt = (b * 16 + s) * s16 + (s16 * .18 if s % 2 else 0)  # light swing
        if BASS_PAT[s] is not None: add(music, tt, bass(root - 12 + BASS_PAT[s]), .5)
        if MAR_PAT[s] is not None: add(music, tt, marimba(chord[MAR_PAT[s]] + 12), .16 if b % 8 < 6 else .2)
        add(music, tt, shaker(), .05 if s % 2 else .09)
        if s in (0, 10): add(music, tt, kick(), .55)
        if s in (4, 12): add(music, tt, clap(), .3)
# the gag: music drops out for "...The what?" and comes back on the reveal
g = np.ones(N); tt = np.arange(N) / SR
cut0, cut1 = C['N5.end'] + .05, C['N6'] - .05
g[(tt > cut0) & (tt < cut1)] = 0
k = np.ones(int(.04 * SR)) / int(.04 * SR); g = np.convolve(g, k, 'same')
g *= np.clip(tt / .3, 0, 1) * np.clip((DUR - tt) / 1.2, 0, 1)
music *= g
# gentle duck under speech
e = np.sqrt(np.convolve(voice ** 2, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'))
duck = 1 - .45 * np.clip(e / .05, 0, 1)
music *= duck * .2


def save(name, x):
    w = wave.open(os.path.join(A, name), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()


mix = voice * 2.6 + sfx * .5 + music
mix = np.tanh(mix * 1.1) / 1.1
print('peak', np.max(np.abs(mix)), 'dur', DUR)
save('voice.wav', voice * 2.6); save('mix.wav', mix)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(A, 'mix.wav'), '-af', 'alimiter=limit=0.89', '-ac', '2', '-c:a', 'aac', '-b:a', '192k', os.path.join(A, 'mix.m4a')], check=True)
cues['DUR'] = DUR
open(os.path.join(HERE, 'tl.js'), 'w').write('window.TL=' + json.dumps(cues) + ';\n')
print(json.dumps(cues, indent=0))
