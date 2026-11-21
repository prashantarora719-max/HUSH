// Visit every shot once and dump the sound cues the picture registered: node dryrun.js full.html cues.json
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, process.argv[2])); await p.evaluate(() => window.assetsReady);
  const cues = await p.evaluate(() => { for (let t = 0; t < TL.DUR; t += .1) render(t); return { cues: Object.keys(window.CUES), dur: TL.DUR }; });
  fs.writeFileSync(path.join(__dirname, process.argv[3]), JSON.stringify(cues)); console.log(cues.cues.length, 'cues'); await b.close(); })();
