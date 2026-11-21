#!/usr/bin/env python3
"""Cut a Grok character sheet on white into separate transparent PNGs.
usage: cut_sheet.py <image> <prefix> <cols> name1 name2 ...   (names row by row)"""
import sys
from PIL import Image
import numpy as np
from scipy import ndimage
src, prefix, cols, names = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4:]
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(int); white = a.min(axis=2) > 232
lab, n = ndimage.label(white)
edge = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
fg = ~np.isin(lab, list(edge)); fg[int(im.height * .935):, int(im.width * .9):] = False   # watermark corner
l2, n2 = ndimage.label(fg); sizes = ndimage.sum(fg, l2, range(1, n2 + 1)); objs = ndimage.find_objects(l2)
rows = len(names) // cols
for i in range(n2):
    if sizes[i] < 8000: continue
    sl = objs[i]; cy = (sl[0].start + sl[0].stop) / 2; cx = (sl[1].start + sl[1].stop) / 2
    nm = names[int(cy // (im.height / rows)) * cols + int(cx // (im.width / cols))]
    y0, y1, x0, x1 = max(0, sl[0].start - 3), sl[0].stop + 3, max(0, sl[1].start - 3), sl[1].stop + 3
    m = ndimage.binary_dilation(l2[y0:y1, x0:x1] == i + 1, iterations=1); al = ndimage.gaussian_filter(m.astype(float), .7)
    o = Image.fromarray(np.dstack([a[y0:y1, x0:x1], np.clip(al * 1.3, 0, 1) * 255]).astype('uint8'), 'RGBA')
    o = o.resize((o.width * 2, o.height * 2), Image.LANCZOS); o.save(f'{prefix}{nm}.png'); print(nm, o.size)
