# Signal Scout

Add-on signal research for account managers selling LinkedIn Sales Navigator.
Load your book of accounts, get them ranked by add-on potential, and open any
account for a cited brief: open GTM roles, acquisitions, new subsidiaries,
funding, sales leadership changes, expansion and risk flags, plus a seat
whitespace estimate, talk track and email draft.

## Run it

```bash
cd signal-scout
npm install
npm start
```

Open http://localhost:3000. Without an API key the app runs in **demo mode**
with fictional sample accounts.

## Switch on live research

Set an Anthropic API key before starting the server:

```bash
export ANTHROPIC_API_KEY=your-key
npm start
```

Each account is then researched with live web search across the company's
careers page, newsroom and recent news. One lookup takes one to three minutes
and costs roughly a few tens of cents, depending on how much there is to read.
LinkedIn itself is never used as a source.

Optional settings: `PORT` (default 3000) and `SIGNAL_SCOUT_MODEL`
(default `claude-opus-5-5`).

## How scoring works

The model finds signals; `scoring.js` decides what they are worth, so the
ranking is explainable and the weights are easy to change:

| Signal | Max points |
|---|---|
| GTM hiring (10+ seat-eligible open roles = full) | 30 |
| Acquisition | 20 |
| Funding and growth | 15 |
| Sales leadership change | 15 |
| New subsidiary | 10 |
| New markets and products | 10 |
| Risk (layoffs, freezes) | up to -25 |

65+ is hot, 35 to 64 warm, below 35 cool. Suggested add-on seats come from
open roles that prospect or manage accounts.

## Sharing with the team

Accounts and research are stored on the server in `data/accounts.json`, so
everyone using the same deployment sees the same book. There is **no login**
yet: host it somewhere only your team can reach (VPN, internal network, or a
host with access control in front) until authentication is added.
