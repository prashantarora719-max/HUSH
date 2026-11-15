"""Writes captions.srt for the story-mode film from the recorded lines, with spoken numbers shown as numerals."""
import json, re, ast, pathlib
D = pathlib.Path(__file__).resolve().parent
src = (D.parent / 'video' / 'build_timeline.py').read_text(); FIX = ast.literal_eval(src[src.index('FIX = ') + 6:].split('\n')[0])
FIX.update({'one hundred and forty billion dollars': '$140 billion', 'a hundred and forty billion dollars': '$140 billion', 'one hundred and thirty billion dollars': '$130 billion', 'one hundred and twenty-one billion dollars': '$121 billion', 'seventy-two billion dollars': '$72 billion', 'twenty-six billion dollars': '$26 billion', 'fourteen billion dollars': '$14 billion', 'thirty billion dollars': '$30 billion', 'Nasdaq one hundred': 'Nasdaq-100', 'S and P five hundred': 'S&P 500', 'Seventy-eight bucks': '78 bucks', 'one point four': '1.4', 'one point two five': '1.25', 'seven hundred million dollars': '$700 million', 'sixty-four billion dollars': '$64 billion'})
OPEN = [(.15, 1.4, 'This is Dario.'), (1.5, 7.0, 'Five years ago, he walked out of OpenAI with six colleagues, and started a rival.'), (7.2, 10.4, 'On Thursday, that rival goes public.'), (10.5, 14.5, 'The price tag? $1.4 trillion.'), (14.7, 17.0, 'FRANK: Good for him. I\'m not buying it.'),
        (17.5, 22.5, 'This is Frank. Frank is 58. Frank has a retirement account.'), (22.6, 25.6, 'Frank, do you own a Nasdaq-100 fund?'), (26.15, 27.1, 'FRANK: …Yes.'), (27.5, 32.5, 'Then within a few weeks, you may be buying it anyway. At whatever price it\'s trading.'), (32.75, 33.9, 'FRANK: Nobody asked me.'),
        (34.3, 37.7, 'Nobody has to. And here\'s what you\'d be buying.'), (37.8, 44.0, 'A company that just reported a loss of $80.7 billion. In six months.'), (44.2, 45.6, 'FRANK: Eighty billion?!'), (46.0, 50.3, 'And investors still ordered six times more shares than are for sale.'),
        (50.4, 56.1, 'So either they have all lost their minds, or that loss is not what it looks like.'), (56.2, 59.5, 'The answer decides who really wins on Thursday.'), (59.6, 61.6, 'And it probably isn\'t Frank.'), (61.8, 62.6, 'FRANK: Hey.')]
caps = list(OPEN)
for l in json.load(open(D / 'timeline.json'))['lines']:
    if l['sec'] == 0: continue
    sents = [s for s in re.split(r'(?<=[.?!])\s+', l['text']) if s]; groups, cur = [], ''
    for s in sents:  # keep each caption to a readable length
        if cur and len(cur) + len(s) > 84: groups.append(cur); cur = s
        else: cur = (cur + ' ' + s).strip()
    if cur: groups.append(cur)
    n = sum(len(x.split()) for x in groups); t = l['t0']; d = l['t1'] - l['t0']
    for i, x in enumerate(groups):
        dt = d * len(x.split()) / n; y = x
        for a, b in sorted(FIX.items(), key=lambda kv: -len(kv[0])): y = re.sub(re.escape(a), b, y, flags=re.I)
        caps.append((t, t + dt - .05, ('FRANK: ' if l['who'] == 'F' and i == 0 else '') + y)); t += dt
ts = lambda t: f'{int(t // 3600):02}:{int(t % 3600 // 60):02}:{int(t % 60):02},{int(round(t % 1 * 1000)) % 1000:03}'
(D.parent / 'story-captions.srt').write_text('\n'.join(f'{i + 1}\n{ts(a)} --> {ts(b)}\n{x}\n' for i, (a, b, x) in enumerate(caps)))
print(len(caps), 'captions'); [print(' ', x) for _, _, x in caps[18:30]]
