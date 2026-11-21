// Shared drawing kit for the flat cut-out style. Deterministic: everything is a function of t.
const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 1920, H = 1080, TL = window.TL, IMG = {};
window.assetsReady = Promise.all([...Object.entries(window.ART2).map(([k, u]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = u; })),
  ...['90px Anton', '90px Bangers', '700 40px Inter'].map(f => document.fonts.load(f))]);
const INK = '#1a2240', RED = '#e8372c', YEL = '#ffc928', CRM = '#fff3d6', NAVY = '#243a8f', GRN = '#17a35f';
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, p) => a + (b - a) * p, oc = p => 1 - Math.pow(1 - cl(p), 3);
const ob = p => { p = cl(p); const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const pr = (t, t0, d = .3) => cl((t - t0) / d);
const bump = (t, t0, amt = .1, d = .2) => t < t0 ? 0 : amt * Math.exp(-(t - t0) / d) * Math.cos((t - t0) * 24);
const LN = {}; TL.lines.forEach(l => LN[l.i] = l);
const T0 = i => LN[i].t0, T1 = i => LN[i].t1;
// time a given word starts in line i (substring match, nth occurrence)
const wt = (i, word, nth = 0) => { const m = LN[i].w.filter(w => w[2].toLowerCase().includes(word.toLowerCase())); return (m[nth] || m[m.length - 1] || [LN[i].t0])[0]; };
// mouth state for a speaker during line i: 0 closed, 1 or 2 open
const mouth = (i, t) => { const ws = LN[i].w; for (let k = 0; k < ws.length; k++) if (t >= ws[k][0] - .02 && t < ws[k][1] + .02) return 1 + ((k + Math.floor((t - ws[k][0]) / .11)) % 2); return 0; };
const speaking = (i, t) => t >= LN[i].t0 && t <= LN[i].t1;
const paper = (on = true) => { g.shadowColor = on ? 'rgba(18,20,60,.38)' : 'transparent'; g.shadowBlur = on ? 16 : 0; g.shadowOffsetX = on ? 9 : 0; g.shadowOffsetY = on ? 13 : 0; };
const box = (x, y, w, h, f, r = 0, lw = 8) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = f; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); } };
function label(s, x, y, size, col = '#fff', font = 'Anton', align = 'center') { g.font = `${font === 'Inter' ? '700 ' : ''}${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); }
function big(t, s, x, y, size, fill, t0, o = {}) {
  if (t < t0 || (o.out && t > o.out)) return; const e = o.slam ? lerp(2.4, 1, oc(pr(t, t0, .15))) : ob(pr(t, t0, .2));
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(e, e); g.font = `${size}px ${o.font || 'Anton'}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * .2; g.strokeStyle = INK;
  g.shadowColor = INK; g.shadowOffsetX = size * .06; g.shadowOffsetY = size * .08; g.strokeText(s, 0, 0); g.shadowColor = 'transparent'; g.fillStyle = fill; g.fillText(s, 0, 0); g.restore();
}
function chip(t, s, x, y, t0, fill = YEL, col = INK, size = 54, rot = -.03) {
  if (t < t0) return; const e = ob(pr(t, t0, .2)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(e, e); g.font = `${size}px Anton`; const w = g.measureText(s).width + 52;
  paper(); g.beginPath(); g.roundRect(-w / 2, -size * .72, w, size * 1.44, 14); g.fillStyle = fill; g.fill(); paper(false); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, 4); g.restore();
}
function bubble(t, lines, x, y, t0, tx, ty, o = {}) {
  if (t < t0 || (o.out && t > o.out)) return; const size = o.size || 92, e = ob(pr(t, t0, .2));
  g.save(); g.font = `${size}px Bangers`; const w = Math.max(...lines.map(l => g.measureText(l).width)) + 100, h = lines.length * size * 1.08 + 60;
  g.translate(x, y); g.scale(e, e); g.rotate(o.rot || -.03); g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = INK; g.fillStyle = o.fill || '#fff';
  const draw = () => { g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 44); const ax = cl(tx - x, -w / 2 + 70, w / 2 - 70), dn = ty > y; g.moveTo(ax - 40, dn ? h / 2 - 4 : -h / 2 + 4); g.lineTo(tx - x, ty - y); g.lineTo(ax + 40, dn ? h / 2 - 4 : -h / 2 + 4); };
  paper(); draw(); g.fill(); paper(false); draw(); g.stroke(); draw(); g.fill();
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.08 + 6)); g.restore();
}
// full-body cut-out: x centre, y feet, h height
function fig(t, name, x, y, h, o = {}) {
  const blink = IMG[name + '-blink'] && ((t + (o.ph || .4)) % 2.7) < .12; const im = IMG[blink ? name + '-blink' : name], s = h / im.height;
  const talk = o.talk ? Math.abs(Math.sin(t * 17)) * .02 : 0, sq = 1 + bump(t, o.land ?? 1e9, .07) + talk;
  g.save(); g.translate(x + (o.shake || 0) * Math.sin(t * 60), y + (o.bob ? -Math.abs(Math.sin(t * 9.5)) * 16 : 0)); g.rotate((o.rot || 0) + (o.bob ? Math.sin(t * 9.5) * .035 : 0)); g.scale((o.flip ? -1 : 1) * (2 - sq), sq);
  if (!o.noShadow) { g.fillStyle = 'rgba(20,20,60,.22)'; g.beginPath(); g.ellipse(0, 0, im.width * s * .4, 18, 0, 0, 7); g.fill(); }
  paper(); g.drawImage(im, -im.width * s * (o.ax ?? .5), -h, im.width * s, h); g.restore();
}
// head-and-shoulders close-up from the face sheets; mouth follows the words of line i
function bust(t, who, x, y, h, i, o = {}) {
  let k = o.rest || 'neutral'; const m = i == null ? 0 : mouth(i, t);
  if (m) k = o.wide && m === 2 ? o.wide : m === 1 ? 'open1' : 'open2';
  else if (!o.noBlink && ((t + .9) % 3.1) < .12 && IMG[who + '-face-closed']) k = 'closed';
  const im = IMG[who + '-face-' + k], s = h / im.height, e = ob(pr(t, o.t0 ?? -9, .22));
  g.save(); g.translate(x + (o.shake || 0) * Math.sin(t * 60), y + (1 - e) * h); g.rotate(Math.sin(t * 1.7) * .012 + (m ? Math.sin(t * 13) * .008 : 0)); g.scale(o.flip ? -1 : 1, 1 + (m ? .012 : 0));
  paper(); g.drawImage(im, -im.width * s / 2, -h, im.width * s, h); g.restore();
}
const SIL = {};
function silhouette(name, x, y, h, col = INK) {
  if (!SIL[name]) { const im = IMG[name], c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const q = c.getContext('2d'); q.drawImage(im, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#000'; q.fillRect(0, 0, c.width, c.height); SIL[name] = c; }
  const c = SIL[name], s = h / c.height; g.save(); g.globalAlpha = .92; g.drawImage(c, x - c.width * s / 2, y - h, c.width * s, h); g.restore();
}
function burger(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineWidth = 9; g.strokeStyle = INK; g.lineJoin = 'round';
  const part = (f, fn) => { g.fillStyle = f; g.beginPath(); fn(); g.closePath(); g.fill(); g.stroke(); };
  part('#e9a54b', () => g.roundRect(-150, 58, 300, 56, [8, 8, 34, 34])); part('#6b3a1f', () => g.roundRect(-162, 16, 324, 52, 24));
  part('#ffd23c', () => { g.moveTo(-170, 6); g.lineTo(170, 6); g.lineTo(120, 30); g.lineTo(60, 14); g.lineTo(0, 44); g.lineTo(-70, 14); g.lineTo(-130, 32); });
  part('#4fbf4a', () => g.roundRect(-176, -20, 352, 26, 12)); part('#f0b055', () => { g.moveTo(-160, -16); g.bezierCurveTo(-160, -150, 160, -150, 160, -16); });
  g.restore();
}
function fries(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.lineWidth = 8; g.strokeStyle = INK; g.lineJoin = 'round';
  [-48, -24, 0, 24, 48].forEach((dx, i) => { g.save(); g.rotate((i - 2) * .09); g.fillStyle = '#ffd23c'; g.beginPath(); g.rect(dx - 11, -150 - (i % 2) * 22, 22, 130); g.fill(); g.stroke(); g.restore(); });
  g.fillStyle = RED; g.beginPath(); g.moveTo(-80, -60); g.lineTo(80, -60); g.lineTo(62, 70); g.lineTo(-62, 70); g.closePath(); g.fill(); g.stroke(); g.restore(); }
function cup(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.lineWidth = 8; g.strokeStyle = INK; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(14, -150); g.lineTo(34, -230); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-62, -130); g.lineTo(62, -130); g.lineTo(46, 70); g.lineTo(-46, 70); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = RED; g.beginPath(); g.moveTo(-56, -60); g.lineTo(56, -60); g.lineTo(51, 0); g.lineTo(-51, 0); g.closePath(); g.fill(); g.stroke(); box(-72, -150, 144, 26, '#fff', 8); g.restore(); }
function bill(x, y, s, rot = 0, txt = '$1') { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); paper(); box(-110, -52, 220, 104, '#8fd694', 10, 7); paper(false); g.lineWidth = 4; g.strokeStyle = '#2d7a44'; g.strokeRect(-94, -38, 188, 76); g.beginPath(); g.arc(0, 0, 30, 0, 7); g.stroke(); label(txt, 0, 3, 40, '#1f5c32'); g.restore(); }
function rays(t, c1, c2, a = .1) { const r = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1250); r.addColorStop(0, c1); r.addColorStop(1, c2); g.fillStyle = r; g.fillRect(-200, -200, W + 400, H + 400);
  g.save(); g.translate(W / 2, H / 2); g.rotate(t * .1); g.fillStyle = `rgba(255,255,255,${a})`; for (let i = 0; i < 14; i++) { g.rotate(Math.PI / 7); g.beginPath(); g.moveTo(0, 0); g.lineTo(1600, -180); g.lineTo(1600, 180); g.fill(); } g.restore(); }
// the restaurant. P = three menu prices, till = number on the register, trayX = tray position (or null)
function room(t, o = {}) {
  g.fillStyle = '#ffdf9a'; g.fillRect(-600, -400, W + 1200, 1300); g.fillStyle = '#ffd07a'; for (let i = -4; i < 16; i++) g.fillRect(i * 180, -400, 90, 1300);
  box(-600, 470, W + 1200, 46, RED, 0, 8); g.fillStyle = '#2c3f96'; g.fillRect(-600, 800, W + 1200, 700);
  g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 6; for (let i = -8; i < 24; i++) { g.beginPath(); g.moveTo(960 + (i * 150 - 960) * .86, 800); g.lineTo(960 + (i * 150 - 960) * 1.5, 1500); g.stroke(); }
  [880, 1000].forEach(y => { g.beginPath(); g.moveTo(-600, y); g.lineTo(W + 600, y); g.stroke(); }); g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.moveTo(-600, 800); g.lineTo(W + 600, 800); g.stroke();
  box(60, 180, 330, 624, '#8fd3ff', 10); box(84, 204, 282, 300, '#c9ecff', 6, 6); box(84, 520, 282, 284, '#c9ecff', 6, 6); box(338, 480, 22, 90, YEL, 8, 6);
  paper(); box(1010, 60, 850, 300, NAVY, 22); paper(false); const P = o.P || ['$7.49', '$4.19', '$3.29'];
  [[1150, burger, .36, 150], [1435, fries, .5, 200], [1720, cup, .46, 205]].forEach(([x, fn, s, y], i) => { box(x - 120, 84, 240, 252, '#fff3d6', 14, 6); fn(x, y, s);
    g.save(); g.translate(x, 292); const b = 1 + (o.hot ? .06 * Math.sin(t * 30 + i) : 0); g.scale(b, b); label(P[i], 0, 0, 56, o.hot ? RED : INK); g.restore(); });
  if (o.behind) o.behind();
  paper(); box(1000, 600, 1500, 60, CRM, 10); paper(false); box(1030, 656, 1500, 300, RED, 0); box(1030, 700, 1500, 30, YEL, 0, 6);
  box(1560, 470, 250, 134, '#3b4a66', 14); box(1590, 400, 190, 80, INK, 10); label('$' + (o.till ?? 11).toFixed(2), 1685, 442, 50, '#39c46a');
  for (let i = 0; i < 8; i++) box(1585 + (i % 4) * 34, 500 + Math.floor(i / 4) * 40, 24, 24, '#c9d2e6', 5, 4);
  if (o.trayX != null) tray(o.trayX, 576, 1, o);
}
function tray(x, y, s, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); paper(); box(-190, 0, 380, 26, '#b9c2d6', 12); paper(false); if (!o.noFood) { fries(-110, -36, .5); cup(120, -36, .5); burger(5, -28, o.tiny ? .2 : .26); } g.restore(); }
const cam = (cx, cy, z, fn) => { g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore(); };
const SHOTS = []; const shot = (t0, fn) => SHOTS.push([t0, fn]);
function render(t) {
  SHOTS.sort((a, b) => a[0] - b[0]); let i = 0; while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= t) i++; const lt = t - SHOTS[i][0];
  g.setTransform(1, 0, 0, 1, 0, 0); paper(false); g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.save(); const z = 1 + .05 * (1 - oc(lt / .2)) + lt * .004; g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); SHOTS[i][1](t, lt); g.restore(); paper(false);
  if (i > 0 && lt < .08) { g.fillStyle = `rgba(255,255,255,${.5 * (1 - lt / .08)})`; g.fillRect(0, 0, W, H); }
  const D = TL.DUR; if (t > D - .5) { g.fillStyle = `rgba(0,0,0,${cl((t - (D - .5)) / .5)})`; g.fillRect(0, 0, W, H); }
}
window.render = render;
