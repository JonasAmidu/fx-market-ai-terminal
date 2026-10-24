import { CurrencyPair, Candle, Timeframe, EconomicEvent, CurrencyStrength } from '../types/forex';

export const INITIAL_CURRENCY_PAIRS: CurrencyPair[] = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'Major',
    price: 1.0854,
    bid: 1.08532,
    ask: 1.08548,
    spreadPips: 1.6,
    change: +0.0024,
    changePct: +0.22,
    high: 1.0892,
    low: 1.0818,
    volume24h: '184.2B',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    digits: 4
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'Major',
    price: 1.2642,
    bid: 1.26410,
    ask: 1.26430,
    spreadPips: 2.0,
    change: -0.0031,
    changePct: -0.24,
    high: 1.2695,
    low: 1.2612,
    volume24h: '112.5B',
    baseCurrency: 'GBP',
    quoteCurrency: 'USD',
    digits: 4
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'Major',
    price: 154.22,
    bid: 154.211,
    ask: 154.229,
    spreadPips: 1.8,
    change: +0.85,
    changePct: +0.55,
    high: 154.88,
    low: 153.20,
    volume24h: '142.1B',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    digits: 2
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    category: 'Major',
    price: 0.6580,
    bid: 0.65791,
    ask: 0.65809,
    spreadPips: 1.8,
    change: +0.0012,
    changePct: +0.18,
    high: 0.6612,
    low: 0.6548,
    volume24h: '68.4B',
    baseCurrency: 'AUD',
    quoteCurrency: 'USD',
    digits: 4
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'Major',
    price: 1.3540,
    bid: 1.35388,
    ask: 1.35412,
    spreadPips: 2.4,
    change: -0.0015,
    changePct: -0.11,
    high: 1.3582,
    low: 1.3515,
    volume24h: '56.9B',
    baseCurrency: 'USD',
    quoteCurrency: 'CAD',
    digits: 4
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    category: 'Major',
    price: 0.8845,
    bid: 0.88438,
    ask: 0.88462,
    spreadPips: 2.4,
    change: +0.0008,
    changePct: +0.09,
    high: 0.8870,
    low: 0.8824,
    volume24h: '43.2B',
    baseCurrency: 'USD',
    quoteCurrency: 'CHF',
    digits: 4
  },
  {
    symbol: 'GBP/JPY',
    name: 'British Pound / Japanese Yen',
    category: 'Minor',
    price: 194.88,
    bid: 194.862,
    ask: 194.898,
    spreadPips: 3.6,
    change: +0.42,
    changePct: +0.22,
    high: 195.45,
    low: 193.85,
    volume24h: '48.7B',
    baseCurrency: 'GBP',
    quoteCurrency: 'JPY',
    digits: 2
  },
  {
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    category: 'Minor',
    price: 0.8585,
    bid: 0.85838,
    ask: 0.85862,
    spreadPips: 2.4,
    change: +0.0035,
    changePct: +0.41,
    high: 0.8610,
    low: 0.8540,
    volume24h: '39.8B',
    baseCurrency: 'EUR',
    quoteCurrency: 'GBP',
    digits: 4
  },
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    category: 'Metal',
    price: 2738.50,
    bid: 2738.25,
    ask: 2738.75,
    spreadPips: 5.0,
    change: +16.20,
    changePct: +0.60,
    high: 2748.20,
    low: 2715.10,
    volume24h: '94.6B',
    baseCurrency: 'XAU',
    quoteCurrency: 'USD',
    digits: 2
  },
  {
    symbol: 'XAG/USD',
    name: 'Spot Silver / US Dollar',
    category: 'Metal',
    price: 33.75,
    bid: 33.72,
    ask: 33.78,
    spreadPips: 6.0,
    change: +0.45,
    changePct: +1.35,
    high: 34.10,
    low: 33.15,
    volume24h: '28.1B',
    baseCurrency: 'XAG',
    quoteCurrency: 'USD',
    digits: 2
  }
];

// Timeframe duration in seconds
export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1M': 60,
  '5M': 300,
  '15M': 900,
  '1H': 3600,
  '4H': 14400,
  '1D': 86400
};

// Generate realistic OHLCV historical candle data
export function generateCandles(pair: CurrencyPair, timeframe: Timeframe, count = 75): Candle[] {
  const candles: Candle[] = [];
  const stepSec = TIMEFRAME_SECONDS[timeframe];
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * stepSec;

  const isJpy = pair.symbol.includes('JPY');
  const isGold = pair.symbol.includes('XAU');
  const isSilver = pair.symbol.includes('XAG');

  // Base pip unit
  let pipSize = 0.0001;
  if (isJpy) pipSize = 0.01;
  if (isGold) pipSize = 0.1;
  if (isSilver) pipSize = 0.01;

  // Volatility multiplier per timeframe
  const tfVolatilityMultiplier: Record<Timeframe, number> = {
    '1M': 4,
    '5M': 7,
    '15M': 12,
    '1H': 25,
    '4H': 50,
    '1D': 110
  };

  const candlePipRange = tfVolatilityMultiplier[timeframe] * pipSize;

  // Start price working backwards, then simulate forward
  let currentPrice = pair.price - (pair.changePct / 100) * pair.price * 0.8;
  const trendBias = (pair.changePct >= 0 ? 0.05 : -0.05) * candlePipRange;

  for (let i = 0; i < count; i++) {
    const candleTime = startTime + i * stepSec;
    // Micro trend waves (sine cycle)
    const wave = Math.sin(i / 6) * candlePipRange * 0.7;
    const randomShock = (Math.random() - 0.49) * candlePipRange;
    const delta = trendBias + wave * 0.15 + randomShock;

    const open = currentPrice;
    let close = open + delta;

    // Last candle should align close to current live price
    if (i === count - 1) {
      close = pair.price;
    }

    const wickUpper = Math.random() * candlePipRange * 0.6;
    const wickLower = Math.random() * candlePipRange * 0.6;
    const high = Math.max(open, close) + wickUpper;
    const low = Math.min(open, close) - wickLower;
    const volume = Math.floor(Math.random() * 800) + 200 + Math.abs(delta / pipSize) * 20;

    candles.push({
      time: candleTime,
      open: Number(open.toFixed(pair.digits)),
      high: Number(high.toFixed(pair.digits)),
      low: Number(low.toFixed(pair.digits)),
      close: Number(close.toFixed(pair.digits)),
      volume
    });

    currentPrice = close;
  }

  return candles;
}

// Generate updated tick price for simulated live market
export function simulateMarketTick(pair: CurrencyPair): CurrencyPair {
  const isJpy = pair.symbol.includes('JPY');
  const isGold = pair.symbol.includes('XAU');
  const isSilver = pair.symbol.includes('XAG');

  let tickStep = 0.0001;
  if (isJpy) tickStep = 0.01;
  if (isGold) tickStep = 0.15;
  if (isSilver) tickStep = 0.02;

  // Random fluctuation with mean-reverting tendency
  const direction = (Math.random() - 0.498);
  const delta = direction * tickStep * (Math.random() * 1.5);
  const newPrice = Math.max(pair.low * 0.99, Math.min(pair.high * 1.01, pair.price + delta));

  const pipSpreadUnit = isJpy || isSilver ? 0.01 : isGold ? 0.1 : 0.0001;
  const spreadValue = pair.spreadPips * pipSpreadUnit;

  const newBid = newPrice - spreadValue / 2;
  const newAsk = newPrice + spreadValue / 2;

  const newChange = newPrice - (pair.price - pair.change);
  const newChangePct = ((newPrice - (pair.price - pair.change)) / (pair.price - pair.change)) * 100;
  const newHigh = Math.max(pair.high, newPrice);
  const newLow = Math.min(pair.low, newPrice);

  return {
    ...pair,
    price: Number(newPrice.toFixed(pair.digits)),
    bid: Number(newBid.toFixed(pair.digits + (pair.digits === 4 ? 1 : 1))),
    ask: Number(newAsk.toFixed(pair.digits + (pair.digits === 4 ? 1 : 1))),
    change: Number(newChange.toFixed(pair.digits)),
    changePct: Number(newChangePct.toFixed(2)),
    high: Number(newHigh.toFixed(pair.digits)),
    low: Number(newLow.toFixed(pair.digits))
  };
}

// Live relative currency strength calculation
export function calculateCurrencyStrengths(pairs: CurrencyPair[]): CurrencyStrength[] {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const scores: Record<string, number> = {
    USD: 68,
    EUR: 52,
    GBP: 44,
    JPY: 28,
    AUD: 62,
    CAD: 46,
    CHF: 48,
    NZD: 58
  };

  // Adjust scores dynamically based on pairs 24h performance
  pairs.forEach(p => {
    if (scores[p.baseCurrency] !== undefined && scores[p.quoteCurrency] !== undefined) {
      scores[p.baseCurrency] += p.changePct * 2.5;
      scores[p.quoteCurrency] -= p.changePct * 2.5;
    }
  });

  return currencies.map(code => {
    const raw = Math.min(96, Math.max(12, Math.round(scores[code])));
    let status: CurrencyStrength['status'] = 'Neutral';
    if (raw >= 75) status = 'Strong';
    else if (raw >= 58) status = 'Bullish';
    else if (raw <= 30) status = 'Weak';
    else if (raw <= 45) status = 'Bearish';

    const change = Number(((raw - 50) / 10).toFixed(1));

    return {
      code,
      name: getCurrencyName(code),
      score: raw,
      change24h: change,
      status
    };
  }).sort((a, b) => b.score - a.score);
}

function getCurrencyName(code: string): string {
  const map: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    NZD: 'New Zealand Dollar'
  };
  return map[code] || code;
}

// High Impact Economic Calendar Data
export const INITIAL_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: 'ev-1',
    time: '13:30',
    date: 'Today',
    ccy: 'USD',
    name: 'Core CPI m/m',
    impact: 'HIGH',
    actual: '0.3%',
    forecast: '0.3%',
    previous: '0.3%',
    aiImpactVerdict: 'In line with estimates. Keeps Fed on gradual 25bps easing trajectory.'
  },
  {
    id: 'ev-2',
    time: '14:15',
    date: 'Today',
    ccy: 'EUR',
    name: 'ECB Main Refinancing Rate',
    impact: 'HIGH',
    actual: '3.25%',
    forecast: '3.25%',
    previous: '3.50%',
    aiImpactVerdict: 'Dovish 25bps cut priced in. Focus on Lagarde press conference guidance.'
  },
  {
    id: 'ev-3',
    time: '18:00',
    date: 'Today',
    ccy: 'USD',
    name: 'FOMC Meeting Minutes',
    impact: 'HIGH',
    actual: '-',
    forecast: '-',
    previous: '-',
    aiImpactVerdict: 'High volatility expected across USD pairs and Gold if QT pace discussed.'
  },
  {
    id: 'ev-4',
    time: '01:30',
    date: 'Tomorrow',
    ccy: 'AUD',
    name: 'Employment Change & Jobless Rate',
    impact: 'HIGH',
    actual: '-',
    forecast: '24.5K',
    previous: '47.5K',
    aiImpactVerdict: 'Strong prints will push AUD/USD toward 0.6650 resistance.'
  },
  {
    id: 'ev-5',
    time: '07:00',
    date: 'Tomorrow',
    ccy: 'GBP',
    name: 'UK GDP m/m & Industrial Production',
    impact: 'MED',
    actual: '-',
    forecast: '0.2%',
    previous: '0.0%',
    aiImpactVerdict: 'Positive GDP print could arrest recent GBP weakness against EUR.'
  },
  {
    id: 'ev-6',
    time: '04:00',
    date: 'Tomorrow',
    ccy: 'JPY',
    name: 'BOJ Core CPI y/y',
    impact: 'HIGH',
    actual: '-',
    forecast: '2.1%',
    previous: '2.0%',
    aiImpactVerdict: 'Above 2.1% heightens December rate hike odds, strengthening JPY.'
  }
];

// Currency Correlation Matrix Data
export const CORRELATION_MATRIX = [
  { pair: 'EUR/USD', correlations: { 'EUR/USD': 1.00, 'GBP/USD': 0.88, 'USD/JPY': -0.74, 'AUD/USD': 0.79, 'USD/CAD': -0.71, 'XAU/USD': 0.68 } },
  { pair: 'GBP/USD', correlations: { 'EUR/USD': 0.88, 'GBP/USD': 1.00, 'USD/JPY': -0.66, 'AUD/USD': 0.75, 'USD/CAD': -0.65, 'XAU/USD': 0.61 } },
  { pair: 'USD/JPY', correlations: { 'EUR/USD': -0.74, 'GBP/USD': -0.66, 'USD/JPY': 1.00, 'AUD/USD': -0.58, 'USD/CAD': 0.77, 'XAU/USD': -0.42 } },
  { pair: 'AUD/USD', correlations: { 'EUR/USD': 0.79, 'GBP/USD': 0.75, 'USD/JPY': -0.58, 'AUD/USD': 1.00, 'USD/CAD': -0.83, 'XAU/USD': 0.81 } },
  { pair: 'USD/CAD', correlations: { 'EUR/USD': -0.71, 'GBP/USD': -0.65, 'USD/JPY': 0.77, 'AUD/USD': -0.83, 'USD/CAD': 1.00, 'XAU/USD': -0.62 } },
  { pair: 'XAU/USD', correlations: { 'EUR/USD': 0.68, 'GBP/USD': 0.61, 'USD/JPY': -0.42, 'AUD/USD': 0.81, 'USD/CAD': -0.62, 'XAU/USD': 1.00 } }
];
