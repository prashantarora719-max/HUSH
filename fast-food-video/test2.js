// Style test: the first 12 seconds staged as a scene with the flat 2D Frank. render(t) is deterministic.
const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 1920, H = 1080, T = window.TL, IMG = {};
window.assetsReady = Promise.all([...Object.entries(window.ART2).map(([k, u]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = u; })),
  ...['90px Anton', '90px Bangers', '700 40px Inter'].map(f => document.fonts.load(f))]);
const INK = '#1a2240', RED = '#e8372c', YEL = '#ffc928', CRM = '#fff3d6', NAVY = '#243a8f';
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, p) => a + (b - a) * p, oc = p => 1 - Math.pow(1 - cl(p), 3);
const ob = p => { p = cl(p); const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const pr = (t, t0, d = .3) => cl((t - t0) / d), C = k => T[k];
const bump = (t, t0, amt = .1, d = .2) => t < t0 ? 0 : amt * Math.exp(-(t - t0) / d) * Math.cos((t - t0) * 24);
const box = (x, y, w, h, f, r = 0, lw = 8) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = f; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); } };

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
function label(s, x, y, size, col = '#fff', font = 'Anton', align = 'center') { g.font = `${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); }
function price(t) { // menu prices creep up while Frank walks in
  const p = oc(pr(t, .3, 2.0)); return [lerp(4.39, 7.49, p), lerp(1.39, 4.19, p), lerp(1.00, 3.29, p)].map(v => '$' + v.toFixed(2)); }

function room(t, o = {}) {
  g.fillStyle = '#ffdf9a'; g.fillRect(-400, -300, W + 800, 1100);                       // wall
  g.fillStyle = '#ffd07a'; for (let i = -2; i < 14; i++) g.fillRect(i * 180, -300, 90, 1100);  // wall stripes
  box(-400, 470, W + 800, 46, RED, 0, 8);                                               // dado rail
  g.fillStyle = '#2c3f96'; g.fillRect(-400, 800, W + 800, 600);                         // floor
  g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 6; for (let i = -6; i < 22; i++) { g.beginPath(); g.moveTo(960 + (i * 150 - 960) * .86, 800); g.lineTo(960 + (i * 150 - 960) * 1.5, 1400); g.stroke(); }
  [880, 1000].forEach(y => { g.beginPath(); g.moveTo(-400, y); g.lineTo(W + 400, y); g.stroke(); });
  g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.moveTo(-400, 800); g.lineTo(W + 400, 800); g.stroke();
  box(60, 180, 330, 624, '#8fd3ff', 10); box(84, 204, 282, 300, '#c9ecff', 6, 6); box(84, 520, 282, 284, '#c9ecff', 6, 6); box(338, 480, 22, 90, YEL, 8, 6);  // door
  // menu board
  box(1010, 60, 850, 300, NAVY, 22); const P = price(t);
  [[1150, burger, .36, 150], [1435, fries, .5, 200], [1720, cup, .46, 205]].forEach(([x, fn, s, y], i) => { box(x - 120, 84, 240, 252, '#fff3d6', 14, 6); fn(x, y, s);
    const hot = pr(t, .3, 2.0) < 1 && t > .3; g.save(); g.translate(x, 292); const b = 1 + (hot ? .06 * Math.sin(t * 30 + i) : 0); g.scale(b, b); label(P[i], 0, 0, 56, hot ? RED : INK); g.restore(); });
  // counter
  box(1000, 600, 1300, 60, CRM, 10); box(1030, 656, 1300, 300, RED, 0); box(1030, 700, 1300, 30, YEL, 0, 6);
  // register
  box(1560, 470, 250, 134, '#3b4a66', 14); box(1590, 400, 190, 80, INK, 10); const rv = t < 1.95 ? 0 : lerp(0, 11, oc(pr(t, 1.95, .42)));
  label('$' + rv.toFixed(2), 1685, 442, 50, t > 2.37 && Math.sin(t * 20) > -.3 ? '#7dff9a' : '#39c46a', 'Anton');
  for (let i = 0; i < 8; i++) box(1585 + (i % 4) * 34, 500 + Math.floor(i / 4) * 40, 24, 24, '#c9d2e6', 5, 4);
  // tray
  const tx = t < C('N1.lunch') - .1 ? 9999 : lerp(2200, 1290, ob(pr(t, C('N1.lunch') - .1, .4)));
  box(tx - 190, 576, 380, 26, '#b9c2d6', 12); if (!o.noFood) { fries(tx - 110, 540, .5); cup(tx + 120, 540, .5); burger(tx + 5, 548, o.tiny ? .2 : .26); }
}
// Frank: x = centre, y = feet, h = height
function frank(t, pose, x, y, h, o = {}) {
  const blink = pose !== 'walk' && ((t * 1.0 + .4) % 2.6) < .13; const im = IMG[blink ? pose + '-blink' : pose], s = h / im.height;
  const talk = o.talk ? Math.abs(Math.sin(t * 17)) * .022 : 0; const sq = 1 + bump(t, o.land ?? 1e9, .07) + talk;
  g.save(); g.translate(x + (o.shake || 0) * Math.sin(t * 60), y); g.rotate(o.rot || 0); g.scale((o.flip ? -1 : 1) * (2 - sq), sq);
  g.fillStyle = 'rgba(20,20,60,.25)'; g.beginPath(); g.ellipse(0, 0, im.width * s * .42, 20, 0, 0, 7); g.fill();
  g.drawImage(im, -im.width * s * (o.ax ?? .5), -h, im.width * s, h); g.restore();
}
function bubble(t, lines, x, y, t0, tx, ty, o = {}) {
  if (t < t0 || (o.out && t > o.out)) return; const size = o.size || 92, e = ob(pr(t, t0, .2));
  g.save(); g.font = `${size}px Bangers`; const w = Math.max(...lines.map(l => g.measureText(l).width)) + 100, h = lines.length * size * 1.08 + 60;
  g.translate(x, y); g.scale(e, e); g.rotate(o.rot || -.03); g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = INK; g.fillStyle = o.fill || '#fff';
  const draw = () => { g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 44); if (o.cloud) return; const ax = cl(tx - x, -w / 2 + 70, w / 2 - 70), dn = ty > y; g.moveTo(ax - 40, dn ? h / 2 - 4 : -h / 2 + 4); g.lineTo(tx - x, ty - y); g.lineTo(ax + 40, dn ? h / 2 - 4 : -h / 2 + 4); };
  g.shadowColor = INK; g.shadowOffsetX = 10; g.shadowOffsetY = 10; draw(); g.stroke(); g.shadowColor = 'transparent'; draw(); g.fill();
  g.fillStyle = o.col || INK; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.08 + 6)); g.restore();
}
function big(t, s, x, y, size, fill, t0, o = {}) {
  if (t < t0 || (o.out && t > o.out)) return; const e = o.slam ? lerp(2.4, 1, oc(pr(t, t0, .15))) : ob(pr(t, t0, .2));
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(e, e); g.font = `${size}px Anton`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * .2; g.strokeStyle = INK;
  g.shadowColor = INK; g.shadowOffsetX = size * .06; g.shadowOffsetY = size * .08; g.strokeText(s, 0, 0); g.shadowColor = 'transparent'; g.fillStyle = fill; g.fillText(s, 0, 0); g.restore();
}
const cam = (cx, cy, z, fn) => { g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore(); };
const SHOTS = [
  [0, t => {            // A. Frank walks in, the prices climb, the till rings up $11.00
    const wp = pr(t, .15, 1.85), x = lerp(-160, 860, wp), walking = wp < 1;
    cam(lerp(900, 1060, oc(t / 3.3)), 560, lerp(1, 1.12, oc(t / 3.3)), () => { room(t);
      if (walking) frank(t, 'walk', x, 905 - Math.abs(Math.sin(t * 9.5)) * 16, 640, { flip: 0, rot: Math.sin(t * 9.5) * .035 });
      else frank(t, t > 2.45 ? 'receipt' : 'stand', x, 905, 650, { land: t > 2.45 ? 2.45 : 2.0, ax: t > 2.45 ? .72 : .5, shake: t > 2.45 ? 6 * Math.exp(-(t - 2.45) * 4) : 0 });
    });
    big(t, 'THIS IS FRANK.', 560, 150, 150, '#fff', C('N1'), { rot: -.03, out: 1.7 });
    big(t, '$11.00', 1010, 500, 130, YEL, 2.4, { slam: 1, rot: -.05 });
  }],
  [C('F1') - .1, t => {  // B. close on Frank
    cam(830, 420, 1.75 + (t - C('F1')) * .04, () => { room(t); frank(t, 'receipt', 860, 905, 650, { ax: .72, talk: 1, shake: 9 * Math.exp(-(t - C('F1')) * 3) }); });
    g.fillStyle = 'rgba(232,55,44,.16)'; g.fillRect(0, 0, W, H);
    bubble(t, ['ELEVEN', 'DOLLARS?!'], 1420, 330, C('F1') + .02, 1010, 520, { size: 150, rot: .03 });
  }],
  [C('F1.forthis') - .08, t => {  // C. the tiny burger
    cam(1130, 500, 2.0, () => { room(t, { tiny: 1 }); frank(t, 'point', 760, 905, 650, { flip: 1, ax: .62, talk: 1 }); });
    bubble(t, ['FOR THIS?'], 620, 250, C('F1.forthis') + .02, 420, 520, { size: 150 });
    const e = ob(pr(t, C('F1.forthis') + .2, .25)); g.save(); g.translate(1290, 660); g.scale(e, e); g.strokeStyle = YEL; g.lineWidth = 14; g.setLineDash([24, 14]); g.beginPath(); g.arc(0, 0, 110, 0, 7); g.stroke(); g.restore();
  }],
  [C('D1') - .1, t => {  // D. Danny, off screen
    const two = t >= C('D1.cost');
    cam(1000, 560, 1.22, () => { room(t); frank(t, two ? 'shrug' : 'crossed', 820, 905, 650, { flip: 0, land: two ? C('D1.cost') : C('D1') - .1 }); });
    if (!two) bubble(t, ["IT'S A BURGER,", 'GRANDPA.'], 1470, 760, C('D1') + .05, 1990, 900, { size: 100, fill: '#bfe4ff', rot: .02 });
    else bubble(t, ["THAT'S WHAT", 'THEY COST.'], 1470, 760, C('D1.cost') + .03, 1990, 900, { size: 110, fill: '#bfe4ff', rot: .02 });
    g.font = '700 30px Inter'; g.textAlign = 'right'; g.fillStyle = '#fff'; g.fillText('DANNY, 19 (his own drawing is next)', 1880, 1040);
  }],
  [C('F2') - .12, t => {  // E. in my day
    cam(820, 430, 1.5 + (t - C('F2')) * .03, () => { room(t); frank(t, 'stand', 760, 905, 650, { talk: 1, land: C('F2') - .1 }); });
    const t0 = C('F2') + .05; if (t >= t0) { const e = ob(pr(t, t0, .3)); g.save(); g.translate(1420, 340); g.scale(e, e);
      [[-545, -40, 24], [-500, -115, 34]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); });
      g.beginPath(); [[-250, 0, 190], [-60, -110, 200], [180, -60, 210], [260, 110, 180], [40, 160, 200], [-180, 140, 180]].forEach(([x, y, r]) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); }); g.lineWidth = 18; g.strokeStyle = INK; g.stroke(); g.fillStyle = '#fff'; g.fill();
      g.fillStyle = 'rgba(214,160,90,.25)'; g.fill(); burger(-120, 40, .75, -.06);
      if (t >= C('F2.dollar')) { const q = ob(pr(t, C('F2.dollar'), .25)); g.save(); g.translate(220, 20); g.rotate(.12); g.scale(q, q); box(-150, -95, 300, 190, YEL, 20, 10); label('$1', 0, 6, 150, INK); g.restore(); }
      g.restore(); }
    big(t, 'IN MY DAY...', 480, 150, 120, '#fff', C('F2') + .02, { rot: -.03 });
  }],
];
function render(t) {
  let i = 0; while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= t) i++; const lt = t - SHOTS[i][0];
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.save(); const z = 1 + .06 * (1 - oc(lt / .2)); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); SHOTS[i][1](t); g.restore();
  if (i > 0 && lt < .08) { g.fillStyle = `rgba(255,255,255,${.5 * (1 - lt / .08)})`; g.fillRect(0, 0, W, H); }
  if (t > 11.5) { g.fillStyle = `rgba(0,0,0,${cl((t - 11.5) / .4)})`; g.fillRect(0, 0, W, H); }
}
window.render = render;
