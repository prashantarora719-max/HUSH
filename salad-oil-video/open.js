// Cold open sampler for the salad oil pilot. Deterministic: render(t) draws the frame at t seconds.
const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 1920, H = 1080, TL = window.TL, IMG = {};
window.assetsReady = Promise.all([...Object.entries(window.ART).map(([k, u]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = u; })),
  ...['700 60px Fraunces', 'italic 400 40px Fraunces', '40px Plex', '80px Anton'].map(f => document.fonts.load(f))]);
window.CUES = {}; const cue = (k, t0) => { window.CUES[k + '@' + t0.toFixed(2)] = 1; };
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, p) => a + (b - a) * p, oc = p => 1 - Math.pow(1 - cl(p), 3), io = p => { p = cl(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const pr = (t, t0, d = .4) => cl((t - t0) / d);
const norm = s => s.toLowerCase().replace(/[^a-z0-9'’-]/g, '');
const wt = (word, nth = 0) => { const k = norm(word); let m = TL.w.filter(w => norm(w[2]) === k); if (!m.length) m = TL.w.filter(w => norm(w[2]).startsWith(k)); if (!m.length) throw new Error('no word ' + word); return (m[nth] || m[m.length - 1])[0]; };
const AMB = '#f2b25c', INKY = '#0b1320', PAPER = '#efe6d2';
// pseudo-random, stable per index
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const grainC = document.createElement('canvas'); grainC.width = 480; grainC.height = 270; { const q = grainC.getContext('2d'), d = q.createImageData(480, 270); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (rnd(i) - .5) * 150; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } q.putImageData(d, 0, 0); }
function finish(t) {   // vignette, drifting dust, film grain
  const v = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1180); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.62)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 46; i++) { const x = (rnd(i) * W + t * (8 + rnd(i + 9) * 22)) % W, y = (rnd(i + 50) * H + Math.sin(t * .4 + i) * 30 + t * 6 * (rnd(i + 3) - .5) + H) % H, r = 1.2 + rnd(i + 20) * 2.6; g.fillStyle = `rgba(255,220,170,${.05 + .1 * rnd(i + 70)})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore();
  g.save(); g.globalAlpha = .07; g.globalCompositeOperation = 'overlay'; const f = Math.floor(t * 24), ox = -(rnd(f) * 200), oy = -(rnd(f + 5) * 120); g.drawImage(grainC, ox, oy, W + 240, H + 160); g.restore();
}
// a painting with a slow camera move: from [cx,cy,zoom] to [cx,cy,zoom] (image coordinates, 1920x1080)
function paint(name, p, a, b) { const e = io(p), cx = lerp(a[0], b[0], e), cy = lerp(a[1], b[1], e), z = lerp(a[2], b[2], e); g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); g.drawImage(IMG[name], 0, 0, W, H); g.restore(); return [cx, cy, z]; }
const toScreen = (c, x, y) => [W / 2 + (x - c[0]) * c[2], H / 2 + (y - c[1]) * c[2]];
function glow(x, y, r, a, col = '255,190,110') { g.save(); g.globalCompositeOperation = 'lighter'; const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(${col},${a})`); q.addColorStop(1, `rgba(${col},0)`); g.fillStyle = q; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore(); }
function fog(t, a = .1) { g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 5; i++) { const x = ((rnd(i + 200) * 2600 + t * (14 + i * 5)) % 2600) - 340, y = 520 + rnd(i + 210) * 420, r = 380 + rnd(i + 220) * 300; const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(150,180,200,${a})`); q.addColorStop(1, 'rgba(150,180,200,0)'); g.fillStyle = q; g.fillRect(x - r, y - r, 2 * r, 2 * r); } g.restore(); }
function typed(s, x, y, size, t, t0, o = {}) { if (t < t0) return; const n = Math.floor((t - t0) / (o.cps ? 1 / o.cps : .035)), a = o.out ? 1 - pr(t, o.out, .4) : 1; if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = `${size}px Plex`; g.textAlign = o.align || 'left'; g.textBaseline = 'middle'; g.fillStyle = o.col || '#fff'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 12; const str = s.slice(0, n); g.fillText(str + (n < s.length && Math.floor(t * 8) % 2 ? '▌' : ''), x, y); g.restore(); if (!o.quiet) cue('type', t0); }
function title(s, x, y, size, t, t0, o = {}) { if (t < t0) return; const p = oc(pr(t, t0, o.d || .7)), a = (o.out ? 1 - pr(t, o.out, .4) : 1) * p; if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = `${o.italic ? 'italic 400' : '700'} ${size}px ${o.font || 'Fraunces'}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.fillStyle = o.col || '#fff'; g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 26; g.shadowOffsetY = 4; g.fillText(s, x, y + (1 - p) * (o.rise ?? 26)); g.restore(); }
function tagRecon(t, t0) { const a = pr(t, t0 + .6, .6); g.save(); g.globalAlpha = .7 * a; g.font = '26px Plex'; g.textAlign = 'right'; g.fillStyle = '#fff'; g.fillText('RECONSTRUCTION', W - 60, H - 52); g.restore(); }
// cross-section of a tank: x,y = top-left of the shell; depth = how far the measuring line has gone (0..1)
function tankCut(t, x, y, w, h, o = {}) {
  const oil = o.oil ?? .07, reveal = o.reveal ?? 0, r = 26; g.save();
  g.beginPath(); g.roundRect(x, y, w, h, [r, r, 8, 8]); g.clip();
  g.fillStyle = '#070c14'; g.fillRect(x, y, w, h);
  const top = y + h * .1, oy = top + (h - (top - y)) * oil;
  const wg = g.createLinearGradient(0, oy, 0, y + h); wg.addColorStop(0, `rgba(40,110,170,${.25 + .75 * reveal})`); wg.addColorStop(1, `rgba(10,40,80,${.25 + .75 * reveal})`); g.fillStyle = wg; g.fillRect(x, oy, w, y + h - oy);
  if (reveal > 0) { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const yy = oy + 30 + i * (y + h - oy) / 7 + Math.sin(t * 1.3 + i) * 10; g.strokeStyle = `rgba(120,200,255,${.10 * reveal})`; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 20; k++) { const xx = x + w * k / 20; g.lineTo(xx, yy + Math.sin(k * .9 + t * 2 + i) * 7); } g.stroke(); } g.globalCompositeOperation = 'source-over'; }
  const og = g.createLinearGradient(0, top, 0, oy); og.addColorStop(0, '#ffd27a'); og.addColorStop(1, '#c9861e'); g.fillStyle = og; g.beginPath(); g.moveTo(x, top + Math.sin(t * 2) * 2); for (let k = 0; k <= 24; k++) g.lineTo(x + w * k / 24, top + Math.sin(k * .8 + t * 2.2) * 2.5); g.lineTo(x + w, oy); g.lineTo(x, oy); g.fill();
  g.restore(); g.lineWidth = o.lw || 7; g.strokeStyle = o.stroke || '#8fa2b8'; g.beginPath(); g.roundRect(x, y, w, h, [r, r, 8, 8]); g.stroke();
  return [top, oy];
}
const SH = [];   // [start, draw(t, lt)]
// 0. black, date
SH.push([0, t => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }]);
// 1. the tank farm
SH.push([.5, (t, lt) => { const c = paint('tankfarm', lt / 9.2, [1000, 540, 1.04], [560, 470, 1.5]); const [fx, fy] = toScreen(c, 395, 395); glow(fx + 60, fy - 10, 260 * c[2], .16 + .05 * Math.sin(t * 9) * Math.sin(t * 3.1)); fog(t, .09);
  typed('BAYONNE, NEW JERSEY', 110, 880, 44, t, 1.3, { out: 8.3 }); typed('NOVEMBER 1963', 110, 944, 44, t, 2.5, { out: 8.3, col: AMB }); tagRecon(t, .5); }]);
// 2. on paper: the receipt
SH.push([wt('On') - .35, (t, lt) => { const bgd = g.createRadialGradient(W / 2, 420, 100, W / 2, 540, 1300); bgd.addColorStop(0, '#22303f'); bgd.addColorStop(1, '#070b12'); g.fillStyle = bgd; g.fillRect(0, 0, W, H);
  const e = oc(pr(lt, 0, .9)), tilt = lerp(-.09, -.035, e); cue('paper', wt('On') - .3); g.save(); g.translate(W / 2 - 250, 560 + (1 - e) * 500); g.rotate(tilt); g.scale(1 + lt * .012, 1 + lt * .012);
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 60; g.shadowOffsetY = 30; g.fillStyle = PAPER; g.fillRect(-520, -330, 1040, 660); g.shadowColor = 'transparent';
  g.strokeStyle = '#3a3226'; g.lineWidth = 4; g.strokeRect(-490, -300, 980, 600); g.lineWidth = 1.5; g.strokeRect(-478, -288, 956, 576);
  g.fillStyle = '#2a241b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 62px Fraunces'; g.fillText('WAREHOUSE RECEIPT', 0, -225); g.font = '26px Plex'; g.fillText('NEGOTIABLE · FOR GOODS HELD IN STORAGE', 0, -170);
  g.textAlign = 'left'; g.font = '30px Plex'; [['COMMODITY', 'SOYBEAN OIL, IN BULK'], ['STORED AT', 'BAYONNE, N.J. · TANK NO. ——'], ['QUANTITY', '']].forEach(([a, b], i) => { const y = -90 + i * 86; g.fillStyle = '#6b6050'; g.fillText(a, -430, y); g.fillStyle = '#2a241b'; g.fillText(b, -160, y); g.strokeStyle = '#b8ab92'; g.lineWidth = 2; g.beginPath(); g.moveTo(-430, y + 30); g.lineTo(430, y + 30); g.stroke(); });
  const n = Math.round(lerp(0, 6400000, oc(pr(t, wt('holds') - .1, 1.6)))); g.font = '64px Anton'; g.fillStyle = '#a3241c'; g.fillText(n.toLocaleString('en-US') + ' LBS', -160, 84);
  const ta = wt('American') - .1; if (t >= ta) { const q = pr(t, ta, .5); g.save(); g.globalAlpha = q; g.fillStyle = 'rgba(255,214,90,.55)'; g.fillRect(-440, 176, 880 * oc(pr(t, ta + .1, .7)), 62); g.restore(); g.font = '30px Plex'; g.fillStyle = '#6b6050'; g.fillText('ISSUED BY', -430, 208); g.fillStyle = '#2a241b'; g.font = '700 34px Fraunces'; g.fillText('American Express Field Warehousing', -250, 208); cue('hit', ta + .05); }
  g.restore();
  const tb = wt('Banks') - .15; for (let i = 0; i < 5; i++) { const t0 = tb + i * .16; if (t < t0) continue; const q = oc(pr(t, t0, .5)); g.save(); g.translate(1440 + (i % 2) * 150 - 40, 720 - i * 105 + (1 - q) * 120); g.rotate((rnd(i + 5) - .5) * .12); g.globalAlpha = q; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 12; g.fillStyle = '#5f8f66'; g.fillRect(-170, -42, 340, 84); g.shadowColor = 'transparent'; g.strokeStyle = '#d8e6c8'; g.lineWidth = 3; g.strokeRect(-154, -28, 308, 56); g.font = '34px Plex'; g.fillStyle = '#eaf2dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LOAN', 0, 2); g.restore(); if (i === 0) cue('paper', t0); }
  typed('ILLUSTRATION', W - 60, H - 52, 26, t, wt('On') + .4, { align: 'right', col: 'rgba(255,255,255,.7)', quiet: 1, cps: 60 }); }]);
// 3. the hatch
SH.push([wt('He') - .5, (t, lt) => { cue('hatch', wt('opens') - .05); const c = paint('hatch', lt / 7.4, [960, 520, 1.06], [1330, 640, 1.55]); const [hx, hy] = toScreen(c, 1530, 760); glow(hx - 140 * c[2], hy - 190 * c[2], 300 * c[2], .2 + .06 * Math.sin(t * 8.3) * Math.sin(t * 2.7)); fog(t, .05);
  const tc = wt('coated') - .1; if (t >= tc) { title('It came up coated in oil.', 960, 930, 64, t, tc, { italic: 1, col: AMB, out: wt('This', 1) - .5 }); } tagRecon(t, wt('He') - .5); }]);
// 4. deeper: the cut-away tank
SH.push([wt('This', 1) - .45, (t, lt) => { g.fillStyle = '#05080e'; g.fillRect(0, 0, W, H); const td = wt('deeper'), tw = wt('wet'), twa = wt('water');
  const z = 1 + .16 * io(lt / 6); g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2 - 30);
  const reveal = oc(pr(t, tw - .05, .9)); const [top, oy] = tankCut(t, 560, 150, 800, 800, { reveal });
  const depth = t < td - .3 ? lerp(0, .5, oc(pr(lt, .2, 1.0))) : lerp(.5, 1, io(pr(t, td - .3, 2.2))), ly = lerp(150, oy - 8, cl(depth * 2)) + (depth > .5 ? (depth - .5) * 2 * (880 - oy) : 0);
  g.strokeStyle = '#d9dee6'; g.lineWidth = 5; g.beginPath(); g.moveTo(960, 60); g.lineTo(960, ly); g.stroke(); g.fillStyle = '#d9dee6'; g.beginPath(); g.moveTo(945, ly); g.lineTo(975, ly); g.lineTo(960, ly + 34); g.fill();
  g.font = '34px Plex'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = AMB; g.fillText('← OIL', 1390, (top + oy) / 2); g.strokeStyle = AMB; g.lineWidth = 3; g.beginPath(); g.moveTo(1372, top); g.lineTo(1372, oy); g.stroke();
  if (reveal > 0) { g.globalAlpha = reveal; g.fillStyle = '#8fd0ff'; g.fillText('← WATER', 1390, (oy + 950) / 2); g.strokeStyle = '#8fd0ff'; g.beginPath(); g.moveTo(1372, oy + 6); g.lineTo(1372, 946); g.stroke(); g.globalAlpha = 1; }
  g.restore(); cue('drips', tw - .2); cue('hit', twa + .02);
  if (t >= twa) { const p = oc(pr(t, twa, .25)); g.save(); g.globalAlpha = p; g.font = '300px Anton'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#eaf6ff'; g.shadowColor = 'rgba(80,170,255,.9)'; g.shadowBlur = 60; g.translate(360, 560); g.scale(lerp(1.5, 1, p), lerp(1.5, 1, p)); g.rotate(-Math.PI / 2); g.fillText('WATER', 0, 0); g.restore(); } }]);
// 5. dozens of tanks; more oil on paper than the country held
SH.push([wt('There') - .35, (t, lt) => { g.fillStyle = '#05080e'; g.fillRect(0, 0, W, H); const tp = wt('On', 2) - .2, sh = io(pr(t, tp, .8));
  g.save(); g.translate(0, -sh * 150); g.globalAlpha = 1 - sh * .55; for (let i = 0; i < 24; i++) { const t0 = wt('There') - .2 + (i % 8) * .07 + Math.floor(i / 8) * .22; if (t < t0) continue; const q = oc(pr(t, t0, .35)), x = 150 + (i % 8) * 208, y = 150 + Math.floor(i / 8) * 300; g.save(); g.translate(x + 82, y + 115); g.scale(q, q); g.translate(-x - 82, -y - 115); tankCut(t + i, x, y, 164, 230, { reveal: 1, oil: .1, lw: 4 }); g.restore(); if (i % 4 === 0) cue('tick', t0); } g.restore();
  if (t >= tp) { g.fillStyle = `rgba(5,8,14,${.8 * sh})`; g.fillRect(0, 640, W, 440); const a = oc(pr(t, wt('more') - .2, 1.8)); g.font = '34px Plex'; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillStyle = '#8fa2b8'; g.fillText('ALL THE OIL IN THE UNITED STATES', 200, 720); g.fillRect(200, 750, 760 * oc(pr(t, tp + .2, .8)), 46);
    g.fillStyle = AMB; g.fillText('THE OIL ON HIS RECEIPTS', 200, 860); g.fillRect(200, 890, 1440 * a, 46); cue('riser', wt('existed') - 1.4);
    typed('Source: Norman C. Miller, The Great Salad Oil Swindle (1965)', 200, 1000, 26, t, wt('more'), { col: 'rgba(255,255,255,.7)', quiet: 1, cps: 70 }); } }]);
// 6. Wall Street
SH.push([wt('Within') - .4, (t, lt) => { cue('ticker', wt('Within') - .3); cue('hit', wt('gone') - .05); paint('exchange', lt / 5.6, [960, 500, 1.05], [1040, 620, 1.4]); g.fillStyle = 'rgba(8,12,22,.35)'; g.fillRect(0, 0, W, H);
  title('Two Wall Street firms: gone.', 960, 400, 92, t, wt('two') - .1, { out: wt('American', 1) - .35 }); title('American Express: fighting for its name.', 960, 400, 80, t, wt('American', 1) - .1, { col: AMB }); tagRecon(t, wt('Within') - .4); }]);
// 7. the butcher
SH.push([wt('and', 2) - .3, (t, lt) => { const c = paint('butcher', lt / 6.6, [1000, 540, 1.05], [1180, 500, 1.42]); const [lx, ly] = toScreen(c, 1215, 60); glow(lx, ly + 20, 380 * c[2], .12 + .03 * Math.sin(t * 6)); typed('THE BRONX', 110, 944, 44, t, wt('Bronx') - .3, { col: AMB }); title('A butcher’s assistant.', 620, 250, 84, t, wt('butcher') - .15, { italic: 1 }); tagRecon(t, wt('and', 2) - .3); }]);
// 8. nobody looked down: into the hatch, then the title
SH.push([wt('This', 2) - .4, (t, lt) => { const tn = wt('nobody'), p = io(pr(t, tn - .2, 2.6)); cue('riser', wt('looked') - .9); paint('hatch', p, [1330, 640, 1.5], [1530, 800, 7.5]); g.fillStyle = `rgba(0,0,0,${oc(pr(t, tn + .9, 1.6))})`; g.fillRect(0, 0, W, H);
  const tt = TL.w[TL.w.length - 1][1] + .9; cue('hit', tt); title('THE SALAD OIL SWINDLE', 960, 500, 130, t, tt, { d: 1.1, rise: 0 }); title('How one man fooled American Express with tanks of water', 960, 640, 46, t, tt + .9, { italic: 1, col: AMB }); }]);
SH.sort((a, b) => a[0] - b[0]);
const XF = .55;
function render(t) {
  let i = 0; while (i + 1 < SH.length && SH[i + 1][0] <= t) i++; const lt = t - SH[i][0];
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.shadowColor = 'transparent';
  if (i > 0 && lt < XF) { SH[i - 1][1](t, t - SH[i - 1][0]); const snap = render.off || (render.off = document.createElement('canvas')); snap.width = W; snap.height = H; snap.getContext('2d').drawImage(cv, 0, 0); g.globalAlpha = 1; SH[i][1](t, lt); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - io(lt / XF); g.drawImage(snap, 0, 0); g.restore(); }
  else SH[i][1](t, lt);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.shadowColor = 'transparent'; finish(t);
  const fi = 1 - pr(t, 0, 1.2), fo = pr(t, TL.DUR - 1.2, 1.2); if (fi > 0 || fo > 0) { g.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; g.fillRect(0, 0, W, H); }
}
window.render = render;
