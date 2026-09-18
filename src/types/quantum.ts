export interface MarketBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spread: number;
  isConfirmed?: boolean;
}

export interface MacroFeedState {
  symbol: string;
  name: string;
  price: number;
  prevPrice: number;
  changePct: number;
  isValid: boolean;
  status: 'OK' | 'NA' | 'STALE' | 'BAD';
  staleCount: number;
  impactOnGold: 'BULL' | 'BEAR' | 'NEUTRAL';
  arrow: '▲▲' | '▲' | '▼▼' | '▼' | '≈' | '—';
}

export interface DualStructureState {
  activeResistance: number | null;
  activeSupport: number | null;
  swingActiveResistance: number | null;
  swingActiveSupport: number | null;
  bullBOS: boolean;
  bearBOS: boolean;
  chochActiveBull: boolean;
  chochActiveBear: boolean;
  mssActiveBull: boolean;
  mssActiveBear: boolean;
  structType: 'BOS' | 'CHoCH' | 'MSS' | 'none';
  structDirection: 'bull' | 'bear' | 'none';
  structAge: number;
  structActive: boolean;
  structInval: number | null;
  structPersistenceScore: number;
}

export interface SMCZoneState {
  id: string;
  type: 'FVG' | 'OB';
  direction: 'bull' | 'bear';
  high: number;
  low: number;
  barIndex: number;
  isMitigated: boolean;
  mitigationPct: number;
  isActive: boolean;
}

export interface LiquidityState {
  pdh: number | null;
  pdl: number | null;
  pwh: number | null;
  pwl: number | null;
  pmh: number | null;
  pml: number | null;
  cdh: number | null;
  cdl: number | null;
  eqh: number | null;
  eql: number | null;
  destLabel: string;
  destScore: number;
  destDist: number;
  destConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | '';
  reachProb: number;
  sweepBull: boolean;
  sweepBear: boolean;
  lastSweepQ: number;
  lastSweepGrade: 'INST' | 'STRONG' | 'MOD' | 'WEAK' | '';
  nearestAbove: { label: string; price: number } | null;
  nearestBelow: { label: string; price: number } | null;
}

export interface AuctionIntelligenceState {
  state: 'BALANCE' | 'TREND-AUC' | 'ROTATE' | 'DISCOVERY' | 'ACC-HI' | 'ACC-LO' | 'REJ-HI' | 'REJ-LO' | 'EXHAUST' | 'ACCUM' | 'DISTRIB';
  probability: number;
  cycle: string; // e.g. "①BAL", "⑤ACPT"
  discovery: string; // e.g. "DISC:CONF", "ROTATION"
  acceptanceScore: number;
  acceptanceGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  valueMigration: string; // "VAL⇈", "VAL↑", "VAL=", "VAL↓", "VAL⇊"
  openType: string; // "GAP-DRV", "O-DRV", "O-REJ", etc.
  bias: 'LONG-CONT' | 'LONG-REV' | 'SHORT-CONT' | 'SHORT-REV' | 'NO-TRADE' | 'WAIT';
}

export interface MarketRegimeState {
  name: 'ABNORMAL' | 'COMPRESS' | 'EXPANSION' | 'STRONG TR' | 'WEAK TR' | 'RANGE';
  volTag: 'HV' | 'NV' | 'LV';
  regimeCompositeRaw: number;
  regimeComposite: number;
  adxVal: number;
  atrPercentile: number;
  bbWidthPct: number;
  regSLMult: number;
  regBOSMult: number;
  regLiqMult: number;
  regHorizonMult: number;
  regSizeMult: number;
  regConfCap: number;
  effForecastBars: number;
}

export interface TradePlanState {
  isLong: boolean;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tpDist: number;
  slBasis: string;
  tp1Basis: string;
  tp2Basis: string;
  tp3Basis: string;
  rr1: number;
  rr2: number;
  rr3: number;
  pTP1: number | null;
  pTP2: number | null;
  pTP3: number | null;
  pSLhit: number | null;
  planExpectancy: number | null;
  planReason: string;
  lots: number;
  lotsBelowMin: boolean;
  riskUSD: number;
  costToTargetPct: number;
}

export interface EdgeCaseAssertion {
  id: string;
  group: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
  name: string;
  got: string;
  want: string;
  pass: boolean;
  classification: 'STAT' | 'NUM' | 'DESIGN' | 'PRES' | 'BUG';
  citation: string;
  note?: string;
}

export interface InstitutionalDecisionObject {
  signalId: string;
  timestamp: string;
  symbol: string;
  provider: string;
  bid: number;
  ask: number;
  mid: number;
  spread: number;
  timeframe: string;
  mtfAlignment: string;
  direction: 'BUY' | 'SELL' | 'NO TRADE' | 'WAIT' | 'WARMUP' | 'RISK LOCK';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  probability: number;
  probabilityConfidence: string;
  tradeQuality: number;
  tradeQualityGrade: string;
  expectancy: number;
  riskUsd: number;
  lots: number;
  rrRatio: string;
  trendState: string;
  structureState: string;
  liquidityState: string;
  auctionState: string;
  regimeState: string;
  sessionState: string;
  macroState: string;
  dataQuality: string;
  feedLatencyMs: number;
  schemaVersion: string;
  formulaVersion: string;
  decisionReason: string;
  vetoReason: string;
}
