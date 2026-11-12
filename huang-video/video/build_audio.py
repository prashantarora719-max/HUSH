"""Mixes narration + looped music (ducked under the voice) + impact hits into audio/mix.m4a."""
import json, re, subprocess, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / 'audio'; FX = ROOT.parent / 'nvidia-video' / 'audio'
tl = json.loads((ROOT / 'video' / 'timeline.js').read_text().split('=', 1)[1].rstrip().rstrip(';'))
plan = json.loads((ROOT / 'video' / 'plan.js').read_text().split('=', 1)[1].rstrip().rstrip(';'))
sec = tl['sections']; total = tl['total']
def run(*a): subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', *a])
ent = {e['key']: e for e in plan['entries']}
title = ent['0.16']['a']['t']
hits = [(ent['0.2']['lines'][1][2], .9), (ent['0.10']['lines'][1][2], .7), (title, 1.0), (ent['4.10']['a']['six'], .7), (ent['5.19']['t0'], .9), (total - 5 + .7, .8)]
hits += [(sec[n]['start'] - .25, .55) for n in range(2, 8)]
risers = [(title - 2.2, .5), (ent['5.19']['t0'] - 2.2, .4)]
cmd = ['-i', str(A / 'narration.mp3'), '-stream_loop', '-1', '-i', str(FX / 'music.mp3')]
fl = ["[0]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v][key]",
      f"[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total},afade=t=in:d=1.0,afade=t=out:st={total-4}:d=4,volume=0.12[m0]",
      "[m0][key]sidechaincompress=threshold=0.06:ratio=3:attack=15:release=700[m]"]
labels = ['[v]', '[m]']
for i, (t, vol) in enumerate(hits + risers):
    cmd += ['-i', str(FX / ('fx-impact.wav' if i < len(hits) else 'fx-riser.wav'))]
    fl.append(f"[{i+2}]adelay={int(max(t,0)*1000)}:all=1,volume={vol}[f{i}]"); labels.append(f'[f{i}]')
fl.append(''.join(labels) + f"amix=inputs={len(labels)}:normalize=0,atrim=0:{total}[o]")
run(*cmd, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '48000', str(A / 'mix-raw.wav'))
err = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(A / 'mix-raw.wav'), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', err)[-1]); gain = -15.0 - lufs
run('-i', str(A / 'mix-raw.wav'), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.8:level=disabled:attack=5:release=80', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', str(A / 'mix.m4a'))
(A / 'mix-raw.wav').unlink()
print('measured', lufs, 'LUFS, gain', round(gain, 2), 'dB; total', total)
