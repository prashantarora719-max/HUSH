// Renders pilot.html to an MP4, frame by frame.
// Usage: node render.js [out.mp4] [--nocaptions] [--stills=3,12,22]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30;
const args = process.argv.slice(2);
const out = args.find(a => !a.startsWith('--')) || path.join(__dirname, 'pilot.mp4');
const stills = (args.find(a => a.startsWith('--stills=')) || '').replace('--stills=', '');
const query = args.includes('--nocaptions') ? '?nocaptions' : '';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, 'pilot.html') + query);
  await page.evaluate(() => Promise.all([
    document.fonts.load('900 40px "Inter Display"'), document.fonts.load('500 40px "Inter Display"'),
    document.fonts.load('500 40px "JetBrains Mono"')]));
  const grab = t => page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, t)
    .then(u => Buffer.from(u.split(',')[1], 'base64'));

  if (stills) {
    for (const t of stills.split(',').map(Number)) fs.writeFileSync(`${out}-${t}.jpg`, await grab(t));
    await browser.close(); return;
  }
  const duration = await page.evaluate(() => DURATION);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(duration * FPS);
  for (let f = 0; f < total; f++) {
    if (!ff.stdin.write(await grab(f / FPS))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
