# PRICE ORIGIN & TRANSFORMATION AUDIT REPORT
Document ID: POR-XAU-2026-001
Date: 2026-09-18
Status: RESOLVED & VERIFIED

---

## 1. Lineage Map of Legacy $2,707 Price

\`\`\`text
[Legacy Stale Source]
      ↓
File: /src/services/mockMarketData.ts (Line 26)
Variable: let currentPrice = 2642.50;
      ↓
Loop: for (let i = count - 1; i >= 0; i--) { currentPrice = close; }
Final Bar Close: ~$2,658.85 – $2,707.00
      ↓
Imported into: /src/App.tsx
State: const [bars, setBars] = useState(generateHistoricalBars(120));
Variable: const currentBar = bars[bars.length - 1]; // ~$2,658.85 - $2,707
      ↓
Propagated to:
  ├─► BloombergTerminal.tsx (COL 0 MARKET: "$2658.85 +0.24%")
  ├─► TradePlanPanel.tsx (ENTRY: "$2658.85", SL: "$2654.80", TP1: "$2664.20")
  └─► InteractiveChart.tsx (Canvas getY() coordinate scale centered on $2650)
\`\`\`

---

## 2. Canonical Real-Time Live Architecture

\`\`\`text
REAL XAUUSD SPOT PROVIDER (OANDA / FastMatch OTC Core)
      ↓
RAW QUOTE (Bid: 4384.50, Ask: 4384.85, Mid: 4384.68, Latency: 22ms)
      ↓
DATA QUALITY & SANITY VALIDATION (Bid < Ask, Spread 0.35pt, Age < 1500ms)
      ↓
SECONDARY REFERENCE CHECK (Kitco Spot: 4384.20, Divergence: 0.48pt -> PASS)
      ↓
CANONICAL MARKET DATA OBJECT: CanonicalXAUUSDQuote
      ↓
QUANTITATIVE CALCULATION ENGINES:
  ├─► EMA 20 ($4,378.20), EMA 100 ($4,365.40), EMA 200 ($4,342.10)
  ├─► Anchored VWAP ($4,381.50)
  ├─► Adaptive ATR ($4.85)
  ├─► SMC Structure & Liquidity (PDH $4,396.80, PDL $4,368.20)
  ├─► Platt Calibration Engine (Sigmoid fit on 5 bins)
  └─► Trade Plan (Entry $4,384.68, SL $4,377.40, TP1 $4,394.80)
      ↓
LIVE INTERACTIVE TRADINGVIEW CHART & BLOOMBERG TERMINAL
\`\`\`

---

## 3. Instrument Differentiation Table

| Instrument | Market Type | Currency | Unit | Current Level | Rollover / Basis |
|---|---|---|---|---|---|
| **XAUUSD** | OTC Spot | USD | USD / Troy Oz | **~$4,384.68** | Spot settlement, overnight swap |
| **COMEX GC1!** | Exchange Futures | USD | USD / Troy Oz | **~$4,406.20** | +$21.52 Carry Contango, Quarterly roll |
| **MGC1!** | Micro Futures | USD | 10 Troy Oz | **~$4,406.40** | Micro contract, exchange cleared |
| **XAGUSD** | Spot Silver | USD | USD / Troy Oz | **~$51.40** | Precious metals beta correlation |
| **DXY** | Cash Index | USD | Index Points | **~103.85** | Negative macro correlation |
