// Renders overlay.html (transparent) over the footage bed. Usage: node render.js <bed.mp4> <audio|none> <out.mp4> | node render.js stills <bed.mp4> <dir> t1 t2 ...
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
const a = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'overlay.html'));
  await p.evaluate(() => Promise.all(['900 40px "Inter Display"', '600 40px "JetBrains Mono"'].map(f => document.fonts.load(f))));
  const grab = t => p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png'); }, t).then(u => Buffer.from(u.split(',')[1], 'base64'));
  if (a[0] === 'stills') { fs.mkdirSync(a[2], { recursive: true });
    for (const t of a.slice(3)) { const png = path.join(a[2], 'o.png'); fs.writeFileSync(png, await grab(+t));
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', t, '-i', a[1], '-i', png, '-filter_complex', 'overlay', '-frames:v', '1', path.join(a[2], 't' + t + '.jpg')]); } }
  else { const dur = await p.evaluate(() => DURATION), n = Math.round(dur * 30), audio = a[1] !== 'none' ? ['-i', a[1]] : [];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', a[0], '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', ...audio, '-filter_complex', '[0][1]overlay=shortest=1[v]', '-map', '[v]', ...(audio.length ? ['-map', '2:a', '-c:a', 'aac', '-b:a', '192k'] : []),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', '-shortest', a[2]], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < n; f++) { if (!ff.stdin.write(await grab(f / 30))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('wrote', a[2]); }
  await b.close();
})();
