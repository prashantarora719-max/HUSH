// Section 3: the Landlord, the reveal, the verdict (script lines 38 to 66).
const GOLD = '#d4a93a', LGRN = '#12b886';
// the elevator: the Landlord arrives
shot(T1(37) + .2, (t, lt) => { hush(T1(37) + .2, T0(38) - .05); sfx(T1(37) + .45, 'coin'); sfx(T1(37) + 1.2, 'keys'); upstairs(t, 1.05, 960);
  const op = oc(pr(lt, .35, .5)); paper(); box(820, 250, 420, 560, '#7f8fb5', 8, 10); paper(false); box(840, 270, 380, 540, '#16204d', 0, 0); if (lt > .5) fig(t, lt < 1.3 ? 'landlord-walk' : 'landlord-cash', 1030, 800 + (lt < 1.3 ? 0 : 0), lerp(420, 540, oc(pr(lt, .6, .8))), { bob: lt < 1.3, noShadow: 1, ph: 1 });
  box(840, 270, 190 * (1 - op), 540, '#9fb0d6', 0, 6); box(1220 - 190 * (1 - op), 270, 190 * (1 - op), 540, '#9fb0d6', 0, 6); box(980, 190, 100, 50, INK, 8, 0); label('▼', 1030, 216, 34, lt > .3 ? YEL : '#555'); });
// 38. Suspect four
shot(T0(38) - .05, t => { upstairs(t, 1.1, 1000); fig(t, 'landlord-keys', 640, 1260, 1150, { noShadow: 1, land: T0(38) - .05, ph: 1 }); chip(t, 'SUSPECT 4', 1400, 300, wt(38, 'Suspect'), RED, '#fff', 100, -.03); big(t, 'THE LANDLORD', 1380, 560, 190, YEL, wt(38, 'Landlord') - .05, { slam: 1, rot: -.03 }); sfx(wt(38, 'Landlord'), 'stamp'); });
// 39. rent vs royalties
shot(T0(39) - .1, t => { dark(t, '#0f3d33'); big(t, "WHAT McDONALD'S COLLECTS FROM OWNERS", 960, 110, 84, '#fff', T0(39) + .1);
  const a = wt(39, 'ten') - .2, b = wt(39, 'royalties') - .2, p = oc(pr(t, a, .7)), q = oc(pr(t, b, .6)); paper(); box(700, 880 - 620 * p, 300, 620 * p + 4, YEL, 10, 9); box(1180, 880 - 357 * q, 300, 357 * q + 4, '#9fb0d6', 10, 9); paper(false); g.lineWidth = 9; g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(560, 884); g.lineTo(1620, 884); g.stroke();
  if (p > .9) { label('$10.4B', 850, 330, 84, INK); } label('RENT', 850, 940, 70, '#fff'); if (q > .9) label('$6.0B', 1330, 590, 80, INK); if (t > b) label('ROYALTIES', 1330, 940, 70, '#fff'); cue('whoosh', a); cue('pop', b);
  fig(t, 'landlord-crossed', 330, 1000, 700, { ph: 1 }); src("2025: rents $10.4 billion, royalties $6.0 billion · Source: McDonald's annual report"); });
// 40. the property
shot(T0(40) - .1, t => { dark(t, '#0f3d33'); const a = wt(40, 'half') - .3, b = wt(40, 'four') - .1, c = wt(40, 'hundred') - .3;
  big(t, 'IT OWNS', 960, 110, 110, '#fff', T0(40) + .1);
  for (let k = 0; k < 10; k++) { const on = k < 6 && t >= a + k * .04; g.save(); g.translate(250 + k * 90, 330); paper(); box(-36, -36, 72, 72, on ? '#7ccf7a' : '#3d6b5f', 8, 7); paper(false); g.restore(); } chip(t, 'MORE THAN HALF THE LAND', 650, 460, a, YEL, INK, 60, -.02);
  for (let k = 0; k < 5; k++) { const on = k < 4 && t >= b + k * .06, x = 1180 + k * 130; g.save(); g.translate(x, 330); paper(); box(-44, -30, 88, 76, on ? YEL : '#3d6b5f', 6, 7); paper(false); g.fillStyle = on ? RED : '#2d5248'; g.beginPath(); g.moveTo(-58, -30); g.lineTo(0, -80); g.lineTo(58, -30); g.closePath(); g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.restore(); } chip(t, '4 IN 5 BUILDINGS', 1440, 460, b, YEL, INK, 60, .02);
  big(t, '$120 BILLION', 960, 740, 240, YEL, c, { slam: 1, rot: -.02 }); if (t > c) label('of property, by one estimate', 960, 900, 50, '#fff', 'Inter'); sfx(c + .05, 'register');
  src("About 56% of land and 80% of buildings in its main markets · Source: summaries of McDonald's annual report. Value: one outlet's estimate"); });
cu('danny', 41, '#3f6bff', '#1a2fb5', { rest: 'shock', wide: 'open2', noBlink: 1, text: 'A LANDLORD', text2: 'THAT SELLS BURGERS', size: 150, size2: 96, tw: wt(41, 'landlord') - .1, tw2: wt(41, 'sells') - .1, slam: 1 });
// 42. the quote
shot(T0(42) - .1, t => { dark(t, '#0f3d33'); const a = wt(42, 'they') - .1, b = wt(42, 'They', 1) - .1; g.save(); g.translate(960, 500); g.rotate(-.015); paper(); box(-760, -300, 1520, 600, CRM, 24, 12); paper(false); label('“', -660, -150, 300, GOLD); g.restore();
  cue('pop', a); if (t >= a) label('NOT REALLY IN THE FOOD BUSINESS.', 960, 400, 80, INK); big(t, 'IN THE REAL ESTATE BUSINESS.', 960, 580, 104, RED, b, { slam: 1 }); sfx(b, 'stamp');
  chip(t, "LINE USUALLY CREDITED TO HARRY SONNEBORN, McDONALD'S FIRST FINANCE CHIEF", 960, 900, T0(42) + .3, GOLD, INK, 38, 0); src('Paraphrased. The exact wording varies between sources.'); });
// 43. forty-six cents
shot(T0(43) - .1, t => { rays(t, '#243fd0', '#0d1a6e'); const a = wt(43, 'five') - .1, b = wt(43, 'forty') - .05; big(t, 'KEPT FROM EVERY $1', 960, 130, 120, '#fff', T0(43) + .1);
  chip(t, 'MOST RESTAURANTS', 500, 300, a - .3, '#fff', INK, 60, -.02); for (let k = 0; k < 2; k++) if (t >= a + k * .1) coinIcon(430 + k * 150, 520, 62, '5¢'); if (t >= a) label('5 to 10¢', 500, 690, 90, '#fff'); cue('coin', a);
  chip(t, 'THE CORPORATION', 1380, 300, b - .4, YEL, INK, 60, .02); for (let k = 0; k < 9; k++) if (t >= b + k * .04) coinIcon(1160 + (k % 5) * 110, 470 + Math.floor(k / 5) * 120, 50, '5¢'); big(t, '46¢', 1380, 820, 280, YEL, b, { slam: 1, rot: -.04 }); sfx(b + .05, 'register');
  src("2025 operating income $12.4 billion on revenue $26.9 billion · Source: McDonald's results"); });
cu('frank', 44, '#ff6a55', '#b3161e', { rest: 'shock', wide: 'shock', shake: 1, noBlink: 1, text: '46¢?!', size: 330, col: YEL, slam: 1, ty: 500 });
// 45. no fryers, no beef
shot(T0(45) - .1, t => { upstairs(t, 1.05, 960); fig(t, 'landlord-contract', 420, 1010, 760, { ph: 1 });
  [['fryers', 'FRYERS'], ['beef', 'BEEF'], ['ice', 'ICE CREAM MACHINE']].forEach(([w, lab], k) => { const t0 = wt(45, w) - .25, y = 260 + k * 150; chip(t, lab, 900, y, t0, '#fff', INK, 70, 0); xmark(t, 900, y, 60, t0 + .3); });
  [['rent', 'RENT'], ['royalty', 'ROYALTY'], ['name', 'THE NAME']].forEach(([w, lab], k) => chip(t, '✓ ' + lab, 980 + k * 330, 800, wt(45, w), LGRN, '#fff', 74, (k - 1) * .03)); });
cu('frank', 46, '#ffb347', '#d9571a', { rest: 'neutral', text: "SO THAT'S WHY", text2: 'MY LUNCH WENT UP.', size: 110, tw2: wt(46, 'lunch') - .1 });
shot(T0(47) - .1, t => { hush(T0(47) - .1, T0(48) - .1); sfx(T0(47) - .05, 'boing'); dark(t, '#141a3a'); big(t, 'CAREFUL, FRANK.', 960, 380, 150, '#fff', T0(47) + .05); big(t, 'NOT EXACTLY.', 960, 640, 250, RED, wt(47, 'Not') - .05, { slam: 1, rot: -.03 }); });
// 48. Gary sets the price
shot(T0(48) - .1, t => { const a = wt(48, 'raised'), p = oc(pr(t, a - .2, 1.2)); cam(1250, 420, 1.35, () => { room(t, { P: priceAt(p), hot: p > 0 && p < 1 }); fig(t, 'gary-pointup', 760, 905, 640, { ph: 2, flip: 1 }); });
  chip(t, 'GARY SETS THE PRICE', 560, 880, wt(48, 'Gary'), PURP, '#fff', 80, -.02); [['beef', 'BEEF ▲'], ['wages', 'WAGES ▲'], ['bills', 'BILLS ▲']].forEach(([w, lab], k) => chip(t, lab, 1180 + k * 290, 960, wt(48, w), YEL, INK, 64, (k - 1) * .03)); });
gcu('shrug', 49, { text: 'I DIDN’T HAVE', extra: t => big(t, 'A CHOICE.', 1380, 610, 190, YEL, wt(49, 'choice') - .1, { slam: 1 }) });
// 50-51. the percentage: every price rise pays the Landlord
shot(T0(50) - .1, t => { const a = wt(50, 'raises'), n = t < a ? 0 : Math.min(3, Math.floor((t - a) / .7) + 1), n2 = t < T0(51) ? n : 3 + Math.min(4, Math.floor((t - T0(51)) / .55) + 1);
  rays(t, '#12b886', '#066b52'); big(t, 'RENT = A % OF SALES', 960, 120, 130, '#fff', wt(50, 'percentage') - .3, { slam: 1 });
  paper(); box(250, 300, 520, 420, NAVY, 22, 10); paper(false); box(290, 340, 440, 340, CRM, 14, 6); burger(510, 450, .6); label('$' + (7.49 + n2 * .5).toFixed(2), 510, 610, 96, RED);
  for (let k = 0; k < 7; k++) { const t0 = k < 3 ? a + k * .7 : T0(51) + (k - 3) * .55; cue('coin', t0 + .35); const q = oc(pr(t, t0, .45)); if (t < t0 || q >= 1) continue; coinIcon(lerp(780, 1380, q), 520 - Math.sin(q * Math.PI) * 220, 46); }
  fig(t, n2 > 3 ? 'landlord-cash' : 'landlord-stand', 1480, 1010, 720, { ph: 1 }); if (n2) big(t, '+' + n2, 1690, 330, 150, YEL, a, {});
  big(t, 'WITHOUT LIFTING A SPATULA', 960, 960, 100, '#fff', wt(51, 'Without') - .05, { slam: 1 }); });
cu('frank', 52, '#5a2bd6', '#1c0b55', { ra: .07, rest: 'angry', text: 'PRICES UP =', text2: 'HE GETS PAID', size: 130, tw2: wt(52, 'prices') });
// 53. sales up
shot(T0(53) - .1, t => { rays(t, '#1fc46f', '#0a7a43'); big(t, 'SALES UP = HE GETS PAID', 960, 150, 120, '#fff', T0(53) + .1, { slam: 1 }); const a = wt(53, 'five') - .2, p = oc(pr(t, a, 1.6));
  const pts = [[330, 860], [600, 820], [870, 740], [1140, 600], [1410, 470], [1620, 410]]; for (const [lw, c] of [[34, INK], [18, YEL]]) { g.lineWidth = lw; g.strokeStyle = c; g.lineJoin = g.lineCap = 'round'; g.beginPath(); const n = p * 5; pts.forEach(([x, y], i) => { if (i <= n) i ? g.lineTo(x, y) : g.moveTo(x, y); else if (i - 1 < n) { const f = n - (i - 1), q = pts[i - 1]; g.lineTo(lerp(q[0], x, f), lerp(q[1], y, f)); } }); g.stroke(); }
  ['2019', '2020', '2021', '2022', '2023', '2024'].forEach((y, i) => label(y, pts[i][0], 930, 40, '#fff', 'Inter')); chip(t, 'MENU PRICES, 5 YEARS', 620, 420, a, YEL, INK, 64, -.03); src("Menu prices up about 40% from 2019 to 2024 (McDonald's). The line between the two years is illustrative"); });
// 54. customers push back
shot(T0(54) - .1, t => { cam(900, 520, 1.3, () => { room(t, { trayX: 1290 }); fig(t, 'frank-crossed', FX, FY, FH, {}); }); big(t, 'UNTIL CUSTOMERS', 960, 870, 100, '#fff', T0(54) + .1); big(t, 'STOPPED EATING', 960, 1000, 130, YEL, wt(54, 'doing') - .1, { slam: 1 }); });
// 55. the numbers
shot(T0(55) - .1, t => { rays(t, '#ff6a55', '#b3161e'); const a = wt(55, 'four') - .1; big(t, "VISITS TO McDONALD'S (US)", 960, 150, 110, '#fff', T0(55) + .2);
  if (t >= a) { const p = oc(pr(t, a, .5)); g.save(); g.translate(520, 420 + p * 180); g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 12; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-70, -200); g.lineTo(70, -200); g.lineTo(70, 40); g.lineTo(150, 40); g.lineTo(0, 220); g.lineTo(-150, 40); g.lineTo(-70, 40); g.closePath(); paper(); g.fill(); paper(false); g.stroke(); g.restore(); }
  big(t, '−4.5%', 1240, 560, 330, YEL, a, { slam: 1, rot: -.03 }); chip(t, 'SPRING 2026 vs. A YEAR EARLIER', 1240, 800, wt(55, 'year'), '#fff', INK, 60, .02); src('US visits, second quarter of 2026 · Source: Placer.ai'); });
shot(wt(55, 'The', 0) > wt(55, 'count') ? wt(55, 'company') - .4 : wt(55, 'company') - .4, t => { dark(t, '#3a1020'); const a = wt(55, 'cut') - .2, b = wt(55, 'third') - .3; big(t, 'LOWER-INCOME CUSTOMERS', 960, 140, 110, '#fff', wt(55, 'lower') - .2);
  for (let k = 0; k < 10; k++) { const gone = k % 3 === 1 && t >= a + k * .05; g.save(); g.globalAlpha = gone ? .18 : 1; silhouette(k % 2 ? 'danny-stand' : 'frank-stand', 240 + k * 160, 640, 330); g.restore(); } big(t, 'CUT BACK', 960, 300, 150, RED, a, { slam: 1 });
  big(t, '1 IN 3 VISITORS', 520, 820, 120, YEL, b, { slam: 1 }); if (t > b + .3) { label('come from areas where households', 1400, 780, 44, '#fff', 'Inter'); label('typically earn under $50,000', 1400, 850, 44, '#fff', 'Inter'); } src('36% of visitors come from lower-income areas · Source: Placer.ai estimate. Industry traffic comment: McDonald\'s CEO, 2025'); });
// 56. the $8 meal
shot(T0(56) - .1, t => { rays(t, '#ffd84a', '#ff9d1c'); g.save(); g.translate(760, 760); g.scale(2.6, 2.6); tray(0, 0, 1, {}); g.restore(); big(t, '$8 MEAL DEAL', 1320, 300, 190, RED, wt(56, 'eight') - .1, { slam: 1, rot: .04 }); sfx(wt(56, 'eight'), 'register'); chip(t, '+ A PROMISE TO HOLD PRICES', 1320, 520, wt(56, 'pledged') - .1, '#fff', INK, 60, -.02); });
gcu('facepalm', 57, { text: "AND I'M THE ONE", extra: t => big(t, 'SELLING IT.', 1380, 610, 180, YEL, wt(57, 'selling') - .1, { slam: 1 }) });
// 58. a percentage of a cheaper burger
shot(T0(58) - .1, t => { rays(t, '#12b886', '#066b52'); const p = oc(pr(t, wt(58, 'cheaper') - .2, .5)), s = lerp(1.5, 1.0, p); paper(); burger(700, 560, s); paper(false); g.save(); g.beginPath(); g.rect(700 - 270 * s, 560 - 240 * s, 540 * s * .2, 480 * s); g.clip(); g.fillStyle = 'rgba(255,201,40,.75)'; g.fillRect(0, 0, W, H); g.restore(); g.lineWidth = 9; g.strokeStyle = INK; g.setLineDash([22, 14]); g.beginPath(); g.moveTo(700 - 270 * s + 540 * s * .2, 560 - 250 * s); g.lineTo(700 - 270 * s + 540 * s * .2, 560 + 250 * s); g.stroke(); g.setLineDash([]);
  fig(t, 'landlord-cash', 1500, 1010, 700, { ph: 1 }); big(t, 'A % OF LESS', 960, 130, 130, '#fff', T0(58) + .1); big(t, 'IS STILL A %', 960, 950, 150, YEL, wt(58, 'still') - .1, { slam: 1 }); });
// 59-60. the verdict
shot(T0(59) - .3, t => { rays(t, '#ffb347', '#d9571a', .12); bust(t, 'frank', 480, 1180, 1050, t < T0(60) ? 59 : 60, { rest: 'angry' }); chip(t, "FRANK'S VERDICT", 480, 110, T0(59) - .2, RED, '#fff', 80, -.03);
  napkin(t, 1330, 560, [['Food ............ $3.50', BLUE, wt(59, 'Food')], ['Workers ........ $3.10', BLUE, wt(59, 'Workers')], ['Bills + ads .... $1.90', BLUE, wt(59, 'Bills')], ['Gary ............. $0.50', BLUE, wt(59, 'Gary')], ['THE DIRT ...... $2.00', RED, wt(60, 'two')], ['= $11.00', INK, wt(60, 'dirt')]], 1.05); });
shot(wt(60, 'fella') - .1, t => { upstairs(t, 1.1, 1000); bust(t, 'landlord', 700, 1200, 1100, null, { rest: 'grin', noBlink: 1 }); big(t, '$2.00', 1420, 620, 260, YEL, wt(60, 'fella'), { slam: 1 }); big(t, 'FOR OWNING THE DIRT', 1420, 850, 84, '#fff', wt(60, 'owns') - .1); sfx(wt(60, 'dirt'), 'register'); });
// 61. the wrap
shot(T0(61) - .1, t => { dark(t); const a = wt(61, 'filings') - .5; g.save(); g.translate(700, 560); g.rotate(-.04); paper(); box(-300, -380, 600, 760, '#fffdf5', 12, 10); paper(false); box(-300, -380, 600, 150, NAVY, [12, 12, 0, 0], 10); label('ANNUAL REPORT', 0, -305, 70, '#fff'); for (let k = 0; k < 7; k++) box(-240, -170 + k * 70, 480 - (k % 3) * 90, 26, '#c9d2e6', 8, 0); g.restore();
  big(t, 'NOBODY BROKE A RULE', 1330, 330, 96, '#fff', T0(61) + .1); if (t >= a) { const e = lerp(2.4, 1, oc(pr(t, a, .14))); g.save(); g.translate(1330, 600); g.rotate(-.12); g.scale(e, e); g.lineWidth = 14; g.strokeStyle = LGRN; g.strokeRect(-330, -100, 660, 200); label('ALL ON THE RECORD', 0, 8, 96, LGRN); g.restore(); } sfx(a, 'stamp'); });
shot(wt(61, 'But') - .1, t => { rays(t, '#ff5a4a', '#a3121c'); big(t, 'WHY FAST FOOD', 960, 300, 180, '#fff', wt(61, 'But') + .1); big(t, 'STOPPED BEING CHEAP', 960, 520, 180, YEL, wt(61, 'stopped') - .1, { slam: 1 }); big(t, '...AND WON’T BE AGAIN', 960, 780, 110, '#fff', wt(61, 'unlikely') - .1); });
shot(wt(61, 'The', 1) - .1, t => { rays(t, '#ffd84a', '#ff9d1c'); big(t, 'ONE BURGER FEEDS', 960, 130, 130, '#fff', wt(61, 'price') - .2); paper(); burger(960, 330, .5); paper(false);
  [['cook', 'THE COOK', 'gary-stand', 1], ['owner', 'THE OWNER', 'gary-shrug', 0], ['landlord', 'THE LANDLORD', 'landlord-cash', 0]].forEach(([w, lab, im, sil], k) => { const t0 = wt(61, w) - .25, x = 420 + k * 540; cue('pop', t0); if (t < t0) return; const e = ob(pr(t, t0, .25)); g.save(); g.translate(x, 1010); g.scale(e, e); g.translate(-x, -1010); if (sil) { silhouette(im, x, 1010, 520); box(x - 70, 478, 140, 40, '#fff', 10, 7); } else fig(t, im, x, 1010, k === 2 ? 580 : 540, { ph: k }); g.restore(); chip(t, lab, x, 1040, t0 + .1, k === 2 ? RED : '#fff', k === 2 ? '#fff' : INK, 60, 0); }); });
cu('danny', 62, '#3f6bff', '#1a2fb5', { rest: 'neutral', text: 'SO WHAT', text2: 'DO WE DO?', size: 160 });
cu('frank', 63, '#ffb347', '#d9571a', { rest: 'angry', text: 'NEXT TIME:', text2: 'SANDWICHES.', size: 130, size2: 190, tw2: wt(63, 'sandwiches') - .1 });
// 64. it's pretty good, though
shot(T0(64) - .5, t => { hush(T0(64) - .5, T1(64) + .3); cam(900, 480, 1.5, () => { room(t, { trayX: 1290, noFood: 1 }); fig(t, 'frank-stand', FX, FY, FH, { talk: speaking(64, t) }); g.save(); g.translate(FX + 34, FY - 512); paper(); burger(0, 0, .15, .2); paper(false); g.restore(); }); big(t, "...IT'S PRETTY GOOD, THOUGH.", 960, 940, 104, '#fff', wt(64, 'pretty') - .2); });
// 65. the Landlord speaks
shot(T0(65) - .9, (t, lt) => { hush(T0(65) - .9, T1(65) + .2); cam(1000, 520, 1.25, () => { room(t, { trayX: 1290, noFood: 1 }); fig(t, 'frank-crossed', 620, FY, FH, { flip: 1 }); }); if (lt > .2) bust(t, 'landlord', 1420, 1200, 1000, 65, { rest: 'smug', t0: T0(65) - .7 }); sfx(T1(65) + .25, 'keys');
  big(t, 'SEE YOU NEXT WEEK, FRANK.', 960, 130, 110, YEL, wt(65, 'See')); });
// 66. next case
shot(T0(66) - .5, t => { dark(t); big(t, 'NEXT CASE', 960, 200, 150, '#fff', T0(66) - .3); const e = ob(pr(t, T0(66), .3)); g.save(); g.translate(760, 640); g.scale(e * 2.2, e * 2.2); paper(); cup(0, 60, 1); paper(false); g.restore(); big(t, '$7', 1280, 560, 380, YEL, wt(66, 'seven') - .05, { slam: 1, rot: .05 }); big(t, 'COFFEE', 1280, 840, 170, '#fff', wt(66, 'coffee') - .05); sfx(wt(66, 'seven'), 'register'); });
