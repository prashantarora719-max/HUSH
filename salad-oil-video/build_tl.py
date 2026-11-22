#!/usr/bin/env python3
"""Timeline for the chapters listed on the command line: build_tl.py 0 1 ...  (writes film-tl.js)
Each chapter can carry a tempo lift (pitch kept); the mix applies the same lift to the audio."""
import json, subprocess, sys
SPEED = {0: 1.0, 1: 1.08, 2: 1.08, 3: 1.08, 4: 1.08, 5: 1.08, 6: 1.08, 7: 1.06, 8: 1.04}
GAP = {0: 4.6}   # pause after a chapter (default 2.4)
def words(ch):
    ws = [w for w in json.load(open(f'audio/full/ch{ch}.words.json'))['words'] if w['type'] == 'word']; o = []; inb = False
    for w in ws:
        t = w['text']
        if t.startswith('['): inb = not t.endswith(']'); continue
        if inb: inb = not t.endswith(']'); continue
        o.append(w)
    return o
dur = lambda f: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
t = 1.2; W = []; CH = []
for ch in map(int, sys.argv[1:]):
    sp = SPEED[ch]; CH.append({'i': ch, 't0': round(t, 3), 'sp': sp})
    for w in words(ch): W.append([round(t + w['start'] / sp, 3), round(t + w['end'] / sp, 3), w['text'], ch])
    t += dur(f'audio/full/ch{ch}.mp3') / sp; CH[-1]['t1'] = round(t, 3); t += GAP.get(ch, 2.4)
open('film-tl.js', 'w').write('window.TL=' + json.dumps({'DUR': round(t, 2), 'w': W, 'ch': CH}) + ';\n'); print(CH, round(t, 2))
