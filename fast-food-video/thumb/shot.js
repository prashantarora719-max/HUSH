const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 1500 } });
  await p.goto('file://' + path.join(__dirname, 'thumb.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  for (const id of ['v1', 'v2']) await p.locator('#' + id).screenshot({ path: path.join(__dirname, `thumb-${id}.png`) });
  await b.close(); })();
