export interface Meta {
  last_updated: string;          // ISO UTC
  starting_capital: number;
  current_equity: number;
  total_return_pct: number;      // 0.0523 = 5.23%
  spy_return_pct: number;
  alpha_pct: number;
  sharpe: number | null;
  max_drawdown_pct: number;      // negative number, e.g. -0.032
  trade_count: number;
  win_rate: number | null;       // 0..1
  regime: string;                // "trending" | "volatile" | "risk_off" | "unknown"
}

export interface EquityPoint {
  date: string;                  // YYYY-MM-DD
  equity: number;
  spy_equiv: number;             // SPY-only buy-and-hold normalised to same start cash
}

export interface Trade {
  id:           string;
  symbol:       string;
  action:       "BUY" | "SELL";
  entry_date:   string;
  entry_price:  number;
  exit_date:    string | null;
  exit_price:   number | null;
  size_usd:     number;
  pnl_usd:      number | null;
  pnl_pct:      number | null;
  exit_reason:  string | null;   // STOP_LOSS / TARGET_HIT / TRAILING_STOP / SCORE_DEGRADED / SWAP / OPEN
  regime:       string;
}

export interface Verdict {
  id:                       string;
  ticker:                   string;
  verdict_date:             string;          // ISO UTC
  article_summary:          string;
  research_score:           number;          // -10..+10
  confidence:               number;          // 0..10
  fact_summary:             string;
  adversary_summary:        string;
  arbitrator_recommendation: "BUY" | "HOLD" | "SELL" | "AVOID";
  outcome_7d_pct:           number | null;   // resolved 7-day forward return
  outcome_resolved:         boolean;
}
