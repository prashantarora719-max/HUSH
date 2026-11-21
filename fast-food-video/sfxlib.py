"""Synthesised sound effects and the placeholder groove (shared by the build scripts)."""
import numpy as np
SR = 48000
rng = np.random.default_rng(7)
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


BPM = 104; beat = 60 / BPM; s16 = beat / 4
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



def groove(DUR):
    N = int(DUR * SR); music = np.zeros(N)
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
    return music
