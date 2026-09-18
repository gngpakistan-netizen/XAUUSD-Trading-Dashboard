import React, { useState } from 'react';
import { TradePlanState } from '../types/quantum';
import { Target, ShieldAlert, DollarSign, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface TradePlanPanelProps {
  tradePlan: TradePlanState;
  accountSize: number;
  riskPercent: number;
  mt5Offset: number;
  onUpdateSettings: (settings: { accountSize?: number; riskPercent?: number; mt5Offset?: number }) => void;
}

export const TradePlanPanel: React.FC<TradePlanPanelProps> = ({
  tradePlan,
  accountSize,
  riskPercent,
  mt5Offset,
  onUpdateSettings,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const isLong = tradePlan.isLong;

  return (
    <div className="bg-[#0e121a] border border-slate-800 rounded-md p-2 font-mono text-xs select-none shadow-md">
      {/* Top Banner with Trade Plan Rungs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`px-2 py-1 rounded font-bold text-xs ${isLong ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            {isLong ? '▲ LONG PLAN' : '▼ SHORT PLAN'}
          </span>

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded">
            <span className="text-slate-400 text-[10px] mr-1">ENTRY:</span>
            <span className="font-bold text-slate-100">${tradePlan.entry.toFixed(2)}</span>
            {mt5Offset !== 0 && (
              <span className="text-[10px] text-amber-400 ml-1">
                [MT5 {mt5Offset > 0 ? `+${mt5Offset}` : mt5Offset}]
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded">
            <span className="text-rose-400 text-[10px] mr-1">SL ({tradePlan.slBasis}):</span>
            <span className="font-bold text-rose-300">${tradePlan.sl.toFixed(2)}</span>
            {tradePlan.pSLhit !== null && (
              <span className="text-[10px] text-rose-400/80 ml-1.5 font-sans">
                ~SLtouch {tradePlan.pSLhit}%
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded">
            <span className="text-emerald-400 text-[10px] mr-1">TP1 ({tradePlan.tp1Basis}):</span>
            <span className="font-bold text-emerald-300">${tradePlan.tp1.toFixed(2)}</span>
            {tradePlan.pTP1 !== null && (
              <span className="text-[10px] text-emerald-400/80 ml-1.5 font-sans">
                ~{tradePlan.pTP1}%
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded">
            <span className="text-emerald-400 text-[10px] mr-1">TP2 ({tradePlan.tp2Basis}):</span>
            <span className="font-bold text-emerald-300">${tradePlan.tp2.toFixed(2)}</span>
            {tradePlan.pTP2 !== null && (
              <span className="text-[10px] text-emerald-400/80 ml-1.5 font-sans">
                ~{tradePlan.pTP2}%
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded">
            <span className="text-emerald-400 text-[10px] mr-1">TP3 ({tradePlan.tp3Basis}):</span>
            <span className="font-bold text-emerald-300">${tradePlan.tp3.toFixed(2)}</span>
            {tradePlan.pTP3 !== null && (
              <span className="text-[10px] text-emerald-400/80 ml-1.5 font-sans">
                ~{tradePlan.pTP3}%
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded">
            <span className="text-slate-400 text-[10px] mr-1">RRg:</span>
            <span className="font-bold text-cyan-300">
              1:{tradePlan.rr1.toFixed(1)} / 1:{tradePlan.rr2.toFixed(1)} / 1:{tradePlan.rr3.toFixed(1)}
            </span>
          </div>

          <div className="bg-amber-950/40 border border-amber-600/40 px-2.5 py-1 rounded">
            <span className="text-amber-400 text-[10px] mr-1">SIZE:</span>
            <span className="font-bold text-amber-300">
              {tradePlan.lotsBelowMin ? '<min' : `${tradePlan.lots.toFixed(2)}L`}
            </span>
            <span className="text-[10px] text-amber-400/80 ml-1">
              (${tradePlan.riskUSD.toFixed(0)})
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded transition-colors flex-shrink-0"
        >
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span>Execution Parameters</span>
          {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Plan Narrative & Structural Why-Chain */}
      <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] text-slate-400">
        <div className="truncate text-slate-300">
          <strong className="text-slate-400">Construction:</strong> {tradePlan.planReason}
        </div>
        <div className="text-slate-500 flex-shrink-0 ml-2">
          {tradePlan.planExpectancy !== null && (
            <span className={tradePlan.planExpectancy >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              Expectancy: {tradePlan.planExpectancy > 0 ? `+${tradePlan.planExpectancy.toFixed(2)}R` : `${tradePlan.planExpectancy.toFixed(2)}R`}
            </span>
          )}
        </div>
      </div>

      {/* Expandable Execution Controls */}
      {showConfig && (
        <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-4 gap-3 bg-[#090b10] p-2.5 rounded border border-slate-800/80 text-[11px]">
          <div>
            <label className="text-slate-400 block mb-1">Account Balance ($)</label>
            <input
              type="number"
              value={accountSize}
              onChange={e => onUpdateSettings({ accountSize: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Risk per Trade (%)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="2.0"
              value={riskPercent}
              onChange={e => onUpdateSettings({ riskPercent: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">MT5 Price Offset ($)</label>
            <input
              type="number"
              step="0.05"
              value={mt5Offset}
              onChange={e => onUpdateSettings({ mt5Offset: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[9px] text-slate-500">Shifts displayed prices for manual MT5 entry</span>
          </div>

          <div className="flex flex-col justify-end">
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <div>Point Value: <strong>$100 / lot</strong></div>
              <div>Commission: <strong>$7.00 / lot ($0.035/oz)</strong></div>
              <div>Slippage Model: <strong>35 ticks (0.35pt)</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
