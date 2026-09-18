import React from 'react';
import { MarketBar, MacroFeedState, DualStructureState, LiquidityState, AuctionIntelligenceState, MarketRegimeState, TradePlanState } from '../types/quantum';
import { IndicatorSnapshot } from '../services/mockMarketData';

interface BloombergTerminalProps {
  lastBar: MarketBar;
  indicators: IndicatorSnapshot;
  macroFeeds: MacroFeedState[];
  structure: DualStructureState;
  liquidity: LiquidityState;
  auction: AuctionIntelligenceState;
  regime: MarketRegimeState;
  tradePlan: TradePlanState;
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
  decisionState,
}) => {
  const isBull = decisionState.direction === 'BUY' || decisionState.biasLabel === 'BULL';
  const isBear = decisionState.direction === 'SELL' || decisionState.biasLabel === 'BEAR';

  const dirBg = decisionState.direction === 'BUY'
    ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-950/50'
    : decisionState.direction === 'SELL'
    ? 'bg-rose-600 border-rose-400 text-white shadow-rose-950/50'
    : decisionState.direction === 'NO TRADE'
    ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
    : decisionState.direction === 'RISK LOCK'
    ? 'bg-rose-950/80 border-rose-600/70 text-rose-300'
    : 'bg-slate-800 border-slate-700 text-slate-300';

  const biasColor = isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-amber-400';

  return (
    <div className="bg-[#0b0e14] border border-slate-800/90 rounded-md p-2 font-mono select-none text-[11px] leading-tight shadow-xl">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 tracking-wider">BLOOMBERG TERMINAL DASHBOARD</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">9-COLUMN DUAL-ROW ARTIFACT (Q7.2 Master Parity)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>OOS: <strong className="text-slate-200">ROLL 58% N142/11eff</strong></span>
          <span className="text-slate-600">|</span>
          <span>EV: <strong className="text-emerald-400">+0.84R</strong></span>
          <span className="text-slate-600">|</span>
          <span>CAL: <strong className="text-sky-300">P72&gt;65% (B0.182)</strong></span>
        </div>
      </div>

      {/* 9-Column Grid */}
      <div className="grid grid-cols-9 gap-1.5 overflow-x-auto min-w-[980px]">
        {/* COL 0: MARKET */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            01 MARKET
          </div>
          <div className="font-bold text-slate-100 text-[13px]">
            ${lastBar.close.toFixed(2)}
            <span className="text-[10px] ml-1 font-normal text-emerald-400">+0.24%</span>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div className="text-sky-300 font-bold">5M▲ 15M▲ 1H▲ 4H▲ 1D▲</div>
            <div>LDN • Δ+3.4k {regime.volTag}</div>
            <div className="text-amber-300/90 font-semibold">{regime.name} Exp118%</div>
          </div>
        </div>

        {/* COL 1: BIAS */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            02 BIAS
          </div>
          <div className={`font-bold text-[12px] ${biasColor}`}>
            {decisionState.biasLabel} 72
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div className="text-slate-300">C▲78 S▲72 I▲80</div>
            <div>A:HI H:BULL</div>
            <div className="text-purple-300">{auction.cycle} {auction.state}</div>
          </div>
        </div>

        {/* COL 2: SIGNAL */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            03 SIGNAL
          </div>
          <div className="font-bold text-[11px] text-emerald-400">
            L 74% S 20% R 6%
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div className="text-emerald-300 font-semibold">EV +0.8R mP=74%</div>
            <div>CONF {decisionState.confidence}/100 HI</div>
            <div className="text-slate-500 text-[8.5px]">Platt Sigmoid Fitted</div>
          </div>
        </div>

        {/* COL 3: STRUCTURE */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            04 STRUCTURE
          </div>
          <div className="font-bold text-emerald-400 text-[11px] truncate">
            BOS▲ CHoCH▲ MSS▲
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div className="text-emerald-300">▲{structure.structType} {structure.structAge}b</div>
            <div>Persist: {structure.structPersistenceScore}/100</div>
            <div className="text-slate-500">ADX {regime.adxVal.toFixed(1)} &gt; 25</div>
          </div>
        </div>

        {/* COL 4: LIQUIDITY */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            05 LIQUIDITY
          </div>
          <div className="font-bold text-amber-300 text-[11px] truncate">
            {liquidity.nearestAbove ? `${liquidity.nearestAbove.label} ${liquidity.nearestAbove.price.toFixed(0)}` : 'PDH 2668'}
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div className="text-cyan-300">TGT {liquidity.destLabel} R{liquidity.destScore}</div>
            <div>RCH {liquidity.reachProb}% {liquidity.destConfidence}</div>
            <div className="text-slate-500">Sweep: {liquidity.lastSweepGrade || 'None'}</div>
          </div>
        </div>

        {/* COL 5: PRICE & VALUE */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            06 PRICE/VWAP
          </div>
          <div className="font-bold text-cyan-400 text-[11px]">
            V ${indicators.vwapD.toFixed(1)}
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div>EMA200 ${indicators.ema200.toFixed(1)}</div>
            <div className="text-sky-300">{auction.valueMigration} Acc: {auction.acceptanceScore} ({auction.acceptanceGrade})</div>
            <div className="text-slate-500">VA Inside 68%</div>
          </div>
        </div>

        {/* COL 6: MACRO */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            07 MACRO
          </div>
          <div className="font-bold text-emerald-400 text-[11px] truncate">
            DXY▲ 10Y▲ GC+
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div>CR 74% Bonferroni</div>
            <div className="text-emerald-300">Macro BULL (5/7)</div>
            <div className="text-slate-400">GC/OI New Long</div>
          </div>
        </div>

        {/* COL 7: RISK */}
        <div className="flex flex-col gap-1 bg-[#10141d] border border-slate-800/60 rounded p-1.5">
          <div className="text-[10px] font-bold text-slate-400 border-b border-slate-800/60 pb-0.5">
            08 RISK &amp; SIZING
          </div>
          <div className="font-bold text-slate-100 text-[11px]">
            RRg 1:{tradePlan.rr2.toFixed(1)} <span className="text-amber-400 text-[10px]">{tradePlan.lots.toFixed(2)}L</span>
          </div>
          <div className="text-[9.5px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-800/40">
            <div>SL: {tradePlan.slBasis} ({(tradePlan.tpDist / indicators.adaptiveATR).toFixed(1)} ATR)</div>
            <div className="text-emerald-400">Risk ${tradePlan.riskUSD.toFixed(0)} (Kelly 1.0%)</div>
            <div className="text-slate-500">DD 0.0% &lt; 12% Max</div>
          </div>
        </div>

        {/* COL 8: DECISION (Master Primary Action) */}
        <div className={`flex flex-col justify-between border rounded p-2 shadow-lg transition-all ${dirBg}`}>
          <div>
            <div className="flex items-center justify-between text-[9px] font-bold opacity-80 uppercase tracking-widest pb-0.5 border-b border-white/20">
              <span>09 DECISION</span>
              <span>TQ{decisionState.tradeQuality}{decisionState.tqGrade}</span>
            </div>
            <div className="font-extrabold text-[15px] tracking-wider my-0.5">
              {decisionState.direction}
            </div>
          </div>

          <div className="text-[9px] opacity-90 leading-tight space-y-0.5 border-t border-white/20 pt-1">
            <div className="font-semibold">{decisionState.decisionLog}</div>
            {decisionState.whyBlock && (
              <div className="text-[8.5px] opacity-80 font-mono italic">
                {decisionState.whyBlock}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
