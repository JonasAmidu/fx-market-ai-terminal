import React, { useState } from 'react';
import { Calendar, AlertCircle, ChevronDown, ChevronUp, Sparkles, Filter } from 'lucide-react';
import { EconomicEvent } from '../types/forex';
import { INITIAL_ECONOMIC_EVENTS } from '../services/marketDataGenerator';

export const EconomicCalendar: React.FC = () => {
  const [events] = useState<EconomicEvent[]>(INITIAL_ECONOMIC_EVENTS);
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEvents = events.filter(e => {
    const matchesImpact = impactFilter === 'ALL' || e.impact === 'HIGH';
    const matchesCurrency = currencyFilter === 'ALL' || e.ccy === currencyFilter;
    return matchesImpact && matchesCurrency;
  });

  const getImpactBadge = (impact: EconomicEvent['impact']) => {
    switch (impact) {
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'MED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Macro Economic Calendar
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">G10 Central Banks</span>
      </div>

      {/* Filter Ribbon */}
      <div className="flex items-center justify-between gap-2 my-2.5 text-[10px] font-mono">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setImpactFilter('ALL')}
            className={`px-2 py-0.5 rounded border ${
              impactFilter === 'ALL'
                ? 'bg-slate-800 text-white border-slate-600 font-bold'
                : 'text-slate-500 border-slate-800'
            }`}
          >
            All Impact
          </button>
          <button
            onClick={() => setImpactFilter('HIGH')}
            className={`px-2 py-0.5 rounded border ${
              impactFilter === 'HIGH'
                ? 'bg-rose-950 text-rose-300 border-rose-800 font-bold'
                : 'text-slate-500 border-slate-800'
            }`}
          >
            High Impact Only
          </button>
        </div>

        <select
          value={currencyFilter}
          onChange={e => setCurrencyFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Currencies</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="AUD">AUD</option>
        </select>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredEvents.map(ev => {
          const isExpanded = expandedId === ev.id;
          return (
            <div
              key={ev.id}
              className="bg-slate-950 rounded-lg border border-slate-800/80 p-2.5 transition hover:border-slate-700"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 font-semibold">{ev.time}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ev.date}</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${getImpactBadge(ev.impact)}`}>
                      {ev.ccy}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-200 mt-1">{ev.name}</div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div className="text-[10px] font-mono text-slate-400">
                    <div>Act: <span className="text-emerald-400 font-bold">{ev.actual}</span></div>
                    <div>Fcst: <span className="text-slate-300">{ev.forecast}</span></div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                </div>
              </div>

              {isExpanded && ev.aiImpactVerdict && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-start gap-1.5 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">AI Macro Impact:</span>
                  </div>
                  <p className="text-slate-400 pl-5 text-[10px] leading-relaxed">
                    {ev.aiImpactVerdict}
                  </p>
                  <div className="flex items-center justify-between pl-5 pt-1 text-[9px] font-mono text-slate-500">
                    <span>Previous: {ev.previous}</span>
                    <span>Expected Volatility: {ev.impact === 'HIGH' ? 'High (±40-75 pips)' : 'Moderate (±15-30 pips)'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
