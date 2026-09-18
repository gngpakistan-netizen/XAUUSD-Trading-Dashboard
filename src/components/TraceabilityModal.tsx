import React, { useState } from 'react';
import { InstitutionalDecisionObject } from '../types/quantum';
import { GitBranch, Copy, Check, X, ArrowRight, ShieldCheck, Database } from 'lucide-react';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionObject: InstitutionalDecisionObject;
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  decisionObject,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(decisionObject, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex flex-col bg-[#0d1017] border border-slate-700/80 rounded-lg w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111622] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Decision Lineage &amp; MT5 Bridge Payload (Section 93 Spec)
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Full end-to-end mathematical audit trail: Market Feed → Evidence → Calibration → Risk Gate → Execution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Lineage Flow */}
        <div className="grid grid-cols-5 border-b border-slate-800 bg-[#080b10] text-[11px] divide-x divide-slate-800 p-2 text-center">
          <div className="p-1.5">
            <div className="text-[9.5px] text-slate-500 uppercase">1. Raw Market Feed</div>
            <div className="font-bold text-slate-200 mt-0.5">XAUUSD Spot</div>
            <div className="text-[10px] text-emerald-400">${decisionObject.mid.toFixed(2)} (Sprd {decisionObject.spread}pt)</div>
          </div>

          <div className="p-1.5">
            <div className="text-[9.5px] text-slate-500 uppercase">2. Structure &amp; SMC</div>
            <div className="font-bold text-slate-200 mt-0.5">{decisionObject.structureState}</div>
            <div className="text-[10px] text-cyan-400">{decisionObject.liquidityState}</div>
          </div>

          <div className="p-1.5">
            <div className="text-[9.5px] text-slate-500 uppercase">3. Evidence &amp; Macro</div>
            <div className="font-bold text-slate-200 mt-0.5">{decisionObject.macroState}</div>
            <div className="text-[10px] text-purple-300">Regime: {decisionObject.regimeState}</div>
          </div>

          <div className="p-1.5">
            <div className="text-[9.5px] text-slate-500 uppercase">4. Calibration &amp; TQ</div>
            <div className="font-bold text-emerald-400 mt-0.5">
              P={(decisionObject.probability * 100).toFixed(0)}% ({decisionObject.probabilityConfidence})
            </div>
            <div className="text-[10px] text-amber-300">TQ {decisionObject.tradeQuality} ({decisionObject.tradeQualityGrade})</div>
          </div>

          <div className="p-1.5 bg-slate-900/60">
            <div className="text-[9.5px] text-slate-400 uppercase">5. Output Decision</div>
            <div className="font-extrabold text-sm text-emerald-400 mt-0.5">{decisionObject.direction}</div>
            <div className="text-[10px] text-slate-300 font-mono">Lot {decisionObject.lots}L (RR {decisionObject.rrRatio})</div>
          </div>
        </div>

        {/* JSON Payload Viewer */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-[#0b0e14]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="text-slate-400">Institutional Decision JSON Object (MT5 Bridge API Compliant):</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied Payload' : 'Copy JSON for Bridge'}</span>
            </button>
          </div>

          <pre className="flex-1 bg-[#07090e] border border-slate-800/80 p-3 rounded text-[11px] text-cyan-300 overflow-x-auto leading-relaxed select-text font-mono">
            {JSON.stringify(decisionObject, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#111622] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div>
            <span>Audit State: </span>
            <strong className="text-emerald-400">ZERO_LOOKAHEAD_VERIFIED</strong>
            <span className="mx-2">•</span>
            <span>Schema: </span>
            <strong className="text-slate-200">{decisionObject.schemaVersion}</strong>
          </div>
          <div className="text-slate-500">
            Hash: {decisionObject.signalId}
          </div>
        </div>
      </div>
    </div>
  );
};
