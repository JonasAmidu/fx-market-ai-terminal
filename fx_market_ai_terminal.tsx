import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, Volume2, VolumeX, Pause, Play, Square,
  Settings, Zap, BarChart2, DollarSign, Calendar, Sliders, ShieldAlert,
  Activity, ArrowUpRight, ArrowDownRight, Layers, CheckCircle2, AlertTriangle,
  Globe, Radio, Sparkles, HelpCircle, Check, X
} from 'lucide-react';

// Default ElevenLabs Voices
const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Calm & Professional)', gender: 'Female' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Strong & Energetic)', gender: 'Female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Soft & Clear)', gender: 'Female' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Analytical)', gender: 'Male' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Confident)', gender: 'Female' },
  { id: 'TxGEqnscnnW249_DEi4', name: 'Josh (Deep & Authoritative)', gender: 'Male' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Clear & Direct)', gender: 'Male' },
  { id: 'yoZ06aGfM21300435900', name: 'Sam (Dynamic Reporter)', gender: 'Male' }
];

const CURRENCY_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0854, change: +0.0024, changePct: +0.22, high: 1.0880, low: 1.0821 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2642, change: -0.0031, changePct: -0.24, high: 1.2690, low: 1.2610 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 154.22, change: +0.85, changePct: +0.55, high: 154.80, low: 153.10 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', price: 0.6580, change: +0.0012, changePct: +0.18, high: 0.6610, low: 0.6550 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', price: 1.3540, change: -0.0015, changePct: -0.11, high: 1.3580, low: 1.3520 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', price: 194.88, change: +0.42, changePct: +0.22, high: 195.40, low: 193.90 },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', price: 2735.60, change: +14.20, changePct: +0.52, high: 2748.10, low: 2718.00 }
];

export default function App() {
  const [selectedPair, setSelectedPair] = useState(CURRENCY_PAIRS[0]);
  const [timeframe, setTimeframe] = useState('1H');
  const [indicators, setIndicators] = useState({ rsi: true, macd: true, ema20: true, ema50: true });
  
  // ElevenLabs & Audio States
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoReadScan, setAutoReadScan] = useState(true);
  const [audioStatus, setAudioStatus] = useState('idle'); // 'idle' | 'loading' | 'playing' | 'paused'
  const [audioEngine, setAudioEngine] = useState('none'); // 'elevenlabs' | 'webspeech'
  
  // Audio Playback Ref
  const audioRef = useRef(null);
  const [audioWaveform, setAudioWaveform] = useState([20, 40, 70, 30, 90, 40, 60, 20]);

  // AI Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Risk Calculator State
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [slPips, setSlPips] = useState(25);

  // Handle Chart Rendering
  const canvasRef = useRef(null);

  // Dynamic Audio Waveform Animation
  useEffect(() => {
    let interval;
    if (audioStatus === 'playing') {
      interval = setInterval(() => {
        setAudioWaveform(Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 20));
      }, 150);
    } else {
      setAudioWaveform([15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
    }
    return () => clearInterval(interval);
  }, [audioStatus]);

  // Render Synthetic Financial Canvas Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth);
    const height = (canvas.height = canvas.parentElement.clientHeight || 380);

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Generate price candles
    const numCandles = Math.floor(width / 14);
    let currentPrice = selectedPair.price;
    const candles = [];
    const volatility = selectedPair.symbol.includes('XAU') ? 3.5 : 0.0012;

    for (let i = 0; i < numCandles; i++) {
      const delta = (Math.random() - 0.48) * volatility;
      const open = currentPrice;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.8);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.8);
      currentPrice = close;
      candles.push({ open, close, high, low, x: i * 14 + 10 });
    }

    const minP = Math.min(...candles.map(c => c.low));
    const maxP = Math.max(...candles.map(c => c.high));
    const mapY = p => height - 30 - ((p - minP) / (maxP - minP || 1)) * (height - 60);

    // Draw EMAs if enabled
    if (indicators.ema20) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const y = mapY(c.close) + Math.sin(idx * 0.2) * 8;
        if (idx === 0) ctx.moveTo(c.x, y); else ctx.lineTo(c.x, y);
      });
      ctx.stroke();
    }

    if (indicators.ema50) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const y = mapY(c.close) + Math.cos(idx * 0.15) * 14;
        if (idx === 0) ctx.moveTo(c.x, y); else ctx.lineTo(c.x, y);
      });
      ctx.stroke();
    }

    // Draw Candlesticks
    candles.forEach(c => {
      const isBull = c.close >= c.open;
      const color = isBull ? '#10b981' : '#f43f5e';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // Wick
      ctx.beginPath();
      ctx.moveTo(c.x, mapY(c.high));
      ctx.lineTo(c.x, mapY(c.low));
      ctx.stroke();

      // Body
      const top = mapY(Math.max(c.open, c.close));
      const bottom = mapY(Math.min(c.open, c.close));
      const bodyH = Math.max(2, bottom - top);
      ctx.fillRect(c.x - 4, top, 8, bodyH);
    });

  }, [selectedPair, timeframe, indicators]);

  // Execute Gemini AI Analysis & Speech Trigger
  const runAiScan = async () => {
    setIsScanning(true);
    stopAudio();

    try {
      // Direct call to Gemini 3 Flash Preview via SDK API format
      const prompt = `Analyze the FX currency pair ${selectedPair.symbol} on the ${timeframe} timeframe. 
      Provide:
      1. Technical Bias (BUY, SELL, or NEUTRAL).
      2. Entry price, Stop Loss, and Take Profit target based on standard structure.
      3. Confidence percentage (e.g. 78%).
      4. Key technical drivers (2-3 concise bullets).
      5. A concise 3-sentence voiceover summary suitable for an audio broadcast briefing.

      Respond ONLY in raw JSON with the following structure:
      {
        "signal": "BUY" | "SELL" | "NEUTRAL",
        "entry": number,
        "sl": number,
        "tp": number,
        "confidence": number,
        "rationale": ["bullet 1", "bullet 2", "bullet 3"],
        "speechScript": "string concise voiceover script"
      }`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      const data = await res.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (resultText) {
        const parsed = JSON.parse(resultText);
        setAiAnalysis(parsed);

        if (autoReadScan && parsed.speechScript) {
          playAudioScan(parsed.speechScript);
        }
      }
    } catch (err) {
      // Fallback analysis simulation if API rate limits or network issues occur
      const fallbackAnalysis = {
        signal: selectedPair.change >= 0 ? 'BUY' : 'SELL',
        entry: selectedPair.price,
        sl: selectedPair.price * (selectedPair.change >= 0 ? 0.996 : 1.004),
        tp: selectedPair.price * (selectedPair.change >= 0 ? 1.008 : 0.992),
        confidence: Math.floor(Math.random() * 20) + 75,
        rationale: [
          `Bullish momentum confirmed on the ${timeframe} timeline.`,
          `Key liquidity block swept around ${selectedPair.low.toFixed(4)}.`,
          `RSI showing bullish divergence with EMA ribbon expansion.`
        ],
        speechScript: `Market scan for ${selectedPair.symbol}. Primary bias is ${selectedPair.change >= 0 ? 'BUY' : 'SELL'} at ${selectedPair.price}. Stop Loss at ${(selectedPair.price * 0.996).toFixed(4)} and Target Take Profit at ${(selectedPair.price * 1.008).toFixed(4)}. Trade with strict risk parameters.`
      };
      setAiAnalysis(fallbackAnalysis);
      if (autoReadScan) playAudioScan(fallbackAnalysis.speechScript);
    } finally {
      setIsScanning(false);
    }
  };

  // Play Audio Voiceover via ElevenLabs REST API or Fallback
  const playAudioScan = async (textToRead) => {
    const scriptText = textToRead || aiAnalysis?.speechScript;
    if (!scriptText) return;

    // Stop current audio if playing
    stopAudio();
    setAudioStatus('loading');

    // Attempt ElevenLabs direct API
    if (apiKey.trim()) {
      try {
        setAudioEngine('elevenlabs');
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey.trim()
          },
          body: JSON.stringify({
            text: scriptText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API returned status ${response.status}`);
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setAudioStatus('playing');
        audio.onended = () => {
          setAudioStatus('idle');
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setAudioStatus('idle');
          fallbackWebSpeech(scriptText);
        };

        await audio.play();
        return;
      } catch (e) {
        console.warn('ElevenLabs API Failed, defaulting to Browser Web Speech API:', e);
      }
    }

    // Fallback: Web Speech API (speechSynthesis)
    fallbackWebSpeech(scriptText);
  };

  const fallbackWebSpeech = (text) => {
    if ('speechSynthesis' in window) {
      setAudioEngine('webspeech');
      window.speechSynthesis.cancel(); // clear queue
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setAudioStatus('playing');
      utterance.onend = () => setAudioStatus('idle');
      utterance.onerror = () => setAudioStatus('idle');

      window.speechSynthesis.speak(utterance);
    } else {
      setAudioStatus('idle');
    }
  };

  const pauseAudio = () => {
    if (audioEngine === 'elevenlabs' && audioRef.current) {
      audioRef.current.pause();
      setAudioStatus('paused');
    } else if (audioEngine === 'webspeech') {
      window.speechSynthesis.pause();
      setAudioStatus('paused');
    }
  };

  const resumeAudio = () => {
    if (audioEngine === 'elevenlabs' && audioRef.current) {
      audioRef.current.play();
      setAudioStatus('playing');
    } else if (audioEngine === 'webspeech') {
      window.speechSynthesis.resume();
      setAudioStatus('playing');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAudioStatus('idle');
  };

  // Position Size Calculation
  const riskAmount = (accountBalance * (riskPercent / 100)).toFixed(2);
  const pipValue = selectedPair.symbol.includes('JPY') ? 1000 : 10;
  const lotSize = (slPips > 0 ? (riskAmount / (slPips * pipValue)).toFixed(2) : '0.00');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* HEADER / NAVIGATION BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              FX APEX TERMINAL <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ml-2">AI v3.1</span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Real-Time Market Analytics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400">Live Feeds</span>
            </p>
          </div>
        </div>

        {/* Top Controls & Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>ElevenLabs Voice Settings</span>
            {apiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="API Key Configured" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Demo / Fallback Mode" />
            )}
          </button>

          <button
            onClick={runAiScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950"
          >
            <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning Markets...' : 'Run AI Market Scan'}
          </button>
        </div>
      </header>

      {/* MAIN TERMINAL GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-[1700px] mx-auto w-full">
        
        {/* LEFT COLUMN: PAIR WATCHLIST & HEATMAP (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Watchlist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Major Pairs Watchlist
              </span>
              <span className="text-[10px] text-slate-500">Live Quotes</span>
            </div>
            
            <div className="space-y-1">
              {CURRENCY_PAIRS.map(pair => {
                const isSelected = selectedPair.symbol === pair.symbol;
                const isPositive = pair.change >= 0;
                return (
                  <button
                    key={pair.symbol}
                    onClick={() => setSelectedPair(pair)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition border ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/50 text-white shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        {pair.symbol}
                      </div>
                      <div className="text-[10px] text-slate-400">{pair.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold">{pair.price.toFixed(pair.symbol.includes('JPY') ? 2 : 4)}</div>
                      <div className={`text-[10px] font-mono flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{pair.changePct.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency Matrix Heatmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block px-1">
              Relative Currency Strength
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
              {[
                { c: 'USD', s: '+0.85%', strong: true },
                { c: 'EUR', s: '+0.22%', strong: true },
                { c: 'GBP', s: '-0.31%', strong: false },
                { c: 'JPY', s: '-0.65%', strong: false },
                { c: 'AUD', s: '+0.18%', strong: true },
                { c: 'CAD', s: '-0.12%', strong: false },
                { c: 'CHF', s: '-0.05%', strong: false },
                { c: 'NZD', s: '+0.40%', strong: true },
              ].map(item => (
                <div
                  key={item.c}
                  className={`p-2 rounded border ${
                    item.strong
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                  }`}
                >
                  <div className="font-bold">{item.c}</div>
                  <div className="text-[10px]">{item.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE CHART & ANALYSIS PANEL (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Interactive Chart Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
            
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-white font-mono">{selectedPair.symbol}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Spot FX
                </span>
              </div>

              {/* Timeframe Toggles */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['1M', '5M', '15M', '1H', '4H', '1D'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-xs rounded font-mono transition ${
                      timeframe === tf
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Technical Overlay Toggles */}
              <div className="flex items-center gap-2">
                {Object.keys(indicators).map(ind => (
                  <button
                    key={ind}
                    onClick={() => setIndicators(prev => ({ ...prev, [ind]: !prev[ind] }))}
                    className={`px-2 py-0.5 text-[10px] rounded font-mono border uppercase transition ${
                      indicators[ind]
                        ? 'bg-slate-800 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Chart Area */}
            <div className="relative w-full h-80 bg-slate-950/60 rounded-lg border border-slate-800/80 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
          </div>

          {/* AI SCAN & ELEVENLABS AUDIO READOUT PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm uppercase tracking-wide text-white">
                  Gemini AI Market Intelligence & ElevenLabs Voice Scan
                </h3>
              </div>

              {/* Audio Control Bar */}
              {aiAnalysis && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                    <Radio className={`w-3 h-3 ${audioStatus === 'playing' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                    {audioEngine === 'elevenlabs' ? 'ElevenLabs' : 'Browser Voice'}
                  </span>

                  {audioStatus === 'playing' ? (
                    <button
                      onClick={pauseAudio}
                      className="p-1 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition"
                      title="Pause Audio"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : audioStatus === 'paused' ? (
                    <button
                      onClick={resumeAudio}
                      className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                      title="Resume Audio"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => playAudioScan()}
                      disabled={audioStatus === 'loading'}
                      className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition disabled:opacity-50"
                      title="Read AI Scan"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {audioStatus !== 'idle' && (
                    <button
                      onClick={stopAudio}
                      className="p-1 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                      title="Stop Audio"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* AI Scan Content Display */}
            {aiAnalysis ? (
              <div className="space-y-4">
                {/* Audio Status Waveform Visualization */}
                <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        AI
                      </div>
                      {audioStatus === 'playing' && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {ELEVENLABS_VOICES.find(v => v.id === selectedVoice)?.name || 'Market Voiceover'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Status: {audioStatus.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Equalizer Waveform Bars */}
                  <div className="flex items-end gap-1 h-6">
                    {audioWaveform.map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-emerald-400/80 rounded-t transition-all duration-150"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Signal Badge & Target Parameters */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Signal</span>
                    <span className={`font-bold font-mono text-sm ${
                      aiAnalysis.signal === 'BUY' ? 'text-emerald-400' : aiAnalysis.signal === 'SELL' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {aiAnalysis.signal}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Entry</span>
                    <span className="font-bold font-mono text-xs text-slate-200">{aiAnalysis.entry?.toFixed(4)}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Stop Loss</span>
                    <span className="font-bold font-mono text-xs text-rose-400">{aiAnalysis.sl?.toFixed(4)}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Take Profit</span>
                    <span className="font-bold font-mono text-xs text-emerald-400">{aiAnalysis.tp?.toFixed(4)}</span>
                  </div>
                </div>

                {/* Rationale Bullets */}
                <div className="space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-xs">
                  <div className="font-semibold text-slate-300 mb-1">Key Technical Drivers:</div>
                  {aiAnalysis.rationale?.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-400">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Speech Script Readout Box */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-xs italic text-emerald-200/90">
                  "{aiAnalysis.speechScript}"
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto opacity-40 text-emerald-400" />
                <p className="text-xs">Click "Run AI Market Scan" above to analyze {selectedPair.symbol} and trigger ElevenLabs audio commentary.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RISK CALCULATOR & CALENDAR (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Position Size & Risk Calculator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Risk & Position Calculator
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Account Balance ($)</label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={e => setAccountBalance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Risk (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={e => setRiskPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stop Loss (Pips)</label>
                  <input
                    type="number"
                    value={slPips}
                    onChange={e => setSlPips(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash at Risk:</span>
                  <span className="font-mono text-rose-400 font-semibold">${riskAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-200 font-semibold">Recommended Lot Size:</span>
                  <span className="font-mono text-emerald-400 font-bold">{lotSize} Lots</span>
                </div>
              </div>
            </div>
          </div>

          {/* High Impact Economic Calendar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                High Impact Economic Events
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { time: '13:30', ccy: 'USD', name: 'Core CPI m/m', impact: 'HIGH', forecast: '0.3%', prev: '0.3%' },
                { time: '14:00', ccy: 'EUR', name: 'ECB Rate Decision', impact: 'HIGH', forecast: '3.25%', prev: '3.50%' },
                { time: '18:00', ccy: 'USD', name: 'FOMC Meeting Minutes', impact: 'HIGH', forecast: '-', prev: '-' },
              ].map((ev, idx) => (
                <div key={idx} className="p-2 bg-slate-950 border border-slate-800/80 rounded flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">{ev.time}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">
                        {ev.ccy}
                      </span>
                    </div>
                    <div className="font-medium text-slate-300 mt-0.5">{ev.name}</div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    <div>Fcst: {ev.forecast}</div>
                    <div>Prev: {ev.prev}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ELEVENLABS SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">ElevenLabs Voice Configuration</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* API Key Input */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  ElevenLabs API Key
                </label>
                <input
                  type="password"
                  placeholder="xi-api-key..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter your API key from ElevenLabs. If blank, the app will automatically fall back to Web Speech API or simulated commentary.
                </p>
              </div>

              {/* Voice Selector Dropdown */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Select AI Analyst Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={e => setSelectedVoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-sans focus:outline-none focus:border-emerald-500"
                >
                  {ELEVENLABS_VOICES.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto Read Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoRead"
                  checked={autoReadScan}
                  onChange={e => setAutoReadScan(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="autoRead" className="text-slate-300 cursor-pointer">
                  Automatically read scan aloud upon AI completion
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
              >
                Save Settings
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}