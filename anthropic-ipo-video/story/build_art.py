"""Packs the illustrations in art/ into art.js as data URIs, so the page can draw them onto a canvas that can still be exported."""
import base64, json, pathlib
D = pathlib.Path(__file__).resolve().parent
(D / 'art.js').write_text('window.ART=' + json.dumps({p.stem: 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted((D / 'art').glob('*.jpg'))}) + ';')
