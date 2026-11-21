// Section 1: cold open and Suspect 1 (script lines 0 to 14).
const priceAt = p => [lerp(4.39, 7.49, p), lerp(1.39, 4.19, p), lerp(1.00, 3.29, p)].map(v => '$' + v.toFixed(2));
const FX = 820, FY = 905, FH = 650;   // Frank's usual spot
const interrogation = (t, fn) => { g.fillStyle = '#141a3a'; g.fillRect(-200, -200, W + 400, H + 400);
  const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, 'rgba(255,236,160,.55)'); gr.addColorStop(1, 'rgba(255,236,160,.05)'); g.fillStyle = gr; g.beginPath(); g.moveTo(1010, 40); g.lineTo(1110, 40); g.lineTo(1560, 900); g.lineTo(560, 900); g.fill();
  box(1000, 0, 120, 50, '#3b4a66', 10); paper(); box(360, 800, 1400, 50, '#8a5a3a', 8); paper(false); box(430, 850, 40, 260, '#6b4226', 0); box(1650, 850, 40, 260, '#6b4226', 0); if (fn) fn(); };

// A. Frank walks in, the menu prices climb, the till rings up $11.00
shot(0, t => {
  const wp = pr(t, .1, 1.45), x = lerp(-180, FX, wp), tOrd = wt(0, 'ordered'), ring = tOrd + .7;
  cam(lerp(880, 1060, oc(t / 5)), 560, lerp(1, 1.12, oc(t / 5)), () => {
    room(t, { P: priceAt(oc(pr(t, .2, 1.9))), hot: t > .2 && t < 2.1, till: t < tOrd + .3 ? 0 : lerp(0, 11, oc(pr(t, tOrd + .3, .4))), trayX: t < tOrd - .1 ? null : lerp(2300, 1290, ob(pr(t, tOrd - .1, .4))) });
    if (wp < 1) fig(t, 'frank-walk', x, FY, 640, { bob: 1 }); else fig(t, t > ring ? 'frank-receipt' : 'frank-stand', x, FY, FH, { land: t > ring ? ring : 1.55, ax: t > ring ? .72 : .5 });
  });
  big(t, 'THIS IS FRANK.', 560, 150, 150, '#fff', T0(0), { rot: -.03, out: tOrd });
  bubble(t, ['ELEVEN DOLLARS.'], 1560, 210, ring, 2000, 420, { size: 84, fill: '#e6ecff' });
});
// B. "Eleven dollars?"
shot(T0(1) - .1, t => {
  rays(t, '#ff6a55', '#b3161e'); bust(t, 'frank', 720, 1180, 1100, 1, { rest: 'shock', wide: 'shock', shake: 9 * Math.exp(-(t - T0(1)) * 3), noBlink: 1 });
  big(t, '$11?!', 1440, 420, 330, YEL, wt(1, 'Eleven') + .05, { slam: 1, rot: .06 });
});
// C. "For a burger, fries and a drink?"
shot(wt(1, 'For') - .08, t => {
  rays(t, '#ffd84a', '#ff9d1c'); g.save(); g.translate(960, 760); g.scale(3.2, 3.2); tray(0, 0, 1, { noFood: 1 }); g.restore();
  [['burger', burger, 960, 690, .62, 'BURGER'], ['fries', fries, 520, 640, 1.5, 'FRIES'], ['drink', cup, 1400, 640, 1.45, 'DRINK']].forEach(([w, fn, x, y, s, lab], k) => { const t0 = wt(1, w); if (t < t0) return; const e = ob(pr(t, t0, .2));
    g.save(); g.translate(x, y); g.scale(e, e); g.translate(-x, -y); paper(); fn(x, y, s); paper(false); g.restore(); chip(t, lab, x, 330 + (k === 0 ? -60 : 0), t0 + .08, '#fff', INK, 70, (k - 1) * .04); });
});
// D. Danny: "That's what they cost, Grandpa."
shot(T0(2) - .1, t => {
  cam(760, 560, 1.3, () => { room(t, { trayX: 1290 }); fig(t, 'danny-phone', 420, 915, 640, { land: T0(2) - .1, ph: 1.3 }); fig(t, 'frank-crossed', FX, FY, FH, { flip: 1 }); });
  if (LN[2].silent) bubble(t, ["THAT'S WHAT THEY", 'COST, GRANDPA.'], 520, 150, T0(2) + .1, 330, 330, { size: 78, fill: '#bfe4ff' });
});
// E. "In my day this was a dollar."  /  "It wasn't."
shot(T0(3) - .1, t => {
  rays(t, '#ffb347', '#d9571a', .14); bust(t, 'frank', 560, 1180, 1050, 3, { rest: t > T1(3) ? 'smug' : 'neutral' });
  const t0 = T0(3) + .1, e = ob(pr(t, t0, .3)); g.save(); g.translate(1340, 400); g.scale(e, e);
  [[-535, -95, 20], [-480, -60, 30]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); });
  paper(); g.beginPath(); [[-250, 0, 190], [-60, -110, 200], [180, -60, 210], [260, 110, 180], [40, 160, 200], [-180, 140, 180]].forEach(([x, y, r]) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); }); g.fillStyle = '#fff'; g.fill(); paper(false); g.lineWidth = 18; g.strokeStyle = INK; g.stroke(); g.fill();
  burger(-120, 40, .75, -.06); const td = wt(3, 'dollar'); if (t >= td) { const q = ob(pr(t, td, .25)); g.save(); g.translate(220, 20); g.rotate(.12); g.scale(q, q); box(-150, -95, 300, 190, YEL, 20, 10); label('$1', 0, 6, 150, INK); g.restore(); }
  g.restore();
  big(t, 'NOPE.', 1340, 420, 300, RED, wt(4, 'wasn') + .1, { slam: 1, rot: -.12 });
});
// F. menu board: +40% between 2019 and 2024
shot(wt(4, 'McDonald') - .1, t => {
  const a = wt(4, 'rose'), b = wt(4, 'forty'), p = oc(pr(t, a - .6, b - a + .6));
  cam(1435, 250, 1.75 + (t - a) * .01, () => room(t, { P: priceAt(p), hot: p > 0 && p < 1 }));
  g.fillStyle = '#16204d'; g.fillRect(-100, 640, W + 200, 600); g.fillStyle = YEL; g.fillRect(-100, 640, W + 200, 14);
  big(t, "McDONALD'S MENU PRICES", 660, 770, 104, '#fff', wt(4, 'McDonald'));
  big(t, t < wt(4, 'twenty', 1) ? '2019' : '2024', 330, 930, 130, YEL, wt(4, 'nineteen') - .25, { rot: -.04 });
  big(t, '+40%', 1520, 860, 260, YEL, b, { slam: 1, rot: -.05 });
  label("Average menu price, 2019 to 2024 · Source: McDonald's", 660, 1040, 28, 'rgba(255,255,255,.92)', 'Inter');
});
// G. "So where's it all going?"
shot(T0(5) - .1, t => { cam(840, 470, 1.55, () => { room(t, { trayX: 1290 }); fig(t, 'frank-shrug', FX, FY, FH, { talk: speaking(5, t), land: T0(5) - .1 }); }); big(t, "WHERE'S IT GOING?", 960, 930, 130, '#fff', wt(5, 'where')); });
// H. Danny: "Beef. Wages. Everything's expensive."
shot(T0(6) - .1, t => {
  rays(t, '#3f6bff', '#1a2fb5'); bust(t, 'danny', 560, 1180, 1080, null, { rest: 'bored', noBlink: 1 });
  ['BEEF.', 'WAGES.', 'EVERYTHING.'].forEach((s, k) => chip(t, s, 1300 + (k === 2 ? 40 : 0), 300 + k * 190, T0(6) + .12 + k * .36, [RED, YEL, '#fff'][k], k === 0 ? '#fff' : INK, 110, (k - 1) * .04));
});
// I. the man in the suit collects an envelope
shot(T1(6) + .25, (t, lt) => {
  const a = oc(pr(lt, 0, .8)), b = oc(pr(lt, 1.5, .9)), x = lerp(2250, 1420, a) + (lerp(1420, 2250, b) - 1420), give = lt > .85 && lt < 1.5;
  cam(lerp(1000, 1150, oc(lt / 3)), 540, 1.18, () => { room(t, { trayX: 1290, behind: () => { fig(t, lt > .8 && lt < 1.5 ? 'landlord-stand' : 'landlord-walk', x, 965, 720, { flip: lt < .8, bob: lt < .8 || lt > 1.5, noShadow: 1 });
    if (lt > .75) { const ex = lt < 1.5 ? lerp(1900, 1500, oc(pr(lt, .75, .3))) : x + 60; g.save(); g.translate(ex, 500 + Math.sin(t * 9) * 4); g.rotate(-.15); paper(); box(-60, -36, 120, 72, '#f4e3b0', 6, 6); paper(false); g.beginPath(); g.moveTo(-60, -36); g.lineTo(0, 8); g.lineTo(60, -36); g.lineWidth = 6; g.stroke(); label('$', 0, 16, 34, GRN); g.restore(); } } });
    fig(t, 'danny-phone', 380, 915, 640, { ph: 1.3 }); fig(t, 'frank-crossed', FX, FY, FH, { flip: 0 }); });
  if (give) big(t, '?', 400, 170, 220, YEL, T1(6) + 1.15, { slam: 1 });
});
// J. "...Who's that guy?"
shot(T0(7) - .35, t => { rays(t, '#5a2bd6', '#1c0b55', .07); fig(t, 'frank-point', 700, 1500, 1250, { flip: 1, ax: .62, talk: speaking(7, t), noShadow: 1 }); big(t, "WHO'S THAT GUY?", 1330, 330, 150, '#fff', wt(7, 'Who')); });
// K. "Somebody is taking your eleven dollars."
shot(wt(8, 'Somebody') - .08, t => {
  rays(t, '#ffd84a', '#ff9d1c'); g.save(); g.translate(960, 820); g.scale(2.4, 2.4); tray(0, 0, 1, {}); g.restore();
  const t0 = wt(8, 'taking'); for (let k = 0; k < 11; k++) { const q = oc(pr(t, t0 + k * .07, .9)); if (t < t0 + k * .07) continue; bill(lerp(960 + (k - 5) * 30, 2300, q * q), lerp(600, 100 + k * 30, q) - Math.sin(q * 3.1) * 220, 1.1, k * .5 + q * 4); }
  big(t, 'YOUR $11', 960, 220, 220, '#fff', wt(8, 'eleven') - .1, { slam: 1 });
});
// L. four suspects
shot(wt(8, 'We') - .08, t => {
  g.fillStyle = '#16204d'; g.fillRect(-200, -200, W + 400, H + 400); g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { g.beginPath(); g.moveTo(i * 80, 0); g.lineTo(i * 80, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 80); g.lineTo(W, i * 80); g.stroke(); }
  big(t, 'FOUR SUSPECTS', 960, 120, 130, YEL, wt(8, 'four'));
  const hl = wt(8, 'never'); [['THE FOOD', null], ['THE WORKERS', 'gary-stand'], ['THE OWNER', 'gary-shrug'], ['???', 'landlord-keys']].forEach(([lab, im], k) => {
    const t0 = wt(8, 'four') + .15 + k * .22; if (t < t0) return; const e = ob(pr(t, t0, .25)), x = 300 + k * 440, hot = k === 3 && t > hl;
    g.save(); g.translate(x + (hot ? Math.sin(t * 50) * 5 * Math.exp(-(t - hl) * 4) : 0), 600); g.rotate((k - 1.5) * .03); g.scale(e * (hot ? 1.1 : 1), e * (hot ? 1.1 : 1)); paper(); box(-185, -320, 370, 640, hot ? YEL : CRM, 18, 10); paper(false);
    box(-150, -285, 300, 420, '#c9d2e6', 8, 6); g.save(); g.beginPath(); g.rect(-150, -285, 300, 420); g.clip(); if (im) silhouette(im, 0, 300, 560); else { g.save(); g.translate(0, -60); g.scale(.75, .75); burger(0, 0, 1); g.restore(); } g.restore();
    label(lab, 0, 210, 62, INK); label('SUSPECT ' + (k + 1), 0, 275, 34, RED); g.restore(); });
  big(t, 'NEVER COOKED A BURGER', 960, 1010, 84, '#fff', hl + .1);
});
// M. title card
shot(T1(8) + .25, (t, lt) => { rays(t, '#ff5a4a', '#a3121c'); fig(t, 'frank-receipt', 500, 1260, 1150, { ax: .7, noShadow: 1 });
  big(t, 'WHY FAST FOOD', 1240, 330, 200, '#fff', T1(8) + .3, { slam: 1 }); big(t, 'STOPPED BEING', 1240, 560, 200, '#fff', T1(8) + .55, { slam: 1 }); big(t, 'CHEAP', 1240, 820, 300, YEL, T1(8) + .85, { slam: 1, rot: -.04 }); });
// N. "Talk."
shot(T0(9) - .45, t => { interrogation(t, () => { paper(); burger(1060, 730, .62); paper(false); }); fig(t, 'frank-crossed', 520, 1250, 1000, { flip: 1, noShadow: 1, talk: speaking(9, t) }); big(t, 'TALK.', 1480, 330, 260, '#fff', wt(9, 'Talk'), { slam: 1 }); });
// O. Suspect one: the food
shot(T0(10) - .1, t => {
  interrogation(t, () => { paper(); burger(1060, 700, .8, Math.sin(t * 2) * .02); paper(false); });
  chip(t, 'SUSPECT 1: THE FOOD', 560, 130, wt(10, 'Suspect'), RED, '#fff', 84, -.03);
  [['Beef', 'BEEF', 560, 420], ['bun', 'BUN', 1560, 360], ['cheese', 'CHEESE', 1620, 620], ['cup', 'CUP', 500, 660], ['wrapper', 'WRAPPER', 1060, 300]].forEach(([w, lab, x, y]) => chip(t, lab + ' ▲', x, y, wt(10, w), YEL, INK, 70, 0));
  if (LN[11].silent) { } });
// P. Danny: "Told you."
shot(T0(11) - .1, t => { rays(t, '#3f6bff', '#1a2fb5'); bust(t, 'danny', 700, 1180, 1080, null, { rest: 'smug', t0: T0(11) - .1, noBlink: 1 }); if (LN[11].silent) bubble(t, ['TOLD YOU.'], 1350, 380, T0(11) + .1, 1000, 520, { size: 150 }); });
// Q. thirty cents of every dollar
shot(T0(12) - .1, t => {
  rays(t, '#1fc46f', '#0a7a43'); const a = wt(12, 'thirty'), p = oc(pr(t, a - .5, .7));
  big(t, 'EVERY $1 YOU SPEND', 960, 170, 120, '#fff', T0(12) + .2);
  paper(); box(260, 380, 1400, 220, '#8fd694', 24, 10); paper(false); g.save(); g.beginPath(); g.roundRect(260, 380, 1400, 220, 24); g.clip(); g.fillStyle = RED; g.fillRect(260, 380, 1400 * .3 * p, 220); g.restore(); g.lineWidth = 10; g.strokeStyle = INK; g.beginPath(); g.roundRect(260, 380, 1400, 220, 24); g.stroke();
  if (p > .2) label('30¢', 260 + 210, 495, 120, '#fff'); chip(t, 'FOOD + PACKAGING', 470, 700, a + .1, YEL, INK, 60, -.02);
  label('Illustration: a typical franchised restaurant, from analyst models', 960, 1040, 28, 'rgba(255,255,255,.9)', 'Inter');
  const b = wt(12, 'Frank'); if (t >= b - .05) { const e = ob(pr(t, b - .05, .3)); g.save(); g.translate(1240, 900 + (1 - e) * 400); g.scale(1.5, 1.5); tray(0, 0, 1, {}); g.restore(); big(t, '$3.50', 1640, 800, 170, YEL, wt(12, 'three'), { slam: 1, rot: .05 }); }
});
// R. the napkin
shot(T0(13) - .1, t => {
  rays(t, '#ffb347', '#d9571a', .12); bust(t, 'frank', 520, 1180, 1050, 13, { rest: 'angry' });
  g.save(); g.translate(1340, 560); g.rotate(.05); paper(); box(-330, -300, 660, 600, '#fffdf5', 10, 8); paper(false); g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-330, -240 + i * 66); g.lineTo(330, -240 + i * 66); g.stroke(); }
  const ink = '#2343c9'; if (t >= wt(13, 'Three')) label('Food ....... $3.50', 0, -150, 76, ink, 'Bangers'); if (t >= wt(13, 'paid')) { label('I PAID ..... $11.00', 0, 0, 76, RED, 'Bangers'); label('???', 0, 150, 110, ink, 'Bangers'); } g.restore();
});
// S. guilty, but only of $3.50
shot(T0(14) - .1, t => {
  interrogation(t, () => { paper(); burger(1060, 700, .8); paper(false); }); chip(t, 'SUSPECT 1: THE FOOD', 560, 130, 0, RED, '#fff', 84, -.03);
  const tg = wt(14, 'guilty'); if (t >= tg) { const e = lerp(2.6, 1, oc(pr(t, tg, .14))); g.save(); g.translate(1060, 560); g.rotate(-.16); g.scale(e, e); g.lineWidth = 16; g.strokeStyle = RED; g.strokeRect(-330, -110, 660, 220); label('GUILTY', 0, 8, 190, RED); g.restore(); }
  const tb = wt(14, 'only'); if (t >= tb) { const p = oc(pr(t, tb, .5)); paper(); box(310, 900, 1300, 90, '#c9d2e6', 16, 8); paper(false); g.fillStyle = RED; g.beginPath(); g.roundRect(310, 900, 1300 * 3.5 / 11 * p, 90, 16); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.roundRect(310, 900, 1300, 90, 16); g.stroke(); label('$3.50', 310 + 205, 948, 60, '#fff'); label('$7.50 still missing', 1170, 948, 56, INK); }
});
