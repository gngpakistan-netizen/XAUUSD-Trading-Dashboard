import React, { useState, useMemo } from 'react';
import { runEdgeCaseHarness } from '../services/quantumEngine';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, Search, Filter, RefreshCw } from 'lucide-react';

interface HarnessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HarnessModal: React.FC<HarnessModalProps> = ({ isOpen, onClose }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assertions, setAssertions] = useState(() => runEdgeCaseHarness());

  const handleRerun = () => {
    setAssertions(runEdgeCaseHarness());
  };

  const filteredAssertions = useMemo(() => {
    return assertions.filter(item => {
      const matchesGroup = selectedGroup === 'ALL' || item.group === selectedGroup;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.citation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [assertions, selectedGroup, searchQuery]);

  const passCount = assertions.filter(a => a.pass).length;
  const failCount = assertions.length - passCount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex flex-col bg-[#0d1017] border border-slate-700/80 rounded-lg w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111622] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  XAUUSD Quantum — §16 Edge-Case Harness (v6 Audit Engine)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {passCount}/{assertions.length} ALL PASS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Deterministic adversarial assertions proving Pine Script arithmetic, truncation, half-away-from-zero rounding, race order, and clamp limits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRerun}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Re-run Suite</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#090b10] border-b border-slate-800/80 gap-3 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(grp => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${selectedGroup === grp ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
              >
                {grp === 'ALL' ? 'ALL GROUPS' : `Group ${grp}`}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search assertions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Assertion Results Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-1.5 px-2">ID</th>
                <th className="py-1.5 px-3">ASSERTION TEST DESCRIPTION</th>
                <th className="py-1.5 px-2 text-center">GOT</th>
                <th className="py-1.5 px-2 text-center">WANT</th>
                <th className="py-1.5 px-2 text-center">CLASS</th>
                <th className="py-1.5 px-2 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAssertions.map(item => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/40 transition-colors ${item.pass ? 'text-slate-300' : 'text-rose-300 bg-rose-950/20'}`}
                >
                  <td className="py-1.5 px-2 font-bold text-cyan-400 text-[11px] whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="py-1.5 px-3">
                    <div className="font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      Ref: {item.citation} {item.note ? `• ${item.note}` : ''}
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold font-mono">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-200">
                      {item.got}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold font-mono">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                      {item.want}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={`text-[9.5px] px-1.5 py-0.5 rounded border ${item.classification === 'STAT' ? 'bg-purple-950/60 text-purple-300 border-purple-700/50' : item.classification === 'NUM' ? 'bg-sky-950/60 text-sky-300 border-sky-700/50' : item.classification === 'DESIGN' ? 'bg-amber-950/60 text-amber-300 border-amber-700/50' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                      {item.classification}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {item.pass ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-700/50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-600 px-2 py-0.5 rounded animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        FAIL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Summary */}
        <div className="px-4 py-2 bg-[#111622] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Total Assertions: <strong className="text-slate-200">{assertions.length}</strong></span>
            <span>Passing: <strong className="text-emerald-400">{passCount}</strong></span>
            <span>Failing: <strong className={failCount === 0 ? 'text-slate-500' : 'text-rose-400'}>{failCount}</strong></span>
          </div>

          <div className="text-[11px] text-slate-500">
            Audit protocol: STAT (statistical) • NUM (numerical stability) • DESIGN (design assumption)
          </div>
        </div>
      </div>
    </div>
  );
};
