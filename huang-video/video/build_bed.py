"""Cuts and grades the stock clips into the footage bed, following the shot list in build_plan.py."""
import subprocess, pathlib, sys, collections
from concurrent.futures import ThreadPoolExecutor
import build_plan
R = pathlib.Path(__file__).resolve().parent.parent.parent
F = R / 'openai-video' / 'footage'; PORTRAIT = R / 'nvidia-video' / 'thumbnail' / 'assets' / 'huang-illustration.jpg'
T = pathlib.Path(sys.argv[1]); T.mkdir(parents=True, exist_ok=True)
GRADE = "eq=brightness=0.02:contrast=1.12:saturation=0.82:gamma=1.22,colorbalance=bs=0.05:rs=-0.02,vignette=PI/5"
G = collections.defaultdict(lambda: GRADE, {
    '05-datacenter': "eq=brightness=0.06:contrast=1.15:saturation=0.9:gamma=1.9,vignette=PI/5",
    '31-boardroom': "eq=brightness=-0.14:contrast=1.2:saturation=0.55,colorbalance=bs=0.08:rs=-0.04,vignette=PI/3.8",
    '32-chair': "eq=brightness=-0.16:contrast=1.2:saturation=0.6,colorbalance=bs=0.06,vignette=PI/3.8",
    '36-engineers': "eq=brightness=-0.16:contrast=1.2:saturation=0.55,colorbalance=bs=0.08:rs=-0.04,vignette=PI/3.8",
    '39-people-walking': "eq=brightness=-0.12:contrast=1.15:saturation=0.55,colorbalance=bs=0.08,vignette=PI/3.8",
    '37-chess': "eq=brightness=-0.06:contrast=1.12:saturation=0.75,vignette=PI/4.5",
    '38-stage': "eq=contrast=1.1:saturation=0.9,vignette=PI/5",
    '17-construction-night': "eq=brightness=0.03:contrast=1.1:saturation=0.85:gamma=1.25,vignette=PI/5",
    'portrait': "vignette=PI/6"})
FLIP = {'01-skyline', '31-boardroom', '32-chair', '38-stage', '05-datacenter', '17-construction-night', '37-chess', '07-crowd'}
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]).decode())
D = {p.stem: dur(p) for p in F.glob('*.mp4')}
ents, shots = build_plan.build(); total = build_plan.TL['total']
fr = [round(s[0] * 30) for s in shots] + [round(total * 30)]
uses = collections.Counter(); jobs = []
for i, (t, clip, ss, dim) in enumerate(shots):
    n = fr[i + 1] - fr[i]; d = n / 30; k = uses[clip]; uses[clip] += 1
    z0 = 1.0 + 0.1 * (k % 3); pre = 'hflip,' if clip in FLIP and k % 2 else ''
    grade = G[clip] + (",boxblur=16:2,eq=brightness=-0.16" if dim else '')
    if clip == 'portrait':
        inp = ['-loop', '1', '-framerate', '30', '-t', str(d + 1), '-i', str(PORTRAIT)]; z0 = 1.0 + 0.05 * (k % 3)
    else:
        cd = D[clip] - .15
        if ss + d > cd: ss = max(0, cd - d)
        if d > cd: pre += f'setpts={d / cd * 1.03:.3f}*PTS,'
        inp = ['-ss', str(ss), '-i', str(F / f'{clip}.mp4')]
    vf = (f"{pre}fps=30,scale=2880:1620:force_original_aspect_ratio=increase,crop=2880:1620,"
          f"zoompan=z='{z0}+0.0008*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,{grade},format=yuv420p")
    jobs.append((['ffmpeg', '-y', '-loglevel', 'error', *inp, '-frames:v', str(n), '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', str(T / f's{i:03}.mp4')], n))
with ThreadPoolExecutor(4) as ex: list(ex.map(lambda j: subprocess.check_call(j[0]), jobs))
# every shot must have exactly its frame count, or the pictures drift off the words
for i, (_, n) in enumerate(jobs):
    got = int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', str(T / f's{i:03}.mp4')]).decode().strip().strip(','))
    assert got == n, (i, shots[i], got, n)
(T / 'list.txt').write_text(''.join(f"file '{T / f's{i:03}.mp4'}'\n" for i in range(len(jobs))))
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(T / 'list.txt'), '-c', 'copy', str(T / 'bed.mp4')])
print('bed', dur(T / 'bed.mp4'), 'expected', total)
