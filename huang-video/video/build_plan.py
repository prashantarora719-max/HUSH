"""The shot list and on-screen text, keyed to the narration. Writes plan.js (for overlay.html) and returns shots (for build_bed.py)."""
import json, pathlib
V = pathlib.Path(__file__).resolve().parent
TL = json.loads((V / 'timeline.js').read_text().split('=', 1)[1].rstrip().rstrip(';'))
W, Y, R = 'w', 'y', 'r'
SK, SG, TY, DC, CR, MO, CN, BR, CH, EN, CS, ST, PW, CP, PT = ('01-skyline', '02-signing', '03-typing', '05-datacenter', '07-crowd', '08-money-usd',
    '17-construction-night', '31-boardroom', '32-chair', '36-engineers', '37-chess', '38-stage', '39-people-walking', '40-chip-macro', 'portrait')

def E(key, clip, ss=0, **o): return dict(key=key, clip=clip, ss=ss, **o)
# lines: (text, colour, word the line lands on; '=' means already on screen)
PLAN = [
 # ---- 0. cold open
 E('0.0', SK, 2, label='PAPER TRILLIONS  ·  ENTRY NO. 2', lines=[('33 YEARS.', W, 'thirty-three'), ('ONE BOSS.', Y, 'one')], size=170),
 E('0.1', ST, 1, lines=[('AS OF TODAY,', W, 'today'), ('IT DOES NOT.', R, 'not')], size=160),
 E('0.2', PT, 0, tag='NOVEMBER 12, 2026', label='SOURCE: NVIDIA ANNOUNCEMENT', lines=[('JENSEN HUANG', W, 'jensen'), ('HAS RESIGNED.', R, 'resigned')], maxw=860, size=120),
 E('0.3', BR, 0, dim=1, fx='three', anch={'a': 'chief', 'b': 'president', 'c': 'seat', 'd': 'effective'}, cuts=[('0.5', BR, 6)]),
 E('0.7', TY, 0.3, label='ACCORDING TO THE COMPANY', lines=[('HE LEFT', W, 'left'), ('VOLUNTARILY.', Y, 'voluntarily')], size=150),
 E('0.8', PT, 0, label='JENSEN HUANG  ·  ILLUSTRATION', lines=[('FOUNDER.', W, 'founded')], maxw=860, size=150),
 E('0.9', DC, 0.5, lines=[('THE FACE OF', W, 'face'), ('THE AI BOOM.', Y, 'entire')], size=150),
 E('0.10', CS, 0.5, label='IN LESS THAN A WEEK', lines=[('UNTOUCHABLE.', W, 'untouchable'), ('GONE.', R, 'gone')], size=170),
 E('0.11', MO, 0.5, label='NOW RUNNING NVIDIA', lines=[('COLETTE KRESS', W, 'colette'), ('THE FINANCE CHIEF', W, 'running')]),
 E('0.12', MO, 0.5, merge=1, label='NOW RUNNING NVIDIA', lines=[('COLETTE KRESS', W, '='), ('INTERIM ONLY.', Y, 'interim')]),
 E('0.13', BR, 2, lines=[('STILL SEARCHING FOR', W, 'searching'), ('A PERMANENT CEO.', R, 'permanent')]),
 E('0.14', PW, 6, lines=[('ANYONE WITH A', W, 'anyone'), ('RETIREMENT ACCOUNT', Y, 'retirement')]),
 E('0.15', CH, 1, lines=[('THE MOST IMPORTANT', W, 'most'), ('COMPANY IN AI', W, 'company'), ('HAS NO LONG-TERM LEADER.', R, 'no')]),
 E('0.16', ST, 5, fx='title', anch={'t': 'nvidia', 'w': 'without'}),
 # ---- 1. timing note
 E('1.0', TY, 0.2, label='A NOTE ON TIMING'),
 E('1.1', TY, 0.2, merge=1, label='A NOTE ON TIMING', lines=[('RECORDED NOVEMBER 12, 2026', Y, 'recorded'), ('HOURS AFTER THE ANNOUNCEMENT', W, 'hours')]),
 E('1.2', EN, 1, lines=[('THE DETAILS WILL CHANGE.', W, 'details')]),
 E('1.3', EN, 1, merge=1, lines=[('THE DETAILS WILL CHANGE.', W, '='), ('THE QUESTION WILL NOT.', Y, 'question')]),
 E('1.4', CP, 2, lines=[('CAN NVIDIA RUN', W, 'can'), ('WITHOUT HIM?', Y, 'without')], size=160),
 # ---- 2. how it got here
 E('2.0', SK, 9, label='WHAT HAS BEEN REPORTED', lines=[('WHO REPORTED', W, 'reported'), ('WHAT.', Y, 'whom')], size=150),
 E('2.1', SG, 4, tag='NOV 8', label='SOURCE: NVIDIA STATEMENT', lines=[('THE BOARD OPENS', W, 'board'), ('AN INDEPENDENT', W, 'independent'), ('INVESTIGATION', Y, 'investigation')]),
 E('2.2', CP, 8, tag='REPORTED', label='ACCORDING TO PRESS REPORTS', lines=[('A RELATIONSHIP WITH', W, 'relationship'), ('AN EXECUTIVE AT', W, 'executive'), ('A CUSTOMER', W, 'company')],
   until='w:and'),
 E('2.2b', DC, 4, at='2.2/w:and', tag='ALLEGED  ·  NOT PROVEN', tagc=R, label='WHAT U.S. OFFICIALS BELIEVE, PER REPORTS', lines=[('THAT SHE WAS WORKING', W, 'she'), ('WITH CHINESE', W, 'chinese'), ('INTELLIGENCE', W, 'intelligence')]),
 E('2.3', CN, 8, lines=[('CHINA DENIES IT.', W, 'china')], size=150),
 E('2.4', PT, 0, dim=0, fx='quote', q=['“There is no excuse', 'for what I did.”'], by='JENSEN HUANG, TO EMPLOYEES  ·  AS REPORTED', anch={'q': 'there'}),
 E('2.5', BR, 1, lines=[('AT FIRST,', W, 'first'), ('THE BOARD BACKED HIM.', Y, 'backed')]),
 E('2.6', BR, 6, label='BOARD STATEMENT, AS REPORTED', lines=[('CONFIDENCE IN JENSEN.', Y, 'confidence'), ('NO REASON TO BELIEVE', W, 'no'), ('SECRETS WERE COMPROMISED', W, 'secrets')]),
 E('2.7', TY, 3, tag='THIS WEEK', label='REPORTED BY THE NEW YORK TIMES', lines=[('A SECOND RELATIONSHIP', W, 'second'), ('WITH SOMEONE WHO', R, 'someone'), ('WORKED FOR HIM', R, 'worked')]),
 E('2.8', CS, 3, label='REPORTED BY THE WALL STREET JOURNAL', lines=[('THE BOARD IS', W, 'board'), ('PREPARING TO', W, 'preparing'), ('REMOVE HIM', R, 'remove')], size=140),
 E('2.9', CR, 2, lines=[('THESE ARE REPORTS.', W, 'reports')]),
 E('2.10', CR, 8, lines=[('THESE ARE REPORTS.', W, '='), ('NVIDIA HAS NOT CONFIRMED THEM.', Y, 'not')]),
 E('2.11', CN, 11, lines=[('THE SPYING CLAIM:', W, 'spying'), ('NOT PROVEN.', R, 'not')], size=150),
 E('2.12', CH, 4),
 E('2.13', MO, 2, lines=[('IF YOU OWN THIS STOCK,', W, 'owns'), ('THE QUESTION IS DIFFERENT.', Y, 'different')]),
 # ---- 3. why one man matters
 E('3.0', SK, 5, label='WHY ONE MAN MATTERS THIS MUCH', lines=[('MOST COMPANIES:', W, 'most'), ('NO ONE PERSON', W, 'no'), ('MATTERS TOO MUCH.', W, 'matters')]),
 E('3.1', CP, 12, lines=[('NVIDIA:', W, 'nvidia'), ('THE OPPOSITE.', Y, 'opposite')], size=170),
 E('3.2', EN, 4, dim=1, fx='reports', big=0, anch={'n': 'ten'}),
 E('3.3', EN, 4, merge=1, dim=1, fx='reports', big=1, anch={'n': 'more'}),
 E('3.4', EN, 0, lines=[('NO LAYERS.', W, 'no')], size=170),
 E('3.5', EN, 0, merge=1, lines=[('NO LAYERS.', W, '='), ('NO DEPUTY.', W, 'no')], size=170),
 E('3.6', CH, 6, lines=[('EVERY BIG DECISION.', W, 'every'), ('ONE DESK.', Y, 'one')], size=150),
 E('3.7', PT, 0, lines=[('THE DECISIONS', W, 'decisions'), ('WERE HIS.', Y, 'his')], maxw=860, size=130),
 E('3.8', TY, 0.5, tag='20 YEARS AGO', lines=[('HE BET THE COMPANY', W, 'bet'), ('ON SOFTWARE.', Y, 'software')], cuts=[('w:software', CP, 5)]),
 E('3.9', SK, 12, lines=[('WALL STREET', W, 'wall'), ('HATED IT.', R, 'hated')], size=170),
 E('3.10', DC, 5, lines=[('IT IS WHY NVIDIA OWNS', W, 'reason'), ('THE AI CHIP MARKET.', Y, 'ai')]),
 E('3.11', MO, 4, fx='five', anch={'n': 'five', 'b': 'not'}),
 E('3.12', PT, 0, lines=[('THEY WERE BUYING', W, 'buying'), ('HIS JUDGMENT.', Y, 'judgment')], maxw=860, size=110),
 E('3.13', CN, 0, dim=1, fx='lost', anch={'n': 'more', 'c': 'counting'}, cuts=[('3.14', CN, 6)]),
 E('3.15', CH, 2, lines=[('THE PRICE OF', W, 'price'), ('ONE PERSON.', Y, 'one')], size=160),
 # ---- 4. why he could not hold on
 E('4.0', PT, 0, lines=[('SO MUCH POWER.', W, 'power'), ('GONE SO QUICKLY?', Y, 'quickly')], maxw=860, size=110),
 E('4.1', BR, 3, lines=[('HE HAD LESS POWER', W, 'less'), ('THAN PEOPLE THINK.', Y, 'people')]),
 E('4.2', SG, 6, dim=1, fx='meta', anch={'a': 'special', 'b': 'board', 'c': 'nvidia', 'd': 'nothing'}, cuts=[('4.4', SG, 2)]),
 E('4.5', MO, 0, lines=[('HE OWNED ABOUT 3.5%.', W, 'three')]),
 E('4.6', MO, 3, lines=[('IT MADE HIM RICH.', W, 'rich')], size=140),
 E('4.7', MO, 3, merge=1, lines=[('IT MADE HIM RICH.', W, '='), ('NOT SAFE.', R, 'safe')], size=140),
 E('4.8', BR, 5, label='NVIDIA BYLAWS  ·  SECTION 32', lines=[('A SIMPLE MAJORITY', W, 'simple'), ('CAN REMOVE THE CEO', W, 'remove'), ('WITH OR WITHOUT A REASON.', R, 'with')],
   cuts=[('w:remove', CS, 0.5)]),
 E('4.9', BR, 8, dim=1, fx='seats', n6=0),
 E('4.10', BR, 8, merge=1, dim=1, fx='seats', n6=1, anch={'six': 'six'}),
 E('4.11', TY, 3, label='REPORTED BY THE WALL STREET JOURNAL', lines=[('THE BOARD WAS PREPARING', W, 'preparing'), ('TO DO EXACTLY THAT.', R, 'exactly')]),
 E('4.12', ST, 1, label='ACCORDING TO THE COMPANY', lines=[('IN THE END,', W, 'end'), ('HE RESIGNED.', Y, 'resigned')], size=160),
 E('4.13', CN, 3, lines=[('WHY THE BOARD', W, 'reason'), ('COULD NOT WAIT.', R, 'wait')], size=150),
 E('4.14', CP, 0, label='EXPORT LICENSES', lines=[('WASHINGTON DECIDES', W, 'washington'), ('WHERE THE BEST', W, 'best'), ('CHIPS CAN GO.', W, 'abroad')]),
 E('4.15', DC, 2, lines=[('A CEO UNDER A CLOUD', W, 'cloud'), ('ABOUT CHINA', R, 'china')]),
 E('4.16', SG, 0, label='A SENIOR MEMBER OF CONGRESS, AS REPORTED', lines=[('PREPARED TO', W, 'prepared'), ('SUBPOENA HIM.', R, 'subpoena')], size=150),
 E('4.17', SK, 0),
 E('4.18', SK, 14, lines=[('COULD WASHINGTON', W, 'united'), ('STILL TRUST', W, 'trust'), ('THE PERSON IN CHARGE?', Y, 'person')], cuts=[('w:person', CP, 15)]),
 # ---- 5. who's next
 E('5.0', CS, 1, label='THE SUCCESSION', lines=[("WHO'S NEXT?", Y, 'who')], size=230),
 E('5.1', BR, 0, label='THE BOARD SAYS IT WILL LOOK', lines=[('INSIDE THE COMPANY.', W, 'inside'), ('AND OUTSIDE IT.', Y, 'outside')]),
 E('5.2', CS, 4, lines=[('THREE KINDS', W, 'three'), ('OF ANSWER.', W, 'answer')], size=160),
 E('5.3', MO, 1, dim=1, fx='card', num='1', role='THE OPERATOR', name='COLETTE KRESS', cuts=[('5.6', BR, 2)],
   bullets=[('INTERIM CEO, AS OF TODAY', Y, 'interim'), ('STILL THE FINANCE CHIEF AS WELL', W, 'finance'), ('STEADY. TRUSTED BY WALL STREET', W, 'steady'), ('DOES “INTERIM” BECOME PERMANENT?', R, 'whether')]),
 E('5.8', EN, 2, dim=1, fx='card', num='2', role='THE ENGINEER', name='IAN BUCK', cuts=[('5.10', CP, 3), ('5.11', EN, 6)],
   bullets=[('JOINED NVIDIA IN 2004', W, 'joined'), ('A KEY ARCHITECT OF ITS AI SOFTWARE', W, 'architect'), ('RUNS THE BUSINESS SERVING THE BIGGEST AI CUSTOMERS', W, 'runs'), ('HAS NEVER RUN A WHOLE COMPANY', R, 'never')]),
 E('5.13', SK, 3, dim=1, fx='card', num='3', role='THE OUTSIDER  ·  NAMED IN PRESS REPORTS', name='LISA SU  /  RENE HAAS', cuts=[('5.16', SG, 7)],
   bullets=[('LISA SU RUNS RIVAL AMD', W, 'lisa'), ('RENE HAAS RUNS ARM', W, 'rene'), ('PROVEN CHIEF EXECUTIVES', W, 'proven'), ('NOT THERE FOR ANY OF IT', R, 'not')]),
 E('5.17', TY, 1, label='A NEWSWEEK HEADLINE, THIS WEEK'),
 E('5.18', ST, 3, label='A NEWSWEEK HEADLINE, THIS WEEK', lines=[('WHO COULD REPLACE', W, 'who'), ('JENSEN HUANG?', W, 'jensen')], size=130),
 E('5.19', ST, 3, merge=1, lines=[('NOBODY.', Y, 'nobody')], size=300),
 # ---- 6. what history says
 E('6.0', ST, 8),
 E('6.1', SK, 7, label='WHAT HISTORY SAYS', lines=[('THREE COMPANIES.', W, 'three'), ('THREE OUTCOMES.', Y, 'companies')], size=140),
 E('6.2', CP, 6, tag='INTEL  ·  2018'),
 E('6.3', BR, 9, tag='INTEL  ·  2018', lines=[('CEO PUSHED OUT', W, 'pushed'), ('OVER A RELATIONSHIP', W, 'relationship'), ('WITH AN EMPLOYEE', W, 'employee')]),
 E('6.4', CP, 10, tag='INTEL  ·  2018', label='THE STOCK, THAT DAY', lines=[('ABOUT −2%', W, 'barely')], size=200),
 E('6.5', DC, 1, tag='INTEL  ·  2018', lines=[('THEN IT LOST ITS LEAD', R, 'lost'), ('IN MAKING CHIPS.', W, 'making')]),
 E('6.6', CN, 9, tag='INTEL  ·  2018', lines=[('THE TROUBLE WAS', W, 'trouble'), ('ALREADY UNDERWAY.', Y, 'already')], until='6.8'),
 E('6.8', CR, 0, at='6.8', tag='McDONALD’S  ·  2019'),
 E('6.9', PW, 1, tag='McDONALD’S  ·  2019', lines=[('SAME REASON.', W, 'same'), ('SAME OUTCOME.', W, 'same#2')], size=150),
 E('6.10', MO, 3, tag='McDONALD’S  ·  2019', label='THE STOCK, ON THE NEWS', lines=[('ABOUT −5%', R, 'five')], size=200),
 E('6.11', SK, 1, tag='McDONALD’S  ·  2019', lines=[('THE NEW BOSS CARRIED ON.', W, 'carried'), ('THE SHARES: NEW HIGHS.', Y, 'new#2')]),
 E('6.12', ST, 0, tag='APPLE  ·  2011', until='6.13'),
 E('6.13', ST, 0, at='6.13', merge=1, tag='APPLE  ·  2011', lines=[('STEVE JOBS STEPS DOWN.', W, 'steve'), ('PLENTY SAID: IT IS FINISHED.', R, 'finished')], cuts=[('w:plenty', CR, 10)]),
 E('6.14', EN, 5, tag='APPLE  ·  2011', lines=[('HIS REPLACEMENT:', W, 'replacement'), ('AN OPERATIONS MAN.', Y, 'operations')]),
 E('6.15', SK, 10, dim=1, fx='score', anch={'x': 'ten'}),
 E('6.16', CH, 0, lines=[('THE LESSON', Y, 'lesson')], size=170, until='6.17'),
 E('6.17', CP, 1, at='6.17', dim=1, fx='versus', anch={'a': 'one', 'b': 'system'}),
 # ---- 7. three things to watch
 E('7.0', SK, 3, lines=[('THREE THINGS', W, 'what'), ('TO WATCH.', Y, 'look')], size=170),
 E('7.1', BR, 0, fx='watch', num='1', lines=[('HOW LONG DOES', W, 'how'), ('“INTERIM” LAST?', Y, 'interim')], cuts=[('7.3', CH, 12)], until='7.3'),
 E('7.3', CH, 12, merge=1, fx='watch', num='1', lines=[('“INTERIM” MEANS', W, 'interim'), ('NO ANSWER YET.', R, 'answer')]),
 E('7.4', BR, 6, fx='watch', num='1', lines=[('THE LONGER IT STAYS,', W, 'longer'), ('THE MORE IT TELLS YOU.', Y, 'more')]),
 E('7.5', EN, 0, fx='watch', num='2', lines=[('DO THE ENGINEERS STAY?', W, 'engineers')], cuts=[('7.7', CP, 9)], until='7.7'),
 E('7.7', CP, 9, merge=1, fx='watch', num='2', lines=[('NVIDIA’S LEAD', W, 'lead'), ('IS ITS PEOPLE.', Y, 'people')]),
 E('7.8', EN, 6, fx='watch', num='2', lines=[('IF TOP TECHNICAL', W, 'top'), ('NAMES START LEAVING…', R, 'leaving')]),
 E('7.9', DC, 3, fx='watch', num='3', lines=[('NOVEMBER 17', Y, 'november'), ('NVIDIA REPORTS EARNINGS', W, 'earnings')], cuts=[('7.12', MO, 5)], until='7.12'),
 E('7.12', MO, 5, merge=1, fx='watch', num='3', lines=[('THE FIRST RESULTS EVER', W, 'first'), ('WITHOUT JENSEN HUANG', R, 'without')]),
 E('7.13', PT, 0, label='WHAT HE TOLD EMPLOYEES FOR 30 YEARS', lines=[('“THIRTY DAYS FROM', W, 'thirty#2'), ('GOING OUT', W, 'going'), ('OF BUSINESS.”', W, 'business')], maxw=860, size=100),
 E('7.14', CH, 3),
 E('7.15', ST, 2, fx='final', anch={'a': 'never', 'b': 'if'}),
]

def sent(k): s, n = k.split('.'); return TL['sections'][int(s)]['sentences'][int(n)]
def word(sec, w, after):
    w, n = (w.split('#') + ['1'])[:2]; n = int(n)
    for x, t in TL['sections'][sec]['words']:
        if x == w and t >= after - .05:
            n -= 1
            if n == 0: return t
    raise KeyError(f'{w} not found in section {sec} after {after}')

def build():
    ents, shots = [], []
    for e in PLAN:
        base = e['key'].rstrip('b'); sec = int(base.split('.')[0]); s0 = sent(base)['start']
        at = e.get('at')
        if at and '/w:' in at: k, w = at.split('/w:'); t0 = word(sec, w, sent(k)['start'])
        else: t0 = sent(at)['start'] if at else s0
        e['t0'] = t0; e['sec'] = sec
    for i, e in enumerate(PLAN):
        nxt = PLAN[i + 1]['t0'] if i + 1 < len(PLAN) else TL['total']
        u = e.get('until'); sec = e['sec']
        t1 = nxt if not u else (word(sec, u[2:], e['t0']) if u.startswith('w:') else sent(u)['start'])
        if u and u.startswith('w:') and i + 1 < len(PLAN): t1 = min(t1, nxt)
        o = {k: v for k, v in e.items() if k not in ('clip', 'ss', 'cuts', 'lines', 'bullets', 'anch', 'at', 'until', 'merge')}
        o.update(t0=round(e['t0'], 3), t1=round(t1, 3))
        for name in ('lines', 'bullets'):
            if name in e: o[name] = [[tx, c, -1 if a == '=' else round(word(sec, a, e['t0']), 3)] for tx, c, a in e[name]]
        if 'anch' in e: o['a'] = {k: round(word(sec, a, e['t0']), 3) for k, a in e['anch'].items()}
        ents.append(o)
        if not e.get('merge'): shots.append([max(0, e['t0'] - .1), e['clip'], e['ss'], e.get('dim', 0)])
        for k, clip, ss in e.get('cuts', []):
            t = word(sec, k[2:], e['t0']) if k.startswith('w:') else sent(k)['start']
            shots.append([t - .1, clip, ss, e.get('dim', 0)])
    shots.sort(key=lambda s: s[0])
    return ents, shots

if __name__ == '__main__':
    ents, shots = build()
    (V / 'plan.js').write_text('window.PLAN = ' + json.dumps({'entries': ents, 'cuts': [round(s[0], 3) for s in shots], 'total': TL['total']}) + ';\n')
    d = [round(b[0] - a[0], 2) for a, b in zip(shots, shots[1:])]
    print(len(ents), 'entries,', len(shots), 'shots; shortest', min(d), 'longest', max(d), 'mean', round(sum(d) / len(d), 2))
    print('long shots:', [(round(shots[i][0], 1), x) for i, x in enumerate(d) if x > 7])
