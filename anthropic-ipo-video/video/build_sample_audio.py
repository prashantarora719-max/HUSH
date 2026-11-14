"""Audio for the 60-second style sample: narration, ducked music, and synthesised sound design (whooshes, ticks, pops, hits)."""
import subprocess, pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent; A = R / 'audio'; FX = R.parent / 'nvidia-video' / 'audio'; END = 60
def run(*a): subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', *a])
# synthesised effects, so there is nothing to license
run('-f', 'lavfi', '-i', 'anoisesrc=d=0.5:c=white:a=0.7', '-af', "highpass=f=900,lowpass=f=7000,volume='0.9*sin(PI*t/0.5)*sin(PI*t/0.5)':eval=frame", '-ar', '48000', '-ac', '2', str(A / 'fx-whoosh.wav'))
run('-f', 'lavfi', '-i', 'sine=f=1900:d=0.05', '-af', "volume='0.6*exp(-70*t)':eval=frame", '-ar', '48000', '-ac', '2', str(A / 'fx-tick.wav'))
run('-f', 'lavfi', '-i', 'sine=f=540:d=0.16', '-af', "volume='0.6*exp(-22*t)':eval=frame", '-ar', '48000', '-ac', '2', str(A / 'fx-pop.wav'))
ev = [('fx-whoosh.wav', t - .12, .5) for t in (6.2, 7.8, 14.0, 19.1, 25.2, 29.5, 40.7, 47.6, 55.4)]
ev += [('fx-tick.wav', 10.1 + i * .27, .7) for i in range(6)] + [('fx-tick.wav', 16.7 + i * .09, .25) for i in range(13)]
ev += [('fx-pop.wav', t, .6) for t in (9.0, 14.6, 18.1, 29.9, 32.0, 32.4, 39.3, 43.5, 45.4)]
ev += [(str(FX / 'fx-impact.wav'), t, v) for t, v in ((3.15, .9), (12.0, .5), (22.0, .8), (33.6, .5), (47.9, 1.0))] + [(str(FX / 'fx-riser.wav'), 47.9 - 2.2, .5)]
cmd = ['-i', str(A / 'narration.mp3'), '-stream_loop', '-1', '-i', str(FX / 'music.mp3')]
fl = [f"[0]atrim=0:{END},aresample=48000,aformat=channel_layouts=stereo,asplit=2[v][key]", f"[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{END},afade=t=in:d=1,afade=t=out:st={END-3}:d=3,volume=0.13[m0]", "[m0][key]sidechaincompress=threshold=0.06:ratio=3:attack=15:release=700[m]"]
lab = ['[v]', '[m]']
for i, (f, t, vol) in enumerate(ev):
    cmd += ['-i', f if '/' in f else str(A / f)]; fl.append(f"[{i+2}]aresample=48000,aformat=channel_layouts=stereo,adelay={int(max(t,0)*1000)}:all=1,volume={vol}[f{i}]"); lab.append(f'[f{i}]')
fl.append(''.join(lab) + f"amix=inputs={len(lab)}:normalize=0,atrim=0:{END}[o]")
run(*cmd, '-filter_complex', ';'.join(fl), '-map', '[o]', '-ar', '48000', str(A / 'sample-raw.wav'))
err = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(A / 'sample-raw.wav'), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
gain = -15.0 - float(re.findall(r'I:\s+(-?[\d.]+) LUFS', err)[-1])
run('-i', str(A / 'sample-raw.wav'), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.8:level=disabled:attack=5:release=80', '-c:a', 'aac', '-b:a', '192k', str(A / 'sample-mix.m4a')); (A / 'sample-raw.wav').unlink(); print('sample audio ok, gain', round(gain, 2))
