#!/usr/bin/env python3
"""Flat-style Frank: embed the six poses plus blink variants in art2.js."""
from PIL import Image, ImageDraw
import numpy as np, base64, io, json, os
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); out = {}
def uri(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
for nm in ['stand', 'crossed', 'receipt', 'point', 'shrug', 'walk']:
    im = Image.open(f'{HERE}/art2/frank-{nm}.png'); out[nm] = uri(im)
    if nm == 'walk': continue
    a = np.asarray(im).astype(int); H, W = a.shape[:2]
    dark = (a[:, :, :3].max(axis=2) < 70) & (a[:, :, 3] > 200); dark[:int(H * .14)] = False; dark[int(H * .34):] = False
    lab, n = ndimage.label(dark); eyes = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        h = sl[0].stop - sl[0].start; w = sl[1].stop - sl[1].start; ar = (lab[sl] == i + 1).sum()
        if 40 < ar < 700 and .75 < h / w < 1.9 and ar / (h * w) > .6: eyes.append(((sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2, max(h, w) / 2))
    head = a[int(H * .1):int(H * .3)]; sk = head[(head[:, :, 0] > 225) & (head[:, :, 1] > 170) & (head[:, :, 1] < 225) & (head[:, :, 2] < 200)]
    skin = tuple(int(v) for v in np.median(sk[:, :3], axis=0))
    b = im.copy(); d = ImageDraw.Draw(b)
    for x, y, r in eyes:
        R = r * (3.3 if nm in ('receipt', 'point') else 2.1)
        d.ellipse((x - R, y - R, x + R, y + R), fill=skin + (255,))
        d.arc((x - r * 1.7, y - r * 2.2, x + r * 1.7, y + r * .9), 25, 155, fill=(26, 34, 64, 255), width=5)
    out[nm + '-blink'] = uri(b)
open(f'{HERE}/art2.js', 'w').write('window.ART2=' + json.dumps(out) + ';\n')
