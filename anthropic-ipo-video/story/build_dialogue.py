"""Cuts the narrator and Frank takes into script order and writes audio/dialogue.mp3 and timeline.json (every line with its word times)."""
import json, re, subprocess, difflib, pathlib
D = pathlib.Path(__file__).resolve().parent; A = D / 'audio'
secs = json.load(open(D / 'lines.json'))
NT = {'n12': [1, 2], 'n3': [3], 'n4': [4], 'n5': [5], 'n6': [6], 'n78': [7, 8], 'n9': [9], 'n10': [10]}; FT = {'f1': [1, 2, 3, 4, 5], 'f2': [6, 7, 8, 9, 10]}
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
def words(name): return [w for w in json.load(open(A / f'{name}.words.json'))['words'] if w.get('type', 'word') == 'word' and '[' not in w['text'] and ']' not in w['text'] and norm(w['text'])]
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]).decode())
seg = {}  # (section, index in section) -> take, start, end, words
for who, takes in (('N', NT), ('F', FT)):
    for name, ss in takes.items():
        ws = words(name); wt = [norm(w['text']) for w in ws]; exp = []; owner = []
        keys = [(s, i) for s in ss for i, (w, _) in enumerate(secs[s]['lines']) if w == who]
        for k in keys:
            for tok in secs[k[0]]['lines'][k[1]][1].replace('…', ' ').split():
                if norm(tok): exp.append(norm(tok)); owner.append(k)
        m = {}
        for a, b, n in difflib.SequenceMatcher(None, exp, wt, autojunk=False).get_matching_blocks():
            for j in range(n): m[a + j] = b + j
        first, last = {}, {}
        for e, k in enumerate(owner):
            if e in m: first.setdefault(k, m[e]); last[k] = m[e]
        assert len(m) > .9 * len(exp), (name, len(m), len(exp))
        total = dur(A / f'{name}.mp3')
        for n, k in enumerate(keys):
            assert k in first, (name, k)
            i0 = first[k] if n == 0 or last[keys[n - 1]] + 1 > first[k] else last[keys[n - 1]] + 1   # unmatched words go to the line they precede
            i1 = last[k] if n == len(keys) - 1 else first[keys[n + 1]] - 1
            i1 = max(i1, last[k]); i0 = min(i0, first[k])
            pe = ws[i0 - 1]['end'] if i0 else 0; nx = ws[i1 + 1]['start'] if i1 + 1 < len(ws) else total
            a = max(pe + (ws[i0]['start'] - pe) * .5, ws[i0]['start'] - .14); b = min(ws[i1]['end'] + (nx - ws[i1]['end']) * .5, ws[i1]['end'] + .22)
            seg[k] = dict(take=name, a=a, b=b, gap_after=nx - ws[i1]['end'], words=[[re.sub(r'[^a-z0-9-]', '', w['text'].lower()), w['start'] - a] for w in ws[i0:i1 + 1]])
for n in list(NT) + list(FT):
    subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(A / f'{n}.mp3'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', str(A / f'{n}.wav')])
op = json.load(open(A / 'opening-lines.json')); t = op[-1]['t1']; lines = [dict(sec=0, who=o['who'], text=secs[0]['lines'][i][1], t0=o['t0'], t1=o['t1'], words=[]) for i, o in enumerate(op)] if len(op) == len(secs[0]['lines']) else None
if lines is None:  # the opening was cut by speaker turn, the script lists it by line: keep turn timing
    lines = [dict(sec=0, who=o['who'], text='', t0=o['t0'], t1=o['t1'], words=[]) for o in op]
inputs = ['-i', str(A / 'opening-dialogue.mp3')]; idx = {}; parts = ['[0:a]aresample=44100,aformat=channel_layouts=mono[op]']; order = ['[op]']; n = 0
for s in secs[1:]:
    t += 1.0; parts.append(f'anullsrc=r=44100:cl=mono,atrim=0:1.0[g{n}]'); order.append(f'[g{n}]'); n += 1
    L = s['lines']
    for i, (who, text) in enumerate(L):
        g = seg[(s['n'], i)]; prev = L[i - 1][0] if i else None
        if i:
            same = prev == who and seg[(s['n'], i - 1)]['take'] == g['take']
            gap = max(0, min(seg[(s['n'], i - 1)]['gap_after'], .9) - .36) if same else (.42 if text.startswith('…') else .1 if who == 'F' else .16)
            if gap > .01: parts.append(f'anullsrc=r=44100:cl=mono,atrim=0:{gap:.3f}[g{n}]'); order.append(f'[g{n}]'); n += 1; t += gap
        if g['take'] not in idx: idx[g['take']] = len(inputs) // 2; inputs += ['-i', str(A / f"{g['take']}.wav")]
        d = g['b'] - g['a']; parts.append(f"[{idx[g['take']]}:a]atrim={g['a']:.3f}:{g['b']:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={d - .03:.3f}:d=0.03[s{n}]"); order.append(f'[s{n}]'); n += 1
        lines.append(dict(sec=s['n'], who=who, text=text, t0=round(t, 3), t1=round(t + d, 3), words=[[w, round(t + x, 3)] for w, x in g['words']])); t += d
(D / 'fc.txt').write_text(';'.join(parts) + ';' + ''.join(order) + f'concat=n={len(order)}:v=0:a=1[o]')
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex_script', str(D / 'fc.txt'), '-map', '[o]', '-c:a', 'libmp3lame', '-b:a', '192k', str(A / 'dialogue.mp3')])
(D / 'fc.txt').unlink(); [(A / f'{x}.wav').unlink() for x in list(NT) + list(FT)]
json.dump(dict(total=round(t + 4, 3), lines=lines), open(D / 'timeline.json', 'w'))
print('speech ends', round(t, 2), 'file', round(dur(A / 'dialogue.mp3'), 2), 'lines', len(lines))
for l in lines[len(op):len(op) + 14]: print(l['who'], l['t0'], l['t1'], l['text'][:50], '|', ' '.join(w for w, _ in l['words'][:3]), '…', ' '.join(w for w, _ in l['words'][-2:]))
