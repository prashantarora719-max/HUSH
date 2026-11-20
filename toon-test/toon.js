// A small cartoon rig drawn in code. Every frame is a pure function of time t, so renders are repeatable.
// Characters are built from parts (torso, arms, head, eyes, brows, mouth) posed by keyframes, with
// idle life (breathing, blinks, eye darts), lip movement driven by the voice level, and overshoot on pose changes.
const W = 1920, H = 1080, g = document.getElementById('c').getContext('2d');
const OUT = '#1f1b2d', LW = 7, CREAM = '#fbf3e4', CORAL = '#e8674f', TEAL = '#2f8f8b', NAVY = '#27304f', GOLD = '#f2b632';
const DISP = 'Fraunces', UI = 'Inter';
window.assetsReady = Promise.all(['600 40px Fraunces', 'italic 400 40px Fraunces', '700 40px Fraunces', '600 40px Inter', '700 40px Inter'].map(f => document.fonts.load(f)));
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k, prog = (t, a, b) => clamp((t - a) / (b - a));
const outCubic = k => 1 - Math.pow(1 - k, 3), inOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, outBack = k => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
// overshoot and settle, like a body part with weight
const spring = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6.5 * k) * Math.cos(11 * k);
const noise = (t, s) => (Math.sin(t * 1.31 + s * 12.9) + Math.sin(t * 2.17 + s * 4.1) * .6 + Math.sin(t * 0.53 + s * 7.7) * .8) / 2.4;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const LINE = Object.fromEntries(TL.lines.map(l => [l.id, l]));
const at = id => LINE[id].t0, end = id => LINE[id].t1;

// ---------- voice to mouth
function talk(id, t) { const l = LINE[id]; if (!l || t < l.t0 - .05 || t > l.t1 + .08) return null; const f = (t - l.t0) * 30, e = i => l.env[clamp(Math.round(i), 0, l.env.length - 1)] || 0;
  const open = Math.pow(clamp(e(f - 1) * .25 + e(f) * .5 + e(f + 1) * .25), .75);
  let syl = 0; for (let i = 1; i < Math.min(l.env.length - 1, f); i++) if (l.env[i] > .45 && l.env[i] >= l.env[i - 1] && l.env[i] > l.env[i + 1]) syl++;   // count syllable peaks so far
  return { open, round: hash(syl + l.t0) > .62 ? .8 : hash(syl + l.t0 + 3) > .7 ? .35 : 0, energy: e(f) }; }

// ---------- poses: [time, {prop: value}, duration]; each change eases in with overshoot
const REST = { x: 0, y: 0, s: 1, lean: 0, tilt: 0, hx: 0, hy: 0, sq: 0, look: [0, 0], open: 1, brow: 0, browUp: 0, smile: .3, aL: [.18, .25], aR: [.18, .25], mouth: 0, face: 1 };
function pose(keys, t) { const p = JSON.parse(JSON.stringify(REST)); for (const [kt, props, d = .42, ez = spring] of keys) { if (t < kt) break; const k = ez(prog(t, kt, kt + d));
    for (const n in props) p[n] = Array.isArray(props[n]) ? props[n].map((v, i) => lerp(p[n][i], v, k)) : n === 'face' ? props[n] : lerp(p[n], props[n], k); } return p; }
function blink(t, seed) { const period = 2.6 + hash(seed) * 1.8, ph = (t + seed * 1.7) % period; return ph < .07 ? 1 - ph / .07 : ph < .11 ? 0 : ph < .2 ? (ph - .11) / .09 : 1; }

// ---------- drawing primitives
function shape(path, fill, lw = LW) { g.beginPath(); path(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = OUT; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
function limb(pts, w, col) { g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.strokeStyle = OUT; g.lineWidth = w + LW * 2; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
const ell = (x, y, rx, ry, rot = 0) => () => g.ellipse(x, y, rx, ry, rot, 0, 7);
function text(s, x, y, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.weight || 600} ${o.size || 60}px ${o.font || DISP}`; g.textAlign = o.align || 'left'; g.globalAlpha *= o.alpha ?? 1; if (o.spacing != null) g.letterSpacing = o.spacing + 'px'; g.fillStyle = o.color || OUT; g.fillText(s, x, y); g.restore(); }
const pop = (t, a, d = .45) => spring(prog(t, a, a + d));
function tag(s, x, y, t, a, col = CORAL, size = 44) { const k = pop(t, a); if (k <= 0) return; g.save(); g.font = `700 ${size}px ${UI}`; const w = g.measureText(s).width + 56; g.translate(x, y); g.scale(k, k); g.rotate(-.03); shape(() => g.roundRect(-w / 2, -size * .85, w, size * 1.6, 14), col); text(s, 0, size * .28, { font: UI, weight: 700, size, align: 'center', color: '#fff' }); g.restore(); }

// ---------- the character
function mouth(m, cy, baseW) { const w = baseW * (1 - .45 * m.round) * (1 + .14 * Math.max(0, m.smile)), o = m.open * 44 * (1 + .25 * m.round), y = cy - m.smile * 6;
  if (o < 4) { g.beginPath(); g.moveTo(-w / 2, y - m.smile * 8); g.quadraticCurveTo(0, y + m.smile * 26, w / 2, y - m.smile * 8); g.lineWidth = LW; g.strokeStyle = OUT; g.lineCap = 'round'; g.stroke(); return; }
  const path = () => { g.moveTo(-w / 2, y); g.quadraticCurveTo(0, y - o * .32 - 5, w / 2, y); g.quadraticCurveTo(0, y + o * 1.7 + m.smile * 12, -w / 2, y); };
  g.save(); g.beginPath(); path(); g.fillStyle = '#5b1b2a'; g.fill(); g.clip(); g.fillStyle = '#fff'; g.fillRect(-w / 2, y - o * .4 - 8, w, o * .4 + 7); if (o > 16) { g.fillStyle = '#e8717f'; g.beginPath(); g.ellipse(0, y + o * 1.05, w * .3, o * .5, 0, 0, 7); g.fill(); } g.restore(); shape(path, null); }
function eye(x, y, p, side, skin, r = 1) { const rx = 25 * r, ry = 30 * r * (1 - .25 * Math.abs(p.sq));
  g.save(); g.translate(x, y); shape(ell(0, 0, rx, ry), '#fff'); g.save(); g.beginPath(); g.ellipse(0, 0, rx - 3, ry - 3, 0, 0, 7); g.clip();
  g.fillStyle = OUT; g.beginPath(); g.arc(clamp(p.look[0], -1, 1) * 11, clamp(p.look[1], -1, 1) * 9 + 2, 12 * r, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(clamp(p.look[0], -1, 1) * 11 + 4, clamp(p.look[1], -1, 1) * 9 - 3, 3.5, 0, 7); g.fill();
  const lid = -ry + (1 - p.open) * 2 * ry + Math.max(0, p.brow) * 8; g.rotate(p.brow * .32 * side); g.fillStyle = skin; g.fillRect(-rx * 2, -ry * 3, rx * 4, ry * 2 + lid + ry); g.fillStyle = OUT; g.fillRect(-rx * 2, lid - 3, rx * 4, 6); g.restore();
  if (p.open < .12) { g.beginPath(); g.moveTo(-rx, 2); g.quadraticCurveTo(0, 10, rx, 2); g.lineWidth = LW; g.strokeStyle = OUT; g.stroke(); } g.restore();
  g.save(); g.translate(x, y - ry - 16 - p.browUp * 16); g.rotate(p.brow * .42 * side); g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(0, -7, 26, 0); g.lineWidth = 11; g.strokeStyle = OUT; g.lineCap = 'round'; g.stroke(); g.restore(); }
function arm(S, a, side, c, sleeveTo) { const L1 = 118, L2 = 112, E = [S[0] + Math.sin(a[0]) * L1 * side, S[1] + Math.cos(a[0]) * L1], Hd = [E[0] + Math.sin(a[0] + a[1]) * L2 * side, E[1] + Math.cos(a[0] + a[1]) * L2];
  limb([S, E, Hd], 40, c.sleeve === 'short' ? c.skin : c.shirt); if (c.sleeve === 'short') limb([S, [lerp(S[0], E[0], .7), lerp(S[1], E[1], .7)]], 54, c.shirt);
  else { limb([S, E], 50, c.shirt); g.beginPath(); g.arc(Hd[0], Hd[1], 26, 0, 7); g.fillStyle = '#fff'; g.fill(); }
  const ha = a[0] + a[1]; g.save(); g.translate(Hd[0], Hd[1]); g.rotate(-ha * side); shape(ell(-side * 20, -6, 13, 20, side * .5), c.skin, 5); shape(() => g.roundRect(-27, -24, 54, 62, 24), c.skin); g.restore(); return Hd; }
function character(c, p, t, m) { const br = 1 + Math.sin(t * 2.1 + c.seed) * .012, TH = c.th, SW = c.sw, HW = c.hw;
  g.save(); g.translate(p.x, p.y); g.scale(p.s, p.s); g.rotate(p.lean); const sh = -TH * br, SL = [-SW / 2 + 16, sh + 34], SR = [SW / 2 - 16, sh + 34];
  const far = p.face > 0 ? 'L' : 'R', near = p.face > 0 ? 'R' : 'L'; const hands = {};
  hands[far] = arm(far === 'L' ? SL : SR, far === 'L' ? p.aL : p.aR, far === 'L' ? -1 : 1, c);
  shape(() => { g.moveTo(-HW / 2, 40); g.lineTo(-SW / 2, sh + 46); g.quadraticCurveTo(-SW / 2, sh, -SW / 2 + 52, sh); g.lineTo(SW / 2 - 52, sh); g.quadraticCurveTo(SW / 2, sh, SW / 2, sh + 46); g.lineTo(HW / 2, 40); g.closePath(); }, c.shirt);
  if (c.suit) { shape(() => { g.moveTo(-34, sh + 2); g.lineTo(0, sh + 120); g.lineTo(34, sh + 2); g.closePath(); }, '#fff'); shape(() => { g.moveTo(-11, sh + 22); g.lineTo(11, sh + 22); g.lineTo(15, sh + 96); g.lineTo(0, sh + 116); g.lineTo(-15, sh + 96); g.closePath(); }, c.tie, 5);
    g.beginPath(); g.moveTo(-34, sh + 2); g.lineTo(-70, sh + 60); g.lineTo(-6, sh + 128); g.moveTo(34, sh + 2); g.lineTo(70, sh + 60); g.lineTo(6, sh + 128); g.lineWidth = LW; g.strokeStyle = OUT; g.stroke(); }
  else { g.beginPath(); g.moveTo(-40, sh + 4); g.quadraticCurveTo(0, sh + 44, 40, sh + 4); g.lineWidth = LW; g.strokeStyle = OUT; g.stroke(); }
  // neck and head
  const hy = sh - 26 - c.hh / 2 + p.hy - (m ? m.open * 5 : 0); limb([[0, sh + 10], [p.hx * .5, hy + c.hh / 2 - 20]], 46, c.skin);
  g.save(); g.translate(p.hx, hy); g.rotate(p.tilt); g.scale(1 + p.sq * .5, 1 - p.sq); const hw = c.hwid / 2, hh = c.hh / 2, f = p.face * 16;
  if (c.hairBack) { g.save(); g.rotate(-p.tilt * .5 + (p.hairLag || 0)); shape(() => { g.moveTo(-hw - 26, -hh * .3); g.bezierCurveTo(-hw - 40, -hh - 70, hw + 40, -hh - 70, hw + 26, -hh * .3); g.lineTo(hw + 34, hh + 46); g.quadraticCurveTo(hw, hh + 78, hw - 30, hh + 30); g.lineTo(-hw + 30, hh + 30); g.quadraticCurveTo(-hw, hh + 78, -hw - 34, hh + 46); g.closePath(); }, c.hair); g.restore(); }
  shape(ell(-hw - 4 + f * .4, 6, 20, 26), c.skin); shape(ell(hw + 4 + f * .4, 6, 20, 26), c.skin);
  shape(() => g.roundRect(-hw, -hh, hw * 2, hh * 2, [hw * .95, hw * .95, hw * .8, hw * .8]), c.skin);
  if (c.stubble) { g.save(); g.beginPath(); g.roundRect(-hw + 4, -hh + 4, hw * 2 - 8, hh * 2 - 8, [hw * .95, hw * .95, hw * .8, hw * .8]); g.clip(); g.fillStyle = 'rgba(42,32,40,.78)'; g.beginPath(); g.ellipse(f, hh * 1.12, hw * 1.12, hh * .5, 0, 0, 7); g.fill(); g.restore(); }
  if (c.tufts) { shape(ell(-hw - 2, -hh * .32, 26, 44, .2), c.hair); shape(ell(hw + 2, -hh * .32, 26, 44, -.2), c.hair); }
  if (c.fringe) for (const sd of [-1, 1]) shape(() => { g.moveTo(f * .5, -hh - 16); g.bezierCurveTo(sd * hw * .9, -hh - 30, sd * (hw + 30), -hh * .5, sd * (hw + 22), hh * .5); g.quadraticCurveTo(sd * (hw - 6), hh * .2, sd * (hw - 12), -hh * .1); g.quadraticCurveTo(sd * hw * .75, -hh * .78, f * .5, -hh * .66); g.closePath(); }, c.hair);
  const pe = { ...p, open: p.open * blink(t, c.seed) }; eye(-44 + f, -12, pe, -1, c.skin); eye(44 + f, -12, pe, 1, c.skin);
  if (c.glasses) { g.lineWidth = 6; g.strokeStyle = OUT; for (const sx of [-44, 44]) { g.beginPath(); g.arc(sx + f, -12, 39, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(-5 + f, -14); g.lineTo(5 + f, -14); g.moveTo(-83 + f, -16); g.lineTo(-hw, -22); g.moveTo(83 + f, -16); g.lineTo(hw, -22); g.stroke(); }
  g.beginPath(); g.moveTo(f * 1.3 - 4, 14); g.quadraticCurveTo(f * 1.3 + p.face * 16, 34, f * 1.3 - 2, 40); g.lineWidth = 6; g.strokeStyle = OUT; g.lineCap = 'round'; g.stroke();
  g.translate(f * 1.1, 0); mouth({ open: m ? Math.max(m.open, p.mouth) : p.mouth, smile: p.smile, round: m ? m.round : 0 }, hh * .56, c.mw);
  g.restore();
  hands[near] = arm(near === 'L' ? SL : SR, near === 'L' ? p.aL : p.aR, near === 'L' ? -1 : 1, c);
  g.restore(); return hands; }
const ADAM = { seed: 1, skin: '#e7b48a', hair: '#2a2028', shirt: '#22252e', sleeve: 'short', th: 215, sw: 214, hw: 160, hwid: 216, hh: 246, mw: 84, hairBack: true, fringe: true, stubble: true };
const INV = { seed: 2, skin: '#f0c9a4', hair: '#b9bcc6', shirt: NAVY, suit: true, tie: CORAL, th: 200, sw: 250, hw: 210, hwid: 226, hh: 220, mw: 74, tufts: true, glasses: true };
// one call: pose from keyframes, add idle life and speech, draw
function act(c, keys, t, lineIds = []) { const p = pose(keys, t), q = pose(keys, t - .11); let m = null; for (const id of lineIds) m = m || talk(id, t);
  p.hx += noise(t, c.seed) * 3; p.tilt += noise(t * .8, c.seed + 5) * .012; p.hairLag = (q.tilt - p.tilt) * .9 + (q.hx - p.hx) * .004;
  if (m) { p.browUp += m.energy * .22; p.tilt += Math.sin(t * 7 + c.seed) * .012 * m.energy; p.hy += Math.sin(t * 9) * 2 * m.energy; p.aL = [p.aL[0] + noise(t * 3, 7) * .05 * m.energy, p.aL[1] + noise(t * 3.4, 8) * .08 * m.energy]; p.aR = [p.aR[0] + noise(t * 3.1, 9) * .05 * m.energy, p.aR[1] + noise(t * 2.8, 10) * .08 * m.energy]; }
  const dart = hash(Math.floor((t + c.seed) / 1.9)); if (dart > .7 && !m) p.look = [p.look[0] + (hash(Math.floor(t / 1.9) + 9) - .5) * .5, p.look[1]];
  return character(c, p, t, m); }

// ---------- sets
function room(wall, floor, y = 800) { g.fillStyle = wall; g.fillRect(0, 0, W, H); g.fillStyle = floor; g.fillRect(0, y, W, H - y); g.fillStyle = OUT; g.fillRect(0, y - 4, W, LW); }
function windowWall(x, y, w, h, t) { shape(() => g.rect(x, y, w, h), '#bfe6e3'); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = '#8ccfca';
  for (let i = 0; i < 9; i++) { const bw = 70 + hash(i) * 90, bh = 120 + hash(i + 4) * (h * .6); g.fillRect(x + i * (w / 8) - 20, y + h - bh, bw, bh); } g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(x + w * .15, y); g.lineTo(x + w * .3, y); g.lineTo(x + w * .1, y + h); g.lineTo(x - w * .05, y + h); g.fill(); g.restore();
  g.lineWidth = LW; g.strokeStyle = OUT; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + w * i / 4, y); g.lineTo(x + w * i / 4, y + h); g.stroke(); } }
function plant(x, y, s = 1, t = 0) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 5; i++) { g.save(); g.rotate((i - 2) * .42 + Math.sin(t * 1.3 + i) * .03); shape(() => { g.moveTo(0, 0); g.quadraticCurveTo(-34, -90, 0, -170); g.quadraticCurveTo(34, -90, 0, 0); }, i % 2 ? '#3fa66f' : '#2f8f5d'); g.restore(); } shape(() => { g.moveTo(-50, 0); g.lineTo(50, 0); g.lineTo(38, 84); g.lineTo(-38, 84); g.closePath(); }, CORAL); g.restore(); }
function desk(x, y, w, t, a = -9, col = '#d9a066') { const k = pop(t, a); if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); shape(() => g.rect(-w / 2 + 14, 0, 16, 110), '#8a5a33'); shape(() => g.rect(w / 2 - 30, 0, 16, 110), '#8a5a33'); shape(() => g.roundRect(-w / 2, -22, w, 30, 8), col); g.restore(); }
function cash(x, y, n, t, a = -9) { for (let i = 0; i < n; i++) { const k = pop(t, a + i * .07); if (k <= 0) continue; g.save(); g.translate(x + (i % 2) * 6, y - i * 24 * k); shape(() => g.roundRect(-70, -22, 140, 24, 4), '#6fc08b'); shape(() => g.rect(-14, -22, 28, 24), '#eaf7ee', 4); g.restore(); } }
function cam(z, cx, cy, fn) { g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore(); }
function rays(x, y, t, a) { const k = prog(t, a, a + .6); if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(t * .25); g.globalAlpha = .5 * k; for (let i = 0; i < 14; i++) { g.rotate(Math.PI / 7); g.fillStyle = i % 2 ? '#ffe9a8' : '#fff6d6'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1500); g.lineTo(90, -1500); g.fill(); } g.restore(); }

// ---------- shots
const SHOTS = [
  [0, t => { const z = lerp(1.05, 1.12, prog(t, 0, 2)); cam(z, 960, 560, () => { room('#f6dcc0', '#d7b08a'); windowWall(1060, 150, 760, 500, t); plant(330, 716, 1.15, t);
      act(ADAM, [[0, { x: 960, y: 1500, s: 1.5, face: 1 }, .01], [.08, { y: 1030 }, .6], [.5, { aR: [2.5, .5], smile: 1, mouth: .5, browUp: .6, tilt: -.07 }], [1.05, { aR: [2.75, -.5] }, .22], [1.3, { aR: [2.45, .55] }, .22], [1.55, { aR: [2.75, -.5] }, .22]], t); });
      tag('ADAM', 520, 300, t, .7, CORAL, 64); }],
  [1.95, t => { const a = 1.95; cam(lerp(1, 1.05, prog(t, a, 4)), 960, 540, () => { room('#f1e4cf', '#cdb596', 760); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) desk(700 + i * 210 + r * 40, 600 + r * 150, 150, t, a + .25 + (r * 6 + i) * .05);
      act(ADAM, [[a, { x: 330, y: 1000, s: .92, face: 1, smile: .8 }, .01], [a + .3, { aR: [1.75, .1], look: [.8, 0], tilt: .05 }], [a + 1.2, { aR: [1.5, .5], aL: [.9, 1.2], browUp: .4 }]], t); });
      text('Adam rents out desks.', 960, 150, { size: 84, align: 'center', alpha: prog(t, a + .1, a + .5) }); }],
  [3.95, t => { const a = at('n2'), tg = a + 4.25; cam(lerp(1.02, 1.1, prog(t, a, end('n2'))), 960, 560, () => { room('#f6dcc0', '#d7b08a'); windowWall(120, 150, 620, 500, t); plant(1700, 716, 1.1, t); desk(1180, 880, 330, t);
      const k = spring(prog(t, tg, tg + .9)); if (k > 0) { g.save(); g.translate(1180, -40); g.rotate((1 - k) * -.5 + Math.sin(t * 2) * .02); g.strokeStyle = OUT; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 330 * k); g.stroke(); g.translate(0, 330 * k); shape(() => { g.moveTo(-330, 60); g.lineTo(-250, 0); g.lineTo(330, 0); g.lineTo(330, 220); g.lineTo(-250, 220); g.lineTo(-330, 160); g.closePath(); }, GOLD); shape(ell(-270, 110, 16, 16), CREAM); text('$47,000,000,000', 40, 140, { font: UI, weight: 700, size: 70, align: 'center' }); g.restore(); }
      act(ADAM, [[a, { x: 560, y: 1040, s: 1.25, face: 1, smile: .6, aR: [.9, 1.1] }, .01], [a + 1.3, { look: [.7, .1], aR: [1.55, .15] }], [tg - .25, { lean: -.05, hy: 8, sq: .06 }, .2], [tg + .1, { lean: .04, sq: -.05, hy: -10, aR: [2.3, .3], aL: [2.3, .3], smile: 1, mouth: .6, browUp: .8, look: [.6, -.5] }], [tg + 1.3, { sq: 0, hy: 0, mouth: .25 }]], t); });
      tag('2019', 300, 190, t, a + .5, TEAL, 56); }],
  [10.95, t => { const a = at('a1'), b = a + 2.2; cam(lerp(1.1, 1.22, prog(t, a, end('a1'))), 960, 520, () => { room('#f3d9b5', '#d7b08a', 900); rays(960, 430, t, b);
      act(ADAM, [[a - .3, { x: 960, y: 1260, s: 1.7, face: 1, smile: .4, brow: .25, aL: [.5, 1.7], aR: [.5, 1.7] }, .01], [a + .05, { aL: [1.35, .5], aR: [1.35, .5], tilt: .04, brow: .35 }], [a + 1.1, { aL: [.7, 1.9], aR: [.7, 1.9], tilt: -.05 }],
        [b - .2, { hy: 10, sq: .05 }, .18], [b, { aL: [2.2, .25], aR: [2.2, .25], look: [0, -.8], brow: -.5, browUp: .7, hy: -14, sq: -.04, smile: .7, tilt: 0 }, .55], [b + 1.6, { aL: [2.45, .1], aR: [2.45, .1], sq: 0 }], [end('a1') - .15, { open: .05, smile: 1, look: [0, 0], hy: 0 }, .3]], t, ['a1']); });
      text('“…elevate the world’s consciousness.”', 960, 120, { size: 54, italic: true, weight: 400, align: 'center', alpha: prog(t, b + .4, b + .8) }); text('From the company’s own IPO filing', 960, 168, { font: UI, size: 22, align: 'center', color: 'rgba(31,27,45,.6)', alpha: prog(t, b + .8, b + 1.2) }); }],
  [16.5, t => { const a = at('n3'); cam(lerp(1.08, 1.16, prog(t, 16.5, 19.3)), 960, 520, () => { room('#dfe7ef', '#b9c4d2', 870); g.fillStyle = '#c9d4e0'; for (let i = 0; i < 6; i++) g.fillRect(140 + i * 300, 120, 200, 420);
      act(INV, [[16.5, { x: 960, y: 980, s: 1.5, face: -1, smile: .05, aL: [.5, 2.0], aR: [.5, 2.0], look: [0, .1] }, .01], [a + .5, { tilt: .05, browUp: .3 }], [a + 1.2, { hy: 8 }, .16], [a + 1.4, { hy: 0, smile: .3 }, .3]], t);
      shape(() => g.roundRect(380, 900, 1160, 60, 12), '#7a5a43'); cash(560, 900, 5, t, a + .2); cash(1380, 900, 7, t, a + .5); cash(1230, 900, 3, t, a + .8); });
      tag('THE MAN WITH THE MONEY', 960, 150, t, a + .3, NAVY, 46); }],
  [19.1, t => { cam(lerp(1, 1.06, prog(t, 19.1, 24.3)), 960, 560, () => { room('#e9e1d3', '#c9b89e', 860); windowWall(560, 130, 800, 430, t);
      act(INV, [[19.1, { x: 520, y: 1010, s: 1.2, face: 1, smile: 0, look: [.8, 0], aR: [.6, 1.8], aL: [.4, .6] }, .01], [at('i1'), { lean: .06, aR: [1.0, 1.5], brow: .25 }], [end('i1'), { lean: 0, aR: [.6, 1.8], browUp: .4, brow: 0 }]], t, ['i1']);
      act(ADAM, [[19.1, { x: 1400, y: 1040, s: 1.2, face: -1, smile: .6, look: [-.8, 0], aL: [.5, .5] }, .01], [at('i1') + .9, { tilt: -.06, browUp: .4 }], [at('a2') - .1, { aL: [1.3, 1.2], aR: [1.3, 1.2], hy: -8, smile: 1, browUp: .7, tilt: .05 }], [at('a2') + 1.35, { aL: [.5, .5], aR: [.3, .3], hy: 0, tilt: -.04 }]], t, ['a2']);
      shape(() => g.roundRect(330, 920, 1260, 50, 12), '#8a5a33'); });
      const a = at('a2') + .25, k = pop(t, a); if (k > 0) { g.save(); g.translate(960, 150); g.scale(k, k); shape(() => g.roundRect(-430, -112, 860, 196, 24), '#fff'); text('−$1.9 billion', 0, 0, { font: UI, weight: 700, size: 120, align: 'center', color: '#c8281c' }); g.restore(); text('WeWork’s net loss, 2018', 960, 204, { font: UI, size: 30, align: 'center', color: 'rgba(31,27,45,.65)', alpha: prog(t, a + .4, a + .8) }); } }],
  [24.3, t => { const a = at('i2'), b = a + 2.95; cam(lerp(1.15, 1.3, prog(t, 24.3, 30.5)), 960, 500, () => { room('#dfe7ef', '#b9c4d2', 880); g.fillStyle = '#c9d4e0'; for (let i = 0; i < 6; i++) g.fillRect(140 + i * 300, 120, 200, 420);
      const hands = act(INV, [[24.3, { x: 960, y: 1000, s: 1.55, face: 1, smile: -.1, brow: .5, open: .55, look: [.5, 0], aR: [.55, 2.35], aL: [.4, .5] }, .01], [24.9, { tilt: .07, look: [.3, -.4] }, .6, inOut], [a - .1, { tilt: 0, lean: .07, look: [.6, 0], aR: [1.2, 1.3], brow: .35, open: .8 }], [b - .6, { lean: 0, aR: [.5, .6], brow: 0, open: 1, browUp: .3 }], [b - .2, { lean: -.05, hy: 6 }, .18], [b, { lean: .1, hy: 0, aR: [1.45, .12], smile: .5, browUp: .5 }, .5]], t, ['i2']);
      shape(() => g.roundRect(300, 930, 1320, 60, 12), '#7a5a43'); const k = outBack(prog(t, b + .1, b + .6)); cash(lerp(1120, 1500, k), 930, 8, t, b - 5); });
      const a2 = b + .5, k = pop(t, a2); if (k > 0) { g.save(); g.translate(1500, 250); g.scale(k, k); text('+$4 billion', 0, 0, { font: UI, weight: 700, size: 104, align: 'center', color: '#2e8b57' }); g.restore(); }
      text('Dialogue dramatised. SoftBank invested $4.4 billion in WeWork in 2017.', 960, 60, { font: UI, size: 22, align: 'center', color: 'rgba(31,27,45,.6)', alpha: prog(t, a + .3, a + .8) }); }],
  [30.45, t => { const a = at('a3'); cam(lerp(1.12, 1.2, prog(t, 30.45, 33)), 1080, 540, () => { room('#e9e1d3', '#c9b89e', 860); windowWall(560, 130, 800, 430, t);
      act(INV, [[30.45, { x: 520, y: 1010, s: 1.2, face: 1, smile: .4, look: [.8, 0], aR: [1.3, .2] }, .01]], t); cash(840, 920, 8, t);
      act(ADAM, [[30.45, { x: 1400, y: 1040, s: 1.2, face: -1, smile: .7, look: [-.8, 0], browUp: .5 }, .01], [a - .2, { face: 1, look: [-.2, 0], tilt: .06, hy: -8, aL: [1.75, .9], smile: 1, browUp: .8 }, .4], [end('a3') - .1, { open: .55, tilt: .1 }, .25]], t, ['a3']);
      shape(() => g.roundRect(330, 920, 1260, 50, 12), '#8a5a33'); }); }],
  [32.75, t => { const a = at('n4'), w = t - 32.75; cam(1.08, 960, 540, () => { g.fillStyle = '#cfe3ee'; g.fillRect(0, 0, W, H); g.fillStyle = '#b6c6d0'; g.fillRect(0, 830, W, 250); g.fillStyle = OUT; g.fillRect(0, 826, W, LW);
      const sx = -w * 60; for (let i = 0; i < 5; i++) { const x = 200 + i * 520 + sx; shape(() => g.rect(x, 140, 380, 690), '#9fb7c6'); g.fillStyle = '#d7eaf3'; for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 3; c2++) g.fillRect(x + 30 + c2 * 115, 180 + r * 150, 90, 110); }
      const bob = Math.abs(Math.sin(w * 5.2)) * 14, x = lerp(620, 1050, prog(t, 32.75, 38)); const hands = act(ADAM, [[32.75, { x, y: 1080 - bob, s: 1.3, face: 1, smile: -.7, brow: -.6, look: [.2, .6], open: .7, aL: [.2, 1.25], aR: [.2, 1.25], lean: .05, tilt: .06 }, .01]], t);
      const hx = (hands.L[0] + hands.R[0]) / 2 * 1.3 + x, hyy = (hands.L[1] + hands.R[1]) / 2 * 1.3 + 1080 - bob; g.save(); g.translate(hx, hyy - 30); shape(() => g.rect(-150, -70, 300, 170), '#c99a63'); shape(() => g.rect(-165, -92, 330, 36), '#b48650'); plant(50, -92, .42, t); g.restore(); for (const k of ['L', 'R']) shape(() => g.roundRect(hands[k][0] * 1.3 + x - 27, hands[k][1] * 1.3 + 1080 - bob - 30, 54, 62, 24), ADAM.skin); });
      tag('SIX WEEKS LATER', 960, 150, t, a + .2, CORAL, 52); text('He stepped down as chief executive in September 2019.', 960, 1040, { font: UI, size: 26, align: 'center', color: 'rgba(31,27,45,.7)', alpha: prog(t, a + 3.6, a + 4.1) }); }],
  [38.45, t => { g.fillStyle = CREAM; g.fillRect(0, 0, W, H); g.fillStyle = CORAL; g.fillRect(0, 0, W, 22); const a = 38.5; g.save(); g.translate(960, 520); const k = pop(t, a, .6); g.scale(k, k); text('So what went wrong?', 0, 0, { size: 150, align: 'center', weight: 700 }); g.restore(); text('Style test  ·  characters drawn and animated in code', 960, 660, { font: UI, size: 30, align: 'center', color: 'rgba(31,27,45,.6)', alpha: prog(t, a + .7, a + 1.2) }); }]];
function render(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); SHOTS[i][1](t);
  const f = prog(t, TL.total - .9, TL.total - .1); if (f > 0) { g.fillStyle = `rgba(0,0,0,${f})`; g.fillRect(0, 0, W, H); } }
