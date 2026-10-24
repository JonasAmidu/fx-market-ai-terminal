import React, { useRef, useEffect, useState } from 'react';
import { CurrencyPair, Candle, Timeframe, IndicatorState } from '../types/forex';
import { calculateAllIndicators, IndicatorCalculations } from '../services/technicalIndicators';
import { Sliders, Maximize2, BarChart2, Eye, EyeOff } from 'lucide-react';

interface CandlestickChartProps {
  pair: CurrencyPair;
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  indicators: IndicatorState;
  onToggleIndicator: (key: keyof IndicatorState) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  pair,
  candles,
  timeframe,
  onTimeframeChange,
  indicators,
  onToggleIndicator,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hover Crosshair state
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Calculated indicators cache
  const [calcIndicators, setCalcIndicators] = useState<IndicatorCalculations | null>(null);

  useEffect(() => {
    if (candles.length > 0) {
      const result = calculateAllIndicators(candles);
      setCalcIndicators(result);
    }
  }, [candles]);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length || !calcIndicators) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Layout partitioning: Main chart height vs subcharts (RSI / MACD)
    const rightMargin = 65; // Price scale width
    const bottomMargin = 24; // Time scale height
    let subchartHeight = 0;
    const activeSubcharts = (indicators.rsi ? 1 : 0) + (indicators.macd ? 1 : 0);
    if (activeSubcharts === 1) subchartHeight = 70;
    if (activeSubcharts === 2) subchartHeight = 120;

    const mainChartHeight = height - bottomMargin - subchartHeight;
    const chartWidth = width - rightMargin;

    // Price range calculation
    const allHighs = candles.map(c => c.high);
    const allLows = candles.map(c => c.low);
    let minPrice = Math.min(...allLows);
    let maxPrice = Math.max(...allHighs);

    // Include Bollinger Bands in price bounds if enabled
    if (indicators.bollinger) {
      calcIndicators.bollinger.upper.forEach(val => { if (val !== null) maxPrice = Math.max(maxPrice, val); });
      calcIndicators.bollinger.lower.forEach(val => { if (val !== null) minPrice = Math.min(minPrice, val); });
    }

    // Add padding to price range
    const priceRange = maxPrice - minPrice || 0.001;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const effectiveRange = maxPrice - minPrice;

    const mapY = (price: number) => {
      return mainChartHeight - 15 - ((price - minPrice) / effectiveRange) * (mainChartHeight - 30);
    };

    const candleWidth = chartWidth / candles.length;
    const candleBodyWidth = Math.max(2, candleWidth * 0.65);

    // 1. Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridYSteps = 6;
    for (let i = 0; i <= gridYSteps; i++) {
      const y = (mainChartHeight / gridYSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis price label
      const priceAtY = maxPrice - (i / gridYSteps) * effectiveRange;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceAtY.toFixed(pair.digits), chartWidth + 6, y + 3);
    }

    const gridXSteps = 6;
    for (let i = 0; i < gridXSteps; i++) {
      const x = (chartWidth / gridXSteps) * i + candleWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - bottomMargin);
      ctx.stroke();

      // Time axis label
      const candleIdx = Math.floor((i / gridXSteps) * candles.length);
      if (candles[candleIdx]) {
        const d = new Date(candles[candleIdx].time * 1000);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.fillStyle = '#64748b';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, x, height - 8);
      }
    }

    // 2. Draw Order Blocks (Smart Money Concepts)
    if (indicators.orderBlocks && calcIndicators.orderBlocks) {
      calcIndicators.orderBlocks.forEach(ob => {
        const yTop = mapY(ob.top);
        const yBottom = mapY(ob.bottom);
        const h = Math.max(4, yBottom - yTop);
        const startX = ob.candleIndex * candleWidth;
        const blockW = chartWidth - startX;

        ctx.fillStyle = ob.type === 'bullish' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';
        ctx.strokeStyle = ob.type === 'bullish' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.fillRect(startX, yTop, blockW, h);
        ctx.strokeRect(startX, yTop, blockW, h);
        ctx.setLineDash([]);

        ctx.fillStyle = ob.type === 'bullish' ? '#34d399' : '#fb7185';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${ob.type === 'bullish' ? 'Bullish' : 'Bearish'} OB`, startX + 4, yTop + 10);
      });
    }

    // 3. Draw Bollinger Bands
    if (indicators.bollinger && calcIndicators.bollinger) {
      const { upper, middle, lower } = calcIndicators.bollinger;

      // Shaded area
      ctx.beginPath();
      let started = false;
      upper.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = mapY(val);
          if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
        }
      });
      for (let i = lower.length - 1; i >= 0; i--) {
        const val = lower[i];
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = mapY(val);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.fill();

      // Middle line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      middle.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = mapY(val);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Draw EMAs
    const drawEmaLine = (emaSeries: (number | null)[], color: string, widthPx = 1.5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = widthPx;
      ctx.beginPath();
      let hasStarted = false;
      emaSeries.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = mapY(val);
          if (!hasStarted) {
            ctx.moveTo(x, y);
            hasStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    if (indicators.ema9) drawEmaLine(calcIndicators.ema9, '#f59e0b', 1.2);
    if (indicators.ema20) drawEmaLine(calcIndicators.ema20, '#38bdf8', 1.5);
    if (indicators.ema50) drawEmaLine(calcIndicators.ema50, '#a855f7', 1.5);
    if (indicators.ema200) drawEmaLine(calcIndicators.ema200, '#ec4899', 1.8);

    // 5. Draw Candlesticks
    candles.forEach((c, idx) => {
      const isBull = c.close >= c.open;
      const color = isBull ? '#10b981' : '#f43f5e';
      const x = idx * candleWidth + candleWidth / 2;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.2;

      // High - Low Wick
      ctx.beginPath();
      ctx.moveTo(x, mapY(c.high));
      ctx.lineTo(x, mapY(c.low));
      ctx.stroke();

      // Real Body
      const yOpen = mapY(c.open);
      const yClose = mapY(c.close);
      const top = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));

      ctx.fillRect(x - candleBodyWidth / 2, top, candleBodyWidth, bodyH);
    });

    // 6. Draw Current Live Price Line & Tag
    const lastPriceY = mapY(pair.price);
    ctx.strokeStyle = pair.changePct >= 0 ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, lastPriceY);
    ctx.lineTo(chartWidth, lastPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Price Tag on Right Axis
    ctx.fillStyle = pair.changePct >= 0 ? '#10b981' : '#f43f5e';
    ctx.fillRect(chartWidth + 1, lastPriceY - 9, rightMargin - 4, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(pair.price.toFixed(pair.digits), chartWidth + 5, lastPriceY + 4);

    // 7. Subcharts (RSI / MACD)
    let currentSubY = mainChartHeight;

    // RSI Subchart
    if (indicators.rsi && calcIndicators.rsi) {
      const rsiH = activeSubcharts === 2 ? 55 : 65;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(0, currentSubY, chartWidth, rsiH);

      // 70 and 30 reference lines
      const y70 = currentSubY + rsiH * 0.3;
      const y30 = currentSubY + rsiH * 0.7;
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(0, y70); ctx.lineTo(chartWidth, y70); ctx.stroke();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath(); ctx.moveTo(0, y30); ctx.lineTo(chartWidth, y30); ctx.stroke();
      ctx.setLineDash([]);

      // RSI Curve
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      calcIndicators.rsi.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = currentSubY + rsiH - (val / 100) * rsiH;
          if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
        }
      });
      ctx.stroke();

      // RSI Label
      const lastRsi = calcIndicators.rsi[calcIndicators.rsi.length - 1];
      ctx.fillStyle = '#c084fc';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`RSI(14): ${lastRsi ? lastRsi.toFixed(1) : '-'}`, 6, currentSubY + 14);

      currentSubY += rsiH;
    }

    // MACD Subchart
    if (indicators.macd && calcIndicators.macd) {
      const macdH = activeSubcharts === 2 ? 55 : 65;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(0, currentSubY, chartWidth, macdH);

      const zeroY = currentSubY + macdH / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(chartWidth, zeroY); ctx.stroke();

      // Find max histogram for scaling
      const validHists = calcIndicators.macd.histogram.filter(h => h !== null) as number[];
      const maxHist = Math.max(0.0001, ...validHists.map(Math.abs));

      // Draw Histogram
      calcIndicators.macd.histogram.forEach((hist, i) => {
        if (hist !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const barH = (hist / maxHist) * (macdH / 2 - 4);
          ctx.fillStyle = hist >= 0 ? '#10b981' : '#f43f5e';
          ctx.fillRect(x - 1.5, zeroY, 3, -barH);
        }
      });

      // MACD Line & Signal Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      calcIndicators.macd.macdLine.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = zeroY - (val / maxHist) * (macdH / 2.5);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`MACD (12, 26, 9)`, 6, currentSubY + 14);
    }

    // 8. Crosshair Render
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth && mousePos.y >= 0 && mousePos.y <= height - bottomMargin) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height - bottomMargin);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price badge on mouse Y
      if (mousePos.y <= mainChartHeight) {
        const hoveredPrice = maxPrice - (mousePos.y / mainChartHeight) * effectiveRange;
        ctx.fillStyle = '#334155';
        ctx.fillRect(chartWidth + 1, mousePos.y - 8, rightMargin - 4, 16);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(hoveredPrice.toFixed(pair.digits), chartWidth + 5, mousePos.y + 4);
      }
    }

  }, [candles, indicators, calcIndicators, pair, mousePos]);

  // Handle Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const chartWidth = rect.width - 65;
    const candleWidth = chartWidth / candles.length;
    const candleIdx = Math.floor(x / candleWidth);

    if (candleIdx >= 0 && candleIdx < candles.length) {
      setHoveredCandle(candles[candleIdx]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  const displayCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col shadow-sm">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
        {/* Pair Details & Spot Tag */}
        <div className="flex items-center gap-2.5">
          <span className="font-extrabold text-base text-white font-mono tracking-wide">
            {pair.symbol}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            SPOT FX
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {pair.name}
          </span>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80 font-mono text-xs">
          {(['1M', '5M', '15M', '1H', '4H', '1D'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-0.8 rounded text-xs transition font-semibold ${
                timeframe === tf
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-1 flex-wrap font-mono text-[11px]">
          {(
            [
              { key: 'ema9', label: 'EMA 9', color: 'text-amber-400' },
              { key: 'ema20', label: 'EMA 20', color: 'text-sky-400' },
              { key: 'ema50', label: 'EMA 50', color: 'text-purple-400' },
              { key: 'bollinger', label: 'BB(20)', color: 'text-cyan-300' },
              { key: 'rsi', label: 'RSI', color: 'text-violet-400' },
              { key: 'macd', label: 'MACD', color: 'text-teal-400' },
              { key: 'orderBlocks', label: 'SMC OB', color: 'text-emerald-400' }
            ] as const
          ).map(ind => (
            <button
              key={ind.key}
              onClick={() => onToggleIndicator(ind.key)}
              className={`px-2 py-0.8 rounded border text-[10px] transition font-mono ${
                indicators[ind.key]
                  ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                  : 'bg-slate-950/60 border-slate-800/70 text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={indicators[ind.key] ? ind.color : ''}>{ind.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* OHLCV Readout Ribbon */}
      <div className="flex items-center gap-3 py-1.5 px-2 bg-slate-950/70 rounded-lg border border-slate-800/50 my-2 text-[11px] font-mono overflow-x-auto text-slate-400">
        {displayCandle && (
          <>
            <span className="text-slate-500">
              {new Date(displayCandle.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-1">
              <span>O:</span>
              <span className="text-slate-200 font-semibold">{displayCandle.open.toFixed(pair.digits)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>H:</span>
              <span className="text-emerald-400 font-semibold">{displayCandle.high.toFixed(pair.digits)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>L:</span>
              <span className="text-rose-400 font-semibold">{displayCandle.low.toFixed(pair.digits)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>C:</span>
              <span className={displayCandle.close >= displayCandle.open ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {displayCandle.close.toFixed(pair.digits)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Vol:</span>
              <span className="text-cyan-400">{displayCandle.volume}</span>
            </div>
            {hoveredCandle && (
              <span className="text-slate-500 italic ml-auto text-[10px]">
                (Hovered Candle)
              </span>
            )}
          </>
        )}
      </div>

      {/* Canvas Chart Area */}
      <div ref={containerRef} className="relative w-full h-[360px] bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
