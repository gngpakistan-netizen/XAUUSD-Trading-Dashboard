import React, { useState } from 'react';
import { SPEC_DOCS, SpecDoc } from '../services/specDocuments';
import { BookOpen, FileText, Search, Copy, Check, X, Tag } from 'lucide-react';

interface SpecDocsViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecDocsViewer: React.FC<SpecDocsViewerProps> = ({ isOpen, onClose }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(SPEC_DOCS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentDoc = SPEC_DOCS.find(d => d.id === selectedDocId) || SPEC_DOCS[0];

  const filteredDocs = SPEC_DOCS.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex flex-col bg-[#0d1017] border border-slate-700/80 rounded-lg w-full max-w-6xl h-[88vh] shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111622] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wider">
                XAUUSD Quantum Institutional — 15 Engineering Specifications (Section 97)
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Comprehensive blueprints, formulas, database schemas, and parity matrices for institutional development.
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

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Document List */}
          <div className="w-80 border-r border-slate-800 bg-[#090c12] flex flex-col">
            <div className="p-2 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter 15 specifications..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredDocs.map(doc => {
                const isSelected = doc.id === currentDoc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-2 rounded transition-colors border ${isSelected ? 'bg-indigo-950/70 border-indigo-500/60 text-indigo-100' : 'bg-slate-900/40 hover:bg-slate-800/60 border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold truncate">
                      <span>{doc.filename}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                        {doc.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                      {doc.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main View: Document Reader */}
          <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0e121a]">
              <div>
                <span className="text-xs font-bold text-slate-200">{currentDoc.title}</span>
                <span className="text-[10.5px] text-cyan-400 ml-2">({currentDoc.filename})</span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 text-slate-300 font-sans text-xs leading-relaxed space-y-3 select-text">
              <div className="bg-[#111622] border border-slate-800 p-3 rounded text-[11px] font-mono text-slate-400 mb-4">
                <strong>Document Summary:</strong> {currentDoc.summary}
              </div>

              <pre className="font-mono text-[11.5px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {currentDoc.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
