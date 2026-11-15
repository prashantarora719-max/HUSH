"""Cuts the narrator and Frank takes into script order, sample-accurately, and writes audio/dialogue.wav/.mp3 and timeline.json."""
import json, re, subprocess, difflib, pathlib, numpy as np
D = pathlib.Path(__file__).resolve().parent; A = D / 'audio'; SR = 44100
secs = json.load(open(D / 'lines.json'))
NT = {'n12': [1, 2], 'n3': [3], 'n4': [4], 'n5': [5], 'n6': [6], 'n78': [7, 8], 'n9': [9], 'n10': [10], 'n11': list(range(1, 11))}; FT = {'f1': [1, 2, 3, 4, 5], 'f2': [6, 7, 8, 9, 10], 'f3': list(range(1, 11)), 'f4': list(range(1, 11))}; EXTRA = ('f3', 'f4', 'n11')
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
def words(name): return [w for w in json.load(open(A / f'{name}.words.json'))['words'] if w.get('type', 'word') == 'word' and '[' not in w['text'] and ']' not in w['text'] and norm(w['text'])]
def load(name, loud=True): return np.frombuffer(subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', str(A / f'{name}.mp3'), *(['-af', 'loudnorm=I=-16:TP=-1.5:LRA=11'] if loud else []), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']), dtype=np.float32).copy()
PCM = {n: load(n) for n in list(NT) + list(FT)}
def quiet(x, a, b, prefer):
    """the quietest 30 ms between a and b seconds; ties go to the end nearest the words being kept"""
    a, b = max(0, a), min(len(x) / SR, b)
    if b - a < .04: return (a + b) / 2
    ts = np.arange(a, b - .03, .005); e = np.array([np.sqrt((x[int(t * SR):int((t + .03) * SR)] ** 2).mean()) for t in ts]); return ts[int(np.argmin(np.convolve(e, np.ones(9) / 9, mode='same')))] + .015
seg = {}
for who, takes in (('N', NT), ('F', FT)):
    for name, ss in takes.items():
        keys = [(s, i) for s in ss for i, l in enumerate(secs[s]['lines']) if l[0] == who and (l[2] if len(l) > 2 else None) == (name if name in EXTRA else None)]
        if not keys: continue
        ws = words(name); wt = [norm(w['text']) for w in ws]; exp, owner = [], []
        for k in keys:
            for tok in secs[k[0]]['lines'][k[1]][1].replace('…', ' ').split():
                if norm(tok): exp.append(norm(tok)); owner.append(k)
        m = {}
        for a, b, n in difflib.SequenceMatcher(None, exp, wt, autojunk=False).get_matching_blocks():
            for j in range(n): m[a + j] = b + j
        first, last = {}, {}
        for e, k in enumerate(owner):
            if e in m: first.setdefault(k, m[e]); last[k] = m[e]
        assert len(m) > .9 * len(exp), (name, len(m), len(exp)); x = PCM[name]; total = len(x) / SR
        for n, k in enumerate(keys):
            i0, i1 = first[k], last[k]   # words between two kept lines were cut from the script and are dropped
            pe = ws[i0 - 1]['end'] if i0 else 0; nx = ws[i1 + 1]['start'] if i1 + 1 < len(ws) else total
            a = 0 if i0 == 0 and name != 'x' else quiet(x, pe - .15, ws[i0]['start'] + .15, 'late'); b = total if i1 + 1 >= len(ws) else quiet(x, ws[i1]['end'] - .15, nx + .15, 'early')
            # the word times are estimates, so tighten each end onto where the voice really starts and stops
            env = lambda t: np.sqrt((x[int(t * SR):int((t + .02) * SR)] ** 2).mean()) if int((t + .02) * SR) <= len(x) else 0
            thr = 10 ** (-42 / 20); a0 = a
            while a < b - .1 and env(a) < thr: a += .005
            a = max(a0, a - .05)
            b0 = b
            while b > a + .1 and env(b - .02) < thr: b -= .005
            b = min(b0, b + .12)
            seg[k] = dict(take=name, a=a, b=b, gap_after=nx - ws[i1]['end'], words=[[re.sub(r'[^a-z0-9-]', '', w['text'].lower()), w['start'] - a] for w in ws[i0:i1 + 1]])
op = json.load(open(A / 'opening-lines.json')); opx = load('opening-dialogue', False)
out = [opx]; t = len(opx) / SR; lines = [dict(sec=0, who=o['who'], text='', t0=o['t0'], t1=o['t1'], words=[]) for o in op]
def silence(d): global t; n = int(round(d * SR)); out.append(np.zeros(n, np.float32)); t += n / SR
silence(max(0, 63.5 - t))
for s in secs[1:]:
    Ls = s['lines']
    if not Ls: continue
    if len(lines) > len(op): silence(1.0)
    for i, l in enumerate(Ls):
        who, text = l[0], l[1]; g = seg[(s['n'], i)]
        if i:
            pv = seg[(s['n'], i - 1)]; same = Ls[i - 1][0] == who and pv['take'] == g['take']
            silence(max(0, min(pv['gap_after'], .9) - .25) if same else (.5 if text.startswith('…') else .26 if who == 'F' else .3))
        x = PCM[g['take']][int(g['a'] * SR):int(g['b'] * SR)].copy(); f = int(.012 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        lines.append(dict(sec=s['n'], who=who, text=text, t0=round(t, 3), t1=round(t + len(x) / SR, 3), words=[[w, round(t + d, 3)] for w, d in g['words']])); out.append(x); t += len(x) / SR
pcm = np.concatenate(out); (A / 'dialogue.f32').write_bytes(pcm.tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', str(A / 'dialogue.f32'), '-c:a', 'pcm_s16le', str(A / 'dialogue.wav')]); (A / 'dialogue.f32').unlink()
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(A / 'dialogue.wav'), '-c:a', 'libmp3lame', '-b:a', '192k', str(A / 'dialogue.mp3')])
json.dump(dict(total=round(t + 4, 3), lines=lines), open(D / 'timeline.json', 'w'))
x = pcm; rms = lambda a, b: 20 * np.log10(np.sqrt((x[int(a * SR):int(b * SR)] ** 2).mean()) + 1e-6)
loud = [(l['who'], l['t0'], l['text'][:30]) for l in lines if l['sec'] and (rms(l['t0'], l['t0'] + .02) > -32 or rms(l['t1'] - .02, l['t1']) > -32)]
print('speech ends', round(t, 2), 'samples say', round(len(pcm) / SR, 2), 'lines', len(lines), 'loud edges', len(loud)); [print(' ', z) for z in loud[:12]]
