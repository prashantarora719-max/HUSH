#!/usr/bin/env python3
"""Final mix: voice + real sound effects placed from the picture's cue list + the music track, looped and ducked.
usage: build_mix_full.py <name>   (reads audio/<name>-voice.wav and cues.json; writes audio/<name>-mix.m4a)"""
import json, os, subprocess, sys, wave
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); name = sys.argv[1]
C = json.load(open(HERE + '/cues.json')); DUR = C['dur']; N = int(DUR * SR)
def dec(path, trim=True):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    if trim:
        e = np.abs(x) > .02 * np.abs(x).max(); i = np.argmax(e); j = len(x) - np.argmax(e[::-1]); x = x[max(0, i - 200):min(len(x), j + int(.05 * SR))]
        f = int(.01 * SR); x[-f:] *= np.linspace(1, 0, f)
    return x / (np.abs(x).max() + 1e-9)
S = {k: dec(f'{HERE}/audio/sfx/{k}.mp3') for k in ['register', 'whoosh', 'pop', 'stamp', 'coin', 'keys', 'boing', 'scribble']}
S['register'] = S['register'][:int(1.3 * SR)]; S['stamp'] = S['stamp'][:int(.7 * SR)]; S['keys'] = S['keys'][:int(.9 * SR)]; S['boing'] = S['boing'][:int(.9 * SR)]; S['scribble'] = S['scribble'][:int(.6 * SR)]
for k in S: f = int(.04 * SR); S[k][-f:] *= np.linspace(1, 0, f)
w = wave.open(f'{HERE}/audio/{name}-voice.wav'); voice = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768; voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
# picture cue -> (sample, gain, offset)
MAP = {'cut': ('whoosh', .30, -.10), 'slam': ('stamp', .55, 0), 'text': ('pop', .28, 0), 'pop': ('pop', .40, 0), 'stamp': ('stamp', .5, 0), 'whoosh': ('whoosh', .45, 0), 'register': ('register', .42, 0), 'coin': ('coin', .4, 0), 'keys': ('keys', .45, 0), 'boing': ('boing', .4, 0), 'scribble': ('scribble', .45, 0)}
sfx = np.zeros(N); hush = []; last = {}
for c in sorted(C['cues'], key=lambda s: float(s.split('@')[1])):
    p = c.split('@'); kind, t0 = p[0], float(p[1])
    if kind == 'hush': hush.append((t0, float(p[2]))); continue
    smp, gain, off = MAP[kind]
    if t0 - last.get(smp, -9) < .09: continue   # don't stack the same sound on itself
    last[smp] = t0; x = S[smp]; i = max(0, int((t0 + off) * SR)); x = x[:N - i]; sfx[i:i + len(x)] += x * gain
# music: loop with crossfades, stop for the gags, duck under speech
m = dec(HERE + '/audio/music.mp3', trim=False); m = m[int(.05 * SR):len(m) - int(1.2 * SR)]; xf = int(1.0 * SR); music = np.zeros(N + len(m)); pos = 0
while pos < N:
    seg = m.copy(); seg[:xf] *= np.linspace(0, 1, xf) if pos else 1; seg[-xf:] *= np.linspace(1, 0, xf); music[pos:pos + len(seg)] += seg; pos += len(m) - xf
music = music[:N]; tt = np.arange(N) / SR; gate = np.ones(N)
for a, b in hush: gate[(tt > a) & (tt < b)] = 0
k = int(.12 * SR); gate = np.convolve(gate, np.ones(k) / k, 'same') * np.clip(tt / .5, 0, 1) * np.clip((DUR - tt) / 2.0, 0, 1)
e = np.sqrt(np.convolve(voice ** 2, np.ones(int(.3 * SR)) / int(.3 * SR), 'same')); music *= gate * (1 - .55 * np.clip(e / .1, 0, 1)) * .30
mix = np.tanh((voice + sfx + music) * 1.1) / 1.1; print('peak', round(float(np.abs(mix).max()), 3), 'hush', len(hush))
o = wave.open(f'{HERE}/audio/{name}-mix.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/audio/{name}-mix.wav', '-af', 'alimiter=limit=0.89', '-ac', '2', '-c:a', 'aac', '-b:a', '192k', f'{HERE}/audio/{name}-mix.m4a'], check=True)
