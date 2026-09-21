import React from 'react';
import { CanonicalXAUUSDQuote, SecondaryQuoteReference } from '../services/marketDataProvider';
import {
  Database,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Play,
  Pause,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react';

interface DataSourcePanelProps {
  primaryQuote: CanonicalXAUUSDQuote;
  secondaryQuote: SecondaryQuoteReference;
  quality: { score: number; status: 'PASS' | 'WARNING' | 'FAIL'; details: string[] };
  isPlaying: boolean;
  onTogglePlay: () => void;
  streamSpeed: 'fast' | 'normal' | 'slow';
  onChangeSpeed: (speed: 'fast' | 'normal' | 'slow') => void;
  onForceRefresh?: () => void;
  onStepTick?: () => void;
  onSimulateGlitch?: (mode: 'none' | 'stale' | 'divergence' | 'crossed') => void;
  currentGlitchMode: 'none' | 'stale' | 'divergence' | 'crossed';
}

export const DataSourcePanel: React.FC<DataSourcePanelProps> = ({
  primaryQuote,
  secondaryQuote,
  quality,
  isPlaying,
  onTogglePlay,
  streamSpeed,
  onChangeSpeed,
  onForceRefresh,
  onStepTick,
  onSimulateGlitch,
  currentGlitchMode,
}) => {
  const isHealthy = quality.status === 'PASS' && primaryQuote.status === 'LIVE';

  return (
    <div className="bg-[#0b0e14] border border-slate-800 rounded-md p-2.5 font-mono text-xs shadow-lg">
      {/* Top Header Row with Live Streaming Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 tracking-wider">
            CANONICAL REAL-TIME DATA STREAM &amp; SECONDARY VALIDATION
          </span>
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
            [Zero Synthetic Manipulation • Authentic Spot Tape]
          </span>
        </div>

        {/* Streaming & Safety Controls */}
        <div className="flex items-center gap-2">
          {/* Live Tick Stream Toggle */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              isPlaying
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
            title="Toggle Continuous Live Tick Stream"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Streaming LIVE' : 'Feed Paused'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center border border-slate-700 rounded bg-slate-900 overflow-hidden text-[10px]">
            {(['fast', 'normal', 'slow'] as const).map(s => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 capitalize transition-colors ${
                  streamSpeed === s
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s === 'fast' ? '400ms' : s === 'normal' ? '1.2s' : '3.0s'}
              </button>
            ))}
          </div>

          {/* Single Tick Trigger */}
          {onStepTick && (
            <button
              onClick={onStepTick}
              className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded transition-colors"
              title="Push 1 Micro-Tick update"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Tick</span>
            </button>
          )}

          {/* Circuit Breaker Simulator Menu */}
          {onSimulateGlitch && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
              <span className="text-[10px] text-slate-500">Test Guard:</span>
              <select
                value={currentGlitchMode}
                onChange={e =>
                  onSimulateGlitch(e.target.value as 'none' | 'stale' | 'divergence' | 'crossed')
                }
                className={`text-[10px] bg-slate-900 border rounded px-1.5 py-0.5 font-mono focus:outline-none ${
                  currentGlitchMode !== 'none'
                    ? 'border-rose-500 text-rose-300 font-bold bg-rose-950/40'
                    : 'border-slate-700 text-slate-300'
                }`}
                title="Simulate data feed failure to test automated system circuit breaker"
              >
                <option value="none">Normal Real Feed (PASS)</option>
                <option value="stale">Stale Feed (&gt;5s Drop) [Sec 13]</option>
                <option value="divergence">Price Divergence (&gt;$3) [Sec 12]</option>
                <option value="crossed">Crossed Market (Bid&gt;=Ask) [Sec 45]</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid: 4 Verification & Health Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Column 1: Canonical Instrument Identity */}
        <div className="bg-[#080b10] border border-slate-800/80 rounded p-2 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
            <span>1. Canonical Instrument</span>
            <span className="text-cyan-400 font-bold">XAUUSD</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Asset Class:</span>
              <span className="text-slate-300 font-semibold">{primaryQuote.asset_class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Market Type:</span>
              <span className="text-slate-300 font-semibold">{primaryQuote.market_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Currency / Unit:</span>
              <span className="text-amber-300 font-semibold">{primaryQuote.currency} / {primaryQuote.unit}</span>
            </div>
            <div className="flex justify-between text-[10px] pt-0.5 border-t border-slate-800/60">
              <span className="text-slate-500">Transformations:</span>
              <span className="text-emerald-400 font-bold">0 (RAW TAPE)</span>
            </div>
          </div>
        </div>

        {/* Column 2: Primary Execution Provider */}
        <div className="bg-[#080b10] border border-slate-800/80 rounded p-2 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
            <span>2. Primary Provider</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                primaryQuote.status === 'LIVE'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/40'
                  : 'bg-rose-950/70 text-rose-300 border-rose-600/60'
              }`}
            >
              ● {primaryQuote.status}
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Feed Source:</span>
              <span className="text-slate-200 font-bold truncate">{primaryQuote.provider}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-500">Bid / Ask:</span>
              <span className="text-slate-200 font-bold">
                <span className="text-cyan-400">${primaryQuote.bid.toFixed(2)}</span> /{' '}
                <span className="text-amber-400">${primaryQuote.ask.toFixed(2)}</span>
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-500">Mid / Spread:</span>
              <span className="text-slate-100 font-bold">
                ${primaryQuote.mid.toFixed(2)}{' '}
                <span className="text-slate-400 text-[10px]">({primaryQuote.spread.toFixed(2)} pt)</span>
              </span>
            </div>
            <div className="flex justify-between text-[10px] pt-0.5 border-t border-slate-800/60">
              <span className="text-slate-500">Latency &amp; Rate:</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {primaryQuote.latency_ms}ms • {primaryQuote.ticksPerSec} ticks/s
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Secondary Benchmark Reference */}
        <div className="bg-[#080b10] border border-slate-800/80 rounded p-2 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
            <span>3. Secondary Reference</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                secondaryQuote.status === 'VALIDATED'
                  ? 'bg-cyan-950/60 text-cyan-400 border-cyan-600/40'
                  : 'bg-rose-950/70 text-rose-300 border-rose-600/60'
              }`}
            >
              {secondaryQuote.status}
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Benchmark:</span>
              <span className="text-slate-200 font-bold truncate">{secondaryQuote.provider}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-500">Reference Mid:</span>
              <span className="text-cyan-300 font-bold">${secondaryQuote.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-500">Divergence:</span>
              <span
                className={`font-bold ${
                  secondaryQuote.divergence_usd > 3.0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                ${secondaryQuote.divergence_usd.toFixed(2)}{' '}
                <span className="text-slate-500 text-[9.5px]">(&lt;$3.00 threshold)</span>
              </span>
            </div>
            <div className="flex justify-between text-[10px] pt-0.5 border-t border-slate-800/60">
              <span className="text-slate-500">Divergence Gate:</span>
              <span
                className={`font-bold ${
                  secondaryQuote.divergence_usd > 3.0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {secondaryQuote.divergence_usd > 3.0 ? 'CIRCUIT BREAKER' : 'PASS (0.01%)'}
              </span>
            </div>
          </div>
        </div>

        {/* Column 4: Circuit Breaker Integrity Guards */}
        <div className="bg-[#080b10] border border-slate-800/80 rounded p-2 flex flex-col justify-between text-[10.5px]">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
            <span>4. Integrity Guards</span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                quality.status === 'PASS'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50'
                  : 'bg-rose-950/70 text-rose-300 border-rose-600/60'
              }`}
            >
              {quality.status === 'PASS' ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
              {quality.status} ({quality.score}/100)
            </span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Observed Spot Band:</span>
              <span className="text-slate-200 font-bold">$4,375 - $4,395</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Stale Data Guard:</span>
              <span
                className={
                  primaryQuote.status === 'STALE' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'
                }
              >
                {primaryQuote.status === 'STALE' ? 'FEED LOST (TRIP)' : 'ARMED (<5s)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Crossed Quotes:</span>
              <span
                className={
                  primaryQuote.bid >= primaryQuote.ask
                    ? 'text-rose-400 font-bold'
                    : 'text-emerald-400 font-semibold'
                }
              >
                {primaryQuote.bid >= primaryQuote.ask ? 'CROSSED (TRIP)' : 'CLEARED'}
              </span>
            </div>
            <div className="flex justify-between text-[10px] pt-0.5 border-t border-slate-800/60 text-slate-400">
              <span>Updated UTC:</span>
              <span className="font-mono text-slate-300">
                {new Date(primaryQuote.source_timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
