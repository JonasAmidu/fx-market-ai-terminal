# FX APEX TERMINAL | AI Market Intelligence Platform

An institutional-grade Forex Market Analysis application built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

Designed with a high-density Bloomberg & TradingView dark terminal aesthetic, it provides real-time currency analytics, interactive canvas candlestick charting with real mathematical indicators, Smart Money Concepts (SMC) order blocks, dual AI engine analysis, spoken audio broadcasts, position risk sizing, currency strength ranking, correlation heatmaps, and an interactive AI Copilot.

---

## Key Features

### 1. Interactive Technical & Candlestick Charting
- **HTML5 Canvas Performance**: Smooth, high-DPI rendering for ultra-responsive interaction.
- **Multiple Timeframes**: 1M, 5M, 15M, 1H, 4H, and 1D.
- **Real Mathematical Indicators**:
  - **EMAs**: EMA 9, EMA 20, EMA 50, EMA 200 calculated with true exponential smoothing.
  - **Bollinger Bands**: 20-period with 2 standard deviations and shaded volatility channel.
  - **RSI Subchart**: 14-period Relative Strength Index with 70/30 overbought & oversold levels.
  - **MACD Subchart**: 12/26/9 MACD Line, Signal Line, and colored momentum histogram.
  - **Smart Money Concepts (SMC)**: Automated detection and visualization of Bullish & Bearish **Order Blocks (OB)** and **Fair Value Gaps (FVG)**.
- **Interactive Crosshair**: Hover inspection displaying exact Time, Open, High, Low, Close, Volume, and price cursor labels.

### 2. Dual AI Forex Analysis Engine
- **Live Google Gemini API Integration**:
  - Connect your Gemini API key in Settings (supports `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`).
  - Synthesizes live market metrics, recent OHLC history, and indicator data to produce structured trade signals (`STRONG BUY`, `BUY`, `NEUTRAL`, `SELL`, `STRONG SELL`), entry price, stop-loss, dual take-profits (TP1, TP2), risk/reward ratio, and institutional rationale.
- **Built-in Quantitative Heuristic Fallback Engine**:
  - **Zero-key required**: If no Gemini key is provided, the terminal automatically runs the quant engine calculating real RSI divergence, EMA stack slope, and ATR volatility to generate dynamic, authentic trade setups.

### 3. Voiceover Audio Commentary & Broadcasting
- **ElevenLabs HD Speech**: Optional integration with 8 predefined analyst voices (Rachel, Domi, Bella, Antoni, Elli, Josh, Adam, Sam).
- **Web Speech API Fallback**: Built-in browser speech synthesis fallback requiring zero setup or keys.
- **Audio Controls**: Play, pause, resume, stop, and an animated audio waveform visualizer.
- **Speech Speed Control**: Configurable from 0.8x to 1.4x with optional auto-play upon scan completion.

### 4. Interactive AI Forex Copilot
- Dedicated AI chat assistant trained on foreign exchange market structure, central bank policy (Fed, ECB, BOJ, BOE), macroeconomic releases, and risk management.
- Quick-prompt chips for instantaneous setup inquiries.

### 5. Institutional Risk & Position Sizing Calculator
- Calculates exact **Cash at Risk**, **Lot Size** (Standard, Mini, Micro lots), and **Required Margin** based on:
  - Account capital ($)
  - Risk percentage (0.5%, 1%, 2%)
  - Stop-loss distance in pips (with one-click "Sync AI" button to match active scan)
  - Account leverage (1:30, 1:50, 1:100, 1:500)
  - Currency-pair specific pip valuations (e.g. standard pairs vs JPY crosses vs Gold).

### 6. Relative Currency Strength & Asset Correlation
- **8-Currency Strength Gauge**: Dynamic live momentum scoring for USD, EUR, GBP, JPY, AUD, CAD, CHF, and NZD with automated divergence pairing.
- **30-Day Rolling Correlation Matrix**: Interactive heatmap showing positive and inverse correlations between EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, and XAU/USD.

### 7. Macro Economic Calendar
- High and medium impact economic events (CPI, FOMC, ECB Rate Decisions, Employment, GDP).
- Filter by currency or impact rating.
- AI Macro Impact verdicts predicting currency directional bias.

---

## Project Structure

```text
fx-market-ai-terminal/
├── src/
│   ├── types/
│   │   └── forex.ts                 # Full TypeScript interfaces & types
│   ├── services/
│   │   ├── technicalIndicators.ts   # EMA, Bollinger, RSI, MACD, Order Blocks math
│   │   ├── marketDataGenerator.ts   # Pairs, realistic OHLCV generator, micro-tick engine
│   │   ├── aiAnalysisEngine.ts      # Gemini API + Quant Heuristic Fallback engine
│   │   └── audioService.ts          # ElevenLabs & Web Speech audio service
│   ├── components/
│   │   ├── Header.tsx               # Top navigation, status, live tick toggle
│   │   ├── Watchlist.tsx            # Filterable currency list with live quotes
│   │   ├── CandlestickChart.tsx     # High-performance HTML5 Canvas chart
│   │   ├── AiMarketIntelligence.tsx # AI scan report, trade levels, audio readout
│   │   ├── AiCopilotChat.tsx        # Interactive AI chat assistant
│   │   ├── CurrencyStrengthMeter.tsx# 8-currency relative strength meter
│   │   ├── CorrelationMatrix.tsx    # Correlation heatmap table
│   │   ├── RiskCalculator.tsx       # Lot sizing and margin calculator
│   │   ├── EconomicCalendar.tsx     # Macro releases with AI forecasts
│   │   └── SettingsModal.tsx        # Gemini & ElevenLabs API key management
│   ├── App.tsx                      # Master terminal container
│   ├── main.tsx                     # React DOM entry point
│   └── index.css                    # Tailwind CSS & custom fintech styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── index.html
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```
*(On Windows PowerShell with script execution restricted, use `npm.cmd install`)*

### Development Server
```bash
npm run dev
```
*(Or `npm.cmd run dev`)*

The application will start on `http://localhost:3000`.

### Production Build
```bash
npm run build
```
*(Or `npm.cmd run build`)*

Produces an optimized production bundle in the `dist/` directory.

---

## Configuration & API Keys
1. Launch the app and click **AI Settings** in the top navigation bar.
2. *(Optional)* Enter your **Google Gemini API Key** and choose your preferred model (`gemini-2.5-flash` or `gemini-1.5-pro`).
   - If left blank, the built-in Quantitative Heuristic Engine automatically powers all technical analysis and signals.
3. *(Optional)* Enter your **ElevenLabs API Key** to enable studio-quality AI voice commentary.
   - If left blank, the app seamlessly defaults to the browser's native Web Speech synthesis.
4. Settings are automatically preserved in your browser's `localStorage`.
