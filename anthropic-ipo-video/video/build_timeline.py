"""Builds timeline.js, narration.mp3 and captions.srt from the per-section audio and word timings."""
import json, re, subprocess, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
LEAD, GAP, TAIL = 0.5, 1.1, 5.0
FIX = {'eighty billion dollar loss': '$80 billion loss', 'one point four trillion dollars': '$1.4 trillion', 'one point four trillion': '$1.4 trillion', 'one point two five trillion': '$1.25 trillion', 'eight hundred and twenty-five million': '825 million', 'seventy to seventy-eight dollars': '$70 to $78', 'sixty-four billion dollars': '$64 billion', 'one trillion dollars': '$1 trillion', 'two trillion dollar whisper': '$2 trillion whisper', 'the two trillion that': 'the $2 trillion that', 'sixteen point three billion dollars': '$16.3 billion', 'eighty point seven billion': '$80.7 billion', 'seventy-two billion dollars': '$72 billion', 'seven hundred million dollars': '$700 million', 'nine billion dollars': '$9 billion', 'one hundred and twenty billion dollars': '$120 billion', 'fifteen billion dollars': '$15 billion', 'six point seven billion dollars': '$6.7 billion', 'twelve point three billion': '$12.3 billion', 'one hundred and thirty billion dollars': '$130 billion', 'thirty billion dollars': '$30 billion', 'one hundred and forty billion dollars': '$140 billion', 'twenty-six billion dollars': '$26 billion', 'thirty-eight dollars': '$38', 'forty-five dollars': '$45', 'fourteen billion dollars': '$14 billion', 'ten to fourteen percent': '10 to 14 percent', 'thirteen percent': '13 percent', 'six percent': '6 percent', 'five percent': '5 percent', 'twenty twelve': '2012', 'twenty nineteen': '2019', 'S and P five hundred': 'S&P 500', 'Nasdaq one hundred': 'Nasdaq-100', 'fifteen trading days': '15 trading days', 'five to fifteen days': '5 to 15 days', 'twelve months': '12 months', 'trillion dollar price': 'trillion-dollar price'}
def dur(f):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode())
tl, t0, inputs = {'sections': []}, LEAD, []
for i in range(11):
    f = str(ROOT / 'audio' / f's{i}.mp3'); d = dur(f)
    words = [w for w in json.load(open(ROOT / 'audio' / f'w{i}.json'))['words'] if w.get('type', 'word') == 'word']
    sents, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.?!]["”]?$', w['text']) and w['text'] != 'U.S.':
            sents.append(cur); cur = []
    if cur: sents.append(cur)
    out = []
    for s in sents:
        text = ' '.join(w['text'] for w in s)
        for a, b in FIX.items(): text = text.replace(a, b)
        out.append({'text': text, 'start': round(t0 + s[0]['start'], 3), 'end': round(t0 + s[-1]['end'], 3)})
    tl['sections'].append({'start': round(t0, 3), 'end': round(t0 + d, 3), 'sentences': out,
                           'words': [[re.sub(r'[^a-z0-9-]', '', w['text'].lower()), round(t0 + w['start'], 3)] for w in words]})
    inputs.append((f, t0)); t0 += d + GAP
tl['total'] = round(t0 - GAP + TAIL, 3)
(ROOT / 'video' / 'timeline.js').write_text('window.TL = ' + json.dumps(tl) + ';\n')
cmd = ['ffmpeg','-y','-loglevel','error']
for f, _ in inputs: cmd += ['-i', f]
fl = ''.join(f'[{k}]adelay={int(t*1000)}:all=1[a{k}];' for k, (_, t) in enumerate(inputs))
fl += ''.join(f'[a{k}]' for k in range(len(inputs))) + f'amix=inputs={len(inputs)}:normalize=0,apad=whole_dur={tl["total"]}[o]'
subprocess.check_call(cmd + ['-filter_complex', fl, '-map', '[o]', '-c:a', 'libmp3lame', '-b:a', '192k', str(ROOT / 'audio' / 'narration.mp3')])
def ts(t): return f'{int(t//3600):02}:{int(t%3600//60):02}:{int(t%60):02},{int(t%1*1000):03}'
n, srt = 1, []
for sec in tl['sections']:
    for x in sec['sentences']:
        srt.append(f"{n}\n{ts(x['start'])} --> {ts(x['end'] + 0.25)}\n{x['text']}\n"); n += 1
(ROOT / 'captions.srt').write_text('\n'.join(srt))
print('total', tl['total'])
for i, sec in enumerate(tl['sections']):
    print(i, sec['start'], len(sec['sentences']))
