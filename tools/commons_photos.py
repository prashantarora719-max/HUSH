"""Finds freely licensed photos on Wikimedia Commons, downloads them and writes their credits.
Usage: python3 tools/commons_photos.py <out_dir> "Name One" "Name Two" ...   (add :N after a name to take the Nth match)"""
import json, re, sys, html, time, pathlib, subprocess, urllib.error, urllib.parse, urllib.request
API = 'https://commons.wikimedia.org/w/api.php'; UA = {'User-Agent': 'video-research-script/1.0 (educational use)'}
def get(url, tries=5):
    for k in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or k == tries - 1: raise
            time.sleep(45 * (k + 1))  # be polite when the site asks us to slow down
def clean(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
cf = out / 'credits.json'; credits = json.loads(cf.read_text()) if cf.exists() else []
for arg in sys.argv[2:]:
    name, _, pick = arg.partition(':'); pick = int(pick or 1)
    if any(c['person'] == name for c in credits): continue  # already fetched
    time.sleep(5)
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': f'intitle:"{name}" filetype:bitmap', 'gsrnamespace': 6, 'gsrlimit': 20,
                                'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime'})
    pages = sorted(json.loads(get(f'{API}?{q}')).get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 99))
    ok = []
    for p in pages:
        ii = p['imageinfo'][0]; m = ii['extmetadata']; lic = clean(m.get('LicenseShortName', {}).get('value'))
        if ii['mime'] != 'image/jpeg' or ii['width'] < 500 or not re.match(r'(CC BY|CC0|Public domain|CC-BY)', lic, re.I) or 'NC' in lic or 'ND' in lic: continue
        ok.append((p['title'], ii, lic, clean(m.get('Artist', {}).get('value'))[:80], clean(m.get('ImageDescription', {}).get('value'))[:110]))
    print(f'\n{name}: {len(ok)} usable'); [print(f'  {i+1}. {t} | {l} | {a} | {d}') for i, (t, _, l, a, d) in enumerate(ok[:6])]
    if len(ok) < pick: continue
    t, ii, lic, artist, desc = ok[pick - 1]; slug = re.sub(r'[^a-z]+', '-', name.lower()).strip('-')
    raw = out / f'{slug}-original.jpg'; raw.write_bytes(get(ii['url']))  # the original; thumbnails live on a host we cannot reach
    subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(raw), '-vf', "scale='min(1600,iw)':-2", '-q:v', '3', str(out / f'{slug}.jpg')]); raw.unlink()
    credits = [c for c in credits if c['person'] != name]; credits.append({'person': name, 'file': f'{slug}.jpg', 'title': t, 'author': artist, 'licence': lic, 'page': ii['descriptionurl']})
    cf.write_text(json.dumps(credits, indent=1))
