import React, { useState, useEffect } from 'react';
import {
  Activity, Sparkles, Settings, Play, Pause,
  Clock, ShieldCheck, Key
} from 'lucide-react';
import { CurrencyPair } from '../types/forex';

interface HeaderProps {
  selectedPair: CurrencyPair;
  isScanning: boolean;
  onRunScan: () => void;
  isLiveFeed: boolean;
  onToggleLiveFeed: () => void;
  onOpenSettings: () => void;
  hasGeminiKey: boolean;
  hasElevenLabsKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPair,
  isScanning,
  onRunScan,
  isLiveFeed,
  onToggleLiveFeed,
  onOpenSettings,
  hasGeminiKey,
  hasElevenLabsKey,
}) => {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Brand & Market Session */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-inner">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-sans">
              FX APEX TERMINAL
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">
              QUANT AI v3.5
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {utcTime}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400/90">London / New York Session</span>
          </div>
        </div>
      </div>

      {/* Center Ticker Highlight */}
      <div className="hidden md:flex items-center gap-4 bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">ACTIVE:</span>
          <span className="text-white font-bold">{selectedPair.symbol}</span>
          <span className="text-emerald-400 font-semibold">{selectedPair.price.toFixed(selectedPair.digits)}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500">SPREAD:</span>
          <span className="text-amber-400 font-medium">{selectedPair.spreadPips} pips</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500">24H:</span>
          <span className={selectedPair.changePct >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
            {selectedPair.changePct >= 0 ? '+' : ''}{selectedPair.changePct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Live Feed Toggle */}
        <button
          onClick={onToggleLiveFeed}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
            isLiveFeed
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={isLiveFeed ? 'Pause Live Market Tick Feed' : 'Resume Live Market Tick Feed'}
        >
          {isLiveFeed ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Pause className="w-3 h-3 text-emerald-400 ml-0.5" />
              <span>LIVE TICKS</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-amber-400" />
              <span>PAUSED</span>
            </>
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
          title="Configure Gemini & ElevenLabs API Settings"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">AI Settings</span>
          <div className="flex items-center gap-1 ml-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${hasGeminiKey ? 'bg-emerald-400' : 'bg-slate-500'}`}
              title={hasGeminiKey ? 'Gemini API Connected' : 'Defaulting to Heuristic Engine'}
            />
            <span
              className={`w-1.5 h-1.5 rounded-full ${hasElevenLabsKey ? 'bg-emerald-400' : 'bg-slate-500'}`}
              title={hasElevenLabsKey ? 'ElevenLabs Voice Connected' : 'Browser Web Speech Active'}
            />
          </div>
        </button>

        {/* AI Scan Trigger Button */}
        <button
          onClick={onRunScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950 glow-emerald"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Synthesizing...' : 'Run AI Market Scan'}</span>
        </button>
      </div>
    </header>
  );
};
