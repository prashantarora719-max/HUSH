"""Cuts three vertical Shorts from the finished film: a headline on top, the clip in the middle, large captions under it."""
import re, json, subprocess, pathlib, html
D = pathlib.Path(__file__).resolve().parent; R = D.parent; F = R / 'video' / 'fonts'
SHORTS = [('short-1-paper-loss', 123.21, 170.09, 'It lost $80 billion', 'in six months. Or did it?'),
          ('short-2-which-fund', 650.84, 688.71, 'Does your fund have to buy', 'the $1.4 trillion Anthropic IPO?'),
          ('short-3-no-vote', 483.51, 523.14, '$140 billion invested.', 'Zero votes.')]
def tsec(s): h, m, x = s.split(':'); return int(h) * 3600 + int(m) * 60 + float(x.replace(',', '.'))
caps = [(tsec(a), tsec(b), t.strip()) for a, b, t in re.findall(r'\d+\n(\S+) --> (\S+)\n(.+?)\n\n', (R / 'story-captions.srt').read_text() + '\n', flags=re.S)]
CSS = f"""@font-face{{font-family:News;font-weight:600;src:url('{F}/newsreader-latin-600-normal.woff2')}}@font-face{{font-family:News;font-weight:400;font-style:italic;src:url('{F}/newsreader-latin-400-italic.woff2')}}@font-face{{font-family:News;font-weight:500;src:url('{F}/newsreader-latin-500-normal.woff2')}}@font-face{{font-family:Inter;font-weight:700;src:url('{F}/inter-latin-700-normal.woff2')}}
body{{margin:0}}.p{{width:1080px;position:relative;font-family:News;color:#141413}}"""
pages = []
for name, a, b, h1, h2 in SHORTS:
    pages.append((f'{name}-base', 1920, f"""<div class="p" style="height:1920px;background:#faf3e1"><div style="position:absolute;left:0;top:0;width:100%;height:22px;background:#d97757"></div>
<div style="position:absolute;left:70px;top:150px;font-family:Inter;font-weight:700;font-size:30px;letter-spacing:6px;color:#d97757">PAPER TRILLIONS</div>
<div style="position:absolute;left:66px;top:210px;width:950px;font-weight:600;font-size:92px;line-height:1.02;letter-spacing:-2px">{html.escape(h1)}</div>
<div style="position:absolute;left:70px;top:{210 + (200 if len(h1) > 22 else 104)}px;width:950px;font-style:italic;font-weight:400;font-size:64px;line-height:1.08;color:#d97757">{html.escape(h2)}</div>
<div style="position:absolute;left:0;top:1138px;width:100%;height:6px;background:rgba(20,20,19,.12)"></div>
<div style="position:absolute;left:70px;top:1560px;width:800px;font-family:Inter;font-weight:700;font-size:34px;line-height:1.3">Full story on the channel:<br><span style="color:#d97757">The Anthropic IPO, explained with Frank</span></div></div>"""))
    for i, (ca, cb, t) in enumerate(c for c in caps if c[0] >= a - .05 and c[0] < b - .6):
        frank = t.startswith('FRANK: '); t = t[7:] if frank else t
        pages.append((f'{name}-c{i:02}', 400, f"""<div class="p" style="height:400px">{'<div style="position:absolute;left:70px;top:8px;font-family:Inter;font-weight:700;font-size:26px;letter-spacing:5px;color:#d97757">FRANK</div>' if frank else ''}
<div style="position:absolute;left:66px;top:{48 if frank else 20}px;width:950px;font-weight:{600 if frank else 500};font-size:{58 if len(t) < 70 else 50}px;line-height:1.14;letter-spacing:-.5px">{'“' + html.escape(t) + '”' if frank else html.escape(t)}</div></div>"""))
(D / 'pages.json').write_text(json.dumps(pages)); (D / 'pages.css').write_text(CSS)
subprocess.check_call(['node', '-e', """
const {chromium}=require('playwright'),fs=require('fs');(async()=>{const P=JSON.parse(fs.readFileSync('pages.json')),css=fs.readFileSync('pages.css','utf8');fs.mkdirSync('png',{recursive:true});const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const [n,h,body] of P){await p.setViewportSize({width:1080,height:h});await p.setContent('<!doctype html><meta charset=utf-8><style>'+css+'</style>'+body);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:'png/'+n+'.png',omitBackground:true});}await b.close()})()"""], cwd=D)
for name, a, b, h1, h2 in SHORTS:
    cs = [c for c in caps if c[0] >= a - .05 and c[0] < b - .6]; d = b - a
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(a), '-t', str(d), '-i', str(R / 'story-film.mp4'), '-loop', '1', '-t', str(d), '-i', str(D / 'png' / f'{name}-base.png')]
    fc = '[0:v]scale=1080:608,setsar=1[v];[1:v][v]overlay=0:520[b0]'
    for i, (ca, cb, t) in enumerate(cs):
        cmd += ['-i', str(D / 'png' / f'{name}-c{i:02}.png')]; e = (cs[i + 1][0] if i + 1 < len(cs) else b) - a
        fc += f";[b{i}][{i + 2}:v]overlay=0:1170:enable='between(t,{max(0, ca - a):.2f},{e:.2f})'[b{i + 1}]"
    fc += f";[b{len(cs)}]fade=t=out:st={d - .4:.2f}:d=0.4,format=yuv420p[o];[0:a]afade=t=in:d=0.15,afade=t=out:st={d - .5:.2f}:d=0.5[ao]"
    subprocess.check_call(cmd + ['-filter_complex', fc, '-map', '[o]', '-map', '[ao]', '-r', '30', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(D / f'{name}.mp4')])
    print(name, round(d, 1), 's', len(cs), 'captions')
