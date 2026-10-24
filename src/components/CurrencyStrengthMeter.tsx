import React from 'react';
import { Activity, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { CurrencyStrength } from '../types/forex';

interface CurrencyStrengthMeterProps {
  strengths: CurrencyStrength[];
}

export const CurrencyStrengthMeter: React.FC<CurrencyStrengthMeterProps> = ({ strengths }) => {
  const strongest = strengths[0];
  const weakest = strengths[strengths.length - 1];

  const getStatusColor = (status: CurrencyStrength['status']) => {
    switch (status) {
      case 'Strong':
        return { text: 'text-emerald-400', bar: 'bg-emerald-500', bg: 'bg-emerald-950/40 border-emerald-800/40' };
      case 'Bullish':
        return { text: 'text-teal-300', bar: 'bg-teal-500', bg: 'bg-teal-950/30 border-teal-800/30' };
      case 'Bearish':
        return { text: 'text-amber-400', bar: 'bg-amber-500', bg: 'bg-amber-950/30 border-amber-800/30' };
      case 'Weak':
        return { text: 'text-rose-400', bar: 'bg-rose-500', bg: 'bg-rose-950/40 border-rose-800/40' };
      default:
        return { text: 'text-slate-300', bar: 'bg-slate-500', bg: 'bg-slate-900 border-slate-800' };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          Currency Strength Meter
        </span>
        <span className="text-[10px] font-mono text-slate-500">Live 8-CCY</span>
      </div>

      {/* Top Momentum Pairing Insight */}
      {strongest && weakest && (
        <div className="p-2 mb-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Max Divergence:</span>
            <span className="text-emerald-400 font-bold">{strongest.code}</span>
            <span className="text-slate-600">vs</span>
            <span className="text-rose-400 font-bold">{weakest.code}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
            Favors Long {strongest.code}/{weakest.code}
          </span>
        </div>
      )}

      {/* Grid of 8 Currencies */}
      <div className="grid grid-cols-2 gap-1.5">
        {strengths.map(item => {
          const colors = getStatusColor(item.status);
          return (
            <div
              key={item.code}
              className={`p-2 rounded-lg border ${colors.bg} transition`}
            >
              <div className="flex items-center justify-between font-mono mb-1">
                <span className="font-extrabold text-xs text-white">{item.code}</span>
                <span className={`text-[11px] font-bold ${colors.text}`}>{item.score}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${colors.bar} rounded-full transition-all duration-300`}
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                <span className="text-slate-400">{item.status}</span>
                <span className={item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {item.change24h >= 0 ? '+' : ''}{item.change24h}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
