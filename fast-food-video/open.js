// 60-second opening, "Why Fast Food Stopped Being Cheap". Deterministic: render(t) draws the frame at t seconds.
const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 1920, H = 1080, T = window.TL;
const IMG = {};
window.assetsReady = Promise.all([
  ...Object.entries(window.ART).map(([k, u]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = u; })),
  ...['90px Anton', '90px Bangers', '900 40px Inter', '700 40px Inter'].map(f => document.fonts.load(f)),
]);
const INK = '#1a1230', RED = '#e8372c', YEL = '#ffc928', BLU = '#2748e8', GRN = '#12a05c', PUR = '#4a1fa8', ORG = '#ff7a1a', CRM = '#fff6e0', PNK = '#ff4f8b';
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, p) => a + (b - a) * p;
const oc = p => 1 - Math.pow(1 - cl(p), 3);
const ob = p => { p = cl(p); const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const pr = (t, t0, d = .3) => cl((t - t0) / d);
const bump = (t, t0, amt = .12, d = .25) => t < t0 ? 0 : amt * Math.exp(-(t - t0) / d) * Math.cos((t - t0) * 22);

function bg(t, c1, c2, rays = 'rgba(255,255,255,.09)') {
  const r = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1250); r.addColorStop(0, c1); r.addColorStop(1, c2);
  g.fillStyle = r; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.rotate(t * .1); g.fillStyle = rays;
  for (let i = 0; i < 14; i++) { g.rotate(Math.PI / 7); g.beginPath(); g.moveTo(0, 0); g.lineTo(1500, -170); g.lineTo(1500, 170); g.fill(); }
  g.restore();
  g.fillStyle = 'rgba(0,0,0,.10)';
  for (let y = 0; y < 9; y++) for (let x = 0; x < 16; x++) { const s = 15 - y * 1.7 - x * .7; if (s > 1) { g.beginPath(); g.arc(W - 30 - x * 44, H - 30 - y * 44, s, 0, 7); g.fill(); g.beginPath(); g.arc(30 + x * 44, 30 + y * 44, s, 0, 7); g.fill(); } }
}
// sticker character: x = centre, y = bottom edge, h = height
function ch(t, name, x, y, h, t0, o = {}) {
  if (t < t0) return; const im = IMG[name], s = h / im.height, p = pr(t, t0, o.d || .32), e = ob(p);
  let dx = 0, dy = 0; const from = o.from || 'bottom';
  if (from === 'bottom') dy = (1 - e) * h * .9; if (from === 'left') dx = -(1 - e) * 900; if (from === 'right') dx = (1 - e) * 900;
  let sc = (from === 'pop' ? lerp(.3, 1, e) : 1) * (1 + (o.punch || []).reduce((a, b) => a + bump(t, b, .07), 0));
  const bob = Math.sin(t * 2.3 + (o.ph || 0)) * 7, rot = Math.sin(t * 1.4 + (o.ph || 0)) * .014 + (o.rot || 0) + (1 - p) * (o.spin || 0);
  const sq = 1 + (p < 1 ? 0 : 0) + bump(t, t0 + (o.d || .32) * .7, .05, .18);
  g.save(); g.translate(x + dx + (o.shake ? Math.sin(t * 61) * o.shake(t) : 0), y + dy + bob); g.rotate(rot); g.scale((o.flip ? -1 : 1) * sc * (2 - sq), sc * sq);
  g.shadowColor = 'rgba(20,10,40,.42)'; g.shadowOffsetX = 16; g.shadowOffsetY = 16;
  g.drawImage(im, -im.width * s / 2, -h, im.width * s, h); g.restore();
}
function txt(t, s, x, y, size, fill, t0, o = {}) {
  if (t < t0 || (o.out && t > o.out)) return; const e = ob(pr(t, t0, o.d || .22));
  g.save(); g.translate(x, y); g.rotate((o.rot || 0) + (1 - e) * (o.spin || -.12)); const sc = lerp(o.slam ? 2.6 : .2, 1, o.slam ? oc(pr(t, t0, .16)) : e) * (1 + bump(t, o.punch ?? 1e9, .1));
  g.scale(sc, sc); g.font = `${o.font === 'inter' ? '900 ' : ''}${size}px ${o.font === 'inter' ? 'Inter' : o.font || 'Anton'}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = size * (o.lw || .2); g.strokeStyle = INK;
  g.shadowColor = INK; g.shadowOffsetX = size * .07; g.shadowOffsetY = size * .09; g.strokeText(s, 0, 0); g.shadowColor = 'transparent';
  g.strokeText(s, 0, 0); g.fillStyle = fill; g.fillText(s, 0, 0); g.restore();
}
function small(s, x, y, size = 30, col = 'rgba(255,255,255,.92)', align = 'center') { g.font = `700 ${size}px Inter`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); }
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
// comic speech bubble; tail points at (tx,ty)
function bubble(t, lines, x, y, t0, tx, ty, o = {}) {
  if (t < t0 || (o.out && t > o.out)) return; const size = o.size || 92, e = ob(pr(t, t0, .22));
  g.save(); g.font = `${size}px Bangers`; const w = Math.max(...lines.map(l => g.measureText(l).width)) + 110, h = lines.length * size * 1.08 + 70;
  g.translate(x, y); g.scale(e, e); g.rotate(o.rot || -.03);
  g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = INK; g.fillStyle = o.fill || '#fff';
  g.shadowColor = INK; g.shadowOffsetX = 12; g.shadowOffsetY = 12;
  const draw = () => { g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 46); const ax = cl(tx - x, -w / 2 + 70, w / 2 - 70), dn = ty > y; g.moveTo(ax - 44, dn ? h / 2 - 4 : -h / 2 + 4); g.lineTo(tx - x, ty - y); g.lineTo(ax + 44, dn ? h / 2 - 4 : -h / 2 + 4); };
  draw(); g.stroke(); g.shadowColor = 'transparent'; draw(); g.fill();
  g.fillStyle = o.col || INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.08 + 6)); g.restore();
}
function tagCard(t, s, x, y, t0, fill = YEL, col = INK, size = 54, rot = -.04) {
  if (t < t0) return; const e = ob(pr(t, t0, .22)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(e, e); g.font = `${size}px Anton`; const w = g.measureText(s).width + 56;
  g.shadowColor = INK; g.shadowOffsetX = 8; g.shadowOffsetY = 8; g.fillStyle = fill; g.strokeStyle = INK; g.lineWidth = 8; g.lineJoin = 'round'; rr(-w / 2, -size * .72, w, size * 1.44, 14); g.stroke(); g.shadowColor = 'transparent'; g.fill();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, 4); g.restore();
}
function burger(x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineWidth = 9; g.strokeStyle = INK; g.lineJoin = 'round';
  const part = (f, fn) => { g.fillStyle = f; g.beginPath(); fn(); g.closePath(); g.fill(); g.stroke(); };
  part('#e9a54b', () => g.roundRect(-150, 58, 300, 56, [8, 8, 34, 34]));
  part('#6b3a1f', () => g.roundRect(-162, 16, 324, 52, 24));
  part('#ffd23c', () => { g.moveTo(-170, 6); g.lineTo(170, 6); g.lineTo(120, 30); g.lineTo(60, 14); g.lineTo(0, 44); g.lineTo(-70, 14); g.lineTo(-130, 32); });
  part('#4fbf4a', () => { g.moveTo(-176, -4); for (let i = 0; i <= 8; i++) g.quadraticCurveTo(-176 + i * 44 - 22, i % 2 ? -22 : 14, -176 + i * 44, -4); g.lineTo(176, -18); g.lineTo(-176, -18); });
  part('#f0b055', () => { g.moveTo(-160, -16); g.bezierCurveTo(-160, -150, 160, -150, 160, -16); });
  g.fillStyle = '#fff3cf'; [[-70, -82], [-10, -104], [56, -84], [-34, -58], [30, -56], [92, -52], [-104, -50]].forEach(([a, b]) => { g.beginPath(); g.ellipse(a, b, 9, 5, .5, 0, 7); g.fill(); });
  g.restore();
}
function coin(x, y, r, label = '$', on = true) {
  g.save(); g.translate(x, y); g.lineWidth = r * .16; g.strokeStyle = INK; g.fillStyle = on ? '#ffcf2e' : '#c9c3d6';
  g.shadowColor = INK; g.shadowOffsetX = r * .1; g.shadowOffsetY = r * .12; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.shadowColor = 'transparent'; g.stroke();
  g.lineWidth = r * .07; g.strokeStyle = on ? '#b8860b' : '#8f88a0'; g.beginPath(); g.arc(0, 0, r * .76, 0, 7); g.stroke();
  g.font = `${r * 1.05}px Anton`; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, r * .06); g.restore();
}
function cross(t, x, y, r, t0) {
  if (t < t0) return; g.save(); g.translate(x, y); g.lineCap = 'round'; const p1 = oc(pr(t, t0, .1)), p2 = oc(pr(t, t0 + .1, .1));
  for (const [w, c] of [[r * .34, INK], [r * .2, RED]]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); g.moveTo(-r, -r); g.lineTo(-r + 2 * r * p1, -r + 2 * r * p1); g.stroke(); if (p2 > 0) { g.beginPath(); g.moveTo(r, -r); g.lineTo(r - 2 * r * p2, -r + 2 * r * p2); g.stroke(); } }
  g.restore();
}
const C = k => T[k];
const SC = [];
const scene = (t0, fn) => SC.push({ t0, fn });

// 1. This is Frank. Frank just bought lunch.
scene(0, t => {
  bg(t, '#ffd84a', '#ff9d1c');
  ch(t, 'frank-crossed', 620, 1120, 980, C('N1') - .1, { punch: [C('N1.lunch') + .8] });
  txt(t, 'THIS IS FRANK.', 1290, 250, 170, '#fff', C('N1') - .02, { rot: -.04 });
  tagCard(t, '58 · HATES SURPRISES', 1290, 400, C('N1') + .55, RED, '#fff', 56, .03);
  const m = IMG.meal, tm = C('N1.lunch') - .1; if (t >= tm) { const e = ob(pr(t, tm, .35)), s = .62 * (1 + bump(t, C('N1.lunch') + .78, .08));
    g.save(); g.translate(1330 + (1 - e) * 1000, 760 + Math.sin(t * 2.6) * 6); g.rotate(-.05 + (1 - e) * .4); g.scale(s, s); g.shadowColor = 'rgba(20,10,40,.42)'; g.shadowOffsetX = 18; g.shadowOffsetY = 18; g.drawImage(m, -m.width / 2, -m.height / 2); g.restore(); }
  txt(t, '$11.00', 1640, 560, 150, YEL, C('N1.lunch') + .78, { slam: 1, rot: .1, fill: RED });
});
// 2. Eleven dollars? For this?
scene(C('F1') - .1, t => {
  const two = t >= C('F1.forthis') - .08; bg(t, two ? '#ff7a3a' : '#ff5a4a', two ? '#c21f3a' : '#b3161e');
  if (!two) { ch(t, 'frank-receipt', 1300, 1130, 1040, C('F1') - .1, { from: 'right', d: .22, shake: tt => 10 * Math.exp(-(tt - C('F1')) * 3) });
    bubble(t, ['ELEVEN', 'DOLLARS?!'], 560, 400, C('F1') + .02, 930, 520, { size: 150 }); }
  else { ch(t, 'frank-burger', 620, 1130, 1040, C('F1.forthis') - .08, { from: 'left', d: .22 });
    bubble(t, ['FOR THIS?'], 1350, 330, C('F1.forthis') + .02, 900, 470, { size: 160, rot: .03 });
    const e = ob(pr(t, C('F1.forthis') + .25, .3)); if (t > C('F1.forthis') + .25) { burger(1380, 760, .55 * e, -.08); small('actual size (emotionally)', 1380, 870, 34, '#fff'); } }
});
// 3. Danny
scene(C('D1') - .1, t => {
  bg(t, '#3f6bff', '#1a2fb5'); const two = t >= C('D1.cost');
  ch(t, two ? 'danny-shrug' : 'danny-eat', two ? 1240 : 1300, 1130, two ? 900 : 1010, two ? C('D1.cost') : C('D1') - .1, { from: two ? 'pop' : 'right', d: .22 });
  tagCard(t, 'DANNY · 19 · GRANDSON', 1300, 90, C('D1') + .25, YEL, INK, 50, .02);
  if (!two) bubble(t, ["IT'S A BURGER,", 'GRANDPA.'], 520, 420, C('D1') + .05, 1020, 470, { size: 120 });
  else bubble(t, ["THAT'S WHAT", 'THEY COST.'], 480, 400, C('D1.cost') + .03, 960, 480, { size: 130, fill: YEL });
});
// 4. In my day this was a dollar.
scene(C('F2') - .12, t => {
  bg(t, '#ffb347', '#d9571a', 'rgba(255,240,200,.16)');
  ch(t, 'frank-remember', 600, 1130, 1040, C('F2') - .12, { from: 'left', d: .24 });
  bubble(t, ['IN MY DAY...'], 1260, 250, C('F2') + .02, 880, 420, { size: 130 });
  const t1 = C('F2.dollar'); if (t >= t1) { const e = ob(pr(t, t1, .3)); g.save(); g.translate(1330, 650 + (1 - e) * -500); g.scale(Math.cos((1 - oc(pr(t, t1, .6))) * 9), 1); coin(0, 0, 190, '$1'); g.restore(); }
  txt(t, 'THIS WAS A DOLLAR.', 1300, 930, 96, '#fff', t1 + .15);
});
// 5a. He's exaggerating. But not by much.
scene(C('N2') - .1, t => {
  bg(t, '#8a5bff', '#3d1a9c');
  ch(t, 'frank-shrug', 960, 1140, 800, C('N2') - .1, { d: .22 });
  txt(t, 'EXAGGERATING', 960, 230, 210, RED, C('N2') + .22, { slam: 1, rot: -.06, out: C('N2.notmuch') });
  txt(t, '...BUT NOT BY MUCH', 960, 230, 170, YEL, C('N2.notmuch'), { rot: .03 });
});
// 5b. +40% chart
scene(C('N2.since') - .12, t => {
  bg(t, '#1fc46f', '#0a7a43'); const t0 = C('N2.since'), tf = C('N2.forty');
  txt(t, "McDONALD'S MENU PRICES", 110, 130, 110, '#fff', t0, { align: 'left', spin: 0 });
  small('Average menu price, 2019 to 2024 · Source: McDonald\'s', 114, 215, 32, 'rgba(255,255,255,.9)', 'left');
  const x0 = 220, x1 = 1180, yb = 900, p = oc(pr(t, t0 + .5, tf - t0 - .6));
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x0, yb - i * 140); g.lineTo(x1 + 60, yb - i * 140); g.stroke(); }
  const yrs = ['2019', '2020', '2021', '2022', '2023', '2024'], vals = [0, .04, .10, .21, .33, .40];
  const pt = i => [x0 + (x1 - x0) * i / 5, yb - vals[i] * 1400];
  const drawLine = (w, c) => { g.lineWidth = w; g.strokeStyle = c; g.lineJoin = g.lineCap = 'round'; g.beginPath(); const n = p * 5; for (let i = 0; i <= Math.floor(n); i++) { const [x, y] = pt(i); i ? g.lineTo(x, y) : g.moveTo(x, y); } if (n < 5) { const i = Math.floor(n), f = n - i, a = pt(i), b = pt(i + 1); g.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); } g.stroke(); };
  drawLine(34, INK); drawLine(18, YEL);
  yrs.forEach((y, i) => { if (p * 5 >= i - .05) { const [x, yy] = pt(i); g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(x, yy, 17 * (1 + bump(t, t0 + .5 + (tf - t0 - .6) * i / 5, .5, .12)), 0, 7); g.fill(); g.stroke(); } small(y, x0 + (x1 - x0) * i / 5, yb + 52, 36, '#fff'); });
  const n = p * 5, i = Math.min(4, Math.floor(n)), f = Math.min(1, n - i), a = pt(i), b = pt(i + 1), hx = lerp(a[0], b[0], f), hy = lerp(a[1], b[1], f);
  if (t > t0 + .4 && t < tf) burger(hx + 10, hy - 70, .32, -.3);
  const v = Math.round(lerp(0, 40, p));
  if (t < tf) txt(t, '+' + v + '%', 1560, 520, 230, '#fff', t0 + .5);
  else { txt(t, '+40%', 1500, 430, 270, YEL, tf, { slam: 1, rot: -.05 }); tagCard(t, 'IN FIVE YEARS', 1500, 640, tf + .3, RED, '#fff', 70, .03); }
  ch(t, 'frank-shock', 1560, 1440, 760, tf + .25, { d: .25 });
}, 'shake');
// 6. faster than almost everything else
scene(C('N3') - .1, t => {
  bg(t, '#2f7bff', '#12309e'); const t0 = C('N3');
  txt(t, 'FAST FOOD vs. EVERYTHING ELSE', 960, 130, 104, '#fff', t0, { spin: 0 });
  const p = oc(pr(t, t0 + .3, 2.9)), x0 = 200, yb = 930;
  const line = (k, col, lab, w) => { const x = x0 + 1300 * p, y = yb - k * 1300 * p; for (const [lw, c] of [[w + 16, INK], [w, col]]) { g.lineWidth = lw; g.strokeStyle = c; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, yb); g.lineTo(x, y); g.stroke(); } return [x, y]; };
  const [ex, ey] = line(.22, '#cfd8ff', 0, 16); tagCard(t, 'EVERYTHING ELSE', ex + 20, ey - 60, t0 + .5, '#cfd8ff', INK, 44, 0);
  const [fx, fy] = line(.42, YEL, 0, 22); burger(fx + 30, fy - 60, .4, -.35 + Math.sin(t * 9) * .05);
  tagCard(t, 'FAST FOOD', fx - 260, fy - 40, t0 + .5, YEL, INK, 56, -.06);
  small('Prices since 2014. Illustration: fast food has risen faster than overall inflation (BLS data).', 960, 1030, 30, 'rgba(255,255,255,.85)');
  txt(t, 'FASTER', 1440, 820, 170, RED, t0 + 2.9, { slam: 1, rot: -.07 });
});
// 7. Beef. Wages. Rent.  (+ "True.")
scene(C('D2') - .1, t => {
  bg(t, '#ffd84a', '#ff9d1c'); const tr = C('N4') + .05;
  ch(t, 'danny-ref', 420, 1130, 960, C('D2') - .1, { from: 'left', d: .22, punch: [C('D2.beef'), C('D2.wages'), C('D2.rent')] });
  bubble(t, ['SO EVERYTHING', 'COSTS MORE.'], 1180, 200, C('D2') + .03, 700, 420, { size: 96, out: C('D2.beef') - .05 });
  [['BEEF', RED, 'D2.beef'], ['WAGES', BLU, 'D2.wages'], ['RENT', PUR, 'D2.rent']].forEach(([s, c, k], i) => {
    const t0 = C(k); if (t < t0) return; const e = ob(pr(t, t0, .22)), x = 950 + i * 310, y = 560 + (i % 2 ? 40 : 0);
    g.save(); g.translate(x, y); g.rotate((i - 1) * .05 + (1 - e) * .5); g.scale(e * (1 + bump(t, tr, .06)), e); g.shadowColor = INK; g.shadowOffsetX = 12; g.shadowOffsetY = 12; g.fillStyle = c; g.strokeStyle = INK; g.lineWidth = 10; rr(-135, -190, 270, 380, 26); g.stroke(); g.shadowColor = 'transparent'; g.fill();
    g.font = '86px Anton'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, -100);
    g.fillStyle = YEL; g.strokeStyle = INK; g.lineWidth = 8; g.lineJoin = 'round'; g.beginPath(); const a = 20 + Math.sin(t * 6 + i) * 8; g.moveTo(0, -30 - a); g.lineTo(70, 60 - a); g.lineTo(28, 60 - a); g.lineTo(28, 150); g.lineTo(-28, 150); g.lineTo(-28, 60 - a); g.lineTo(-70, 60 - a); g.closePath(); g.fill(); g.stroke();
    if (t >= tr + i * .07) { const q = ob(pr(t, tr + i * .07, .2)); g.fillStyle = GRN; g.lineWidth = 8; g.beginPath(); g.arc(105, -170, 46 * q, 0, 7); g.fill(); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(105 - 20 * q, -170); g.lineTo(105 - 4 * q, -152); g.lineTo(105 + 22 * q, -188); g.stroke(); }
    g.restore(); });
  txt(t, 'TRUE.', 1260, 930, 150, '#fff', tr, { slam: 1 });
});
// 8a. the part nobody tells you
scene(C('N4.but') - .12, t => {
  bg(t, '#5a2bd6', '#1c0b55', 'rgba(255,255,255,.06)'); const t0 = C('N4.but');
  ch(t, 'frank-chin', 500, 1130, 1060, t0 - .12, { from: 'left', d: .25 });
  txt(t, 'THE PART', 1280, 330, 190, '#fff', t0 + .05); txt(t, 'NOBODY', 1280, 540, 230, YEL, t0 + .75, { slam: 1, rot: -.03 }); txt(t, 'TELLS YOU', 1280, 760, 190, '#fff', t0 + 1.2);
});
// 8b. forty cents of every dollar
scene(C('N4.company') - .1, t => {
  bg(t, '#243fd0', '#0d1a6e'); const t0 = C('N4.company'), tc = C('N4.cents');
  txt(t, 'THE COMPANY AT THE TOP', 960, 130, 112, '#fff', t0, { spin: 0 });
  for (let i = 0; i < 10; i++) { const tin = t0 + .25 + i * .05; if (t < tin) continue; const e = ob(pr(t, tin, .2)); const kept = i < 4, q = kept ? oc(pr(t, tc + .12 + i * .12, .35)) : 0;
    const x = lerp(330 + i * 140, 620 + i * 115, q), y = lerp(400, 800, q) - Math.sin(q * Math.PI) * 120; g.save(); g.translate(x, y); g.scale(e, e); coin(0, 0, 58, '10¢', kept || t < tc); g.restore(); }
  if (t >= tc) { const e = ob(pr(t, tc, .25)); g.save(); g.translate(790, 815); g.scale(e, e); g.lineWidth = 12; g.strokeStyle = YEL; g.setLineDash([26, 16]); rr(-300, -105, 600, 210, 30); g.stroke(); g.restore(); }
  txt(t, 'KEEPS', 300, 815, 120, '#fff', tc);
  txt(t, '40¢', 1500, 720, 300, YEL, tc + .05, { slam: 1, rot: -.05 });
  txt(t, 'OF EVERY $1', 1500, 930, 110, '#fff', C('N4.every'));
  small("McDonald's Corporation operating margin, roughly 40% and up · company filings", 960, 1040, 28, 'rgba(255,255,255,.8)');
});
// 9. Forty cents? On a burger?
scene(C('F3') - .1, t => {
  bg(t, '#ff5a4a', '#b3161e'); const two = t >= C('F3.onburger');
  ch(t, 'frank-shock', 620, 1150, 1080, C('F3') - .1, { from: 'left', d: .2, shake: tt => 14 * Math.exp(-(tt - C('F3')) * 3), punch: [C('F3.onburger')] });
  if (!two) bubble(t, ['FORTY', 'CENTS?!'], 1330, 380, C('F3') + .02, 900, 470, { size: 170 });
  else { bubble(t, ['ON A BURGER?!'], 1340, 260, C('F3.onburger'), 900, 450, { size: 130, fill: YEL }); const e = ob(pr(t, C('F3.onburger') + .1, .25)); burger(1380, 720, .8 * e, .06 + Math.sin(t * 8) * .03); }
});
// 10. Not on the burger, Frank. On the rent.
scene(C('N5') - .1, t => {
  const tr = C('N5.onrent') - .1, two = t >= tr; bg(t, two ? '#12b886' : '#3f6bff', two ? '#066b52' : '#1a2fb5');
  if (!two) { const e = ob(pr(t, C('N5') - .05, .25)); burger(960, 600, 1.25 * e, -.04); cross(t, 960, 570, 260, C('N5') + .72); txt(t, 'NOT THE BURGER', 960, 950, 130, '#fff', C('N5') + .8, { slam: 1 }); }
  else { ch(t, 'landlord', 560, 1130, 1040, tr, { from: 'left', d: .25, punch: [C('N5.onrent') + .55] });
    txt(t, 'THE', 1300, 240, 170, '#fff', tr + .1); txt(t, 'RENT.', 1330, 600, 380, YEL, C('N5.onrent') + .12, { slam: 1, rot: -.04 }); }
});
// 11. ...The what?   (music drops out)
scene(C('N5.end') + .12, t => {
  const z = 1 + (t - C('N5.end')) * .05; g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  g.fillStyle = '#ffe9a8'; g.fillRect(0, 0, W, H);
  const im = IMG['frank-burger'], h = 1500; g.drawImage(im, 960 - im.width * h / im.height / 2 + 90, 40, im.width * h / im.height, h); g.restore();
  txt(t, '. . .', 1500, 300, 140, INK, C('N5.end') + .25, { lw: .001 });
  bubble(t, ['...THE WHAT?'], 1420, 300, C('F4'), 1050, 520, { size: 130 });
});
// 12a. not in the burger business
scene(C('N6') - .12, t => {
  bg(t, '#ff8a1a', '#d93a1a'); const t0 = C('N6'), ti = C('N6.isnt');
  const e = ob(pr(t, t0 - .1, .3)); g.save(); g.translate(660, 590 + (1 - e) * 900); g.rotate(-.035); const s = .56 * (1 + (t - t0) * .012); g.scale(s, s);
  g.shadowColor = 'rgba(20,10,40,.45)'; g.shadowOffsetX = 22; g.shadowOffsetY = 22; g.fillStyle = '#fff'; g.fillRect(-990, -570, 1980, 1140); g.shadowColor = 'transparent'; g.drawImage(IMG.restaurant, -960, -540);
  g.lineWidth = 12; g.strokeStyle = INK; g.strokeRect(-990, -570, 1980, 1140);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; const sx = SIGN[0] - 960 + SIGN[2] / 2, sy = SIGN[1] - 540 + SIGN[3] / 2;
  if (t < ti + .5) { g.font = '74px Anton'; g.fillText('BURGERS', sx, sy + 4); } else { g.font = '150px Anton'; g.fillStyle = RED; g.fillText('?', sx, sy + 8); }
  g.restore();
  if (t >= ti + .45 && t < ti + .62) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(0, 0, W, H); }
  txt(t, 'BIGGEST BURGER', 1440, 260, 112, '#fff', t0 + .1); txt(t, 'CHAIN ON EARTH', 1440, 390, 112, '#fff', t0 + .55);
  txt(t, 'NOT', 1440, 640, 250, YEL, ti + .5, { slam: 1, rot: -.05 }); txt(t, 'IN THE BURGER BUSINESS', 1440, 850, 86, '#fff', ti + .8);
});
// 12b. So who is actually taking your money?
scene(C('N6.who') - .1, t => {
  bg(t, '#ff5a4a', '#a3121c'); const t0 = C('N6.who');
  ch(t, 'frank-receipt', 430, 1140, 1040, t0 - .1, { from: 'left', d: .22 });
  txt(t, "SO WHO'S", 1280, 190, 170, '#fff', t0); txt(t, 'TAKING', 1280, 390, 210, '#fff', t0 + .45); txt(t, 'YOUR MONEY?', 1280, 620, 230, YEL, t0 + .95, { slam: 1, rot: -.03, punch: C('N6.end') + .3 });
  for (let i = 0; i < 3; i++) { const ti = C('N6.end') + .05 + i * .14; if (t < ti) continue; const e = ob(pr(t, ti, .22)); g.save(); g.translate(1000 + i * 280, 900); g.rotate((i - 1) * .06); g.scale(e, e); g.shadowColor = INK; g.shadowOffsetX = 10; g.shadowOffsetY = 10; g.fillStyle = INK; g.strokeStyle = '#fff'; g.lineWidth = 8; rr(-105, -120, 210, 240, 22); g.fill(); g.shadowColor = 'transparent'; g.stroke(); g.font = '170px Anton'; g.fillStyle = [YEL, '#7de3ff', PNK][i]; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 0, 10 + Math.sin(t * 5 + i) * 6); g.restore(); }
});
const SIGN = [532, 163, 295, 192];
SC.sort((a, b) => a.t0 - b.t0);
// hits that shake the camera
const HITS = ['N1.lunch+.78', 'F1+.05', 'N2+.25', 'N2.forty', 'N4.cents', 'F3+.04', 'N5+.75', 'N5.onrent+.12', 'N6.isnt+.5', 'N6.who+.95'].map(s => { const [k, o] = s.split('+'); return T[k] + (+o || 0); });
function render(t) {
  let i = 0; while (i + 1 < SC.length && SC[i + 1].t0 <= t) i++;
  const s = SC[i], lt = t - s.t0; let sh = 0; for (const h of HITS) if (t >= h && t < h + .35) sh = Math.max(sh, 16 * Math.exp(-(t - h) * 9));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  // punch-in on every cut + slow push through the shot
  const z = 1 + .1 * (1 - oc(lt / .22)) + lt * .006 + (sh ? .01 : 0);
  g.translate(W / 2 + Math.sin(t * 90) * sh, H / 2 + Math.cos(t * 77) * sh); g.scale(z, z); g.translate(-W / 2, -H / 2);
  s.fn(t); g.restore();
  if (i > 0 && lt < .1) { g.fillStyle = `rgba(255,255,255,${.55 * (1 - lt / .1)})`; g.fillRect(0, 0, W, H); }
  if (t > T.DUR - .5) { g.fillStyle = `rgba(0,0,0,${cl((t - (T.DUR - .5)) / .5)})`; g.fillRect(0, 0, W, H); }
}
window.render = render;
