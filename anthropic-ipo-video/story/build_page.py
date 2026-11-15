"""Assembles the film page: story.js (opening + cutaways), core.js (shared drawing tools on warm paper), scenes.js and film.html."""
import pathlib, re, json
from PIL import Image
D = pathlib.Path(__file__).resolve().parent; V = D.parent / 'video'
t = (D / 'test.js').read_text(); t = t[:t.index('function render(t)')]
t = t.replace("window.assetsReady = Promise.all([", "window.assetsReady = Promise.all([window.assetsReady, ")
bg = {p.stem: 'rgb(%d,%d,%d)' % Image.open(p).getpixel((20, 20)) for p in sorted((D / 'art').glob('*.jpg'))}
t = re.sub(r"IM = \{\}, BG = \{.*?\};", "IM = {}, BG = " + json.dumps(bg) + ";", t, flags=re.S); t = re.sub(r"const NAMES = \[.*?\];", "const NAMES = Object.keys(window.ART);", t, flags=re.S)
(D / 'story.js').write_text('(() => {\n' + t + (D / 'story-extra.js').read_text() + '\n})();\n')
(D / 'core.js').write_text((V / 'film-core.js').read_text().replace("CREAM = '#f0eee6'", "CREAM = '#faf3e1'"))
src = (V / 'build_film.py').read_text(); blk = src[src.index('SCENES = ['):]; blk = blk[:blk.index('\n]')]
sc = [(n, k) for n, k in re.findall(r"\('([A-Za-z_]+)', '([0-9.:a-z#-]+)'", blk) if int(k.split('.')[0]) >= 1]
TL = json.loads((D / 'tl.js').read_text().split('\n')[0].split('=', 1)[1].rstrip(';'))
def at(k):
    s, n = map(int, k.split(':')[0].split('.')); t0 = TL['sections'][s]['sentences'][n]['start']
    if ':' not in k: return t0
    w = k.split(':')[1].split('#')[0]; return next((tt for x, tt in TL['sections'][s]['words'] if x == w and tt >= t0 - .05), t0)
out = [{'n': n, 't0': round(63.5 if i == 0 else at(k) - .25, 3), 'foot': False} for i, (n, k) in enumerate(sc)]
for i, o in enumerate(out): o['t1'] = out[i + 1]['t0'] if i + 1 < len(out) else TL['total']
(D / 'scenes.js').write_text('window.SC = ' + json.dumps(out) + ';\n')
h = (V / 'film.html').read_text().replace("url('fonts/", "url('../video/fonts/")
h = re.sub(r'<script src="timeline.js">.*</body>', '<script src="tl.js"></script><script src="scenes.js"></script><script src="../video/logos.js"></script><script src="../video/photos.js"></script><script src="art.js"></script><script src="core.js"></script><script src="../video/film-a.js"></script><script src="../video/film-b.js"></script><script src="../video/film-c.js"></script><script src="../video/film-d.js"></script><script src="story.js"></script>\n<script>render(+new URLSearchParams(location.search).get("t") || 0);</script></body>', h, flags=re.S)
(D / 'film.html').write_text(h); print(len(out), 'scenes')
