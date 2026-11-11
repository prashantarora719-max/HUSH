// Renders video.html to MP4. Usage:
//   node render.js stills <outdir>            one check frame per scene
//   node render.js part <from> <to> <out.mp4> render seconds [from, to)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, [mode, ...a] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, 'video.html'));
  await page.evaluate(() => Promise.all([document.fonts.load('900 40px "Inter Display"'), document.fonts.load('500 40px "Inter Display"'),
    document.fonts.load('700 40px "Inter Display"'), document.fonts.load('500 40px "JetBrains Mono"'), document.fonts.load('700 40px "JetBrains Mono"')]));
  await page.waitForFunction(() => document.querySelector('canvas') && window.render);
  await page.waitForTimeout(300);
  const grab = t => page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t).then(u => Buffer.from(u.split(',')[1], 'base64'));
  if (mode === 'stills') {
    const scenes = await page.evaluate(() => SCENES);
    fs.mkdirSync(a[0], { recursive: true });
    for (let i = 0; i < scenes.length; i++) fs.writeFileSync(path.join(a[0], String(i).padStart(2, '0') + '.jpg'), await grab(scenes[i][1] - 0.55));
    console.log(scenes.length, 'stills');
  } else if (mode === 'at') {
    for (const t of a.slice(1)) fs.writeFileSync(path.join(a[0], 't' + t + '.jpg'), await grab(+t));
  } else {
    const from = +a[0], to = Math.min(+a[1], await page.evaluate(() => DURATION));
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-crf', '18', '-preset', 'medium', a[2]], { stdio: ['pipe', 'inherit', 'inherit'] });
    const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS);
    for (let f = f0; f < f1; f++) { if (!ff.stdin.write(await grab(f / FPS))) await new Promise(r => ff.stdin.once('drain', r)); if ((f - f0) % 600 === 0) console.log(a[2], f - f0, '/', f1 - f0); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', a[2]);
  }
  await browser.close();
})();
