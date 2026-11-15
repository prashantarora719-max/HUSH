// Shared drawing tools for the film. Every scene is a pure function of time t, drawn onto whichever canvas `g` points at.
const W = 1920, H = 1080, MAIN = document.getElementById('c').getContext('2d'), DURATION = TL.total, NARR_END = DURATION - 5;
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c.getContext('2d'); }, LA = mk(), LB = mk();
let g = MAIN;
const DISP = 'Fraunces', CLD = 'Newsreader', UI = 'Inter', NUM = '"IBM Plex Mono"', GGL = 'Roboto';
const INK = '#141413', CREAM = '#f0eee6', CLAY = '#d97757', YL = '#ffd84a', RD = '#ff5a4d', GN = '#5fd38d', SOFT = 'rgba(255,255,255,.66)';
const BRAND = { anthropic: INK, claude: CLAY, google: '#4285f4', googlegemini: '#8e75ff', facebook: '#1877f2', uber: '#ffffff', spacex: '#ffffff', nvidia: '#76b900' }, PATHS = {}, IM = {};
window.assetsReady = Promise.all([...['400 40px Fraunces', '600 40px Fraunces', '700 40px Fraunces', 'italic 400 40px Fraunces', 'italic 600 40px Fraunces', '400 40px Newsreader', '500 40px Newsreader', '600 40px Newsreader', 'italic 400 40px Newsreader', 'italic 500 40px Newsreader',
  '400 40px Inter', '500 40px Inter', '600 40px Inter', '700 40px Inter', '400 40px "IBM Plex Mono"', '500 40px "IBM Plex Mono"', '600 40px "IBM Plex Mono"', '400 40px Roboto', '500 40px Roboto', '700 40px Roboto'].map(f => document.fonts.load(f)),
  ...Object.entries(window.PHOTOS || {}).map(([k, v]) => { const i = new Image(); i.src = v; IM[k] = i; return i.decode(); })]);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k, prog = (t, a, b) => clamp((t - a) / (b - a));
const outCubic = k => 1 - Math.pow(1 - k, 3), outExpo = k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k), outBack = k => 1 + 2.6 * Math.pow(k - 1, 3) + 1.6 * Math.pow(k - 1, 2), inOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const grow = (t, a, d = .8) => outExpo(prog(t, a, a + d)), count = (t, a, d = .9) => outExpo(prog(t, a, a + d));
// when a sentence or a word is spoken: at('3.5') is the start of section 3, sentence 5; at('3.5:seventy-two') is that word in or after it
function at(key) { const [k, w0] = key.split(':'), [s, n] = k.split('.').map(Number), t0 = TL.sections[s].sentences[n].start; if (!w0) return t0; let [w, nth] = w0.split('#'); nth = +(nth || 1);
  for (const [x, tt] of TL.sections[s].words) if (x === w && tt >= t0 - .05 && --nth === 0) return tt; throw new Error('no word ' + key); }
// the current scene's palette: light scenes (Claude, Google) use dark ink and no drop shadow
let TH = { ink: '#fff', soft: SOFT, blur: 14 };
const theme = light => { TH = light ? { ink: INK, soft: 'rgba(20,20,19,.6)', blur: 0 } : { ink: '#fff', soft: SOFT, blur: 14 }; };
function text(s, x, y, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.weight || 600} ${o.size || 80}px ${o.font || DISP}`; g.textAlign = o.align || 'left'; g.globalAlpha *= o.alpha ?? 1; if (o.spacing != null) g.letterSpacing = o.spacing + 'px';
  const b = o.blur ?? TH.blur; if (b) { g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = b; g.shadowOffsetY = 4; } g.fillStyle = o.color || TH.ink; g.fillText(s, x, y); g.restore(); }
function width(s, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.weight || 600} ${o.size || 80}px ${o.font || DISP}`; if (o.spacing != null) g.letterSpacing = o.spacing + 'px'; const m = g.measureText(s).width; g.restore(); return m; }
const fit = (s, o, maxw) => { const wd = width(s, o); return wd > maxw ? Math.floor(o.size * maxw / wd) : o.size; };
function rise(s, x, y, o, t, a, d = .45) { const k = outCubic(prog(t, a, a + d)); if (k > 0) text(s, x, y + (1 - k) * 24, { ...o, alpha: k * (o.alpha ?? 1) }); }
const cap = (s, x, y, t, a, o = {}) => rise(s, x, y, { font: UI, weight: 600, size: 26, spacing: 2.5, color: TH.soft, blur: TH.blur ? 8 : 0, ...o }, t, a, .35);
const head = (s, t, a, o = {}) => rise(s, 140, 210, { size: 84, spacing: -1, ...o }, t, a);
const src = (s, t, a) => cap('Source: ' + s, 1780, 1040, t, a, { align: 'right', size: 21, weight: 500, spacing: 1 });
const mark = (x, y, w, h, col, t, a, d = .45) => { const k = outExpo(prog(t, a, a + d)); if (k > 0) { g.fillStyle = col; g.fillRect(x, y, w * k, h); } };
const rr = (x, y, w, h, r, col) => { if (w <= .5 || h <= .5) return; g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2)); g.fill(); };
const ring = (x, y, w, h, r, col, lw = 4) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke(); };
const bg = (a, b) => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, H); theme(false); };
const paper = (col = CREAM, edge = CLAY) => { g.fillStyle = col; g.fillRect(0, 0, W, H); if (edge) { g.fillStyle = edge; g.fillRect(0, 0, 22, H); } theme(true); };
const glow = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
const clear = (k = .78) => { g.clearRect(0, 0, W, H); const gr = g.createLinearGradient(0, H * .3, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${k})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); theme(false); };
function logo(name, cx, cy, size, t, a, col) { const k = a < 0 ? 1 : outBack(prog(t, a, a + .3)); if (k <= 0) return; PATHS[name] ??= new Path2D(LOGOS[name]); g.save(); g.translate(cx, cy); g.scale(size / 24 * k, size / 24 * k); g.translate(-12, -12); g.fillStyle = col || BRAND[name]; g.fill(PATHS[name]); g.restore(); }
function photo(name, x, y, size, t, a, edge = YL) { const k = outCubic(prog(t, a, a + .35)); if (k <= 0 || !IM[name]) return; g.save(); g.globalAlpha = k; g.translate(x, y + (1 - k) * 20); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 10; g.fillStyle = '#111'; g.beginPath(); g.roundRect(0, 0, size, size, 16); g.fill();
  g.shadowColor = 'transparent'; g.save(); g.clip(); g.drawImage(IM[name], 0, 0, size, size); g.restore(); g.strokeStyle = edge; g.lineWidth = 5; g.stroke(); g.restore(); }
// chart pieces
const hbar = (x, y, w, h, col, t, a, d = 1) => rr(x, y, w * grow(t, a, d), h, 12, col);
const colbar = (x, base, w, hpx, col, t, a, d = .9) => { const k = grow(t, a, d), hh = Math.abs(hpx) * k; rr(x, hpx > 0 ? base - hh : base, w, hh, 10, col); return k; };
function donut(cx, cy, r, th, f0, f1, col, k = 1) { if (k <= 0 || f1 <= f0) return; g.strokeStyle = col; g.lineWidth = th; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2 + f0 * 2 * Math.PI, -Math.PI / 2 + lerp(f0, f1, k) * 2 * Math.PI); g.stroke(); }
function icon(kind, x, y, s, col, k = 1) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = col; g.lineWidth = s * .16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
  if (kind === 'check') { g.moveTo(-s * .4, 0); g.lineTo(-s * .1, s * .32); g.lineTo(s * .45, -s * .35); } else if (kind === 'cross') { g.moveTo(-s * .35, -s * .35); g.lineTo(s * .35, s * .35); g.moveTo(s * .35, -s * .35); g.lineTo(-s * .35, s * .35); }
  else if (kind === 'arrow') { g.moveTo(-s * .5, 0); g.lineTo(s * .5, 0); g.moveTo(s * .15, -s * .3); g.lineTo(s * .5, 0); g.lineTo(s * .15, s * .3); } g.stroke(); g.restore(); }
const line = (pts, col, lw, k) => { if (k <= 0) return; g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); const m = k * (pts.length - 1); pts.forEach((p, i) => { if (i === 0) g.moveTo(...p); else if (i <= m) g.lineTo(...p); else if (i - 1 < m) { const q = pts[i - 1], f = m - (i - 1); g.lineTo(lerp(q[0], p[0], f), lerp(q[1], p[1], f)); } }); g.stroke(); g.restore(); };
const card = (x, y, w, h, t, a, col = 'rgba(255,255,255,.06)', edge = 'rgba(255,255,255,.18)') => { const k = outCubic(prog(t, a, a + .35)); if (k <= 0) return 0; g.save(); g.globalAlpha = k; rr(x, y + (1 - k) * 18, w, h, 20, col); if (edge) ring(x, y + (1 - k) * 18, w, h, 20, edge, 2); g.restore(); return k; };
const FN = {}, CHAPTERS = [['d_terms', 'The deal'], ['l_cols', 'The $80 billion loss'], ['s_what', 'What you would be buying'], ['o_intro', 'The rival that blinked'], ['g_intro', 'Paid either way'], ['c_nvidia', 'Who is in charge'], ['h_intro', 'What history says'], ['r_you', 'Your retirement account']];

function drawScene(i, t, ctx) { g = ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); (FN[SC[i].n] || (() => { bg('#222', '#111'); text(SC[i].n, 140, 540, {}); }))(t, SC[i]);
  const ch = CHAPTERS.findIndex(c => c[0] === SC[i].n); if (ch >= 0) { const t0 = SC[i].t0 + .2, k = outCubic(prog(t, t0, t0 + .4)) * (1 - prog(t, t0 + 3.6, t0 + 4)); if (k > 0) { const s = `Part ${ch + 1} of ${CHAPTERS.length}`, o = { font: UI, weight: 700, size: 24, spacing: 2 }, w1 = width(s, o) + 36; g.save(); g.globalAlpha = k; rr(140, 70, w1, 46, 23, YL); text(s, 158, 102, { ...o, color: '#111', blur: 0 });
      text(CHAPTERS[ch][1], 140 + w1 + 18, 103, { font: UI, weight: 600, size: 26, color: TH.ink, blur: TH.blur ? 8 : 0 }); g.restore(); } }
  text('PAPER TRILLIONS', 1780, 80, { font: UI, weight: 600, size: 20, spacing: 5, align: 'right', alpha: .6, color: TH.ink, blur: TH.blur ? 8 : 0 }); }
// scenes dissolve into each other with a slight drift, so nothing snaps
function render(t) { let i = 0; while (i + 1 < SC.length && t >= SC[i + 1].t0) i++; const X = .5, k = i ? inOut(prog(t, SC[i].t0, SC[i].t0 + X)) : 1; g = MAIN; MAIN.setTransform(1, 0, 0, 1, 0, 0); MAIN.globalAlpha = 1; MAIN.clearRect(0, 0, W, H);
  if (k < 1) { drawScene(i - 1, t, LA); drawScene(i, t, LB); MAIN.save(); MAIN.globalAlpha = 1 - k; MAIN.translate(-30 * k, 0); MAIN.drawImage(LA.canvas, 0, 0); MAIN.restore(); MAIN.save(); MAIN.globalAlpha = k; MAIN.translate(30 * (1 - k), 0); MAIN.drawImage(LB.canvas, 0, 0); MAIN.restore(); }
  else { drawScene(i, t, LA); MAIN.drawImage(LA.canvas, 0, 0); }
  g = MAIN; const o = Math.max(1 - prog(t, 0, .3), prog(t, DURATION - .9, DURATION - .1)); if (o > 0) { MAIN.fillStyle = `rgba(0,0,0,${o})`; MAIN.fillRect(0, 0, W, H); } }
window.render = render; window.DURATION = DURATION;
