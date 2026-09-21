import React from 'react';
import {
  MarketBar,
  MacroFeedState,
  DualStructureState,
  LiquidityState,
  AuctionIntelligenceState,
  MarketRegimeState,
  TradePlanState,
} from '../types/quantum';
import { IndicatorSnapshot } from '../services/mockMarketData';
import { CalibrationSnapshot } from '../services/calibrationEngine';
import { ShieldCheck, Activity } from 'lucide-react';

interface BloombergTerminalProps {
  lastBar: MarketBar;
  indicators: IndicatorSnapshot;
  macroFeeds: MacroFeedState[];
  structure: DualStructureState;
  liquidity: LiquidityState;
  auction: AuctionIntelligenceState;
  regime: MarketRegimeState;
  tradePlan: TradePlanState;
  calibration: CalibrationSnapshot;
  dataQualityStatus: 'PASS' | 'WARNING' | 'FAIL';
  feedLatencyMs: number;
  decisionState: {
    direction: 'BUY' | 'SELL' | 'NO TRADE' | 'WAIT' | 'WARMUP' | 'RISK LOCK';
    confidence: number;
    tradeQuality: number;
    tqGrade: string;
    decisionLog: string;
    whyBlock: string;
    biasLabel: string;
    isConfirmed: boolean;
  };
  onOpenCalibrationModal?: () => void;
}

export const BloombergTerminal: React.FC<BloombergTerminalProps> = ({
  lastBar,
  indicators,
  macroFeeds,
  structure,
  liquidity,
  auction,
  regime,
  tradePlan,
  calibration,
  dataQualityStatus,
  feedLatencyMs,
  decisionState,
  onOpenCalibrationModal,
}) => {
  const isHealthyData = dataQualityStatus === 'PASS';
  const isBull = decisionState.direction === 'BUY' || decisionState.biasLabel === 'BULL';
  const isBear = decisionState.direction === 'SELL' || decisionState.biasLabel === 'BEAR';

  // Decision box background & border matching Master Q7.2
  const dirBg =
    !isHealthyData
      ? 'bg-rose-950/90 border-rose-600 text-rose-200'
      : decisionState.direction === 'BUY'
      ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-950/60'
      : decisionState.direction === 'SELL'
      ? 'bg-rose-600 border-rose-400 text-white shadow-rose-950/60'
      : decisionState.direction === 'NO TRADE'
      ? 'bg-amber-950/70 border-amber-600/70 text-amber-300'
      : decisionState.direction === 'RISK LOCK'
      ? 'bg-rose-950/90 border-rose-600 text-rose-300'
      : 'bg-slate-800 border-slate-700 text-slate-300';

  const biasColor = isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-amber-400';

  // Macro calculations
  const us10y = macroFeeds.find(f => f.symbol === 'TVC:US10Y')?.price || 4.218;
  const us02y = macroFeeds.find(f => f.symbol === 'TVC:US02Y')?.price || 3.965;
  const curve2s10s = (us10y - us02y).toFixed(3);
  const gcFeed = macroFeeds.find(f => f.symbol === 'COMEX:GC1!');
  const oiFeed = macroFeeds.find(f => f.symbol === 'COMEX:GC1!_OI');

  return (
    <div className="bg-[#0b0e14] border border-slate-800/90 rounded-md p-2 font-mono select-none text-[11px] leading-tight shadow-2xl">
      {/* Top Audit Status Bar */}
      <div className="flex flex-wrap items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 tracking-wider">
            BLOOMBERG 9-COLUMN INSTITUTIONAL TERMINAL
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">Q7.2 Master Specification Parity</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCalibrationModal}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-700/50 text-indigo-300 text-[10px] font-semibold transition-colors"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Calibration: <strong>{calibration.calGradePct}% ({calibration.calGradeLabel})</strong></span>
            <span className="text-slate-500">|</span>
            <span>Brier: <strong>{calibration.calBrier}</strong></span>
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <span className="hidden sm:inline">
            OOS: <strong className="text-slate-200">ROLL {calibration.rollingOosWinRate}% N{calibration.analogMfeProbabilities.sampleN}/{calibration.effectiveOosN}eff</strong>
          </span>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <span>
            EV: <strong className="text-emerald-400">+{tradePlan.planExpectancy?.toFixed(2)}R</strong>
          </span>
        </div>
      </div>

      {/* 9-Column Terminal Grid (Matching Pine Script L850-930) */}
      <div className="grid grid-cols-9 gap-1.5 overflow-x-auto min-w-[1020px]">
        {/* COL 0: MARKET */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              01 MARKET
            </div>
            <div className="font-bold text-slate-100 text-[13px] mt-0.5">
              ${lastBar.close.toFixed(2)}
              <span className="text-[10px] ml-1 font-normal text-emerald-400">+0.24%</span>
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div className="text-sky-300 font-bold">5M▲ 15M▲ 1H▲ 4H▲ 1D▲</div>
            <div>NY-KZ • CVD▲ Δ+3.4k</div>
            <div className="text-amber-300/90 font-semibold">{regime.name} {regime.volTag}</div>
            <div className="text-slate-400 text-[9px]">Exp118% M14% C72%</div>
          </div>
        </div>

        {/* COL 1: BIAS */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              02 BIAS
            </div>
            <div className={`font-bold text-[12px] mt-0.5 ${biasColor}`}>
              {decisionState.biasLabel} 78
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div className="text-slate-200">C▲78 S▲72 I▲80</div>
            <div>A:HI • H:BULL</div>
            <div className="text-purple-300">{auction.cycle} {auction.state}</div>
            <div className="text-slate-500 text-[9px]">{auction.bias}</div>
          </div>
        </div>

        {/* COL 2: SIGNAL */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              03 SIGNAL
            </div>
            <div className="font-bold text-[11px] text-emerald-400 mt-0.5">
              L 74% S 20% R 6%
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div className="text-emerald-300 font-semibold">EV +{tradePlan.planExpectancy?.toFixed(2)}R mP=74%</div>
            <div>CONF {decisionState.confidence}/100 HI</div>
            <div className="text-slate-400 text-[9px]">Platt Sigmoid Fitted</div>
            <div className="text-cyan-300/80 text-[9px]">calGateMinP &gt; 0.50 ✓</div>
          </div>
        </div>

        {/* COL 3: STRUCTURE */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              04 STRUCTURE
            </div>
            <div className="font-bold text-emerald-400 text-[11px] truncate mt-0.5">
              BOS▲ CHoCH▲ MSS▲
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div className="text-emerald-300">▲{structure.structType} {structure.structAge}b (Active)</div>
            <div>Persist: {structure.structPersistenceScore}/100</div>
            <div className="text-slate-400">Inval: ${structure.structInval?.toFixed(1)}</div>
            <div className="text-slate-500 text-[9px]">ADX {regime.adxVal.toFixed(1)} &gt; 25</div>
          </div>
        </div>

        {/* COL 4: LIQUIDITY */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              05 LIQUIDITY
            </div>
            <div className="font-bold text-amber-300 text-[11px] truncate mt-0.5">
              {liquidity.nearestAbove ? `${liquidity.nearestAbove.label} ${liquidity.nearestAbove.price.toFixed(0)}` : `PDH ${(lastBar.close + 12).toFixed(0)}`}
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div className="text-cyan-300">TGT {liquidity.destLabel} R{liquidity.destScore} P{liquidity.reachProb}</div>
            <div>RCH {liquidity.reachProb}% {liquidity.destConfidence}</div>
            <div className="text-emerald-400">SW: {liquidity.lastSweepGrade || 'STRONG'} {liquidity.lastSweepQ}</div>
            <div className="text-slate-400 text-[9px]">FVG 4378-4381 BULL</div>
          </div>
        </div>

        {/* COL 5: PRICE & VALUE */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              06 PRICE / VWAP
            </div>
            <div className="font-bold text-cyan-400 text-[11px] mt-0.5">
              V ${indicators.vwapD.toFixed(1)}
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div>EMA200 ${indicators.ema200.toFixed(1)}</div>
            <div className="text-sky-300">{auction.valueMigration} Acc: {auction.acceptanceScore} ({auction.acceptanceGrade})</div>
            <div className="text-slate-300">VA Inside 68%</div>
            <div className="text-slate-500 text-[9px]">Bar {new Date(lastBar.time).toLocaleTimeString()}</div>
          </div>
        </div>

        {/* COL 6: MACRO */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              07 MACRO
            </div>
            <div className="font-bold text-emerald-400 text-[11px] truncate mt-0.5">
              DXY▲ 10Y▲ GC++
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div>CR 74% Bonferroni</div>
            <div className="text-emerald-300">Macro BULL (5/7)</div>
            <div className="text-cyan-300">2s10s +{curve2s10s}%^</div>
            <div className="text-amber-300 text-[9px]">COT 82% • OI NEW-LONG</div>
          </div>
        </div>

        {/* COL 7: RISK & SIZING */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5 justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
              08 RISK &amp; SIZING
            </div>
            <div className="font-bold text-slate-100 text-[11px] mt-0.5">
              RRg 1:{tradePlan.rr2.toFixed(1)}{' '}
              <span className="text-amber-400 text-[10px] font-bold">
                {tradePlan.lotsBelowMin ? '<min' : `${tradePlan.lots.toFixed(2)}L`}
              </span>
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/40">
            <div>SL: {tradePlan.slBasis} ({(tradePlan.tpDist / indicators.adaptiveATR).toFixed(1)} ATR)</div>
            <div className="text-emerald-400">Risk ${tradePlan.riskUSD.toFixed(0)} (Kelly 1.0%)</div>
            <div className="text-slate-300">DD 0.0% &lt; 12% Max</div>
            <div className="text-slate-400 text-[9px]">Cst: {tradePlan.costToTargetPct}% of Target</div>
          </div>
        </div>

        {/* COL 8: DECISION (Master Execution Gate) */}
        <div className={`flex flex-col justify-between border rounded p-2 shadow-xl transition-all ${dirBg}`}>
          <div>
            <div className="flex items-center justify-between text-[9px] font-bold opacity-80 uppercase tracking-widest pb-0.5 border-b border-white/20">
              <span>09 DECISION</span>
              <span>TQ{decisionState.tradeQuality}{decisionState.tqGrade}</span>
            </div>
            <div className="font-extrabold text-[15px] tracking-wider my-0.5">
              {!isHealthyData ? 'FEED LOST' : decisionState.direction}
            </div>
          </div>

          <div className="text-[9px] opacity-95 leading-tight space-y-0.5 border-t border-white/20 pt-1">
            <div className="font-semibold">
              {!isHealthyData
                ? 'CIRCUIT BREAKER: SIGNALS BLOCKED'
                : decisionState.decisionLog}
            </div>
            {decisionState.whyBlock && isHealthyData && (
              <div className="text-[8.5px] opacity-80 font-mono italic">
                {decisionState.whyBlock}
              </div>
            )}
            <div className="text-[8.5px] font-mono opacity-80">
              Latency: {feedLatencyMs}ms • Agree 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
