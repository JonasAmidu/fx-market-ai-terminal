import React, { useState } from 'react';
import { ShieldAlert, DollarSign, Calculator, AlertTriangle, ArrowRight } from 'lucide-react';
import { CurrencyPair, AiScanResult } from '../types/forex';

interface RiskCalculatorProps {
  pair: CurrencyPair;
  analysis: AiScanResult | null;
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({ pair, analysis }) => {
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [slPips, setSlPips] = useState<number>(25);
  const [leverage, setLeverage] = useState<number>(100);

  // Exact Pip Value calculations based on currency pair
  const isJpy = pair.symbol.includes('JPY');
  const isGold = pair.symbol.includes('XAU');
  const isSilver = pair.symbol.includes('XAG');

  // Pip value per 1.0 standard lot (100,000 units) in USD:
  // For XXX/USD (EUR/USD, GBP/USD, AUD/USD): pip value = $10.00
  // For USD/JPY: pip value = (0.01 / USDJPY) * 100,000 ≈ $6.50
  // For USD/CAD: pip value = (0.0001 / USDCAD) * 100,000 ≈ $7.40
  // For XAU/USD: 100 oz contract, $0.10 pip = $10.00
  let pipValuePerStdLot = 10;
  if (isJpy) {
    pipValuePerStdLot = (0.01 / pair.price) * 100000;
  } else if (pair.symbol === 'USD/CAD') {
    pipValuePerStdLot = (0.0001 / pair.price) * 100000;
  } else if (pair.symbol === 'USD/CHF') {
    pipValuePerStdLot = (0.0001 / pair.price) * 100000;
  } else if (isGold) {
    pipValuePerStdLot = 10;
  }

  const cashAtRisk = (accountBalance * (riskPercent / 100));
  const calculatedLotSize = slPips > 0 && pipValuePerStdLot > 0
    ? (cashAtRisk / (slPips * pipValuePerStdLot))
    : 0;

  const standardLots = calculatedLotSize.toFixed(2);
  const miniLots = (calculatedLotSize * 10).toFixed(1);
  const microLots = (calculatedLotSize * 100).toFixed(0);

  // Margin Required = (Lot Size * 100,000 * Contract Price) / Leverage
  const contractValue = isGold ? calculatedLotSize * 100 * pair.price : calculatedLotSize * 100000;
  const marginRequired = (contractValue / leverage).toFixed(2);
  const marginPercentOfBalance = ((parseFloat(marginRequired) / accountBalance) * 100);

  // Synchronize with AI scan stop loss if available
  const syncWithAiSl = () => {
    if (!analysis) return;
    const diff = Math.abs(pair.price - analysis.sl);
    const pipUnit = isJpy ? 0.01 : isGold ? 0.1 : 0.0001;
    const calculatedPips = Math.round(diff / pipUnit);
    if (calculatedPips > 0) {
      setSlPips(calculatedPips);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Institutional Risk Calculator
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Pair: <span className="text-white font-bold">{pair.symbol}</span>
        </span>
      </div>

      <div className="space-y-3 mt-3 text-xs">
        {/* Account Balance */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px]">Account Capital ($)</label>
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-slate-500 font-mono">$</span>
            <input
              type="number"
              min="100"
              step="500"
              value={accountBalance}
              onChange={e => setAccountBalance(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Risk % and Stop Loss Pips */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 text-[11px]">Risk Per Trade</label>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">{riskPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0.5, 1.0, 2.0].map(pct => (
                <button
                  key={pct}
                  onClick={() => setRiskPercent(pct)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono border transition ${
                    riskPercent === pct
                      ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 text-[11px]">Stop Loss (Pips)</label>
              {analysis && (
                <button
                  onClick={syncWithAiSl}
                  className="text-[9px] text-cyan-400 hover:underline font-mono"
                  title="Sync with current AI Scan SL"
                >
                  Sync AI
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              value={slPips}
              onChange={e => setSlPips(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Leverage Selector */}
        <div>
          <label className="text-slate-400 block mb-1 text-[11px]">Account Leverage</label>
          <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
            {[30, 50, 100, 500].map(lev => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`py-1 rounded border transition ${
                  leverage === lev
                    ? 'bg-slate-800 border-slate-600 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                1:{lev}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Results Box */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-sans">Cash at Risk:</span>
            <span className="text-rose-400 font-bold text-sm">${cashAtRisk.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-200 font-bold font-sans">Recommended Size:</span>
            <span className="text-emerald-400 font-extrabold text-base">{standardLots} Lots</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
            <div>
              <span>Mini Lots:</span> <strong className="text-slate-200">{miniLots}</strong>
            </div>
            <div>
              <span>Micro Lots:</span> <strong className="text-slate-200">{microLots}</strong>
            </div>
            <div>
              <span>Pip Value:</span> <strong className="text-slate-200">${(calculatedLotSize * pipValuePerStdLot).toFixed(2)}</strong>
            </div>
            <div>
              <span>Req. Margin:</span> <strong className="text-slate-200">${marginRequired}</strong>
            </div>
          </div>

          {marginPercentOfBalance > 50 && (
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] mt-1 font-sans">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Margin requires {marginPercentOfBalance.toFixed(0)}% of account equity. Consider lower size.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
