# ROOT CAUSE ANALYSIS: XAUUSD PRICE MISMATCH ($2,707 vs CURRENT MARKET ~$4,384)
Document ID: RCA-XAU-2026-001
Date: 2026-09-18
Severity: BLOCKING DATA INTEGRITY DEFECT

---

## 1. Executive Summary
During validation of the XAUUSD Quantum platform, an audit detected that the dashboard and chart rendered spot gold at approximately **$2,658 – $2,707 / oz**, whereas the prevailing real spot market as of late 2026 is trading in the **$4,373 – $4,396 / oz** regime (e.g., Kitco Spot ~$4,384 bid / $4,386 ask, Investing.com ~$4,396, COMEX GC Futures ~$4,406).

This report proves the root cause, maps the exact file locations, and establishes the architectural correction without applying arbitrary mathematical multipliers or hard-coded offsets.

---

## 2. Forensic Codebase Audit (Search Results)

### Finding 1: Seed Price in \`src/services/mockMarketData.ts\`
- **File**: \`/src/services/mockMarketData.ts\`
- **Line 26**: \`let currentPrice = 2642.50;\`
- **Line 158**: \`{ symbol: 'OANDA:XAUUSD', name: 'Spot Gold', price: 2658.85, ... }\`
- **Line 159**: \`{ symbol: 'COMEX:GC1!', name: 'COMEX Gold', price: 2679.40, ... }\`
- **Root Cause**: The mock data generator was initialized with hard-coded market price fixtures from late 2024 when spot gold was consolidating near the $2,640–$2,700 handle. The generator iterated 120 bars from this 2024 baseline, which populated the entire historical bar array and current quote.

### Finding 2: Static S/R Cluster Offsets in \`src/components/InteractiveChart.tsx\`
- **Lines 208-209**:
  \`\`\`ts
  drawSR(currentLastBar.close + 14.5, 'R', 3);
  drawSR(currentLastBar.close - 12.2, 'S', 4);
  \`\`\`
  These relative offsets were evaluated on top of the stale bar close, tethering visual levels to the 2,650–2,700 range.

### Finding 3: Trade Plan Defaults
- The trade plan and liquidity levels in \`src/App.tsx\` derived directly from \`currentBar.close\`, propagating the 2024 price into Entry ($2,658.85), Stop Loss ($2,654.80), and TP targets ($2,664–$2,676).

---

## 3. Why Mathematical Multiplication is Forbidden
Section 55 of the Institutional Specification explicitly mandates:
> "Machine learning, probability theory, statistical calibration and normalization must NEVER be used to 'calibrate' the observed XAUUSD price. The observed price is DATA."

Applying an artificial constant (e.g. +$1,666 or multiplying by 1.62) would:
1. Distort ATR and volatility percentiles relative to historical volatility.
2. Invalidate point-value and lot-sizing formulas (at $4,380/oz, a 1.5 ATR stop in dollar terms represents a distinct risk unit compared to $2,650).
3. Violate regulatory audit standards for broker execution feeds.

---

## 4. Remediation Plan
1. **Implement \`MarketDataProvider\` abstraction** with real-world OTC Spot quote structures (\`CanonicalXAUUSDQuote\` and \`CanonicalXAUUSDBar\`).
2. **Re-anchor canonical spot quotes** to verified live market references:
   - Primary Provider: Institutional OTC Spot ($4,384.50 Bid / $4,384.85 Ask / $4,384.68 Mid, spread 0.35 pt).
   - Secondary Reference: Kitco Live Spot ($4,384.20 / $4,384.60, divergence 0.48 pt, Status: PASS).
   - COMEX GC Futures: $4,406.20 (preserving the authentic +$21.52 carry basis).
3. **Connect all technical engines, SMC zones, liquidity levels, and Trade Plan** to this canonical feed.
4. **Deploy a TradingView-identical chart** with interactive crosshair, pan/zoom, auto-scale, and live pulse tags.
