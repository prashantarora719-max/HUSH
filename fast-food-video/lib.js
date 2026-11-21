// Shared drawing kit for the flat cut-out style. Deterministic: everything is a function of t.
const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 1920, H = 1080, TL = window.TL, IMG = {};
window.assetsReady = Promise.all([...Object.entries(window.ART2).map(([k, u]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = u; })),
  ...['90px Anton', '90px Bangers', '700 40px Inter'].map(f => document.fonts.load(f))]);
const INK = '#1a2240', RED = '#e8372c', YEL = '#ffc928', CRM = '#fff3d6', NAVY = '#243a8f', GRN = '#17a35f';
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, p) => a + (b - a) * p, oc = p => 1 - Math.pow(1 - cl(p), 3);
const ob = p => { p = cl(p); const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const pr = (t, t0, d = .3) => cl((t - t0) / d);
const bump = (t, t0, amt = .1, d = .2) => t < t0 ? 0 : amt * Math.exp(-(t - t0) / d) * Math.cos((t - t0) * 24);
window.CUES = {}; const cue = (kind, t0) => { window.CUES[kind + '@' + t0.toFixed(2)] = 1; };
const sfx = (t0, name) => cue(name, t0), hush = (a, b) => { window.CUES['hush@' + a.toFixed(2) + '@' + b.toFixed(2)] = 1; };
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
  cue(o.slam ? 'slam' : 'text', t0); if (t < t0 || (o.out && t > o.out)) return; const e = o.slam ? lerp(2.4, 1, oc(pr(t, t0, .15))) : ob(pr(t, t0, .2));
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(e, e); g.font = `${size}px ${o.font || 'Anton'}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * .2; g.strokeStyle = INK;
  g.shadowColor = INK; g.shadowOffsetX = size * .06; g.shadowOffsetY = size * .08; g.strokeText(s, 0, 0); g.shadowColor = 'transparent'; g.fillStyle = fill; g.fillText(s, 0, 0); g.restore();
}
function chip(t, s, x, y, t0, fill = YEL, col = INK, size = 54, rot = -.03) {
  cue('pop', t0); if (t < t0) return; const e = ob(pr(t, t0, .2)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(e, e); g.font = `${size}px Anton`; const w = g.measureText(s).width + 52;
  paper(); g.beginPath(); g.roundRect(-w / 2, -size * .72, w, size * 1.44, 14); g.fillStyle = fill; g.fill(); paper(false); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, 4); g.restore();
}
function bubble(t, lines, x, y, t0, tx, ty, o = {}) {
  cue('pop', t0); if (t < t0 || (o.out && t > o.out)) return; const size = o.size || 92, e = ob(pr(t, t0, .2));
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
const SHOTS = []; const shot = (t0, fn) => { SHOTS.push([t0, fn]); cue('cut', t0); };
function render(t) {
  SHOTS.sort((a, b) => a[0] - b[0]); let i = 0; while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= t) i++; const lt = t - SHOTS[i][0];
  g.setTransform(1, 0, 0, 1, 0, 0); paper(false); g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.save(); const z = 1 + .05 * (1 - oc(lt / .2)) + lt * .004; g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); SHOTS[i][1](t, lt); g.restore(); paper(false);
  if (i > 0 && lt < .08) { g.fillStyle = `rgba(255,255,255,${.5 * (1 - lt / .08)})`; g.fillRect(0, 0, W, H); }
  const D = TL.DUR; if (t > D - .5) { g.fillStyle = `rgba(0,0,0,${cl((t - (D - .5)) / .5)})`; g.fillRect(0, 0, W, H); }
}
window.render = render;

// ---- shared scene pieces for the later sections ----
// close-up of a speaking character on a ray background, with one optional line of big text
function cu(who, i, c1, c2, o = {}) { shot((o.at ?? T0(i)) - .08, t => { rays(t, c1, c2, o.ra ?? .1); bust(t, who, o.x || 620, 1180, o.h || 1080, i, { rest: o.rest, wide: o.wide, flip: o.flip, shake: o.shake ? 9 * Math.exp(-(t - T0(i)) * 3) : 0, noBlink: o.noBlink });
  if (o.text) big(t, o.text, o.tx || 1370, o.ty || 420, o.size || 150, o.col || '#fff', o.tw ?? T0(i) + .12, { slam: o.slam, rot: o.rot ?? -.03 }); if (o.text2) big(t, o.text2, o.tx || 1370, (o.ty || 420) + (o.size || 150) * 1.25, o.size2 || o.size || 150, o.col2 || YEL, o.tw2 ?? T0(i) + .5, { slam: 1, rot: .02 }); if (o.extra) o.extra(t); }); }
// Gary has no face sheet: a large pose with a talk bounce
function gcu(pose, i, o = {}) { shot((o.at ?? T0(i)) - .08, t => { office(t, 1.25, 700); fig(t, 'gary-' + pose, o.x || 640, 1330, 1150, { talk: speaking(i, t), noShadow: 1, land: T0(i) - .08 });
  if (o.text) big(t, o.text, 1380, o.ty || 420, o.size || 150, '#fff', o.tw ?? T0(i) + .12, { slam: o.slam, rot: -.03 }); if (o.extra) o.extra(t); }); }
function office(t, z = 1, cx = 960) { cam(cx, 540, z, () => { g.fillStyle = '#bfe3d0'; g.fillRect(-800, -400, W + 1600, 1300); g.fillStyle = '#aed8c2'; for (let i = -6; i < 18; i++) g.fillRect(i * 200, -400, 100, 1300);
  g.fillStyle = '#8a6a4a'; g.fillRect(-800, 820, W + 1600, 700); g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.moveTo(-800, 820); g.lineTo(W + 800, 820); g.stroke();
  paper(); box(1330, 150, 420, 300, '#d9b98a', 10); paper(false); [[1370, 190, .1], [1500, 200, -.08], [1620, 185, .05], [1400, 320, -.05], [1560, 330, .09]].forEach(([x, y, r], k) => { g.save(); g.translate(x + 50, y + 45); g.rotate(r); box(-50, -45, 100, 90, k % 2 ? '#fff' : '#ffe9a8', 4, 5); label(k % 2 ? 'DUE' : 'BILL', 0, 4, 30, RED); g.restore(); });
  paper(); box(120, 380, 240, 440, '#7f8fb5', 8); paper(false); [400, 540, 680].forEach(y => { box(140, y, 200, 120, '#9fb0d6', 6, 6); box(215, y + 48, 50, 18, INK, 6, 0); });
  box(560, 120, 320, 240, '#8fd3ff', 8); g.lineWidth = 8; g.beginPath(); g.moveTo(720, 120); g.lineTo(720, 360); g.moveTo(560, 240); g.lineTo(880, 240); g.stroke(); }); }
function upstairs(t, z = 1, cx = 960) { cam(cx, 540, z, () => { g.fillStyle = '#0f3d33'; g.fillRect(-800, -400, W + 1600, 1300); g.fillStyle = '#0c342b'; for (let i = -6; i < 18; i++) g.fillRect(i * 220, -400, 110, 1300);
  box(-800, 760, W + 1600, 30, '#d4a93a', 0, 6); g.fillStyle = '#3a2416'; g.fillRect(-800, 790, W + 1600, 700);
  paper(); box(180, 120, 620, 440, '#9fd7ff', 10, 12); paper(false); g.fillStyle = '#5f8fd0'; [[220, 330, 80, 230], [320, 250, 110, 310], [450, 300, 90, 260], [560, 200, 120, 360], [690, 340, 80, 220]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); g.lineWidth = 12; g.strokeStyle = '#d4a93a'; g.strokeRect(180, 120, 620, 440);
  paper(); box(1180, 150, 380, 300, '#d4a93a', 8, 8); paper(false); box(1205, 175, 330, 250, '#14493d', 4, 4); label('RENT', 1370, 270, 80, YEL); label('due monthly', 1370, 350, 34, '#fff', 'Inter'); }); }
// the napkin: Frank's running tally. rows = [text, colour, time]
function napkin(t, x, y, rows, s = 1) { g.save(); g.translate(x, y); g.rotate(.04); g.scale(s, s); paper(); box(-340, -330, 680, 660, '#fffdf5', 10, 8); paper(false); g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-340, -260 + i * 70); g.lineTo(340, -260 + i * 70); g.stroke(); }
  rows.forEach(([s2, c, t0], k) => { if (t0 > 0) sfx(t0, 'scribble'); if (t >= t0) label(s2, -290, -250 + k * 92, 70, c, 'Bangers', 'left'); }); g.restore(); }
const BLUE = '#2343c9';
// Frank's $11 as a bar. parts = [amount, colour, label, time]
function bar11(t, x, y, w, h, parts) { paper(); box(x, y, w, h, '#c9d2e6', 18, 0); paper(false); g.save(); g.beginPath(); g.roundRect(x, y, w, h, 18); g.clip(); let a = 0; parts.forEach(([amt, c, lab, t0]) => { const p = oc(pr(t, t0, .4)), ww = w * amt / 11 * p; g.fillStyle = c; g.fillRect(x + w * a / 11, y, ww, h); if (p > .6) { label(lab, x + w * (a + amt / 2) / 11, y + h * .36, h * .26, '#fff'); label('$' + amt.toFixed(2), x + w * (a + amt / 2) / 11, y + h * .7, h * .3, '#fff'); } a += amt; }); g.restore(); g.lineWidth = 9; g.strokeStyle = INK; g.beginPath(); g.roundRect(x, y, w, h, 18); g.stroke(); }
function xmark(t, x, y, r, t0) { if (t0 != null) cue('stamp', t0); if (t < t0) return; g.save(); g.translate(x, y); g.lineCap = 'round'; const p1 = oc(pr(t, t0, .1)), p2 = oc(pr(t, t0 + .1, .1)); for (const [w, c] of [[r * .34, INK], [r * .2, RED]]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); g.moveTo(-r, -r); g.lineTo(-r + 2 * r * p1, -r + 2 * r * p1); g.stroke(); if (p2 > 0) { g.beginPath(); g.moveTo(r, -r); g.lineTo(r - 2 * r * p2, -r + 2 * r * p2); g.stroke(); } } g.restore(); }
function coinIcon(x, y, r, lab = '$') { g.save(); g.translate(x, y); paper(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = '#ffcf2e'; g.fill(); paper(false); g.lineWidth = r * .16; g.strokeStyle = INK; g.stroke(); label(lab, 0, r * .06, r * 1.0, INK); g.restore(); }
const src = s => label(s, 960, 1048, 27, 'rgba(255,255,255,.92)', 'Inter');
const dark = (t, c = '#16204d') => { g.fillStyle = c; g.fillRect(-200, -200, W + 400, H + 400); g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { g.beginPath(); g.moveTo(i * 80, 0); g.lineTo(i * 80, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 80); g.lineTo(W, i * 80); g.stroke(); } };
