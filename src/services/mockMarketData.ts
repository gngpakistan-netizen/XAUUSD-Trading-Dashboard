import { MarketBar, MacroFeedState } from '../types/quantum';

export interface IndicatorSnapshot {
  ema20: number;
  ema100: number;
  ema200: number;
  vwapD: number;
  vwapW: number;
  vwapM: number;
  bbUpper: number;
  bbLower: number;
  bbBasis: number;
  atr: number;
  adaptiveATR: number;
  adx: number;
  diPlus: number;
  diMinus: number;
  rsi: number;
  volPercentile: number;
  relVol: number;
}

export function generateHistoricalBars(count = 120): MarketBar[] {
  const bars: MarketBar[] = [];
  const now = Date.now();
  const barIntervalMs = 5 * 60 * 1000; // 5M bars
  let currentPrice = 2642.50;

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * barIntervalMs;
    // Market dynamics: trends and occasional consolidation
    const cycle = (count - i) / 15;
    const drift = Math.sin(cycle) * 1.8 + Math.cos(cycle * 0.4) * 0.9 + 0.15;
    const volatility = 2.2 + (Math.sin(i * 0.2) > 0.4 ? 2.5 : 0.8);
    
    const open = currentPrice;
    const close = open + drift + (Math.random() - 0.48) * volatility;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.8) + 0.3;
    const low = Math.min(open, close) - Math.random() * (volatility * 0.8) - 0.25;
    const volume = Math.floor(1200 + Math.random() * 2800 + (Math.abs(close - open) > 3.0 ? 3500 : 0));
    const spread = 0.22 + Math.random() * 0.08;

    currentPrice = close;
    bars.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      spread: Number(spread.toFixed(2)),
      isConfirmed: true,
    });
  }

  return bars;
}

export function computeIndicatorSnapshot(bars: MarketBar[]): IndicatorSnapshot {
  if (bars.length === 0) {
    return {
      ema20: 2650, ema100: 2645, ema200: 2638,
      vwapD: 2652, vwapW: 2640, vwapM: 2625,
      bbUpper: 2662, bbLower: 2642, bbBasis: 2652,
      atr: 3.2, adaptiveATR: 3.4, adx: 28.5, diPlus: 26.4, diMinus: 18.2, rsi: 58.4,
      volPercentile: 78, relVol: 1.35
    };
  }

  const closes = bars.map(b => b.close);
  const lastClose = closes[closes.length - 1];

  // EMA calculations
  const calcEma = (period: number) => {
    const k = 2 / (period + 1);
    let ema = closes[0];
    for (let i = 1; i < closes.length; i++) {
      ema = closes[i] * k + ema * (1 - k);
    }
    return ema;
  };

  const ema20 = calcEma(Math.min(20, closes.length));
  const ema100 = calcEma(Math.min(100, closes.length));
  const ema200 = calcEma(Math.min(200, closes.length));

  // Bollinger Bands 20, 2
  const bbSlice = closes.slice(-20);
  const bbBasis = bbSlice.reduce((a, b) => a + b, 0) / bbSlice.length;
  const variance = bbSlice.reduce((sum, val) => sum + Math.pow(val - bbBasis, 2), 0) / bbSlice.length;
  const stdDev = Math.sqrt(variance);
  const bbUpper = bbBasis + 2 * stdDev;
  const bbLower = bbBasis - 2 * stdDev;

  // ATR 14
  let trSum = 0;
  for (let i = Math.max(1, bars.length - 14); i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trSum += tr;
  }
  const atr = trSum / 14;

  // Anchored VWAP approximation
  let cumVolPrice = 0;
  let cumVol = 0;
  for (let i = Math.max(0, bars.length - 60); i < bars.length; i++) {
    const hlc3 = (bars[i].high + bars[i].low + bars[i].close) / 3;
    cumVolPrice += hlc3 * bars[i].volume;
    cumVol += bars[i].volume;
  }
  const vwapD = cumVol > 0 ? cumVolPrice / cumVol : lastClose;
  const vwapW = vwapD - 5.4;
  const vwapM = vwapD - 16.8;

  const adx = 29.4;
  const adaptiveATR = atr * 1.15;

  return {
    ema20: Number(ema20.toFixed(2)),
    ema100: Number(ema100.toFixed(2)),
    ema200: Number(ema200.toFixed(2)),
    vwapD: Number(vwapD.toFixed(2)),
    vwapW: Number(vwapW.toFixed(2)),
    vwapM: Number(vwapM.toFixed(2)),
    bbUpper: Number(bbUpper.toFixed(2)),
    bbLower: Number(bbLower.toFixed(2)),
    bbBasis: Number(bbBasis.toFixed(2)),
    atr: Number(atr.toFixed(2)),
    adaptiveATR: Number(adaptiveATR.toFixed(2)),
    adx,
    diPlus: 27.2,
    diMinus: 17.5,
    rsi: 61.2,
    volPercentile: 74,
    relVol: 1.28
  };
}

export const INITIAL_MACRO_FEEDS: MacroFeedState[] = [
  { symbol: 'OANDA:XAUUSD', name: 'Spot Gold', price: 2658.85, prevPrice: 2652.40, changePct: 0.24, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲▲' },
  { symbol: 'COMEX:GC1!', name: 'COMEX Gold (10m lag absorbed)', price: 2679.40, prevPrice: 2673.10, changePct: 0.23, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲▲' },
  { symbol: 'TVC:DXY', name: 'US Dollar Index', price: 103.85, prevPrice: 104.12, changePct: -0.26, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲' },
  { symbol: 'TVC:US10Y', name: 'US 10Y Yield', price: 4.218, prevPrice: 4.245, changePct: -0.64, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲' },
  { symbol: 'TVC:US02Y', name: 'US 02Y Yield', price: 3.965, prevPrice: 3.990, changePct: -0.63, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'NEUTRAL', arrow: '≈' },
  { symbol: 'OANDA:EURUSD', name: 'EUR/USD', price: 1.0872, prevPrice: 1.0845, changePct: 0.25, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲' },
  { symbol: 'OANDA:XAGUSD', name: 'Silver Spot', price: 31.94, prevPrice: 31.62, changePct: 1.01, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲▲' },
  { symbol: 'SP:SPX', name: 'S&P 500', price: 5872.4, prevPrice: 5855.1, changePct: 0.30, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲' },
  { symbol: 'TVC:VIX', name: 'Volatility Index', price: 14.72, prevPrice: 15.10, changePct: -2.52, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲' },
  { symbol: 'COMEX:GC1!_OI', name: 'Gold Open Interest (Daily)', price: 486240, prevPrice: 479100, changePct: 1.49, isValid: true, status: 'OK', staleCount: 0, impactOnGold: 'BULL', arrow: '▲' },
];
