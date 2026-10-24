import React, { useState } from 'react';
import { Search, Globe, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { CurrencyPair } from '../types/forex';

interface WatchlistProps {
  pairs: CurrencyPair[];
  selectedPair: CurrencyPair;
  onSelectPair: (pair: CurrencyPair) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  pairs,
  selectedPair,
  onSelectPair,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Major' | 'Minor' | 'Metal'>('ALL');

  const filteredPairs = pairs.filter(p => {
    const matchesSearch = p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full shadow-sm">
      {/* Title & Filter Tabs */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          Watchlist
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          {filteredPairs.length} pairs
        </span>
      </div>

      {/* Category Pills */}
      <div className="grid grid-cols-4 gap-1 mb-2 bg-slate-950 p-1 rounded-lg border border-slate-800/80 text-[11px] font-mono">
        {(['ALL', 'Major', 'Minor', 'Metal'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`py-1 rounded text-center transition ${
              categoryFilter === cat
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search pair or asset..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 font-mono"
        />
      </div>

      {/* Pair List */}
      <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
        {filteredPairs.map(pair => {
          const isSelected = selectedPair.symbol === pair.symbol;
          const isPositive = pair.changePct >= 0;
          const priceStr = pair.price.toFixed(pair.digits);

          return (
            <button
              key={pair.symbol}
              onClick={() => onSelectPair(pair)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition border ${
                isSelected
                  ? 'bg-gradient-to-r from-slate-800 to-slate-800/90 border-emerald-500/60 text-white shadow-sm glow-emerald ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span className="font-mono text-white tracking-wide">{pair.symbol}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {pair.category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{pair.name}</div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-mono text-xs font-bold text-slate-100">{priceStr}</div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono text-slate-500">
                    Spr: {pair.spreadPips}
                  </span>
                  <div
                    className={`text-[10px] font-mono font-semibold flex items-center justify-end ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{pair.changePct.toFixed(2)}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
