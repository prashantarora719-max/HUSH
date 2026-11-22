// Cold open sampler for the salad oil pilot. Deterministic: render(t) draws the frame at t seconds.
const cv = document.getElementById('c'), g = cv.getContext('2d'), W = 1920, H = 1080, TL = window.TL, IMG = {};
window.assetsReady = Promise.all([...Object.entries(window.ART).map(([k, u]) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[k] = i; r(); }; i.src = u; })),
  ...['700 60px Fraunces', 'italic 400 40px Fraunces', '40px Plex', '80px Anton'].map(f => document.fonts.load(f))]);
window.CUES = {}; const cue = (k, t0) => { window.CUES[k + '@' + t0.toFixed(2)] = 1; };
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, p) => a + (b - a) * p, oc = p => 1 - Math.pow(1 - cl(p), 3), io = p => { p = cl(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const pr = (t, t0, d = .4) => cl((t - t0) / d);
const norm = s => s.toLowerCase().replace(/[^a-z0-9'’-]/g, '');
let CUR = 0;   // chapter whose words wt() searches
const wt = (word, nth = 0) => { const k = norm(word), W0 = TL.w.filter(w => w[3] === CUR); let m = W0.filter(w => norm(w[2]) === k); if (!m.length) m = W0.filter(w => norm(w[2]).startsWith(k)); if (!m.length) throw new Error('no word ' + word + ' in chapter ' + CUR); return (m[nth] || m[m.length - 1])[0]; };
const C0 = i => TL.ch.find(c => c.i === i).t0, C1 = i => TL.ch.find(c => c.i === i).t1;
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
