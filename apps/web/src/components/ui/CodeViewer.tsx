import React, { useState } from 'react';
import { Copy, Check, ShieldAlert } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  lineNumber?: number;
  filePath?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'java',
  lineNumber,
  filePath
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRedacted = code.includes('[REDACTED');

  return (
    <div className="rounded-xl border border-slate-800 bg-navy-950/90 overflow-hidden font-mono text-xs shadow-inner">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          {filePath && (
            <span className="ml-2 text-slate-300 font-medium truncate max-w-xs">
              {filePath} {lineNumber ? `:${lineNumber}` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRedacted && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <ShieldAlert className="w-3 h-3" /> Secrets Redacted
            </span>
          )}
          <span className="text-[10px] uppercase font-semibold text-slate-500">{language}</span>
          <button
            onClick={handleCopy}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Copy code snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto text-slate-200 flex gap-4 leading-relaxed">
        {lineNumber && (
          <div className="select-none text-slate-600 font-mono text-right pr-2 border-r border-slate-800">
            {lineNumber}
          </div>
        )}
        <pre className="text-cyan-300 flex-1 whitespace-pre-wrap break-all font-mono">
          {code}
        </pre>
      </div>
    </div>
  );
};
