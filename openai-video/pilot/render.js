// Renders pilot.html. Usage: node render.js stills <dir> t1 t2 ... | node render.js video <out.mp4> [fps]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const [mode, out, ...rest] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'pilot.html'));
  await p.evaluate(() => Promise.all(['900 40px "Inter Display"', '500 40px "Inter Display"', '500 40px "JetBrains Mono"', '700 40px "JetBrains Mono"', '700 40px "DejaVu Serif"', 'italic 400 40px "DejaVu Serif"'].map(f => document.fonts.load(f))));
  const grab = t => p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t).then(u => Buffer.from(u.split(',')[1], 'base64'));
  if (mode === 'stills') { fs.mkdirSync(out, { recursive: true }); for (const t of rest) fs.writeFileSync(path.join(out, 't' + t + '.jpg'), await grab(+t)); }
  else { const fps = +(rest[0] || 60), dur = await p.evaluate(() => DURATION), n = Math.round(dur * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < n; f++) { if (!ff.stdin.write(await grab(f / fps))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('wrote', out); }
  await b.close();
})();
