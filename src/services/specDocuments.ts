export interface SpecDoc {
  id: string;
  filename: string;
  title: string;
  category: 'Architecture' | 'Data' | 'Quant & ML' | 'Testing & Parity' | 'Operations';
  summary: string;
  content: string;
}

export const SPEC_DOCS: SpecDoc[] = [
  {
    id: 'doc-1',
    filename: 'QUANTUM_INSTITUTIONAL_ARCHITECTURE.md',
    title: '1. Institutional System Architecture',
    category: 'Architecture',
    summary: 'High-level cloud-native multi-tier architecture transitioning from Pine Script prototypes to Python/PostgreSQL quantitative engine.',
    content: `# QUANTUM INSTITUTIONAL ARCHITECTURE
Version: 7.2-Python / Release: Institutional Target

## 1. System Topology
The platform operates as a decoupled 5-tier quantitative architecture:
1. **Tier 1: Data Ingestion Layer (Feed Aggregator)**
   - Spot XAUUSD (Tick-by-tick bid/ask, OTC quotes, session timestamps).
   - Exchange Futures (COMEX GC / MGC, Centralized volume, Daily Open Interest).
   - Cross-Asset Macro (TVC:DXY, TVC:US10Y, TVC:US02Y, OANDA:EURUSD, OANDA:XAGUSD, SP:SPX, TVC:VIX).
   - Sentiment & Macroeconomic (CFTC Weekly COT 088691, High-impact economic calendar events).

2. **Tier 2: Data Quality & Normalization Barrier**
   - Point-in-time timestamp alignment (strict rejection of lookahead).
   - Arbitrage & Feed sanity checks (Bid < Ask, non-negative spreads, 5% futures basis guard).
   - Universal source status tagging (0: OK, 1: NA, 2: STALE, 3: BAD).

3. **Tier 3: Quantitative Calculation Core (Python / Rust)**
   - Dual Market Structure Engine (Internal fast pivots vs Swing major pivots).
   - Smart Money Concepts (FVG with delayed mitigation lifecycle, Order Blocks with displacement hysteresis).
   - Auction Market Theory (8 discrete states, 7-stage cycle, acceptance grading, value migration).
   - Macro Evidence & Correlation (Bonferroni-corrected 18-test t-distribution significance).
   - Statistical Calibration & Analog Engine (Platt WLS sigmoid, Wilson lower-bound Kelly).

4. **Tier 4: State Persistence & Cache (PostgreSQL / Redis)**
   - Time-series bar storage (1M, 5M, 15M, 1H, 4H, 1D).
   - Ring-buffer analog archive (O(1) incremental census).
   - Decision audit trail with full lineage.

5. **Tier 5: Presentation & Execution Interface**
   - Real-time Bloomberg-style Terminal Dashboard (9 columns x 4 rows).
   - Interactive high-density chart with collision-aware tag registry.
   - Dynamic Trade Plan with structural SL, liquidity-first TPs, and MT5 offset correction.`
  },
  {
    id: 'doc-2',
    filename: 'QUANTUM_FEATURE_INVENTORY.md',
    title: '2. Complete Feature Inventory & Traceability',
    category: 'Architecture',
    summary: 'Comprehensive inventory of all 99 audited modules, inputs, indicators, and historical fixes inherited from Quantum 5.0 / Q7.2.',
    content: `# QUANTUM COMPLETE FEATURE INVENTORY
Mapped from Pine Script Q7.2 Master and §16 Edge-Case Harness v6.

| Feature ID | Name | Source | Status | Description |
|---|---|---|---|---|
| F-001 | Session Quality Polarity Fix | Master L1868 | ACTIVE | Made evSessionBull/Bear direction-neutral (0.65x) to prevent false directional bias. |
| F-002 | Lot Sizing Floor Clamp | Master L3400 | ACTIVE | Realized risk treated as ceiling via floor clamp; '<min' sentinel for lots < 0.01. |
| F-004 | NY Rollover Wrap Strict Inequality | Master L480 | ACTIVE | Strict '<' prevents duplicate reset on 2H (EST) and 3H (EDT) midnight bars. |
| F-006 | Block-Reason Telemetry | Master L2550 | ACTIVE | Surfaces why DECISION is WAIT instead of showing ambiguous idle state. |
| F-007 | Analog Evidence Base Readout | Master L3100 | ACTIVE | Displays oMatch count, win rate, and ROLL samples on chart. |
| F-008 | Restored Analytics Wiring | Master L3150 | ACTIVE | Re-wired PDH1st%, MAE in ATR, and BOS continuation rate. |
| F-009 | Weighted Analog Accumulators | Master L3200 | ACTIVE | Weighted similarity sums used for ratios while raw counts govern gates. |
| F-010 | Multi-source Degradation Guard | Master L3280 | ACTIVE | Missing analog lookback skips candidate rather than fabricating 1.0 similarity. |
| F-012 | Trend Threshold Strict Inequality | Master L210 | ACTIVE | Minval raised to 51 to ensure BUY/SELL mutual exclusivity (2T > 100). |
| F-014 | MT5 Price Offset Display | Master L230 | ACTIVE | Shifts displayed Entry/SL/TP to match MT5 broker feed without altering math. |
| F-016 | TP Ladder Basis Fallback Label | Master L2900 | ACTIVE | Explicitly labels fallback rungs as '+1R' instead of deceptive '3R'. |
| F-019 | TP Max Distance Cap | Master L2850 | ACTIVE | Caps TP candidates at 12R to prevent absurd targets from monthly VWAP. |
| F-021 | Unrounded Regime Thresholding | Master L1870 | ACTIVE | Category tested on raw float [40, 70] to eliminate the 39.5/69.5 rounding bug. |
| F-033 | IANA America/New_York Anchor | Master L460 | ACTIVE | Explicit TZ lookup decouples daily reset from broker server exchange zone. |
| F-036 | OOS Effective Sample Read Order | Master L3380 | ACTIVE | Reorders assignment before derivation to fix permanent 0eff warmup lockup. |
| F-037 | Rolling Population Nomenclature | Master L3420 | ACTIVE | Relabels sliding holdout as 'ROLL' to maintain honest statistical disclosure. |
| F-A02 | Calibrated-Probability Entry Gate | Master L2600 | ACTIVE | Directly gates trades on Platt-calibrated P >= 0.50 in trade direction. |
| F-A08 | Displacement Engine Parity | Visuals L120 | ACTIVE | Mirrors Master's 2.5x enter / 1.5x hold hysteresis and onset trigger. |
| F-A10 | Realized R-Unit Cost Accounting | Master L3320 | ACTIVE | Divides cost by R-unit in points; penalizes timed-out trades appropriately.`
  },
  {
    id: 'doc-3',
    filename: 'FORMULA_REGISTRY.md',
    title: '3. Mathematical Formula Registry',
    category: 'Quant & ML',
    summary: 'Exact formal equations for all quantitative indicators, probability mappings, and risk metrics.',
    content: `# FORMULA REGISTRY
Mathematical definitions governing the Quantum engine.

### FORM-001: Division Safety
\`\`\`
safeDiv(a, b) = (a != NaN and b != NaN and |b| > 1e-10) ? (a / b) : 0.0
\`\`\`

### FORM-002: Bayesian Win Rate (Laplace Smoothing)
\`\`\`
bayesRate(w, t) = (t > 0) ? (w + 1) / (t + 2) : 0.5
\`\`\`

### FORM-003: Cornish-Fisher Expansion Z-Score
\`\`\`
Z_cf = Z + (Z^2 - 1)*S/6 + (Z^3 - 3*Z)*K/24 - (2*Z^3 - 5*Z)*S^2/36
Where S = clamp(skew, -1.0, 1.0), K = clamp(kurt, -1.0, 3.0)
\`\`\`

### FORM-004: Platt-Weighted Least Squares Logistic Fit
\`\`\`
P(win | score) = 1 / (1 + exp(-((score - 50.0) * k + b)))
Where k = clamp(slope, 0.02, 0.25), b = clamp(intercept, -1.0, 1.0)
Output clamped: clamp(P, 0.05, 0.95)
\`\`\`

### FORM-005: Wilson 95% Lower Bound on Effective Sample
\`\`\`
N_eff = N_oos / OUTCOME_N
Denom = 1 + (1.96^2) / N_eff
Center = (p_hat + (1.96^2) / (2 * N_eff)) / Denom
HalfWidth = 1.96 * sqrt(p_hat * (1 - p_hat) / N_eff + (1.96^2) / (4 * N_eff^2)) / Denom
p_wilson = max(Center - HalfWidth, 0.01)
\`\`\`

### FORM-006: Fractional Kelly Sizing
\`\`\`
b = avgWin / max(|avgLoss|, 0.01)
f_star = (p_wilson * b - (1 - p_wilson)) / b
f_half = max(0.0, f_star * 0.5) * skewHaircut * kurtHaircut * maxDdHaircut
\`\`\`

### FORM-007: Analog State Similarity Distance
\`\`\`
D = sum_i(w_i * |feature_current_i - feature_historical_i|) / 100.0
Similarity = (1.0 - clamp(D, 0.0, 1.0)) * (0.997 ^ barDistance)
\`\`\``
  },
  {
    id: 'doc-4',
    filename: 'DATA_DICTIONARY.md',
    title: '4. Canonical Data Dictionary',
    category: 'Data',
    summary: 'Standardized nomenclature, units, and ranges for all state features and variables.',
    content: `# DATA DICTIONARY

| Name | Type | Units | Range | Description |
|---|---|---|---|---|
| close | float | USD / oz | > 0 | Current spot gold price. |
| adaptiveATR | float | USD points | [0.4, inf) | Volatility-regime blended Average True Range. |
| atrPercentile | float | Percentile | [0, 100] | 50-bar rolling percent rank of ATR. |
| adxVal | float | Index | [0, 100] | 14-period Average Directional Index. |
| bullScore | float | Score | [5, 95] | Multi-factor evidence score for bullish scenario. |
| bearScore | float | Score | [5, 95] | Multi-factor evidence score for bearish scenario. |
| rangeScore | float | Score | [0, 90] | Evidence score for range-bound chop condition. |
| mktRegime | string | Enum | 6 states | ABNORMAL, COMPRESS, EXPANSION, STRONG TR, WEAK TR, RANGE. |
| aucState | string | Enum | 8 states | BALANCE, TREND-AUC, ROTATE, DISC, ACC-HI/LO, REJ-HI/LO, EXHAUST, ACC/DIST. |
| tradeQuality | int | Score | [0, 100] | Trade Quality Score (TQ) conditioned on trade direction. |
| _calibratedProb | float | Probability | [0.05, 0.95] | Platt-calibrated probability of TP1 reached before SL. |
| tpDist | float | USD points | [0.5*ATR, 5.0*ATR] | R-unit risk distance between Entry and SL. |
| lots | float | Contracts | [0.01, 100.0] | Conservative floor-clamped MT5 position size.`
  },
  {
    id: 'doc-5',
    filename: 'ENGINE_DEPENDENCY_GRAPH.md',
    title: '5. Engine Dependency & Computation Graph',
    category: 'Architecture',
    summary: 'Directed Acyclic Graph (DAG) detailing strict execution order and preventing circular dependencies.',
    content: `# ENGINE DEPENDENCY GRAPH (DAG)

\`\`\`text
Raw Market Feeds (Spot XAU, COMEX GC, DXY, US10Y, SPX)
  │
  ├─► Data Validation & Integrity Gates (gcValid, oiValid, dxyValid)
  │     │
  │     ├─► Core Indicators (EMA 20/100/200, VWAP, BB, ATR, ADX)
  │     │     │
  │     │     ├─► Regime Engine (Percentiles -> ABNORMAL, COMPRESS, EXPANSION)
  │     │     │     │
  │     │     │     ├─► Dual Structure & SMC (Pivots, BOS, CHoCH, MSS, OB, FVG)
  │     │     │     │     │
  │     │     │     │     ├─► Liquidity Engine (PDH/PDL, Pools, Sweeps, Ranking)
  │     │     │     │     │     │
  │     │     │     │     │     ├─► Auction Intelligence (AMT 8-States, Acceptance)
  │     │     │     │     │     │     │
  │     │     │     │     │     │     ├─► Macro Vote & Bonferroni Correlation
  │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     ▼
  │     │     │     │     │     │     │   Evidence Fusion (bullScore, bearScore, rangeScore)
  │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     ├─► Analog Matching & MFE/MAE Excursion
  │     │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     │     ├─► Platt WLS Calibration (_calibratedProb)
  │     │     │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     │     │     ├─► Trade Quality (TQ Score 0-100)
  │     │     │     │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     │     │     │     ├─► Dynamic Trade Plan (SL, TP1-3, Lots)
  │     │     │     │     │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     │     │     │     │     ├─► Risk Account Controls (Day Loss, Locks)
  │     │     │     │     │     │     │     │     │     │     │     │     │
  │     │     │     │     │     │     │     │     │     │     │     │     ▼
  ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼   FINAL DECISION (BUY/SELL/WAIT/NO TRADE)
\`\`\``
  },
  {
    id: 'doc-6',
    filename: 'DATABASE_SCHEMA.md',
    title: '6. PostgreSQL & TimescaleDB Database Schema',
    category: 'Data',
    summary: 'Relational and time-series table schemas with indexing, foreign keys, and auditing tables.',
    content: `# DATABASE SCHEMA SPECIFICATION

\`\`\`sql
-- Instruments Table
CREATE TABLE instruments (
    id VARCHAR(32) PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL,
    asset_class VARCHAR(16) NOT NULL,
    tick_size NUMERIC(10, 5) NOT NULL,
    point_value NUMERIC(10, 2) NOT NULL
);

-- Real-time Market Quotes
CREATE TABLE market_quotes (
    id BIGSERIAL PRIMARY KEY,
    instrument_id VARCHAR(32) REFERENCES instruments(id),
    bid NUMERIC(12, 4) NOT NULL,
    ask NUMERIC(12, 4) NOT NULL,
    spread NUMERIC(8, 4) GENERATED ALWAYS AS (ask - bid) STORED,
    provider_timestamp TIMESTAMPTZ NOT NULL,
    received_timestamp TIMESTAMPTZ DEFAULT NOW(),
    data_status SMALLINT NOT NULL DEFAULT 0
);

-- OHLCV Aggregated Bars
CREATE TABLE market_bars (
    instrument_id VARCHAR(32) REFERENCES instruments(id),
    timeframe VARCHAR(8) NOT NULL,
    bar_start TIMESTAMPTZ NOT NULL,
    open NUMERIC(12, 4) NOT NULL,
    high NUMERIC(12, 4) NOT NULL,
    low NUMERIC(12, 4) NOT NULL,
    close NUMERIC(12, 4) NOT NULL,
    volume NUMERIC(16, 2) NOT NULL,
    PRIMARY KEY (instrument_id, timeframe, bar_start)
);

-- Historical Analogs & Out-Of-Sample Ring Buffer
CREATE TABLE analog_outcomes (
    id BIGSERIAL PRIMARY KEY,
    bar_start TIMESTAMPTZ NOT NULL,
    adx_cat SMALLINT NOT NULL,
    atr_cat SMALLINT NOT NULL,
    regime SMALLINT NOT NULL,
    bull_score NUMERIC(5, 2) NOT NULL,
    realized_outcome SMALLINT NOT NULL, -- +1 Win, -1 Loss, 0 Timeout
    realized_r NUMERIC(8, 4) NOT NULL,
    r_unit_points NUMERIC(8, 4) NOT NULL,
    schema_version SMALLINT NOT NULL DEFAULT 2
);

-- Institutional Trade Decisions
CREATE TABLE trade_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    direction VARCHAR(16) NOT NULL,
    entry_price NUMERIC(12, 4) NOT NULL,
    sl_price NUMERIC(12, 4) NOT NULL,
    tp1_price NUMERIC(12, 4) NOT NULL,
    tp2_price NUMERIC(12, 4) NOT NULL,
    tp3_price NUMERIC(12, 4) NOT NULL,
    trade_quality INT NOT NULL,
    calibrated_prob NUMERIC(5, 4),
    risk_lots NUMERIC(8, 2) NOT NULL,
    why_chain JSONB NOT NULL
);
\`\`\``
  },
  {
    id: 'doc-7',
    filename: 'DATA_PROVIDER_SPECIFICATION.md',
    title: '7. Real Data Provider & Fallback Specification',
    category: 'Data',
    summary: 'API connection contracts for OTC spot metals, COMEX futures, and economic calendars.',
    content: `# DATA PROVIDER SPECIFICATION
Absolute Prohibition: NO ARTIFICIAL PRICE CREATION.

## 1. Primary Feeds
1. **Spot Gold (XAUUSD)**: Direct FIX/REST from OANDA, Interactive Brokers, or FastMatch.
2. **Exchange Futures (GC)**: CME Market Data feed with confirmed closed bar lag [1] to safely absorb 10-min delayed tier.
3. **Macro Series**: Federal Reserve FRED (Real yields), CBOE (VIX), US Treasury (Yield curve).
4. **Economic News**: DailyFX / ForexFactory / Bloomberg Calendar API.

## 2. Universal Data Status Codes
- \`0 = VALID\`: Feed authenticated, latency < 1500ms, bid < ask, price deviation < 5% vs median.
- \`1 = UNAVAILABLE\`: Feed disconnected, socket silent, symbol unmapped.
- \`2 = STALE\`: Timestamp > 3 bars behind expected arrival.
- \`3 = INVALID\`: Crossed quotes (bid >= ask), zero volume in active session, anomalous spike > 10x ATR.`
  },
  {
    id: 'doc-8',
    filename: 'PROBABILITY_CALIBRATION_SPECIFICATION.md',
    title: '8. Probability Calibration & Scoring Engine',
    category: 'Quant & ML',
    summary: 'Platt scaling, Murphy Brier decomposition, ECE verification, and Wilson Lower Bound derivation.',
    content: `# PROBABILITY CALIBRATION SPECIFICATION
Scores are NOT probabilities. Calibrated probabilities must reflect empirical event frequency.

## 1. Two-Stage Pipeline
1. **Evidence Accumulator**: Sum of 8 weighted evidence streams (Trend, Structure, Flow, Macro, Liquidity, Session, Correlation, Mean Reversion) generates raw score [5, 95].
2. **Platt Logistic Scaling**:
   \`\`\`
   P(TP1 before SL) = 1 / (1 + exp(-((score - 50.0) * k + b)))
   \`\`\`
   Parameters $k$ and $b$ are continuously fitted via Weighted Least Squares across 5 calibration bins ($c0..c4$), requiring:
   - At least 3 populated bins with $N \ge 30$.
   - Strictly positive slope $k > 0$.
   - Minimum variance threshold $\sigma^2 > 10^{-6}$.

## 2. Murphy Brier Score Decomposition
\`\`\`
Brier Score = Uncertainty + Reliability - Resolution
\`\`\`
Where:
- **Uncertainty**: $\bar{o}(1 - \bar{o})$
- **Reliability**: $\sum_k \frac{n_k}{N} (p_k - \bar{o}_k)^2$ (Calibration Error)
- **Resolution**: $\sum_k \frac{n_k}{N} (\bar{o}_k - \bar{o})^2$ (Ability to separate winners from losers)`
  },
  {
    id: 'doc-9',
    filename: 'BACKTEST_WALK_FORWARD_SPECIFICATION.md',
    title: '9. Walk-Forward Backtesting & Purged K-Fold',
    category: 'Testing & Parity',
    summary: 'Embargo handling, overlap penalty, transaction cost derivation, and Strategy A/B twins.',
    content: `# BACKTEST & WALK-FORWARD SPECIFICATION

## 1. Overlap Penalty & Effective Sample Size
When testing holding periods of $H = \text{OUTCOME\_N}$ bars, outcomes overlap across consecutive bars.
\`\`\`
N_eff \approx \frac{N_{raw}}{OUTCOME\_N}
\`\`\`
Wilson lower bounds and Sharpe significance tests MUST use $N_{eff}$.

## 2. Purged & Embargoed Cross-Validation
- **Purging**: Remove training bars whose forward outcome window enters the test fold.
- **Embargo**: Discard records within $\text{OUTCOME\_N}$ bars AFTER test fold to eliminate post-test autocorrelation spillover.

## 3. Pinned Cost Model Parity
- Gold spot is quoted per Troy Ounce (1 oz = 1 contract base unit).
- Point value: $100 per lot = 100 oz per lot.
- Commission: $7.00 per lot round-turn = $0.035 per ounce per side.
- Slippage + Spread: Folded into 35 ticks at 0.01 precision.`
  },
  {
    id: 'doc-10',
    filename: 'PINE_PYTHON_PARITY_SPECIFICATION.md',
    title: '10. Pine Script to Python Parity Matrix',
    category: 'Testing & Parity',
    summary: 'Line-by-line verification guidelines to ensure mathematical identity with Quantum Master Q7.2.',
    content: `# PINE SCRIPT TO PYTHON PARITY MATRIX

| Pine Construct | Python / TypeScript Replacement | Parity Verification Test |
|---|---|---|
| \`safeDiv(a, b)\` | \`abs(b) > 1e-10 ? a / b : 0.0\` | Group I: assertion I6, I7, I8 |
| \`math.round(x)\` | Half away from zero rounder | Group A: assertion A8, A9, A10 |
| \`int(x)\` | Truncate toward zero | Group A: assertion A11, A12 |
| \`ta.ema(src, len)\` | Exponential Moving Average ($\alpha = 2/(len+1)$) | Tolerance $< 10^{-6}$ USD |
| \`ta.vwap(hlc3)\` | Volume-weighted cumulative price reset at session | Exact dollar match to 0.01 |
| \`request.security(..., [1])\` | Lag-1 closed-bar extractor | Zero lookahead verified |
| \`regimeCat(raw)\` | Strict unrounded float test | Group A: assertion A1 to A7 |
| \`race(lo, hi, ent, R)\` | SL-tested-first conservative barrier | Group B: assertion B1 to B6 |
| \`macroNeed(gc)\` | \`ceil((6 + gc)/2.0)\` | Group J: assertion J1, J2 |`
  },
  {
    id: 'doc-11',
    filename: 'LIVE_DATA_SPECIFICATION.md',
    title: '11. Live Feed Streaming & WebSocket Engine',
    category: 'Data',
    summary: 'WebSocket subscription lifecycle, heartbeats, reconnect backoff, and data degradation states.',
    content: `# LIVE DATA STREAMING SPECIFICATION

## 1. Ingestion Protocol
- Async WebSocket client with JSON-RPC or binary Protobuf protocol.
- Sub-second tick aggregation into 5-second synthetic buckets, flushed to confirmed 5M bars.
- Health monitor checking ping interval every 5000ms.

## 2. Degraded Mode Triggers
1. Disconnect duration > 30 seconds -> Trigger \`SYSTEM_STATE: DEGRADED\`.
2. Spread > 3.0x normal session average -> Trigger \`SPREAD_EXPANSION_VETO\`.
3. Out-of-order sequence ID -> Flush local buffer and query snapshot REST endpoint.`
  },
  {
    id: 'doc-12',
    filename: 'DASHBOARD_SPECIFICATION.md',
    title: '12. Bloomberg Terminal Dashboard Layout',
    category: 'Operations',
    summary: '9-column grid cell mapping, color hierarchy, responsive breakpoints, and mobile reduction.',
    content: `# DASHBOARD LAYOUT SPECIFICATION

## 1. 9-Column Architecture
- **COL 0 (MARKET)**: Live price, % change, session classification, CVD delta, volume EWMA anomaly.
- **COL 1 (BIAS)**: Multi-timeframe trend stack (5M, 15M, 1H, 4H, 1D), counter-trend indicators.
- **COL 2 (SIGNAL)**: Directional probabilities (Long %, Short %, Range %), evidence breakdown.
- **COL 3 (STRUCTURE)**: Internal BOS, Swing BOS, CHoCH, MSS, structure window age.
- **COL 4 (LIQUIDITY)**: PDH, PDL, PWH, PWL, PMH, PML, destination ranking score.
- **COL 5 (PRICE)**: Daily VWAP, EMA 200, Value Area position (above/inside/below).
- **COL 6 (MACRO)**: DXY, US10Y, TIPS, EURUSD, XAGUSD, SPX, Bonferroni correlation health.
- **COL 7 (RISK)**: Target RR, ATR stop distance, Kelly sizing %, dollar risk, MaxDD circuit.
- **COL 8 (DECISION)**: Final action (BUY, SELL, WAIT, NO TRADE, WARMUP, RISK LOCK).`
  },
  {
    id: 'doc-13',
    filename: 'TESTING_SPECIFICATION.md',
    title: '13. Comprehensive Automated Testing Suite',
    category: 'Testing & Parity',
    summary: 'Unit, integration, regression, and adversarial test definitions.',
    content: `# TESTING SUITE SPECIFICATION

## 1. Test Tiers
1. **§16 Harness Test Runner**: 73 deterministic adversarial tests executed on every build.
2. **Mathematical Invariant Tests**: Verify that bullScore + bearScore + rangeScore === 100.
3. **Monotonicity Tests**: Verify that higher evidence scores strictly yield non-decreasing probabilities.
4. **Data Isolation Tests**: Assert that test folds contain zero future timestamps.`
  },
  {
    id: 'doc-14',
    filename: 'SECURITY_SPECIFICATION.md',
    title: '14. Security, Secrets, and API Key Protection',
    category: 'Operations',
    summary: 'Rules for secret isolation, server-side proxies, and zero client exposure.',
    content: `# SECURITY & SECRETS SPECIFICATION

## 1. Zero Client Key Exposure
- Broker credentials and private data feed keys MUST reside in server-side environment variables.
- The web browser client receives only sanitized market quotes and aggregated model signals.
- All outbound trading commands execute through authenticated backend proxy endpoints.`
  },
  {
    id: 'doc-15',
    filename: 'DEPLOYMENT_SPECIFICATION.md',
    title: '15. Production Deployment & Cloud Run Pipeline',
    category: 'Operations',
    summary: 'Container build specifications, port 3000 reverse proxy routing, and release checks.',
    content: `# DEPLOYMENT SPECIFICATION

## 1. Runtime Environment
- Platform: Google Cloud Run container behind Nginx reverse proxy.
- Port: Hardcoded 3000 (0.0.0.0:3000).
- Production command: Node.js server bundle serving Vite compiled static distribution.
- Readiness probe: \`/api/health\` endpoint returning HTTP 200 with database connectivity status.`
  }
];
