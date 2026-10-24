import React, { useState, useEffect } from 'react';
import {
  Sparkles, Radio, Play, Pause, Square, Volume2,
  TrendingUp, TrendingDown, Target, ShieldCheck,
  CheckCircle2, Layers, Cpu, Compass
} from 'lucide-react';
import { AiScanResult, CurrencyPair, Timeframe } from '../types/forex';
import { AudioEngine, AudioStatus, fxAudioService } from '../services/audioService';

interface AiMarketIntelligenceProps {
  pair: CurrencyPair;
  timeframe: Timeframe;
  analysis: AiScanResult | null;
  isScanning: boolean;
  onRunScan: () => void;
  elevenLabsApiKey: string;
  selectedVoiceId: string;
  speechSpeed: number;
}

export const AiMarketIntelligence: React.FC<AiMarketIntelligenceProps> = ({
  pair,
  timeframe,
  analysis,
  isScanning,
  onRunScan,
  elevenLabsApiKey,
  selectedVoiceId,
  speechSpeed,
}) => {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle');
  const [audioEngine, setAudioEngine] = useState<AudioEngine>('none');
  const [waveformBars, setWaveformBars] = useState<number[]>([15, 25, 40, 20, 60, 35, 75, 45, 30, 20]);

  // Waveform animation when playing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (audioStatus === 'playing') {
      interval = setInterval(() => {
        setWaveformBars(Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 15));
      }, 140);
    } else {
      setWaveformBars([12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]);
    }
    return () => clearInterval(interval);
  }, [audioStatus]);

  const handlePlayVoiceover = () => {
    if (!analysis?.speechScript) return;
    fxAudioService.playVoiceover(analysis.speechScript, {
      apiKey: elevenLabsApiKey,
      voiceId: selectedVoiceId,
      speed: speechSpeed,
      onStatusChange: (status, engine) => {
        setAudioStatus(status);
        setAudioEngine(engine);
      }
    });
  };

  const handlePause = () => {
    fxAudioService.pause((status, engine) => {
      setAudioStatus(status);
      setAudioEngine(engine);
    });
  };

  const handleResume = () => {
    fxAudioService.resume((status, engine) => {
      setAudioStatus(status);
      setAudioEngine(engine);
    });
  };

  const handleStop = () => {
    fxAudioService.stop();
    setAudioStatus('idle');
    setAudioEngine('none');
  };

  // Signal color styling helper
  const getSignalBadge = (sig: string) => {
    if (sig.includes('BUY')) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 glow-emerald',
        icon: <TrendingUp className="w-4 h-4 text-emerald-400" />
      };
    }
    if (sig.includes('SELL')) {
      return {
        bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400 glow-rose',
        icon: <TrendingDown className="w-4 h-4 text-rose-400" />
      };
    }
    return {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      icon: <Compass className="w-4 h-4 text-amber-400" />
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-wide text-white uppercase font-sans">
              AI Market Intelligence Report
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Quantitative Deep Analysis for <span className="text-white font-bold">{pair.symbol}</span> ({timeframe})
            </p>
          </div>
        </div>

        {/* Audio Broadcast Controls (if analysis exists) */}
        {analysis && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mr-1">
              <Radio className={`w-3 h-3 ${audioStatus === 'playing' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              {audioEngine === 'elevenlabs' ? 'ElevenLabs HD' : 'Speech Voice'}
            </span>

            {audioStatus === 'playing' ? (
              <button
                onClick={handlePause}
                className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition"
                title="Pause voice briefing"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : audioStatus === 'paused' ? (
              <button
                onClick={handleResume}
                className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                title="Resume voice briefing"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handlePlayVoiceover}
                disabled={audioStatus === 'loading'}
                className="flex items-center gap-1.5 px-2 py-0.8 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition text-[11px] font-semibold"
                title="Play voice briefing"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            )}

            {audioStatus !== 'idle' && (
              <button
                onClick={handleStop}
                className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                title="Stop voice briefing"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Audio Waveform Equalizer */}
            <div className="flex items-end gap-0.5 h-4 ml-1">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-emerald-400 rounded-t transition-all duration-150"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Body */}
      {analysis ? (
        <div className="space-y-3.5 mt-3">
          {/* Signal & Structure Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              {(() => {
                const badge = getSignalBadge(analysis.signal);
                return (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wide ${badge.bg}`}>
                    {badge.icon}
                    <span>{analysis.signal}</span>
                  </div>
                );
              })()}

              <div className="text-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Market Structure</span>
                <span className="font-mono font-semibold text-slate-200">{analysis.marketStructure}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
                <span className="font-bold text-emerald-400">{analysis.confidence}%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Risk / Reward</span>
                <span className="font-bold text-cyan-400">{analysis.riskReward}</span>
              </div>
            </div>
          </div>

          {/* Trade Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Execution Entry</span>
              <span className="font-bold text-sm text-slate-100">{analysis.entry.toFixed(pair.digits)}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Stop Loss</span>
              <span className="font-bold text-sm text-rose-400">{analysis.sl.toFixed(pair.digits)}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Target TP 1</span>
              <span className="font-bold text-sm text-emerald-400">{analysis.tp1.toFixed(pair.digits)}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Target TP 2</span>
              <span className="font-bold text-sm text-cyan-400">{analysis.tp2.toFixed(pair.digits)}</span>
            </div>
          </div>

          {/* Technical Rationale Bullets */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
            <div className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Institutional Technical Rationale</span>
            </div>
            <div className="space-y-1.5">
              {analysis.rationale.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span className="leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Money Concepts (SMC) Section */}
          <div className="p-3 bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5 font-sans">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Money Concepts (SMC) & Liquidity Map</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Order Block Zone:</span>
                <span className="text-emerald-300 font-semibold">{analysis.smartMoneyConcept.orderBlockZone}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Fair Value Gap (FVG):</span>
                <span className="text-cyan-300 font-semibold">{analysis.smartMoneyConcept.fairValueGap}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal italic">
              "{analysis.smartMoneyConcept.biasSummary}"
            </p>
          </div>

          {/* Audio Spoken Script Readout */}
          <div className="p-3 bg-emerald-950/15 border border-emerald-500/20 rounded-lg text-xs italic text-emerald-200/90 leading-relaxed font-sans">
            "{analysis.speechScript}"
          </div>

          {/* Engine & Timestamp Footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Engine: <span className="text-slate-300 font-medium">{analysis.engineUsed}</span></span>
            </div>
            <span>Generated at {analysis.analyzedAt}</span>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">No AI Scan Generated Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click the button below to initiate an institutional algorithmic scan of <span className="text-emerald-400 font-bold">{pair.symbol}</span> on the <span className="text-white font-bold">{timeframe}</span> timeframe.
            </p>
          </div>
          <button
            onClick={onRunScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950"
          >
            {isScanning ? 'Analyzing Market...' : 'Run Scan Now'}
          </button>
        </div>
      )}
    </div>
  );
};
