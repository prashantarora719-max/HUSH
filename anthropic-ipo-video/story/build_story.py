"""Maps the earlier film's sentence keys onto the new two-voice recording, so its chart scenes can be reused, and writes tl.js and scenes.js."""
import json, re, pathlib
D = pathlib.Path(__file__).resolve().parent; V = D.parent / 'video'
old = json.loads((V / 'timeline.js').read_text().split('=', 1)[1].rstrip().rstrip(';')); new = json.load(open(D / 'timeline.json')); L = new['lines']
OPEN_END = 63.5
# old sentences whose wording changed: where they now begin, as the first words of the new line
OV = {(2, 2): 'it would raise', (2, 3): 'the second largest', (3, 3): 'i ran a', (3, 4): 'fair but about', (3, 11): 'so its safe', (3, 18): 'its filing shows', (4, 1): 'probably not this', (4, 12): 'either a new', (4, 13): 'either a new', (4, 14): 'either a new', (4, 15): 'or customers are', (6, 7): 'and sells it',
      (6, 19): 'hold on those', (6, 20): 'they are buying', (6, 21): 'they are buying', (6, 22): 'if you watched', (6, 23): 'the money goes', (6, 24): 'those are the winners', (7, 7): 'and me if', (7, 8): 'the people buying', (7, 11): 'you are a passenger', (9, 0): 'so frank what'}
flat = lambda w: w.replace('-', '')
tl = {'sections': [], 'total': new['total']}; miss = []
for s, osec in enumerate(old['sections']):
    ls = [l for l in L if l['sec'] == s]
    if s == 0 or not ls:
        n = len(osec['sentences']); tl['sections'].append({'start': 0 if s == 0 else OPEN_END, 'end': OPEN_END, 'sentences': [{'text': x['text'], 'start': round(i * OPEN_END / n, 3) if s == 0 else OPEN_END, 'end': round((i + 1) * OPEN_END / n, 3) if s == 0 else OPEN_END} for i, x in enumerate(osec['sentences'])], 'words': []}); continue
    nw = [w for l in ls if l['who'] == 'N' for w in l['words']]; allw = sorted([w for l in ls for w in l['words']], key=lambda w: w[1]); p = 0; st = []
    for x in osec['sentences']:
        tok = [w for w, t in osec['words'] if t >= x['start'] - .01][:4]; hit = None; n_ = len(st)
        if (s, n_) in OV:
            ph = OV[(s, n_)].split(); j = next((i for i in range(len(allw)) if [flat(w) for w, _ in allw[i:i + len(ph)]] == ph), None)
            if j is not None: st.append(allw[j][1]); p = next((i for i, w in enumerate(nw) if w[1] >= allw[j][1]), len(nw)); continue
            st.append(None); miss.append((s, n_, 'cut: ' + x['text'][:50])); continue
        for n_tok in (4, 3, 2):
            t2 = tok[:n_tok]
            for i in range(p, min(len(nw), p + 70)):
                if [flat(w) for w, _ in nw[i:i + len(t2)]] == [flat(w) for w in t2]: hit = i; break
            if hit is not None: break
        if hit is None: st.append(None); miss.append((s, len(st) - 1, x['text'][:60]))
        else: st.append(nw[hit][1]); p = hit + 1
    a, b = ls[0]['t0'], ls[-1]['t1']
    for i, v in enumerate(st):  # sentences that are no longer spoken take a time between their neighbours
        if v is None:
            lo = next((st[j] for j in range(i - 1, -1, -1) if st[j] is not None), a); j2 = next((j for j in range(i + 1, len(st)) if st[j] is not None), None); hi = st[j2] if j2 is not None else b
            k = i - (max([j for j in range(i) if st[j] is not None], default=-1)); span = (j2 if j2 is not None else len(st)) - (i - k); st[i] = lo + (hi - lo) * k / span
    tl['sections'].append({'start': a, 'end': b, 'sentences': [{'text': x['text'], 'start': round(st[i], 3), 'end': round(st[i + 1] if i + 1 < len(st) else b, 3)} for i, x in enumerate(osec['sentences'])], 'words': allw})
(D / 'tl.js').write_text('window.TL = ' + json.dumps(tl) + ';\nwindow.ST = ' + json.dumps({'lines': L, 'open_end': OPEN_END}) + ';\n')
print('unmatched old sentences:', len(miss)); [print(' ', m) for m in miss]
