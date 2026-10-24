import { Candle } from '../types/forex';

export interface IndicatorCalculations {
  ema9: (number | null)[];
  ema20: (number | null)[];
  ema50: (number | null)[];
  ema200: (number | null)[];
  bollinger: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  };
  rsi: (number | null)[];
  macd: {
    macdLine: (number | null)[];
    signalLine: (number | null)[];
    histogram: (number | null)[];
  };
  orderBlocks: {
    type: 'bullish' | 'bearish';
    top: number;
    bottom: number;
    candleIndex: number;
  }[];
  supportLevels: number[];
  resistanceLevels: number[];
  pivotPoint: number;
}

// Calculate EMA with proper weighting
export function calculateEMA(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length < period) return result;

  const multiplier = 2 / (period + 1);
  
  // First EMA is simple average
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let prevEMA = sum / period;
  result[period - 1] = prevEMA;

  for (let i = period; i < prices.length; i++) {
    prevEMA = (prices[i] - prevEMA) * multiplier + prevEMA;
    result[i] = prevEMA;
  }
  return result;
}

// Calculate Bollinger Bands (20 period, 2 std dev)
export function calculateBollingerBands(prices: number[], period = 20, multiplier = 2) {
  const upper: (number | null)[] = new Array(prices.length).fill(null);
  const middle: (number | null)[] = new Array(prices.length).fill(null);
  const lower: (number | null)[] = new Array(prices.length).fill(null);

  if (prices.length < period) return { upper, middle, lower };

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    middle[i] = mean;
    upper[i] = mean + multiplier * stdDev;
    lower[i] = mean - multiplier * stdDev;
  }

  return { upper, middle, lower };
}

// Calculate Relative Strength Index (RSI 14)
export function calculateRSI(prices: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi[period] = 100 - (100 / (1 + rs));

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i] = 100 - (100 / (1 + rs));
  }

  return rsi;
}

// Calculate MACD (12, 26, 9)
export function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine: (number | null)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macdLine.push(ema12[i]! - ema26[i]!);
    } else {
      macdLine.push(null);
    }
  }

  // Filter valid non-null macd prices to compute signal line
  const validMacdIndices: number[] = [];
  const validMacdValues: number[] = [];
  macdLine.forEach((val, idx) => {
    if (val !== null) {
      validMacdIndices.push(idx);
      validMacdValues.push(val);
    }
  });

  const signalLineValid = calculateEMA(validMacdValues, 9);
  const signalLine: (number | null)[] = new Array(prices.length).fill(null);
  const histogram: (number | null)[] = new Array(prices.length).fill(null);

  signalLineValid.forEach((val, i) => {
    const origIdx = validMacdIndices[i];
    signalLine[origIdx] = val;
    if (val !== null && macdLine[origIdx] !== null) {
      histogram[origIdx] = macdLine[origIdx]! - val;
    }
  });

  return { macdLine, signalLine, histogram };
}

// Identify Order Blocks & Fair Value Gaps (Smart Money Concepts)
export function identifyOrderBlocks(candles: Candle[]) {
  const blocks: { type: 'bullish' | 'bearish'; top: number; bottom: number; candleIndex: number }[] = [];
  if (candles.length < 5) return blocks;

  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    const prev = candles[i - 1];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];

    // Bullish Order Block: Down candle followed by aggressive up-move breaking previous high
    if (c.close < c.open && next1.close > next1.open && next2.close > prev.high) {
      blocks.push({
        type: 'bullish',
        top: Math.max(c.open, c.close),
        bottom: c.low,
        candleIndex: i
      });
    }

    // Bearish Order Block: Up candle followed by sharp displacement down
    if (c.close > c.open && next1.close < next1.open && next2.close < prev.low) {
      blocks.push({
        type: 'bearish',
        top: c.high,
        bottom: Math.min(c.open, c.close),
        candleIndex: i
      });
    }
  }

  // Return the most recent 3 relevant blocks
  return blocks.slice(-3);
}

// Calculate Support, Resistance and Classic Pivot Points
export function calculateKeyLevels(candles: Candle[]) {
  if (candles.length === 0) return { supportLevels: [], resistanceLevels: [], pivotPoint: 0 };

  const lastCandle = candles[candles.length - 1];
  const recentSlice = candles.slice(-30);
  const high = Math.max(...recentSlice.map(c => c.high));
  const low = Math.min(...recentSlice.map(c => c.low));
  const close = lastCandle.close;

  const pivotPoint = (high + low + close) / 3;
  const r1 = 2 * pivotPoint - low;
  const s1 = 2 * pivotPoint - high;
  const r2 = pivotPoint + (high - low);
  const s2 = pivotPoint - (high - low);

  return {
    supportLevels: [s1, s2],
    resistanceLevels: [r1, r2],
    pivotPoint
  };
}

// Master indicator bundle calculation
export function calculateAllIndicators(candles: Candle[]): IndicatorCalculations {
  const closePrices = candles.map(c => c.close);
  const ema9 = calculateEMA(closePrices, 9);
  const ema20 = calculateEMA(closePrices, 20);
  const ema50 = calculateEMA(closePrices, 50);
  const ema200 = calculateEMA(closePrices, 200);
  const bollinger = calculateBollingerBands(closePrices, 20, 2);
  const rsi = calculateRSI(closePrices, 14);
  const macd = calculateMACD(closePrices);
  const orderBlocks = identifyOrderBlocks(candles);
  const { supportLevels, resistanceLevels, pivotPoint } = calculateKeyLevels(candles);

  return {
    ema9,
    ema20,
    ema50,
    ema200,
    bollinger,
    rsi,
    macd,
    orderBlocks,
    supportLevels,
    resistanceLevels,
    pivotPoint
  };
}
