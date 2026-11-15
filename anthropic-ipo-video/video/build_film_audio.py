"""Mixes the film's sound: narration, ducked music, and synthesised sound design tied to the scene list."""
import json, re, subprocess, pathlib, build_film
R = pathlib.Path(__file__).resolve().parent.parent; A = R / 'audio'; FX = R.parent / 'nvidia-video' / 'audio'; at = build_film.at; sc = build_film.build(); total = build_film.TL['total']
def run(*a): subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', *a])
run('-f', 'lavfi', '-i', 'anoisesrc=d=0.6:c=pink:a=0.6', '-af', "highpass=f=700,lowpass=f=6000,volume='0.8*sin(PI*t/0.6)*sin(PI*t/0.6)':eval=frame", '-ar', '48000', '-ac', '2', str(A / 'fx-whoosh.wav'))
run('-f', 'lavfi', '-i', 'sine=f=1900:d=0.05', '-af', "volume='0.6*exp(-70*t)':eval=frame", '-ar', '48000', '-ac', '2', str(A / 'fx-tick.wav'))
run('-f', 'lavfi', '-i', 'sine=f=540:d=0.16', '-af', "volume='0.6*exp(-22*t)':eval=frame", '-ar', '48000', '-ac', '2', str(A / 'fx-pop.wav'))
chap = {'d_terms', 'l_cols', 's_what', 'o_intro', 'g_intro', 'c_nvidia', 'h_intro', 'r_you', 'w_intro'}
ev = [('fx-whoosh.wav', s['t0'] - .05, .22) for s in sc[1:]] + [(str(FX / 'fx-impact.wav'), s['t0'] + .25, .5) for s in sc if s['n'] in chap]
ev += [(str(FX / 'fx-impact.wav'), t, v) for t, v in ((at('0.0:eighty') - .1, .9), (at('0.4:one') - .2, .7), (at('1.0'), 1.0), (at('3.12:no'), .7), (at('5.1'), .6), (at('9.11:not'), .5), (total - 5 + .9, .8))]
ev += [('fx-pop.wav', t, .7) for t in (.45, 1.15, 1.85)] + [('fx-tick.wav', 2.3, .5)]
ev += [(str(FX / 'fx-riser.wav'), at('1.0') - 2.2, .45), (str(FX / 'fx-riser.wav'), at('10.15') - 2.2, .3)]
ev += [('fx-tick.wav', at('0.1:orders') + i * .27, .6) for i in range(6)] + [('fx-tick.wav', at('4.6:nine') - .5 + i * .1, .5) for i in range(9)] + [('fx-tick.wav', at('7.8:six') - .4 + i * .08, .5) for i in range(6)] + [('fx-tick.wav', at('9.3:fifteen') - .4 + i * .05, .4) for i in range(15)]
ev += [('fx-pop.wav', at(k) + d, .5) for k, d in (('0.6:weeks', 0), ('0.6:index', 0), ('0.6:funds', 0), ('0.7:retirement', 0), ('2.1:eight', -.2), ('2.1:seventy', -.2), ('2.2:sixty-four', -.2), ('4.4:banks', -.2), ('4.4:software', -.2), ('4.4:law', -.2),
    ('6.11:wins', .5), ('6.12:spends', .5), ('6.13:loses', .5), ('6.18:microsoft', -.1), ('6.18:nvidia', -.1), ('6.18:alphabet', -.1), ('6.18:micron', -.1), ('9.10:probably', -.3), ('9.10:probably', 0), ('9.13:twelve', -.3), ('9.13:profitable', -.3))]
cmd = ['-i', str(A / 'narration.mp3'), '-stream_loop', '-1', '-i', str(FX / 'music.mp3')]
fl = ["[0]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v][key]", f"[1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total},afade=t=in:d=1,afade=t=out:st={total-4}:d=4,volume=0.12[m0]", "[m0][key]sidechaincompress=threshold=0.06:ratio=3:attack=15:release=700[m]"]
lab = ['[v]', '[m]']
for i, (f, t, vol) in enumerate(ev):
    cmd += ['-i', f if '/' in f else str(A / f)]; fl.append(f"[{i+2}]aresample=48000,aformat=channel_layouts=stereo,adelay={int(max(t,0)*1000)}:all=1,volume={vol}[f{i}]"); lab.append(f'[f{i}]')
fl.append(''.join(lab) + f"amix=inputs={len(lab)}:normalize=0,atrim=0:{total}[o]")
(A / 'fc.txt').write_text(';'.join(fl)); run(*cmd, '-filter_complex_script', str(A / 'fc.txt'), '-map', '[o]', '-ar', '48000', str(A / 'film-raw.wav')); (A / 'fc.txt').unlink()
err = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(A / 'film-raw.wav'), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
gain = -15.0 - float(re.findall(r'I:\s+(-?[\d.]+) LUFS', err)[-1])
run('-i', str(A / 'film-raw.wav'), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.8:level=disabled:attack=5:release=80', '-c:a', 'aac', '-b:a', '192k', str(A / 'film-mix.m4a')); (A / 'film-raw.wav').unlink(); print('film audio ok;', len(ev), 'sound cues; gain', round(gain, 2))
