"""Scene list for the rebuilt film: which scene runs when, and which footage (if any) shows through it.
Writes scenes.js for film.html and, when given a directory, builds the footage bed (black except where a scene shows footage)."""
import json, pathlib, subprocess, sys
V = pathlib.Path(__file__).resolve().parent; R = V.parent.parent
TL = json.loads((V / 'timeline.js').read_text().split('=', 1)[1].rstrip().rstrip(';'))
FS = [R / 'anthropic-ipo-video' / 'footage', R / 'openai-video' / 'footage']
# (scene name, where it starts, footage clip, clip offset, window [x, y, w, h] or None for full frame)
SCENES = [
 ('K_open', '0.0', 'a16-times-square-crowd', 8), ('K_loss', '0.0:eighty'), ('B_public', '0.0:is', 'a19-bell', .5), ('C_demand', '0.1'), ('D_anthropic', '0.2'), ('E_value', '0.4'), ('F_never', '0.5', 'a05-older-man-paperwork', 1),
 ('G_flow', '0.6', 'a12-retired-couple', 1, [1160, 600, 620, 380]), ('H_winners', '0.8'), ('T_title', '1.0'), ('S_source', '1.2'),
 ('d_terms', '2.0'), ('d_rank', '2.3'), ('d_value', '2.4'), ('d_whisper', '2.8'),
 ('l_cols', '3.0'), ('l_fire', '3.3'), ('l_waterfall', '3.5'), ('l_operating', '3.9'), ('l_seesaw', '3.11'), ('l_compute', '3.14'), ('l_contract', '3.17'), ('l_race', '3.19'),
 ('s_what', '4.0'), ('s_customers', '4.3'), ('s_nine', '4.5'), ('s_quarters', '4.7'), ('s_behind', '4.10'), ('s_fork', '4.12'),
 ('o_intro', '5.0'), ('o_slope', '5.3'), ('o_half', '5.6'), ('o_inout', '5.7'), ('o_delay', '5.10'), ('o_versus', '5.11'), ('o_story', '5.12'),
 ('g_intro', '6.0'), ('g_stake', '6.4'), ('g_chips', '6.7'), ('g_matrix', '6.10'), ('g_amazon', '6.14'), ('g_direct', '6.16'), ('g_loop', '6.20'), ('g_paid', '6.24'),
 ('c_nvidia', '7.0'), ('c_votes', '7.4'), ('c_waffle', '7.7'), ('c_passenger', '7.9', 'a06-plane-passenger', 3),
 ('h_intro', '8.0', 'a16-times-square-crowd', 5), ('h_facebook', '8.1'), ('h_uber', '8.6'), ('h_both', '8.9'), ('h_lesson', '8.12'),
 ('r_you', '9.0', 'a12-retired-couple', 0), ('r_rule', '9.2'), ('r_indexes', '9.5'), ('r_forced', '9.6'), ('r_spacex', '9.8'), ('r_funds', '9.10'), ('r_sp', '9.12'), ('r_statement', '9.15', 'a05-older-man-paperwork', 6),
 ('w_intro', '10.0'), ('w_price', '10.1'), ('w_close', '10.5'), ('w_december', '10.8'), ('e_invited', '10.11', 'a16-times-square-crowd', 1), ('e_paid', '10.14'), ('e_final', '10.15', 'a12-retired-couple', 2),
]
def at(key):
    k, _, w = key.partition(':'); s, n = map(int, k.split('.')); t0 = TL['sections'][s]['sentences'][n]['start']
    if not w: return t0
    w, nth = (w.split('#') + ['1'])[:2]; nth = int(nth)
    for x, t in TL['sections'][s]['words']:
        if x == w and t >= t0 - .05:
            nth -= 1
            if nth == 0: return t
    raise KeyError(key)
def build():
    out = []
    for sc in SCENES:
        out.append({'n': sc[0], 't0': 0 if sc is SCENES[0] else round(at(sc[1]) - .15, 3), 'foot': list(sc[2:]) if len(sc) > 2 else None})
    for a, b in zip(out, out[1:] + [{'t0': TL['total']}]): a['t1'] = b['t0']
    return out
if __name__ == '__main__':
    sc = build(); (V / 'scenes.js').write_text('window.SC = ' + json.dumps(sc) + ';\n'); d = [round(s['t1'] - s['t0'], 1) for s in sc]
    print(len(sc), 'scenes; shortest', min(d), 'longest', max(d), 'footage scenes', sum(1 for s in sc if s['foot']))
    if len(sys.argv) > 1:
        T = pathlib.Path(sys.argv[1]); T.mkdir(parents=True, exist_ok=True); SRC = {p.stem: p for F in FS for p in F.glob('*.mp4')}; parts = []; fr = lambda t: round(t * 30)
        G = "eq=brightness=-0.10:contrast=1.14:saturation=0.75,vignette=PI/4"
        for i, s in enumerate(sc):
            # footage runs a little past each end of its scene so the dissolves have a picture under them
            a, b = fr(s['t0']), fr(s['t1']); n = b - a; o = T / f'{i:03}.mp4'; parts.append(o)
            if not s['foot']: subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=1920x1080:r=30', '-frames:v', str(n), '-c:v', 'libx264', '-bf', '0', '-crf', '22', '-pix_fmt', 'yuv420p', str(o)]); continue
            clip, ss, win = s['foot'][0], s['foot'][1], (s['foot'][2] if len(s['foot']) > 2 else None)
            cd = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(SRC[clip])]).decode()) - .2; d = n / 30; slow = ''
            if ss + d > cd: ss = max(0, cd - d)
            if d > cd: slow = f'setpts={d / cd * 1.03:.3f}*PTS,'  # the clip is shorter than the scene, so play it slightly slower
            if win: x, y, w, h = win; fc = f"[0]{slow}fps=30,scale={w + 80}:-2,crop={w}:{h}:40:0,eq=brightness=-0.04:contrast=1.08[v];[1][v]overlay={x}:{y},format=yuv420p"; cmd = ['-ss', str(ss), '-i', str(SRC[clip]), '-f', 'lavfi', '-i', 'color=c=black:s=1920x1080:r=30', '-filter_complex', fc]
            else: cmd = ['-ss', str(ss), '-i', str(SRC[clip]), '-vf', f"{slow}fps=30,scale=2112:1188:force_original_aspect_ratio=increase,crop=2112:1188,zoompan=z='1+0.0007*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,{G},format=yuv420p"]
            subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', *cmd, '-frames:v', str(n), '-an', '-c:v', 'libx264', '-bf', '0', '-crf', '17', '-preset', 'fast', str(o)])
            got = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', str(o)]).decode().strip().strip(','))
            assert got == n, (s['n'], got, n)
        (T / 'l.txt').write_text(''.join(f"file '{p}'\n" for p in parts)); subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(T / 'l.txt'), '-c', 'copy', str(T / 'bed.mp4')]); print('bed frames', fr(TL['total']))
