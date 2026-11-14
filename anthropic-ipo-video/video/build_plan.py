"""The shot list and on-screen text, keyed to the narration. Writes plan.js (for overlay.html) and returns shots (for build_bed.py)."""
import json, pathlib
V = pathlib.Path(__file__).resolve().parent
TL = json.loads((V / 'timeline.js').read_text().split('=', 1)[1].rstrip().rstrip(';'))
W, Y, R = 'w', 'y', 'r'
TB, IM, LW, SR, OM, PL, GC, PH, AC, SF, PB, RC, AU, SS, CF, TS, DA, CA, BL, WH, CL = ('a01-ticker-board', 'a02-investor-meeting', 'a03-laptop-woman', 'a04-server-racks',
    'a05-older-man-paperwork', 'a06-plane-passenger', 'a07-glass-campus', 'a08-phone-typing', 'a09-accountant-desk', 'a10-signing-form', 'a11-piggy-bank', 'a12-retired-couple',
    'a13-audience-raised-hand', 'a14-sf-skyline-sunset', 'a15-chip-factory', 'a16-times-square-crowd', 'a17-datacenter-aerial', 'a18-chart-animation', 'a19-bell', 'a20-warehouse-aerial', 'a22-calendar')
SK, TY, DC, CR, MO, CN, BR, EN, CS, CP, PT = ('01-skyline', '03-typing', '05-datacenter', '07-crowd', '08-money-usd', '17-construction-night', '31-boardroom', '36-engineers', '37-chess', '40-chip-macro', 'portrait')
S1, ALP = 'ANTHROPIC S-1 FILING', 'ALPHABET Q3 2026 RESULTS'

def E(key, clip, ss=0, **o): return dict(key=key, clip=clip, ss=ss, **o)
def N(key, clip, ss, label, pre, val, suf, col, at, **o):  # a big number that counts up on a spoken word
    return E(key, clip, ss, fx='num', label=label, pre=pre, val=val, suf=suf, col=col, anch={'n': at}, dim=o.pop('dim', 1), **o)
# lines: (text, colour, word the line lands on; '=' means already on screen)
PLAN = [
 # ---- 0. cold open
 N('0.0', TB, 2, 'REPORTED LOSS  ·  SIX MONTHS', '−$', 80.7, ' BILLION', R, 'eighty', src=S1, until='w:is'),
 E('0.0b', BL, 0.5, at='0.0/w:is', lines=[('GOING PUBLIC', W, 'going'), ('THURSDAY.', Y, 'public')], size=170),
 N('0.1', IM, 2, 'ORDERS, AGAINST THE SHARES FOR SALE', '', 6, '×', Y, 'running', src='BLOOMBERG, REUTERS', lines=[('INVESTORS WANT IN.', W, 'want')], dim=0),
 E('0.2', SS, 1, photo='amodei', pname='DARIO AMODEI  ·  ANTHROPIC CEO', pcredit='PHOTO: TECHCRUNCH  ·  CC BY 2.0', lines=[('THE COMPANY:', W, 'company'), ('ANTHROPIC', Y, 'anthropic')], maxw=1000, size=150, logo='anthropic'),
 E('0.3', LW, 2, lines=[('IT MAKES AN AI', W, 'makes'), ('CALLED CLAUDE.', Y, 'claude')], logo='claude'),
 N('0.4', CA, 1, 'VALUE AT THE TOP OF ITS PRICE RANGE', '$', 1.4, ' TRILLION', Y, 'one', src='IPO FILINGS  ·  FULLY DILUTED'),
 E('0.5', OM, 1, lines=[('EVEN IF YOU NEVER', W, 'never'), ('BUY A SINGLE SHARE', Y, 'single')]),
 E('0.6', TB, 9, lines=[('WITHIN WEEKS,', W, 'weeks'), ('INDEX FUNDS MAY', W, 'index'), ('HAVE TO BUY IT.', R, 'buy')], cuts=[('w:may', CR, 3), ('w:at', CA, 6)]),
 E('0.7', RC, 1, lines=[('ONE COULD BE IN YOUR', W, 'one'), ('RETIREMENT ACCOUNT.', Y, 'retirement')]),
 E('0.8', TS, 2, lines=[('THE BIGGEST WINNERS', W, 'winners'), ('ARE NOT THURSDAY’S BUYERS.', R, 'not')]),
 E('0.9', BR, 3, lines=[('THEY WERE DECIDED', W, 'decided'), ('YEARS AGO.', Y, 'years')], size=150),
 # ---- 1. note
 E('1.0', CA, 8, dim=1, fx='title', cuts=[('1.1', CA, 3)]),
 E('1.2', AC, 2, src='EXAMPLE: SOURCE NAME APPEARS HERE', lines=[('EVERY NUMBER HAS', W, 'number'), ('ITS SOURCE ON SCREEN.', Y, 'source')]),
 # ---- 2. the deal
 E('2.0', BL, 3, lines=[('THE DEAL', Y, 'deal')], size=220),
 N('2.1', TB, 14, 'SHARES FOR SALE', '', 825, ' MILLION', W, 'eight', src='IPO FILING', lines=[('AT $70 TO $78 EACH', Y, 'seventy')], dim=0, scrim=.55),
 N('2.2', MO, 1, 'RAISING UP TO', '$', 64, ' BILLION', Y, 'sixty-four', src='IPO FILING'),
 E('2.3', TS, 6, lines=[('THE 2ND LARGEST DEBUT', W, 'second'), ('IN HISTORY', Y, 'history')], until='w:behind'),
 E('2.3b', CA, 5, at='2.3/w:behind', dim=1, fx='rank', src='IPO PROCEEDS  ·  COMPANY FILINGS'),
 E('2.4', SK, 2, lines=[('THE VALUATION', Y, 'valuation')], size=170),
 E('2.5', TY, 1, lines=[('TWO NUMBERS.', W, 'two'), ('BOTH ARE REAL.', Y, 'both')], size=150),
 E('2.6', CA, 9, dim=1, fx='two', label='WHAT IS ANTHROPIC WORTH?', src='IPO FILINGS  ·  AT THE TOP OF THE PRICE RANGE', cuts=[('2.7', TB, 18)],
   L=['SHARES THAT EXIST TODAY', 'ABOUT $1.0 TRILLION', W], R_=['EVERY SHARE PROMISED', '$1.4 TRILLION', Y], anch={'a': 'one', 'b': 'one#2'}),
 E('2.8', IM, 8, lines=[('LESS THAN THE', W, 'less'), ('$2 TRILLION WHISPER', R, 'two')], size=150),
 E('2.9', TB, 4, lines=[('REMEMBER THAT.', Y, 'remember')], size=170),
 # ---- 3. the loss
 E('3.0', AC, 0, lines=[('THAT LOSS.', R, 'loss')], size=220),
 N('3.1', MO, 4, 'REVENUE  ·  FIRST HALF OF 2026', '$', 16.3, ' BILLION', W, 'sixteen', src=S1),
 N('3.2', TB, 6, 'NET LOSS  ·  THE SAME SIX MONTHS', '−$', 80.7, ' BILLION', R, 'eighty', src=S1),
 E('3.3', CN, 2, lines=[('A COMPANY ON FIRE?', W, 'fire')], size=150),
 E('3.4', CN, 2, merge=1, lines=[('A COMPANY ON FIRE?', W, '='), ('IT IS NOT.', Y, 'not')], size=150),
 E('3.5', AC, 5, dim=1, fx='split', src=S1, anch={'a': 'seventy-two'}),
 E('3.6', SF, 0.5, lines=[('IT BORROWED USING NOTES', W, 'notes'), ('THAT CONVERT INTO SHARES', Y, 'convert')]),
 E('3.7', CA, 11, lines=[('COMPANY WORTH MORE', W, 'valuable'), ('= NOTES COST MORE,', W, 'notes'), ('ON PAPER.', Y, 'paper')]),
 E('3.8', MO, 0, lines=[('NO CASH', W, 'cash'), ('LEFT THE BUILDING.', Y, 'left')], size=150),
 N('3.9', TY, 3, 'LOSS FROM ACTUALLY RUNNING THE BUSINESS', 'UNDER $', 700, ' MILLION', W, 'seven', src='ANTHROPIC S-1  ·  OPERATING LOSS $693 MILLION'),
 E('3.10', EN, 1, src='ANTHROPIC S-1  ·  QUARTER ENDED JUNE 30', lines=[('LATEST REPORTED QUARTER:', W, 'quarter'), ('AN OPERATING PROFIT', Y, 'profit')]),
 E('3.11', OM, 5, lines=[('SO IS IT SAFE?', W, 'safe')], size=160),
 E('3.12', OM, 5, merge=1, lines=[('SO IS IT SAFE?', W, '='), ('NO.', R, 'no')], size=160),
 E('3.14', SR, 2, lines=[('TO RUN AI, YOU NEED', W, 'run'), ('COMPUTING POWER.', Y, 'computing')]),
 N('3.15', SR, 12, 'SPENT ON COMPUTING  ·  SIX MONTHS', 'NEARLY $', 9, ' BILLION', R, 'nine', src=S1),
 E('3.16', DC, 1, lines=[('MORE THAN ALL OF', W, 'more'), ('LAST YEAR.', R, 'last')], size=150),
 E('3.17', SF, 3, lines=[('CONTRACTS TO KEEP', W, 'contracts'), ('SPENDING FOR YEARS', Y, 'years')]),
 N('3.18', DA, 1, 'COMMITTED TO GOOGLE ALONE', '$', 121, ' BILLION+', R, 'above', src='ANTHROPIC S-1/A  ·  NOVEMBER 10, 2026', dim=0),
 E('3.19', TB, 20, lines=[('THAT IS THE BET.', Y, 'bet')], size=170),
 E('3.20', MO, 5, lines=[('REVENUE MUST GROW', W, 'revenue'), ('FASTER THAN THE BILLS.', R, 'faster')]),
 # ---- 4. what it sells
 E('4.0', LW, 6, lines=[('WHAT DOES', W, 'what'), ('IT SELL?', Y, 'sell')], size=170),
 E('4.1', PH, 0, lines=[('NOT A CHATBOT', W, 'not'), ('FOR THE PUBLIC.', R, 'public')]),
 E('4.2', TS, 8, lines=[('MOST PEOPLE HAVE', W, 'most'), ('NEVER USED CLAUDE.', Y, 'never')], logo='claude'),
 E('4.3', EN, 5, lines=[('ITS MONEY COMES FROM', W, 'money'), ('BUSINESSES.', Y, 'businesses')], size=150),
 E('4.4', BR, 2, lines=[('BANKS.', W, 'banks'), ('SOFTWARE COMPANIES.', W, 'software'), ('LAW FIRMS.', W, 'law')], cuts=[('w:software', TY, 2), ('w:law', SF, 4)], until='w:pay'),
 E('4.4b', SR, 20, at='4.4/w:pay', lines=[('THEY PAY BY', W, 'pay#2'), ('HOW MUCH THEY USE.', Y, 'use')], size=150),
 E('4.5', IM, 12, lines=[('AND THEY ARE USING', W, 'using'), ('A LOT MORE.', Y, 'lot')], size=150),
 N('4.6', CA, 2, 'SPENDING BY CUSTOMERS FROM A YEAR AGO', '', 9, '×', Y, 'nine', src='ANTHROPIC S-1  ·  NET REVENUE RETENTION', lines=[('NINE TIMES AS MUCH', W, 'times')]),
 E('4.7', TB, 10, dim=1, fx='bars2', src='DERIVED FROM THE ANTHROPIC S-1', anch={'a': 'second'}),
 E('4.9', SK, 6, lines=[('DOUBLE IN', W, 'double'), ('THREE MONTHS.', Y, 'three')], size=180),
 E('4.10', CA, 7, lines=[('THE NUMBER BEHIND', W, 'number'), ('THE TRILLION-DOLLAR PRICE', Y, 'trillion')]),
 E('4.11', SS, 4, lines=[('ALMOST UNHEARD OF', W, 'unheard'), ('AT THIS SIZE.', W, 'size')]),
 E('4.12', OM, 8, lines=[('HOW LONG', W, 'how'), ('CAN IT LAST?', R, 'last')], size=170),
 E('4.13', BR, 6, lines=[('ONE OF TWO THINGS:', W, 'two')]),
 E('4.14', CF, 1, tag='EITHER', lines=[('A NEW INDUSTRY', W, 'new'), ('IS BEING BORN.', Y, 'born')], size=150),
 E('4.15', MO, 2, tag='OR', tagc='r', lines=[('CUSTOMERS EXPERIMENTING', W, 'experimenting'), ('WITH MONEY THEY', W, 'money'), ('WON’T KEEP SPENDING.', R, 'not')]),
 # ---- 5. the rival that blinked
 E('5.0', SS, 7, lines=[('THE ONE EVERYONE', W, 'everyone'), ('EXPECTED TO GO FIRST', Y, 'first')]),
 E('5.1', SK, 12, dim=1, fx='brand', bname='OpenAI', year='THE MAKER OF CHATGPT'),
 E('5.3', IM, 0, photo='altman', pname='SAM ALTMAN  ·  OPENAI CEO', pcredit='PHOTO: TECHCRUNCH  ·  CC BY 2.0', lines=[('ASKED INVESTORS FOR', W, 'asking'), ('$1.4 TRILLION', Y, 'one')], maxw=1000),
 E('5.4', AU, 2, lines=[('INVESTORS', W, 'investors'), ('PUSHED BACK.', R, 'pushed')], size=170),
 E('5.5', CA, 4, dim=1, fx='two', label='OPENAI’S VALUATION IN THIS ROUND', src='PRESS REPORTS  ·  NOVEMBER 2026', L=['ASKED FOR', '$1.40 TRILLION', W], R_=['SETTLED FOR', '$1.25 TRILLION', R], anch={'a': '=', 'b': 'one'}),
 N('5.6', MO, 3, 'RAISED', 'ABOUT $', 15, ' BILLION', W, 'fifteen', src='CNBC', lines=[('ROUGHLY HALF OF WHAT IT WANTED', R, 'half')]),
 E('5.7', TY, 4, lines=[('WHY THE PUSHBACK?', Y, 'why')], size=150),
 E('5.8', TB, 3, dim=1, fx='two', label='OPENAI  ·  LAST QUARTER', src='THE WALL STREET JOURNAL', L=['TOOK IN', '$6.7 BILLION', W], R_=['LOST RUNNING THE BUSINESS', '−$12.3 BILLION', R], anch={'a': 'six', 'b': 'twelve'}, cuts=[('w:lost', DC, 3)]),
 E('5.9', MO, 0, lines=[('FOR EVERY $1 EARNED,', W, 'dollar'), ('IT LOST ALMOST $2.', R, 'two')]),
 E('5.10', BL, 5, lines=[('ITS OWN DEBUT:', W, 'debut'), ('PUSHED TO NEXT YEAR.', R, 'next')]),
 E('5.11', CS, 1, lines=[('THE SMALLER RIVAL', W, 'smaller'), ('MAY BE WORTH MORE', Y, 'higher')], cuts=[('w:than', SS, 2)]),
 E('5.12', TS, 11, lines=[('THE STORY WALL STREET', W, 'story'), ('IS TELLING THIS WEEK', W, 'telling')]),
 E('5.13', OM, 2, lines=[('WHO BENEFITS', W, 'benefits'), ('FROM THAT STORY?', Y, 'story')], size=150),
 E('5.14', TB, 22, lines=[('A COMPANY ABOUT TO SELL', W, 'sell'), ('$64 BILLION OF STOCK.', R, 'sixty-four')], logo='anthropic'),
 # ---- 6. paid either way
 E('6.0', SK, 9, lines=[('THE PART MOST', W, 'part'), ('HEADLINES SKIP', Y, 'skip')], size=150),
 E('6.1', GC, 0, fx='brand', logo='google', bname='GOOGLE', year=''),
 E('6.2', GC, 5, logo='google', lines=[('IT COMPETES', W, 'competes'), ('WITH BOTH.', R, 'both')], size=160),
 E('6.3', PH, 3, logo='googlegemini', src=ALP, lines=[('GEMINI:', W, 'gemini'), ('A BILLION USERS', Y, 'billion')], size=150),
 E('6.4', IM, 14, photo='pichai', pname='SUNDAR PICHAI  ·  GOOGLE CEO', pcredit='PHOTO: L. KOBUS, EUROPEAN COMMISSION  ·  CC BY 4.0', lines=[('BUT IT ALSO OWNS', W, 'owns'), ('A PIECE OF ANTHROPIC', Y, 'piece')], maxw=1000),
 N('6.5', CA, 12, 'GOOGLE’S STAKE IN ANTHROPIC  ·  ESTIMATES', '', 0, '10% TO 14%', Y, 'ten', src='YAHOO FINANCE, TREFIS'),
 N('6.6', MO, 6, 'WORTH, AT THE MIDDLE OF THE PRICE RANGE', 'ABOUT $', 130, ' BILLION', Y, 'one', src='YAHOO FINANCE, TREFIS'),
 E('6.7', CF, 5, lines=[('AND IT SELLS ANTHROPIC', W, 'sells'), ('THE CHIPS IT RUNS ON.', Y, 'chips')]),
 E('6.8', CP, 3, src='ANNOUNCED JANUARY 2026', lines=[('UP TO A MILLION', W, 'million'), ('OF THEM.', W, 'them')], size=150),
 N('6.9', DA, 8, 'GOOGLE CLOUD REVENUE  ·  LAST QUARTER', '$', 30.7, ' BILLION', W, 'thirty', src=ALP, lines=[('MORE THAN DOUBLED', Y, 'doubled')], dim=0, scrim=.35),
 E('6.10', GC, 8, lines=[('THINK ABOUT THAT.', Y, 'think')], size=150),
 E('6.11', SK, 15, dim=1, fx='ifs', anch={'a': 'wins', 'b': 'spends', 'c': 'loses'}, cuts=[('6.12', SR, 6), ('6.13', PH, 5)]),
 E('6.14', WH, 2, lines=[('AMAZON:', W, 'amazon'), ('THE SAME POSITION.', Y, 'same')], size=160),
 E('6.15', WH, 12, photo='jassy', pname='ANDY JASSY  ·  AMAZON CEO', pcredit='PHOTO: L. MEZISTRANO WOLF  ·  CC BY-SA 4.0', lines=[('A STAKE VALUED AROUND', W, 'stake'), ('$140 BILLION', Y, 'one')], maxw=1000, src='YAHOO FINANCE, TREFIS', until='w:sells'),
 E('6.15b', SR, 26, at='6.15/w:sells', lines=[('AND IT SELLS ANTHROPIC', W, 'sells'), ('COMPUTING POWER TOO.', Y, 'computing')]),
 E('6.16', TB, 12, lines=[('AND THEY ARE', W, 'they'), ('NOT ALONE.', R, 'alone')], size=160),
 N('6.17', MO, 2, 'SOLD DIRECTLY, ALONGSIDE THE PUBLIC SALE', 'ABOUT $', 26, ' BILLION', Y, 'twenty-six', src='IPO COVERAGE', lines=[('TO A SMALL GROUP OF COMPANIES', W, 'small')]),
 E('6.18', BR, 5, dim=1, fx='names', src='PRESS REPORTS', anch={'a': 'microsoft', 'b': 'nvidia', 'c': 'alphabet', 'd': 'micron'}),
 E('6.20', CF, 9, lines=[('THEY SELL ANTHROPIC', W, 'sell'), ('ITS CHIPS AND COMPUTING', Y, 'chips')]),
 E('6.21', IM, 5, lines=[('THEY ARE BUYING SHARES', W, 'buying'), ('IN THEIR OWN CUSTOMER.', R, 'customer')]),
 E('6.22', TY, 0, label='FROM OUR FIRST VIDEO', lines=[('YOU HAVE SEEN', W, 'seen'), ('THIS LOOP BEFORE.', Y, 'loop')]),
 E('6.23', CA, 0, dim=1, fx='loop', anch={'a': 'circle', 'b': 'growth'}),
 E('6.24', BR, 9, lines=[('THE WINNERS DECIDED', W, 'winners'), ('YEARS AGO.', Y, 'years')], size=150),
 E('6.25', MO, 4, lines=[('PAID ON THE WAY IN.', W, 'in#2'), ('AND ON THE WAY OUT.', Y, 'out')]),
 # ---- 7. who is in charge
 E('7.0', AC, 9, lines=[('ONE MORE THING', W, 'one'), ('IN THE FILING', W, 'filing')], size=150),
 E('7.1', AU, 6, lines=[('WHO IS', W, 'who'), ('IN CHARGE?', Y, 'charge')], size=180),
 E('7.2', PT, 0, label='FROM LAST WEEK’S VIDEO', logo='nvidia', lines=[('NVIDIA’S FOUNDER:', W, 'founder'), ('NO SPECIAL SHARES.', R, 'special')], maxw=860, size=100),
 E('7.3', SS, 0, logo='anthropic', lines=[('ANTHROPIC IS', W, 'anthropic'), ('THE OPPOSITE.', Y, 'opposite')], size=160),
 E('7.4', AU, 12, dim=1, fx='votes', src='ANTHROPIC S-1  ·  CLASS F SHARES', anch={'a': 'thirteen', 'b': 'half'}, cuts=[('7.5', BR, 1)]),
 E('7.6', GC, 2, lines=[('AMAZON AND GOOGLE:', W, 'amazon'), ('NO VOTE AT ALL.', R, 'no')]),
 E('7.7', TS, 0, lines=[('AND THURSDAY’S BUYERS?', W, 'buying')]),
 N('7.8', TS, 4, 'SHARE OF THE COMPANY GOING TO IPO BUYERS', 'ABOUT ', 6, '%', Y, 'six', src='ANALYSIS OF THE S-1/A', dec=0),
 E('7.9', IM, 17, lines=[('A GOOD THING', W, 'good'), ('OR A BAD THING?', W, 'bad')], size=150),
 E('7.10', SF, 5, lines=[('IT IS THE DEAL.', Y, 'deal')], size=170),
 E('7.11', PL, 3, lines=[('IF YOU OWN THIS STOCK,', W, 'own'), ('YOU ARE A PASSENGER.', Y, 'passenger')]),
 # ---- 8. what history says
 E('8.0', TS, 5, lines=[('THE LAST FEW TIMES', W, 'last'), ('EVERYONE WANTED', W, 'whole'), ('THE SAME STOCK', Y, 'same')], cuts=[('w:whole', CR, 9)]),
 E('8.1', PH, 5, dim=1, fx='brand', logo='facebook', bname='FACEBOOK', year='2012'),
 E('8.2', CR, 12, tag='FACEBOOK  ·  2012', logo='facebook', lines=[('THE MOST ANTICIPATED', W, 'anticipated'), ('DEBUT OF ITS ERA', Y, 'debut')]),
 E('8.3', CA, 3, dim=1, tag='FACEBOOK  ·  2012', logo='facebook', fx='path', src='FACEBOOK SHARE PRICE HISTORY', anch={'a': 'thirty-eight', 'b': 'half', 'c': 'year'}, cuts=[('8.4', TB, 1), ('8.5', CA, 9)]),
 E('8.6', SK, 0, dim=1, fx='brand', logo='uber', bname='UBER', year='2019'),
 N('8.7', MO, 1, 'IPO PRICE', '$', 45, '', W, 'forty-five', tag='UBER  ·  2019', logo='uber', dec=0),
 E('8.8', TB, 16, tag='UBER  ·  2019', logo='uber', src='UBER SHARE PRICE HISTORY', lines=[('FELL ON DAY ONE.', R, 'fell'), ('BELOW $45 FOR MOST', W, 'spent'), ('OF THE NEXT 18 MONTHS', W, 'year')], cuts=[('w:spent', SK, 4)]),
 E('8.9', SS, 9, lines=[('BOTH WENT ON TO BE', W, 'both'), ('WORTH FAR MORE.', Y, 'far')]),
 E('8.10', PH, 1, logo='facebook', lines=[('NOW ONE OF THE MOST', W, 'most'), ('VALUABLE ON EARTH', Y, 'earth')]),
 E('8.11', OM, 0, lines=[('NOT BAD', W, 'bad'), ('BUSINESSES.', W, 'businesses')], size=160),
 E('8.12', BL, 2, label='THE LESSON', lines=[('DAY ONE IS USUALLY', W, 'first'), ('THE MOST EXPENSIVE DAY', R, 'expensive'), ('TO BE EXCITED.', W, 'excited')], cuts=[('w:most', TS, 13)]),
 E('8.13', IM, 9, lines=[('WHO DID BEST?', W, 'best'), ('NOT THE DEBUT BUYERS.', R, 'not')]),
 E('8.14', RC, 4, lines=[('THOSE WHO OWNED IT BEFORE.', W, 'before'), ('AND THOSE WHO WAITED.', Y, 'waited')], cuts=[('w:and', OM, 9)]),
 # ---- 9. your retirement account
 E('9.0', RC, 0, lines=[('WHAT DOES THIS', W, 'what'), ('MEAN FOR YOU?', Y, 'you')], size=160),
 E('9.1', AC, 11, lines=[('IT DEPENDS ON', W, 'depends'), ('WHICH FUND YOU OWN.', Y, 'fund')]),
 E('9.2', TS, 3, src='NASDAQ  ·  RULE CHANGE, MAY 2026', lines=[('NASDAQ CHANGED', W, 'nasdaq'), ('ITS RULES.', R, 'rules')], size=160),
 N('9.3', TB, 0, 'A GIANT NEWCOMER CAN NOW JOIN THE NASDAQ-100 AFTER', '', 15, ' TRADING DAYS', Y, 'fifteen', src='NASDAQ  ·  FAST-ENTRY RULE', dec=0),
 E('9.4', CL, 0, lines=[('BEFORE:', W, 'before'), ('AT LEAST 3 MONTHS', R, 'three')], size=150),
 E('9.5', TY, 2, label='REPORTED BY REUTERS', lines=[('LIKELY ADDED TO', W, 'likely'), ('SEVERAL MAJOR INDEXES', W, 'several'), ('WITHIN 5 TO 15 DAYS', Y, 'five')], cuts=[('w:within', CA, 13)]),
 E('9.6', IM, 3, lines=[('EVERY FUND TRACKING THEM', W, 'every'), ('HAS TO BUY.', R, 'has')]),
 E('9.7', OM, 3, lines=[('NO WAITING FOR', W, 'wait'), ('A BETTER PRICE.', Y, 'better')], size=150),
 N('9.8', MO, 0, 'INDEX FUNDS HAD TO BUY, WITHIN THREE WEEKS', 'ABOUT $', 14, ' BILLION', R, 'fourteen', src='ANALYST ESTIMATES, INCLUDING J.P. MORGAN', tag='SPACEX  ·  JUNE 2026', logo='spacex', dec=0, cuts=[('w:analysts', TB, 7)]),
 N('9.9', CR, 0, 'SHARE OF SPACEX THAT WAS ACTUALLY FOR SALE', 'ABOUT ', 5, '%', Y, 'five', src='ANALYST ESTIMATES', tag='SPACEX  ·  JUNE 2026', logo='spacex', dec=0),
 E('9.10', CL, 1, dim=1, fx='two', label='WILL YOUR FUND OWN ANTHROPIC BY YEAR-END?', src='INDEX PROVIDER RULES  ·  NOT YET CONFIRMED FOR ANTHROPIC', cuts=[('w:or', OM, 6), ('9.11', PB, 1)],
   L=['NASDAQ-100 OR TOTAL MARKET FUND', 'PROBABLY YES', Y], R_=['S&P 500 FUND', 'NO', R], anch={'a': 'probably', 'b': 'not'}),
 E('9.12', AC, 3, lines=[('THAT INDEX KEPT', W, 'kept'), ('ITS OLD RULES.', W, 'old')], size=150),
 E('9.13', SF, 2, src='S&P DOW JONES INDICES', lines=[('PUBLIC FOR 12 MONTHS.', W, 'twelve'), ('AND PROFITABLE.', Y, 'profitable')]),
 E('9.14', CL, 3, lines=[('EARLIEST IT COULD JOIN:', W, 'earliest'), ('LATE NEXT YEAR', R, 'late')]),
 E('9.15', RC, 5, lines=[('SAME COMPANY.', W, 'company')], size=160),
 E('9.16', RC, 5, merge=1, lines=[('SAME COMPANY.', W, '='), ('SAME WEEK.', W, 'week')], size=160),
 E('9.17', OM, 6, lines=[('TWO DIFFERENT OUTCOMES.', W, 'two'), ('A LINE IN YOUR STATEMENT', Y, 'line'), ('MOST PEOPLE NEVER READ', W, 'never')], cuts=[('w:depending', PB, 4)]),
 # ---- 10. three things to watch
 E('10.0', SK, 4, lines=[('THREE THINGS', W, 'what'), ('TO WATCH.', Y, 'watch')], size=170),
 E('10.1', BL, 0, fx='watch', num='1', first=1, lines=[('WEDNESDAY NIGHT’S PRICE', W, 'price')]),
 E('10.3', TB, 5, fx='watch', num='1', lines=[('TOP OF THE RANGE:', W, 'top'), ('DEMAND IS REAL.', Y, 'real')]),
 E('10.4', TB, 15, fx='watch', num='1', lines=[('BOTTOM OF THE RANGE:', W, 'bottom'), ('$2 TRILLION WAS THE PEAK.', R, 'peak')]),
 E('10.5', TS, 9, fx='watch', num='2', first=1, lines=[('THURSDAY’S CLOSE', W, 'closes')]),
 E('10.7', CA, 6, scrim=.5, fx='watch', num='2', lines=[('ABOVE $1.25 TRILLION:', W, 'above'), ('WORTH MORE THAN OPENAI', Y, 'more')]),
 E('10.8', CL, 2, fx='watch', num='3', first=1, lines=[('MID-DECEMBER', Y, 'mid')]),
 E('10.10', OM, 9, fx='watch', num='3', lines=[('THE INDEX DECISION.', W, 'index'), ('THEN THE FORCED BUYING.', R, 'forced')]),
 E('10.11', TS, 1, lines=[('THE PUBLIC IS FINALLY', W, 'public'), ('INVITED IN.', Y, 'invited')], size=150),
 E('10.12', BL, 6, lines=[('SOMETIMES THAT IS', W, 'sometimes'), ('THE BEGINNING.', Y, 'beginning')], size=150),
 E('10.13', TB, 2, lines=[('SOMETIMES IT IS', W, 'sometimes'), ('THE TOP.', R, 'top')], size=170),
 E('10.14', IM, 6, lines=[('THE BUILDERS AND THE GIANTS', W, 'built'), ('HAVE ALREADY BEEN PAID.', Y, 'paid')], cuts=[('w:and', GC, 3)]),
 E('10.15', RC, 2, fx='final', lines=[('ON THURSDAY,', W, 'thursday'), ('IT IS YOUR TURN', W, 'turn'), ('TO DECIDE WHAT IT IS WORTH.', Y, 'decide')]),
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
        if 'anch' in e: o['a'] = {k: -1 if a == '=' else round(word(sec, a, e['t0']), 3) for k, a in e['anch'].items()}
        ents.append(o)
        if not e.get('merge'): shots.append([max(0, e['t0'] - .1), e['clip'], e['ss'], e.get('dim', 0)])
        for k, clip, ss in e.get('cuts', []):
            t = word(sec, k[2:], e['t0']) if k.startswith('w:') else sent(k)['start']
            shots.append([t - .1, clip, ss, e.get('dim', 0)])
    shots.sort(key=lambda s: s[0])
    shots[0][0] = 0  # the first shot runs from the very first frame
    return ents, shots

if __name__ == '__main__':
    ents, shots = build()
    (V / 'plan.js').write_text('window.PLAN = ' + json.dumps({'entries': ents, 'cuts': [round(s[0], 3) for s in shots], 'total': TL['total']}) + ';\n')
    d = [round(b[0] - a[0], 2) for a, b in zip(shots, shots[1:])]
    print(len(ents), 'entries,', len(shots), 'shots; shortest', min(d), 'longest', max(d), 'mean', round(sum(d) / len(d), 2))
    print('long shots:', [(round(shots[i][0], 1), x) for i, x in enumerate(d) if x > 7])
