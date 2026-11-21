// Section 2: the workers, and Gary the owner (script lines 15 to 37).
const WCOL = '#2748e8', PURP = '#6a3fd6';
// 15. Suspect two: the people making it. California's $20.
shot(T0(15) - .1, t => {
  interrogation(t, () => { paper(); box(940, 560, 260, 240, '#9aa6c0', 10); box(965, 590, 210, 90, '#3b4a66', 8); paper(false); fries(1070, 560, .7); silhouette('gary-stand', 1370, 800, 520); box(1296, 268, 150, 44, '#fff', 10, 7); });
  chip(t, 'SUSPECT 2: THE WORKERS', 600, 130, wt(15, 'Suspect'), WCOL, '#fff', 84, -.03);
  big(t, 'WAGES ▲', 520, 520, 190, YEL, wt(15, 'Wages'), { slam: 1, rot: -.04, out: wt(15, 'California') - .1 });
});
shot(wt(15, 'California') - .1, t => {
  rays(t, '#3f6bff', '#1a2fb5'); g.save(); g.translate(960, 520); g.rotate(-.03); paper(); box(-560, -250, 1120, 500, '#fffdf5', 20, 10); paper(false); box(-560, -250, 1120, 110, WCOL, [20, 20, 0, 0], 10); label('PAYCHECK · FAST-FOOD WORKER', 0, -192, 60, '#fff'); label('minimum wage', 0, 195, 46, INK, 'Inter'); g.restore();
  big(t, '$20 / HOUR', 960, 620, 230, RED, wt(15, 'twenty'), { slam: 1, rot: -.03 }); sfx(wt(15, 'twenty') + .05, 'register');
  chip(t, 'CALIFORNIA · 2024', 960, 890, wt(15, 'California') + .1, YEL, INK, 80, .02);
});
cu('frank', 16, '#ff6a55', '#b3161e', { rest: 'shock', wide: 'shock', shake: 1, noBlink: 1, text: 'TWENTY BUCKS', text2: 'TO SALT FRIES?!', size: 130, tw2: wt(16, 'salt') });
cu('danny', 17, '#3f6bff', '#1a2fb5', { rest: 'bored', noBlink: 1, text: '$40', text2: 'LIGHTBULB GUY', size: 190, size2: 110, tw: wt(17, 'forty'), tw2: wt(17, 'lightbulb'), slam: 1 });
cu('frank', 18, '#ffb347', '#d9571a', { rest: 'angry', text: 'IT WAS A', text2: 'TALL LIGHTBULB.', size: 120, tw2: wt(18, 'tall') });
// 19. labour: a little under thirty cents
shot(T0(19) - .1, t => {
  rays(t, '#1fc46f', '#0a7a43'); const a = wt(19, 'thirty'), p = oc(pr(t, a - .4, .6)); big(t, 'EVERY $1 YOU SPEND', 960, 170, 120, '#fff', T0(19) + .1);
  paper(); box(260, 380, 1400, 220, '#8fd694', 24, 0); paper(false); g.save(); g.beginPath(); g.roundRect(260, 380, 1400, 220, 24); g.clip(); g.fillStyle = RED; g.fillRect(260, 380, 420, 220); g.fillStyle = WCOL; g.fillRect(680, 380, 1400 * .28 * p, 220); g.restore(); g.lineWidth = 10; g.strokeStyle = INK; g.beginPath(); g.roundRect(260, 380, 1400, 220, 24); g.stroke();
  label('30¢', 470, 495, 110, '#fff'); if (p > .5) label('28¢', 876, 495, 110, '#fff'); chip(t, 'FOOD', 470, 690, 0, YEL, INK, 56, -.02); chip(t, 'LABOUR', 876, 690, a, YEL, INK, 56, .02);
  big(t, '$3.10', 1480, 850, 190, YEL, wt(19, 'three'), { slam: 1, rot: .04 }); sfx(wt(19, 'three') + .05, 'register'); src('Illustration: a typical franchised restaurant, from analyst models');
});
// 20. the napkin: six sixty
shot(T0(20) - .1, t => { rays(t, '#ffb347', '#d9571a', .12); bust(t, 'frank', 520, 1180, 1050, 20, { rest: 'angry' });
  napkin(t, 1340, 560, [['Food ......... $3.50', BLUE, 0], ['Workers ..... $3.10', BLUE, T0(20)], ['= $6.60', BLUE, wt(20, 'six')], ['I PAID $11.00', RED, wt(20, 'Where')], ['$4.40 = ???', RED, wt(20, 'four')]]); });
// 21. the right question
shot(T0(21) - .1, t => { dark(t); big(t, 'THE RIGHT QUESTION', 960, 240, 150, YEL, T0(21) + .1, { slam: 1 });
  bar11(t, 260, 480, 1400, 220, [[3.5, RED, 'FOOD', 0], [3.1, WCOL, 'WORKERS', 0]]); label('$4.40  ???', 1380, 590, 90, Math.sin(t * 14) > 0 ? RED : INK); });
// 22. "You. Mister McDonald."
shot(T0(22) - .3, t => { office(t, 1.05, 960); fig(t, 'gary-desk', 1330, 910, 620, { ph: 2 }); const e = ob(pr(t, T0(22) - .3, .25)); fig(t, 'frank-point', lerp(-300, 520, e), 940, 760, { flip: 1, ax: .62, talk: speaking(22, t) }); sfx(T0(22) - .3, 'stamp');
  big(t, 'YOU.', 760, 200, 240, '#fff', wt(22, 'You'), { slam: 1, out: wt(22, 'Mister') }); big(t, 'MISTER McDONALD.', 900, 200, 130, '#fff', wt(22, 'Mister')); });
gcu('desk', 23, { x: 760, text: "I'M GARY.", extra: t => chip(t, 'GARY · OWNER · TIRED', 1380, 640, T0(23) + .4, YEL, INK, 64, .03) });
// 24. Suspect three: the owner
shot(T0(24) - .1, t => { office(t, 1.1, 900); fig(t, 'gary-stand', 600, 1000, 780, { ph: 2 }); chip(t, 'SUSPECT 3: THE OWNER', 1300, 150, wt(24, 'Suspect'), PURP, '#fff', 84, .03);
  const ty = wt(24, 'yacht') - .5; if (t >= ty) { const e = ob(pr(t, ty, .3)); g.save(); g.translate(1320, 560); g.scale(e, e); paper(); g.beginPath(); [[-200, 0, 170], [0, -90, 190], [210, -20, 180], [120, 130, 170], [-90, 130, 170]].forEach(([x, y, r]) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); }); g.fillStyle = '#fff'; g.fill(); paper(false); g.lineWidth = 16; g.strokeStyle = INK; g.stroke(); g.fill();
    g.fillStyle = '#8fd3ff'; g.fillRect(-230, 70, 460, 60); g.lineWidth = 9; g.strokeStyle = INK; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-190, 20); g.lineTo(200, 20); g.lineTo(140, 90); g.lineTo(-140, 90); g.closePath(); g.fill(); g.stroke(); g.fillStyle = RED; g.beginPath(); g.moveTo(0, -150); g.lineTo(0, 10); g.lineTo(130, 10); g.closePath(); g.fill(); g.stroke(); g.restore(); xmark(t, 1320, 560, 170, wt(24, 'yacht') + .45); } });
shot(wt(24, 'about') - .1, t => { dark(t); const a = wt(24, 'ninety'); big(t, "McDONALD'S RESTAURANTS", 960, 130, 110, '#fff', wt(24, 'about'));
  for (let k = 0; k < 20; k++) { const x = 330 + (k % 10) * 140, y = 360 + Math.floor(k / 10) * 200, on = k < 19 && t >= a + k * .03; g.save(); g.translate(x, y); paper(); box(-50, -30, 100, 90, on ? YEL : '#c9d2e6', 6, 7); paper(false); g.fillStyle = on ? RED : '#7f8fb5'; g.beginPath(); g.moveTo(-64, -30); g.lineTo(0, -84); g.lineTo(64, -30); g.closePath(); g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); box(-14, 14, 28, 46, INK, 3, 0); g.restore(); }
  big(t, '95%', 520, 860, 250, YEL, a, { slam: 1, rot: -.04 }); big(t, 'RUN BY PEOPLE LIKE GARY', 1240, 860, 96, '#fff', wt(24, 'Gary')); src("About 95% of McDonald's restaurants are franchised · Source: McDonald's 2025 annual report"); });
cu('frank', 25, '#ff6a55', '#b3161e', { rest: 'angry', text: "SO YOU'RE", text2: 'GETTING RICH.', size: 130, tw2: wt(25, 'rich') });
gcu('facepalm', 26, { text: 'SIT DOWN.', slam: 1, tw: wt(26, 'Sit') });
// 27. what Gary pays for
shot(T0(27) - .1, t => { office(t, 1.1, 900); fig(t, 'gary-bills', 560, 1000, 800, { ph: 2 });
  [['staff', 'STAFF', 1120, 250], ['beef', 'BEEF', 1500, 330], ['electric', 'ELECTRIC BILL', 1250, 470], ['insurance', 'INSURANCE', 1520, 610], ['repairs', 'REPAIRS', 1180, 720]].forEach(([w, lab, x, y], k) => chip(t, lab, x, y, wt(27, w), [WCOL, RED, YEL, '#fff', PURP][k], k === 2 || k === 3 ? INK : '#fff', 76, (k % 2 ? .03 : -.03))); });
const iceCream = (t, x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); paper(); box(-150, -330, 300, 560, '#e7ecf7', 20, 10); paper(false); box(-110, -290, 220, 150, '#3b4a66', 12, 8); box(-60, -90, 120, 40, '#9aa6c0', 8, 6); box(-18, -50, 36, 70, '#9aa6c0', 6, 6); g.save(); g.rotate(-.12); box(-140, 60, 280, 90, YEL, 8, 8); label('OUT OF ORDER', 0, 108, 44, INK); g.restore(); g.restore(); };
shot(wt(27, 'ice') - .15, t => { rays(t, '#8fd3ff', '#3a7bd5'); iceCream(t, 960, 620, 1.35 + bump(t, wt(27, 'breaks'), .06)); big(t, 'AGAIN.', 1500, 300, 170, RED, wt(27, 'breaks'), { slam: 1, rot: .06 }); sfx(wt(27, 'breaks'), 'boing'); });
shot(T0(28) - .08, t => { office(t, 1.2, 800); fig(t, 'gary-shrug', 700, 1250, 1050, { talk: speaking(28, t), noShadow: 1 }); iceCream(t, 1560, 640, .8); big(t, "IT'S ALWAYS BROKEN.", 960, 150, 120, '#fff', T0(28) + .1); });
// 29. what's left for the owner
shot(T0(29) - .1, t => { rays(t, '#1fc46f', '#0a7a43'); big(t, 'AFTER ALL THAT', 960, 170, 130, '#fff', T0(29) + .1);
  const a = wt(29, 'five'); paper(); box(260, 380, 1400, 220, '#c9d2e6', 24, 0); paper(false); g.save(); g.beginPath(); g.roundRect(260, 380, 1400, 220, 24); g.clip(); g.fillStyle = '#8f9bb8'; g.fillRect(260, 380, 1400 * .93, 220); g.fillStyle = PURP; g.fillRect(260 + 1400 * .93, 380, 1400 * .07 * oc(pr(t, a, .4)), 220); g.restore(); g.lineWidth = 10; g.strokeStyle = INK; g.beginPath(); g.roundRect(260, 380, 1400, 220, 24); g.stroke(); label('EVERYTHING GARY PAYS OUT', 900, 495, 76, '#fff');
  chip(t, 'GARY KEEPS 5 to 10¢', 1420, 700, a, PURP, '#fff', 64, -.02); big(t, '≈ 50¢', 960, 880, 210, YEL, wt(29, 'fifty'), { slam: 1 }); sfx(wt(29, 'fifty') + .05, 'coin'); src('Illustration: a typical franchised restaurant, from analyst models'); });
shot(T0(30) - .1, t => { rays(t, '#ffb347', '#d9571a', .12); bust(t, 'frank', 520, 1180, 1050, 30, { rest: 'neutral' });
  napkin(t, 1340, 560, [['Food ......... $3.50', BLUE, 0], ['Workers ..... $3.10', BLUE, 0], ['Gary .......... 50¢', BLUE, wt(30, 'Fifty')], ['NOT THE GUY', RED, wt(30, 'not')]]); });
gcu('stand', 31, { text: "I'M NOT", extra: t => big(t, 'THE GUY.', 1380, 610, 190, YEL, wt(31, 'guy') - .1, { slam: 1 }) });
cu('frank', 32, '#5a2bd6', '#1c0b55', { ra: .07, rest: 'neutral', text: 'THEN WHO OWNS', text2: 'THIS PLACE?', size: 120, tw2: wt(32, 'this') });
// Gary points at the ceiling; the camera follows
shot(T1(32) + .15, (t, lt) => { hush(T1(32) + .15, T0(33) - .1); sfx(T1(32) + .5, 'boing'); const p = oc(pr(lt, .45, .9)); g.save(); g.translate(0, p * 520); office(t, 1.15, 900); fig(t, 'gary-pointup', 760, 1040, 820, { land: T1(32) + .15 }); g.restore();
  if (p > .3) { g.fillStyle = `rgba(22,32,77,${p * .85})`; g.fillRect(0, 0, W, 330 * p); big(t, '▲ UPSTAIRS', 960, 150, 150, YEL, T1(32) + .9, { slam: 1 }); } });
// 33. what Gary doesn't own
shot(T0(33) - .1, t => { dark(t, '#1d3f8f'); big(t, "WHAT GARY DOESN'T OWN", 960, 130, 120, '#fff', T0(33) + .1);
  [['recipe', 'THE RECIPE', burger, .55], ['sign', 'THE SIGN', null, 1], ['building', 'THE BUILDING', null, 1]].forEach(([w, lab, fn, s], k) => { const t0 = wt(33, w) - .35, x = 380 + k * 580; cue('pop', t0); if (t < t0) return; const e = ob(pr(t, t0, .22)); g.save(); g.translate(x, 560); g.scale(e, e); paper(); box(-230, -260, 460, 520, CRM, 18, 10); paper(false);
    if (k === 0) burger(0, -40, .9); if (k === 1) { box(-14, -60, 28, 230, '#7f8fb5', 4, 7); box(-150, -200, 300, 150, RED, 14, 9); label('EAT', 0, -120, 90, YEL); } if (k === 2) { box(-150, -90, 300, 220, '#ffdf9a', 6, 9); g.fillStyle = RED; g.beginPath(); g.moveTo(-180, -90); g.lineTo(0, -210); g.lineTo(180, -90); g.closePath(); g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); box(-40, 20, 80, 110, NAVY, 4, 7); }
    label(lab, 0, 210, 56, INK); g.restore(); xmark(t, x, 520, 150, wt(33, w) + .25); }); });
// 34. the company owns the site and rents it out
shot(T0(34) - .1, t => { dark(t, '#1d3f8f'); const a = wt(34, 'land'), b = wt(34, 'rents');
  g.save(); g.translate(700, 620); paper(); g.fillStyle = '#7ccf7a'; g.beginPath(); g.moveTo(-460, 60); g.lineTo(-140, -150); g.lineTo(460, -60); g.lineTo(160, 190); g.closePath(); g.fill(); paper(false); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  if (t >= wt(34, 'building') - .2) { const e = ob(pr(t, wt(34, 'building') - .2, .25)); g.scale(e, e); box(-150, -170, 300, 200, '#ffdf9a', 6, 9); g.fillStyle = RED; g.beginPath(); g.moveTo(-180, -170); g.lineTo(0, -280); g.lineTo(180, -170); g.closePath(); g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); box(-40, -60, 80, 90, NAVY, 4, 7); } g.restore(); cue('pop', wt(34, 'building') - .2);
  big(t, 'THE COMPANY PICKS THE SITE', 960, 130, 104, '#fff', T0(34) + .1); chip(t, 'COMPANY OWNS OR LEASES IT', 700, 900, a, YEL, INK, 64, -.02);
  if (t >= b) { const e = ob(pr(t, b, .25)); fig(t, 'gary-stand', lerp(2300, 1500, e), 980, 620, { ph: 2 }); } chip(t, 'RENTS IT TO GARY', 1500, 280, b, RED, '#fff', 64, .03);
  big(t, 'RENT = ? %', 1480, 470, 130, YEL, wt(34, 'fixed') - .2, { slam: 1, rot: -.03 }); src("In most cases McDonald's owns or leases the land and building and rents it to the franchisee · Source: company filings"); });
gcu('desk', 35, { x: 760, text: 'A PERCENTAGE.', slam: 1, tw: wt(35, 'percentage') - .05, extra: t => big(t, 'OF EVERYTHING I SELL.', 1370, 620, 86, YEL, wt(35, 'everything')) });
// 36. fourteen percent, plus a royalty; two dollars leave the building
shot(T0(36) - .1, t => { office(t, 1.1, 900); fig(t, 'gary-bills', 520, 1000, 800, { ph: 2 });
  big(t, 'RENT ≈ 14%', 1320, 300, 170, YEL, wt(36, 'fourteen') - .1, { slam: 1, rot: -.03 }); big(t, '+ ROYALTY 4 to 5%', 1320, 500, 110, '#fff', wt(36, 'royalty') - .1); chip(t, 'OF EVERY SALE', 1320, 660, wt(36, 'sales'), RED, '#fff', 70, .02);
  src('Rent: trade-press estimate of the system average. Royalty: 4% long-standing, 5% for new US restaurants'); });
shot(wt(36, 'So') - .1, t => { rays(t, '#ffd84a', '#ff9d1c'); g.save(); g.translate(960, 860); g.scale(2.2, 2.2); tray(0, 0, 1, {}); g.restore(); const a = wt(36, 'two') - .1; sfx(a, 'whoosh');
  for (let k = 0; k < 2; k++) { const q = oc(pr(t, a + k * .15, 1.1)); if (t < a) bill(840 + k * 240, 560, 1.5, (k ? .1 : -.1)); else bill(840 + k * 240 + Math.sin(q * 6 + k) * 40, lerp(560, -260, q), 1.5, (k ? .1 : -.1) + q * (k ? 1 : -1)); }
  big(t, '$2 OF THE $11', 960, 200, 170, '#fff', a, { slam: 1 }); big(t, 'LEAVES THE BUILDING', 960, 380, 110, RED, wt(36, 'left') - .1); });
cu('frank', 37, '#5a2bd6', '#1c0b55', { ra: .07, rest: 'shock', wide: 'oh', noBlink: 1, text: "WHO'S", text2: 'UPSTAIRS?', size: 190, tw2: wt(37, 'upstairs') - .05 });
