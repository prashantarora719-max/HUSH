#!/usr/bin/env python3
"""Turn the cut-outs into sticker art (white edge) and embed everything in art.js as data URIs."""
import base64, glob, io, json, os
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
out = {}
for f in sorted(glob.glob(os.path.join(HERE, 'art', '*'))):
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f)
    buf = io.BytesIO()
    if f.endswith('.png'):
        im = im.convert('RGBA'); s = 860 / im.height
        im = im.resize((round(im.width * s), 860), Image.LANCZOS)
        pad = 22
        c = Image.new('RGBA', (im.width + 2 * pad, im.height + pad), (0, 0, 0, 0)); c.paste(im, (pad, pad))
        a = c.split()[3].point(lambda v: 255 if v > 40 else 0)
        edge = a.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(1.2))
        st = Image.new('RGBA', c.size, (255, 255, 255, 0)); st.putalpha(edge)
        st = Image.alpha_composite(st, c)
        st.save(buf, 'PNG', optimize=True); mime = 'png'
    else:
        im.convert('RGB').save(buf, 'JPEG', quality=88); mime = 'jpeg'
    out[name] = f'data:image/{mime};base64,' + base64.b64encode(buf.getvalue()).decode()
open(os.path.join(HERE, 'art.js'), 'w').write('window.ART=' + json.dumps(out) + ';\n')
print({k: len(v) // 1024 for k, v in out.items()})
