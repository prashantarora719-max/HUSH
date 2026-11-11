"""Mixes narration + looped music (ducked under the voice) + impact hits into audio/mix.m4a."""
import json, subprocess, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
A = ROOT / 'audio'
tl = json.loads((ROOT / 'video' / 'timeline.js').read_text().split('=', 1)[1].rstrip().rstrip(';'))
sec = tl['sections']; total = tl['total']
def run(*a): subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', *a])
# synthesised effects (no licensing involved)
run('-f', 'lavfi', '-i', "sine=f=46:d=1.6", '-f', 'lavfi', '-i', "anoisesrc=d=0.35:c=pink:a=0.8",
    '-filter_complex', "[0]volume='1.6*exp(-3.2*t)':eval=frame[a];[1]lowpass=f=600,volume='exp(-12*t)':eval=frame[b];[a][b]amix=inputs=2:normalize=0,alimiter=limit=0.9",
    '-ar', '48000', '-ac', '2', str(A / 'fx-impact.wav'))
run('-f', 'lavfi', '-i', "anoisesrc=d=2.2:c=pink:a=0.5", '-af', "highpass=f=400,volume='0.01+pow(t/2.2,3)*0.7':eval=frame,afade=t=out:st=2.15:d=0.05",
    '-ar', '48000', '-ac', '2', str(A / 'fx-riser.wav'))
slam = sec[0]['sentences'][2]['start']
hits = [(slam, 1.0), (sec[0]['sentences'][15]['start'] + .3, .8), (sec[7]['start'] - 1.2, .7), (sec[8]['end'] + 1.6, .8)]
hits += [(sec[n]['start'] - 1.9 + .5, .6) for n in range(2, 7)]
risers = [(slam - 2.2, .5)]
cmd = ['-i', str(A / 'narration.mp3'), '-stream_loop', '-1', '-i', str(A / 'music.mp3')]
fl = [f"[0]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v][key]",
      f"[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total},afade=t=in:d=1.5,afade=t=out:st={total-4}:d=4,volume=0.12[m0]",
      "[m0][key]sidechaincompress=threshold=0.06:ratio=3:attack=15:release=700[m]"]
labels = ['[v]', '[m]']
for i, (t, vol) in enumerate(hits + risers):
    f = 'fx-impact.wav' if i < len(hits) else 'fx-riser.wav'
    cmd += ['-i', str(A / f)]
    fl.append(f"[{i+2}]adelay={int(max(t,0)*1000)}:all=1,volume={vol}[f{i}]"); labels.append(f'[f{i}]')
fl.append(''.join(labels) + f"amix=inputs={len(labels)}:normalize=0,atrim=0:{total}[o]")
run(*cmd, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '48000', str(A / 'mix-raw.wav'))
# static gain to about -15 LUFS (a fixed gain keeps the music from swelling in the pauses), then a limiter
import re
err = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(A / 'mix-raw.wav'), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', err)[-1]); gain = -15.0 - lufs
run('-i', str(A / 'mix-raw.wav'), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.8:level=disabled:attack=5:release=80', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', str(A / 'mix.m4a'))
(A / 'mix-raw.wav').unlink()
print('measured', lufs, 'LUFS, gain', round(gain, 2), 'dB')
print('mix ok', total)
