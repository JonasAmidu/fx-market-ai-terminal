import React, { useState } from 'react';
import { Layers, Info } from 'lucide-react';
import { CORRELATION_MATRIX } from '../services/marketDataGenerator';

export const CorrelationMatrix: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{ p1: string; p2: string; val: number } | null>(null);
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'XAU/USD'];

  const getCellColor = (val: number) => {
    if (val === 1.0) return 'bg-slate-800 text-slate-300 font-bold';
    if (val >= 0.7) return 'bg-emerald-950/70 text-emerald-300 font-bold';
    if (val >= 0.3) return 'bg-emerald-950/30 text-emerald-400';
    if (val <= -0.7) return 'bg-rose-950/70 text-rose-300 font-bold';
    if (val <= -0.3) return 'bg-rose-950/30 text-rose-400';
    return 'bg-slate-900 text-slate-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Asset Correlation Heatmap
        </span>
        <span className="text-[10px] font-mono text-slate-500">30D Rolling</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-mono text-center border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-slate-500 text-left font-normal">Pair</th>
              {pairs.map(p => (
                <th key={p} className="p-1 text-slate-400 font-semibold">{p.split('/')[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CORRELATION_MATRIX.map(row => (
              <tr key={row.pair} className="border-t border-slate-800/60">
                <td className="p-1 text-left text-slate-300 font-semibold">{row.pair.split('/')[0]}</td>
                {pairs.map(col => {
                  const val = row.correlations[col as keyof typeof row.correlations] ?? 0;
                  const colorClass = getCellColor(val);
                  return (
                    <td
                      key={col}
                      onClick={() => setSelectedCell({ p1: row.pair, p2: col, val })}
                      className={`p-1 border border-slate-800/40 cursor-pointer transition ${colorClass} hover:opacity-80`}
                      title={`${row.pair} vs ${col}: ${val >= 0 ? '+' : ''}${val.toFixed(2)}`}
                    >
                      {val >= 0 ? '+' : ''}{val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono flex items-center justify-between text-slate-300">
          <span>{selectedCell.p1} ↔ {selectedCell.p2}: <strong className={selectedCell.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{selectedCell.val.toFixed(2)}</strong></span>
          <span className="text-slate-500">{selectedCell.val > 0.6 ? 'Strong Positive' : selectedCell.val < -0.6 ? 'Strong Inverse' : 'Low Correlation'}</span>
        </div>
      )}
    </div>
  );
};
