"""Builds timeline.js, narration.mp3 and captions.srt from the per-section audio and word timings."""
import json, re, subprocess, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
LEAD, GAP, TAIL = 0.5, 1.1, 5.0
FIX = {'two thousand four': '2004', 'twenty eighteen': '2018', 'twenty nineteen': '2019', 'twenty eleven': '2011', 'A M D': 'AMD', 'November twelfth': 'November 12th', 'November eighth': 'November 8th', 'November seventeenth': 'November 17th', 'interim or permanent': '"interim" or permanent'}
def dur(f):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode())
tl, t0, inputs = {'sections': []}, LEAD, []
for i in range(8):
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
