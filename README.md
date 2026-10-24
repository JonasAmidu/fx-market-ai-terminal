# FX Market AI Terminal

A React dashboard prototype for exploring currency pairs, viewing a simulated candlestick chart, requesting AI market summaries, and listening to spoken commentary. The interface is branded **FX APEX TERMINAL** and uses a dark theme with a responsive three-column layout.

**Project status:** this repository contains a standalone UI component, not a complete runnable application. Quotes, chart candles, currency strength values, and economic events are demo data. The interface's “Live Feeds” labels do not indicate a connected market data service.

## Features

- **Watchlist:** select EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, GBP/JPY, or XAU/USD.
- **Canvas chart:** synthetic candlesticks, six timeframe selectors, and illustrative EMA overlays.
- **Market scan interface:** display a signal, entry price, stop loss, take profit, technical rationale, and voiceover script from a Gemini response.
- **Audio commentary:** optional ElevenLabs text-to-speech, with browser speech synthesis as a fallback when supported.
- **Playback controls:** play, pause, resume, stop, and an animated audio indicator.
- **Voice settings:** eight predefined voices and an option to read scans automatically.
- **Risk calculator:** editable account balance, risk percentage, and stop-loss distance, with cash-at-risk and lot-size estimates.
- **Market overview:** example currency strength tiles and high-impact economic events.

## Repository contents

```text
fx_market_ai_terminal.tsx   Main dashboard component, exported as App
README.md                  Project overview and integration notes
```

There is currently no package manifest, application entry point, build configuration, backend, or automated test suite.

## Use in a React project

The component requires React, `lucide-react`, Tailwind CSS configured to scan the component's location, and a browser with Canvas support. Audio features also use browser media APIs and, for the fallback, speech synthesis.

1. Start with an existing React application that has Tailwind CSS configured.
2. Install the icon dependency in that application:

   ```bash
   npm install lucide-react
   ```

3. Copy `fx_market_ai_terminal.tsx` into the application's source directory. Although the supplied file has a `.tsx` extension, it uses untyped JSX. For a JavaScript React project, save the copy as `FxMarketAiTerminal.jsx`. A strict TypeScript project will need type annotations for state, refs, function parameters, and API responses.
4. Render the component from your application's entry component:

   ```jsx
   import FxMarketAiTerminal from './FxMarketAiTerminal.jsx';

   export default function App() {
     return <FxMarketAiTerminal />;
   }
   ```

5. Run the host application's development command. This repository itself does not provide an `npm run dev` script.

Use a client-rendered component in frameworks that distinguish server and client components: this dashboard uses React hooks and browser APIs.

## AI market scans

`runAiScan` currently posts to a Gemini `generateContent` endpoint using the model identifier `gemini-3-flash-preview`. The request URL has an empty API key, and there is no Gemini credential setting in the UI, so a successful AI response is not configured out of the box.

The prompt sends the selected pair and timeframe; it does not send candle history or a live market feed. Before enabling real analysis, implement a server-side integration with authentication, market data inputs, HTTP error handling, and response validation. Keep service credentials on the server.

The exception handler creates a simulated analysis if a request or parsing operation throws. An API error returned as valid JSON without candidate text can leave the analysis panel empty, because the current implementation does not check the Gemini response status. The demo fallback also contains fixed bullish rationale and narration that can disagree with a SELL signal.

## Voice commentary

Open **ElevenLabs Voice Settings** to enter an ElevenLabs API key, choose a predefined voice, and toggle automatic narration. The key and settings are held only in React state and reset on reload. The current implementation sends speech requests directly from the browser.

With no ElevenLabs key, or if its request fails, the component attempts browser speech synthesis. Voice availability and playback depend on the browser. Commentary requires an analysis result containing a speech script.

For a shared deployment, move authenticated speech requests behind a backend instead of embedding a service key in frontend source.

## Current limitations

- Market prices, currency strength values, and calendar entries are hardcoded; candles are randomly generated on chart redraws.
- Timeframe selection redraws demo candles and changes the scan prompt; it does not retrieve historical candles.
- EMA overlays are decorative curves, not calculated exponential moving averages. RSI and MACD buttons toggle state but do not render those indicators.
- The calculator uses simplified fixed pip values and does not account for instrument contract specifications or currency conversion. Its results are illustrative.
- Analysis results are not automatically cleared when changing the selected pair or timeframe; a previous scan can remain visible.
- There is no broker connection, order execution, persistent storage, or authentication.

## Development priorities

- Add an application scaffold, dependency manifest, and build configuration.
- Define TypeScript types and validate external API responses.
- Replace demo values with a market data integration and implement real indicators.
- Add server-side Gemini and ElevenLabs integrations with clear error states.
- Improve instrument-specific position sizing and input validation.
- Add tests for calculations, scan errors, and audio playback transitions.
# fx-market-ai-terminal
