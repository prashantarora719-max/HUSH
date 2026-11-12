// Renders overlay.html (transparent) over the footage bed.
// node render.js stills <bed.mp4> <dir> t1 t2 ...   |   node render.js seg <bed.mp4> <out.mp4> <firstFrame> <lastFrame>
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
const a = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'overlay.html'));
  await p.evaluate(() => Promise.all(['900 40px "Inter Display"', 'italic 700 40px "Inter Display"', '800 40px "Inter Display"', '600 40px "JetBrains Mono"', '700 40px "JetBrains Mono"'].map(f => document.fonts.load(f))));
  await p.evaluate(() => window.photosReady);
  const grab = t => p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png'); }, t).then(u => Buffer.from(u.split(',')[1], 'base64'));
  if (a[0] === 'stills') { fs.mkdirSync(a[2], { recursive: true });
    for (const t of a.slice(3)) { const png = path.join(a[2], 'o.png'); fs.writeFileSync(png, await grab(+t));
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', t, '-i', a[1], '-i', png, '-filter_complex', 'overlay,scale=960:540', '-frames:v', '1', path.join(a[2], 't' + (+t).toFixed(1).padStart(6, '0') + '.jpg')]); } }
  else { const f0 = +a[3], f1 = +a[4];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(f0 / 30), '-i', a[1], '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-filter_complex', '[0][1]overlay=shortest=1[v]', '-map', '[v]', '-frames:v', String(f1 - f0),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', a[2]], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = f0; f < f1; f++) { if (!ff.stdin.write(await grab(f / 30))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('wrote', a[2]); }
  await b.close();
})();
