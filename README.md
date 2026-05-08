# bramhaTrading — Public Paper-Portfolio Dashboard

Live paper-trading transparency for bramhaTrading. Every trade and AI verdict, including the wrong ones, published hourly.

## Stack

- Next.js 15 (App Router) — static output
- Tailwind CSS
- Recharts for the equity curve
- Vercel for hosting (free Hobby tier, auto-deploys on push)

## Data flow

```
Mac mini (private)
  └── trading-agent runs Arya on Alpaca paper API
  └── Hourly cron: scripts/export_public_dashboard.py
        │ extracts trades + equity + POD verdicts from SQLite
        │ scrubs internal fields
        │ writes data/*.json in this repo
        │ git commit && git push
        ↓
GitHub: bramhaTrading/dashboard-public
        ↓ webhook
Vercel: auto-build + deploy
        ↓
paper.bramhatrading.com
```

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000
```

The page reads from `data/*.json`. With empty arrays you'll see the "no data yet" placeholders.

## JSON schema

See `lib/types.ts` for the canonical TypeScript types. The exporter (in `trading-agent`) writes:

- `data/meta.json` — single object with current equity, returns, regime, etc
- `data/equity_curve.json` — time series of `{date, equity, spy_equiv}`
- `data/trades.json` — full trade log with entry/exit/P&L/regime
- `data/verdicts.json` — every POD verdict with article summary, recommendation, 7-day outcome

## Deployment

Vercel deploys automatically on every push to `main`. No build secrets needed.

## What this is NOT

- Not financial advice
- Not real money — paper trading on Alpaca only
- Not a leaderboard — every losing trade and wrong verdict is preserved on purpose
