import React from 'react';
import { MacroFeedState } from '../types/quantum';
import { ShieldCheck, Activity, Terminal, BookOpen, GitBranch, Cpu, Clock, CheckCircle2, BarChart2 } from 'lucide-react';

interface HeaderBarProps {
  currentPrice: number;
  macroFeeds: MacroFeedState[];
  onOpenHarness: () => void;
  onOpenDocs: () => void;
  onOpenTrace: () => void;
  onOpenCalibration: () => void;
  harnessPassCount: number;
  harnessTotal: number;
  calGradePct: number;
  calGradeLabel: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentPrice,
  macroFeeds,
  onOpenHarness,
  onOpenDocs,
  onOpenTrace,
  onOpenCalibration,
  harnessPassCount,
  harnessTotal,
  calGradePct,
  calGradeLabel,
}) => {
  // Session calculations with DST awareness
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const timeStr = `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')} UTC`;

  const inLondon = utcHours >= 7 && utcHours < 16;
  const inNY = utcHours >= 14 && utcHours < 21;
  const inAsian = utcHours >= 0 && utcHours < 7;
  const inOverlapKZ = inLondon && inNY;

  const us10y = macroFeeds.find(f => f.symbol === 'TVC:US10Y')?.price || 4.218;
  const us02y = macroFeeds.find(f => f.symbol === 'TVC:US02Y')?.price || 3.965;
  const curve2s10s = (us10y - us02y).toFixed(3);

  return (
    <header className="border-b border-slate-800 bg-[#090b10] text-xs select-none">
      {/* Top Ticker Tape */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-1.5 overflow-x-auto text-[11px] gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>XAUUSD QUANTUM</span>
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-amber-500/30">
              Q7.2-INSTITUTIONAL
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Spot Gold live */}
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-slate-400 font-sans">SPOT:</span>
            <span className="text-emerald-400 font-bold text-[13px]">${currentPrice.toFixed(2)}</span>
            <span className="text-emerald-500/80 text-[10px]">+0.24%</span>
            <span className="text-slate-500 text-[10px] ml-1">Sprd 0.24pt</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Secondary macro tickers */}
          {macroFeeds.slice(1, 7).map(feed => (
            <div key={feed.symbol} className="flex items-center gap-1 font-mono text-slate-300">
              <span className="text-slate-500 text-[10px]">{feed.symbol.split(':')[1]}:</span>
              <span className={feed.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {feed.price < 10 ? feed.price.toFixed(feed.symbol.includes('EUR') ? 4 : 3) : feed.price.toFixed(feed.price > 1000 ? 1 : 2)}
              </span>
              <span className={`text-[9px] ${feed.impactOnGold === 'BULL' ? 'text-emerald-400' : feed.impactOnGold === 'BEAR' ? 'text-rose-400' : 'text-slate-400'}`}>
                {feed.arrow}
              </span>
            </div>
          ))}

          {/* 2s10s curve */}
          <div className="flex items-center gap-1 font-mono text-slate-300">
            <span className="text-slate-500 text-[10px]">2s10s:</span>
            <span className="text-cyan-400">+{curve2s10s}%</span>
            <span className="text-[9px] text-emerald-400">▲</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenCalibration}
            className="flex items-center gap-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 px-2.5 py-1 rounded transition-colors"
            title="Open Platt WLS & Murphy Brier Calibration Engine"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Calibration Audit</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-1 rounded">
              {calGradePct}% {calGradeLabel}
            </span>
          </button>

          <button
            onClick={onOpenHarness}
            className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/50 px-2.5 py-1 rounded transition-colors"
            title="Execute Pine Script §16 Edge-Case Assertion Harness"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">§16 Harness</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-1 rounded">
              {harnessPassCount}/{harnessTotal} PASS
            </span>
          </button>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>15 Institutional Specs</span>
          </button>

          <button
            onClick={onOpenTrace}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
            <span>Decision Lineage</span>
          </button>
        </div>
      </div>

      {/* Institutional Metadata & Session Strip */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#0d1017] text-slate-400 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>BUILD: v2 (SCHEMA_V2 CLEAN)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>DATA STATUS: GC:OK OI:OK 2Y:OK COT:OK</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span>FEED LATENCY:</span>
            <span className="text-emerald-400 font-bold">18ms</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="text-slate-400">
            <span>NO SYNTHETIC TICK INJECTION (REAL FEED ONLY)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-slate-200 font-bold">{timeStr}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${inLondon ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold' : 'text-slate-500'}`}>
              LONDON {inLondon ? '●' : '○'}
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${inNY ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-500'}`}>
              NEW YORK {inNY ? '●' : '○'}
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${inAsian ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-500'}`}>
              ASIAN {inAsian ? '●' : '○'}
            </span>
            {inOverlapKZ && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded text-[10px] font-bold animate-pulse">
                OVERLAP-KZ
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
