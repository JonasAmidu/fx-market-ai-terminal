import React, { useState, useEffect, useRef } from 'react';
import {
  CurrencyPair, Candle, Timeframe, IndicatorState, AiScanResult, CurrencyStrength
} from './types/forex';
import {
  INITIAL_CURRENCY_PAIRS, generateCandles, simulateMarketTick, calculateCurrencyStrengths
} from './services/marketDataGenerator';
import { runForexAiScan } from './services/aiAnalysisEngine';
import { fxAudioService, ELEVENLABS_VOICES } from './services/audioService';

import { Header } from './components/Header';
import { Watchlist } from './components/Watchlist';
import { CandlestickChart } from './components/CandlestickChart';
import { AiMarketIntelligence } from './components/AiMarketIntelligence';
import { AiCopilotChat } from './components/AiCopilotChat';
import { CurrencyStrengthMeter } from './components/CurrencyStrengthMeter';
import { CorrelationMatrix } from './components/CorrelationMatrix';
import { RiskCalculator } from './components/RiskCalculator';
import { EconomicCalendar } from './components/EconomicCalendar';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Market Pairs State
  const [pairs, setPairs] = useState<CurrencyPair[]>(INITIAL_CURRENCY_PAIRS);
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(INITIAL_CURRENCY_PAIRS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [candles, setCandles] = useState<Candle[]>([]);

  // Chart Indicators State
  const [indicators, setIndicators] = useState<IndicatorState>({
    ema9: false,
    ema20: true,
    ema50: true,
    ema200: false,
    bollinger: false,
    rsi: true,
    macd: true,
    orderBlocks: true
  });

  // Live Market Feed Ticks State
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(true);

  // AI & Audio Analysis State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiScanResult | null>(null);

  // Settings & Credentials State
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<string>('gemini-2.5-flash');
  const [elevenLabsKey, setElevenLabsKey] = useState<string>('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(ELEVENLABS_VOICES[0].id);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [autoPlayVoiceover, setAutoPlayVoiceover] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Right column tab switcher (Desktop / Tablet view)
  const [rightPanelTab, setRightPanelTab] = useState<'copilot' | 'risk' | 'calendar'>('copilot');
  // Left column secondary tab (Strength vs Correlation)
  const [leftSubTab, setLeftSubTab] = useState<'strength' | 'correlation'>('strength');

  // Load saved credentials from localStorage on initial render
  useEffect(() => {
    try {
      const savedGKey = localStorage.getItem('fx_gemini_key');
      const savedGModel = localStorage.getItem('fx_gemini_model');
      const savedElKey = localStorage.getItem('fx_eleven_key');
      const savedVoice = localStorage.getItem('fx_voice_id');
      const savedSpeed = localStorage.getItem('fx_speech_speed');
      const savedAuto = localStorage.getItem('fx_autoplay');

      if (savedGKey) setGeminiKey(savedGKey);
      if (savedGModel) setGeminiModel(savedGModel);
      if (savedElKey) setElevenLabsKey(savedElKey);
      if (savedVoice) setSelectedVoiceId(savedVoice);
      if (savedSpeed) setSpeechSpeed(parseFloat(savedSpeed));
      if (savedAuto !== null) setAutoPlayVoiceover(savedAuto === 'true');
    } catch (e) {
      console.warn('LocalStorage retrieval error:', e);
    }
  }, []);

  // Regenerate candles whenever selectedPair or timeframe changes
  useEffect(() => {
    const generated = generateCandles(selectedPair, timeframe, 80);
    setCandles(generated);
  }, [selectedPair.symbol, timeframe]);

  // Live Micro-Tick Market Simulation Loop
  useEffect(() => {
    if (!isLiveFeed) return;

    const interval = setInterval(() => {
      setPairs(prevPairs => {
        // Randomly choose 1 or 2 pairs to tick
        const updated = prevPairs.map(p => {
          if (p.symbol === selectedPair.symbol || Math.random() > 0.6) {
            return simulateMarketTick(p);
          }
          return p;
        });

        // Update selectedPair reference
        const currentActive = updated.find(p => p.symbol === selectedPair.symbol);
        if (currentActive) {
          setSelectedPair(currentActive);

          // Update the last candle's close, high, low with the new tick
          setCandles(prevCandles => {
            if (prevCandles.length === 0) return prevCandles;
            const last = { ...prevCandles[prevCandles.length - 1] };
            last.close = currentActive.price;
            last.high = Math.max(last.high, currentActive.price);
            last.low = Math.min(last.low, currentActive.price);
            last.volume += Math.floor(Math.random() * 5) + 1;
            return [...prevCandles.slice(0, -1), last];
          });
        }

        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLiveFeed, selectedPair.symbol]);

  // Toggle Indicator Helper
  const handleToggleIndicator = (key: keyof IndicatorState) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Run AI Market Scan Trigger
  const handleRunScan = async () => {
    if (isScanning || candles.length === 0) return;
    setIsScanning(true);
    fxAudioService.stop();

    try {
      const result = await runForexAiScan(selectedPair, timeframe, candles, {
        geminiApiKey: geminiKey,
        geminiModel: geminiModel
      });

      setAiAnalysis(result);

      // Auto-play audio voiceover if enabled
      if (autoPlayVoiceover && result.speechScript) {
        fxAudioService.playVoiceover(result.speechScript, {
          apiKey: elevenLabsKey,
          voiceId: selectedVoiceId,
          speed: speechSpeed,
          onStatusChange: () => {}
        });
      }
    } catch (err) {
      console.error('Scan execution error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Currency Strengths
  const currencyStrengths = calculateCurrencyStrengths(pairs);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        selectedPair={selectedPair}
        isScanning={isScanning}
        onRunScan={handleRunScan}
        isLiveFeed={isLiveFeed}
        onToggleLiveFeed={() => setIsLiveFeed(!isLiveFeed)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasGeminiKey={geminiKey.trim().length > 10}
        hasElevenLabsKey={elevenLabsKey.trim().length > 10}
      />

      {/* Main Terminal Dashboard Layout */}
      <main className="flex-1 p-3 sm:p-4 max-w-[1800px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* LEFT COLUMN: WATCHLIST & CURRENCY METRICS (3 Columns) */}
        <div className="lg:col-span-3 space-y-3.5 flex flex-col">
          {/* Pair Watchlist */}
          <div className="flex-1">
            <Watchlist
              pairs={pairs}
              selectedPair={selectedPair}
              onSelectPair={p => {
                setSelectedPair(p);
                // Reset previous scan when changing pair so new pair scan can be fresh
                setAiAnalysis(null);
                fxAudioService.stop();
              }}
            />
          </div>

          {/* Subtabs: Currency Strength vs Correlation Matrix */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setLeftSubTab('strength')}
                className={`flex-1 py-1 rounded-lg transition font-semibold ${
                  leftSubTab === 'strength'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Strength Meter
              </button>
              <button
                onClick={() => setLeftSubTab('correlation')}
                className={`flex-1 py-1 rounded-lg transition font-semibold ${
                  leftSubTab === 'correlation'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Correlation Map
              </button>
            </div>

            {leftSubTab === 'strength' ? (
              <CurrencyStrengthMeter strengths={currencyStrengths} />
            ) : (
              <CorrelationMatrix />
            )}
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE CHART & AI ANALYSIS (6 Columns) */}
        <div className="lg:col-span-6 space-y-3.5 flex flex-col">
          {/* Candlestick & Technical Canvas Chart */}
          <CandlestickChart
            pair={selectedPair}
            candles={candles}
            timeframe={timeframe}
            onTimeframeChange={tf => {
              setTimeframe(tf);
              setAiAnalysis(null);
              fxAudioService.stop();
            }}
            indicators={indicators}
            onToggleIndicator={handleToggleIndicator}
          />

          {/* AI Intelligence Scan Report & Voiceover Readout */}
          <AiMarketIntelligence
            pair={selectedPair}
            timeframe={timeframe}
            analysis={aiAnalysis}
            isScanning={isScanning}
            onRunScan={handleRunScan}
            elevenLabsApiKey={elevenLabsKey}
            selectedVoiceId={selectedVoiceId}
            speechSpeed={speechSpeed}
          />
        </div>

        {/* RIGHT COLUMN: AI COPILOT, RISK CALCULATOR & CALENDAR (3 Columns) */}
        <div className="lg:col-span-3 space-y-3.5 flex flex-col">
          {/* Navigation Pill Bar for Right Panel */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setRightPanelTab('copilot')}
              className={`flex-1 py-1.5 rounded-lg transition font-semibold ${
                rightPanelTab === 'copilot'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Copilot
            </button>
            <button
              onClick={() => setRightPanelTab('risk')}
              className={`flex-1 py-1.5 rounded-lg transition font-semibold ${
                rightPanelTab === 'risk'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk Sizing
            </button>
            <button
              onClick={() => setRightPanelTab('calendar')}
              className={`flex-1 py-1.5 rounded-lg transition font-semibold ${
                rightPanelTab === 'calendar'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Calendar
            </button>
          </div>

          {/* Right Panel View Components */}
          {rightPanelTab === 'copilot' && (
            <div className="space-y-3.5">
              <AiCopilotChat
                pair={selectedPair}
                timeframe={timeframe}
                config={{ geminiApiKey: geminiKey, geminiModel: geminiModel }}
              />
              <RiskCalculator pair={selectedPair} analysis={aiAnalysis} />
            </div>
          )}

          {rightPanelTab === 'risk' && (
            <div className="space-y-3.5">
              <RiskCalculator pair={selectedPair} analysis={aiAnalysis} />
              <EconomicCalendar />
            </div>
          )}

          {rightPanelTab === 'calendar' && (
            <div className="space-y-3.5">
              <EconomicCalendar />
              <RiskCalculator pair={selectedPair} analysis={aiAnalysis} />
            </div>
          )}
        </div>

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiKey={geminiKey}
        onSaveGeminiKey={setGeminiKey}
        geminiModel={geminiModel}
        onSaveGeminiModel={setGeminiModel}
        elevenLabsKey={elevenLabsKey}
        onSaveElevenLabsKey={setElevenLabsKey}
        selectedVoiceId={selectedVoiceId}
        onSaveSelectedVoiceId={setSelectedVoiceId}
        speechSpeed={speechSpeed}
        onSaveSpeechSpeed={setSpeechSpeed}
        autoPlayVoiceover={autoPlayVoiceover}
        onSaveAutoPlayVoiceover={setAutoPlayVoiceover}
      />
    </div>
  );
}
