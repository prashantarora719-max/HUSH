"""Cuts and grades the stock clips into the footage bed for the cold-open test."""
import subprocess, pathlib
R = pathlib.Path(__file__).resolve().parent.parent; F = R / 'footage'; T = pathlib.Path('/tmp/claude-0/-home-user-HUSH/8cdc9d6b-115b-561f-88af-dd8ee2526e83/scratchpad/bed'); T.mkdir(parents=True, exist_ok=True)
GRADE = "eq=brightness=0.02:contrast=1.12:saturation=0.82:gamma=1.22,colorbalance=bs=0.05:rs=-0.02,vignette=PI/5"
DC = "eq=brightness=0.06:contrast=1.15:saturation=0.9:gamma=1.9,vignette=PI/5"
DAY = "eq=brightness=-0.16:contrast=1.2:saturation=0.5,colorbalance=bs=0.10:rs=-0.05,vignette=PI/3.6"
# (clip, start, duration, starting zoom, extra filter)
SHOTS = [('01-skyline', 2.0, 2.2, 1.00, GRADE), ('01-skyline', 8.0, 2.2, 1.15, GRADE), ('01-skyline', 13.5, 2.2, 1.30, GRADE),
         ('03-typing', 0.3, 2.4, 1.00, GRADE), ('03-typing', 3.0, 2.4, 1.35, GRADE),
         ('05-datacenter', 0.5, 3.0, 1.00, DC), ('05-datacenter', 4.5, 3.0, 1.25, DC),
         ('06-crane', 3.0, 3.2, 1.00, DAY), ('07-crowd', 2.0, 2.8, 1.00, GRADE), ('07-crowd', 7.0, 3.2, 1.30, GRADE),
         ('01-skyline', 15.5, 0.6, 1.4, GRADE), ('03-typing', 5.5, 0.6, 1.2, GRADE), ('05-datacenter', 7.8, 0.6, 1.4, DC), ('06-crane', 10.0, 0.6, 1.2, DAY),
         ('05-datacenter', 1.0, 7.0, 1.10, DC + ",boxblur=14:2,eq=brightness=-0.10")]
parts = []
for i, (clip, ss, dur, z0, grade) in enumerate(SHOTS):
    out = T / f's{i:02}.mp4'; n = round(dur * 30)
    vf = (f"fps=30,scale=2880:1620:force_original_aspect_ratio=increase,crop=2880:1620,"
          f"zoompan=z='{z0}+0.0009*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,{grade},format=yuv420p")
    subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(ss), '-i', str(F / f'{clip}.mp4'), '-frames:v', str(n), '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', str(out)])
    parts.append(out)
(T / 'list.txt').write_text(''.join(f"file '{p}'\n" for p in parts))
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(T / 'list.txt'), '-c', 'copy', str(T / 'bed.mp4')])
print(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(T / 'bed.mp4')]).decode())
