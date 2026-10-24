export type Timeframe = '1M' | '5M' | '15M' | '1H' | '4H' | '1D';

export interface CurrencyPair {
  symbol: string;
  name: string;
  category: 'Major' | 'Minor' | 'Metal' | 'Commodity';
  price: number;
  bid: number;
  ask: number;
  spreadPips: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume24h: string;
  baseCurrency: string;
  quoteCurrency: string;
  digits: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorState {
  ema9: boolean;
  ema20: boolean;
  ema50: boolean;
  ema200: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
  orderBlocks: boolean;
}

export interface AiScanResult {
  signal: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  riskReward: string;
  confidence: number;
  marketStructure: 'BULLISH CONTINUATION' | 'BEARISH BREAKDOWN' | 'RANGE-BOUND' | 'LIQUIDITY SWEEP' | 'REVERSAL';
  keyLevels: {
    support: number[];
    resistance: number[];
    pivotPoint: number;
  };
  rationale: string[];
  smartMoneyConcept: {
    orderBlockZone: string;
    fairValueGap: string;
    biasSummary: string;
  };
  speechScript: string;
  analyzedAt: string;
  engineUsed: 'Gemini 2.5 Flash' | 'Gemini 3 Flash' | 'Deep Quantitative Heuristic Engine';
}

export interface EconomicEvent {
  id: string;
  time: string;
  date: string;
  ccy: string;
  name: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  actual: string;
  forecast: string;
  previous: string;
  aiImpactVerdict?: string;
}

export interface CurrencyStrength {
  code: string;
  name: string;
  score: number; // 0 - 100
  change24h: number;
  status: 'Strong' | 'Bullish' | 'Neutral' | 'Bearish' | 'Weak';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  suggestedAction?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  previewDescription: string;
}
