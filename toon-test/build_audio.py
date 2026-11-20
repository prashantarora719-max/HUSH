"""Cuts the three voice takes into dialogue order and writes audio/dialogue.wav plus tl.js: when each line plays and how loud the voice is on every frame (which drives the mouths)."""
import json, subprocess, pathlib, numpy as np
D = pathlib.Path(__file__).resolve().parent; A = D / 'audio'; SR = 44100; FPS = 30
def load(n): return np.frombuffer(subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', str(A / f'{n}.mp3'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']), dtype=np.float32).copy()
P = {k: load(k) for k in 'nai'}
# id, speaker, take, start, end (seconds in the take), pause before it
LINES = [('n1', 'N', 'n', 0.0, 3.05, .5), ('n2', 'N', 'n', 3.40, 10.10, .45), ('a1', 'A', 'a', 0.0, 4.98, .5), ('n3', 'N', 'n', 10.52, 12.62, .6), ('i1', 'I', 'i', 0.0, 1.95, .55),
         ('a2', 'A', 'a', 5.18, 7.44, .45), ('i2', 'I', 'i', 2.48, 7.55, 1.1), ('a3', 'A', 'a', 7.58, 9.17, .5), ('n4', 'N', 'n', 13.18, 20.04, .9)]
out, t, tl = [], 0.0, []
for id_, who, take, a, b, gap in LINES:
    out.append(np.zeros(int(gap * SR), np.float32)); t += int(gap * SR) / SR
    x = P[take][int(a * SR):int(b * SR)].copy(); f = int(.015 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    n = int(np.ceil(len(x) / SR * FPS)); env = [float(np.sqrt((x[int(i * SR / FPS):int((i + 1) * SR / FPS)] ** 2).mean() + 1e-12)) for i in range(n)]
    m = np.percentile(env, 92) or 1; env = [round(min(1, e / m), 3) for e in env]
    tl.append(dict(id=id_, who=who, t0=round(t, 3), t1=round(t + len(x) / SR, 3), env=env)); out.append(x); t += len(x) / SR
out.append(np.zeros(int(3.2 * SR), np.float32)); pcm = np.concatenate(out)
(A / 'd.f32').write_bytes(pcm.tobytes()); subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', str(A / 'd.f32'), str(A / 'dialogue.wav')]); (A / 'd.f32').unlink()
(D / 'tl.js').write_text('window.TL = ' + json.dumps(dict(total=round(len(pcm) / SR, 3), lines=tl)) + ';\n')
print(round(len(pcm) / SR, 2), [(l['id'], l['t0'], l['t1']) for l in tl])
