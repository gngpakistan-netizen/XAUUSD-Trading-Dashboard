import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MarketBar, DualStructureState, LiquidityState, SMCZoneState } from '../types/quantum';
import { IndicatorSnapshot } from '../services/mockMarketData';
import { CanonicalXAUUSDQuote } from '../services/marketDataProvider';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
  Activity,
  BarChart2,
  Clock,
  Sparkles,
  Compass,
} from 'lucide-react';

interface TradingViewChartProps {
  bars: MarketBar[];
  indicators: IndicatorSnapshot;
  structure: DualStructureState;
  liquidity: LiquidityState;
  zones: SMCZoneState[];
  quote: CanonicalXAUUSDQuote;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  bars,
  indicators,
  structure,
  liquidity,
  zones,
  quote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Timeframe and chart mode
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('5m');
  const [chartType, setChartType] = useState<'candles' | 'area'>('candles');

  // Indicators toggle matching Visuals Companion (XAUUSD_Quantum_5_5_Visuals.pine)
  const [showEma, setShowEma] = useState<boolean>(true);
  const [showVwap, setShowVwap] = useState<boolean>(true);
  const [showVwapWM, setShowVwapWM] = useState<boolean>(true);
  const [showBB, setShowBB] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showSMC, setShowSMC] = useState<boolean>(true);
  const [showLevels, setShowLevels] = useState<boolean>(true);
  const [showSR, setShowSR] = useState<boolean>(true);
  const [showStructure, setShowStructure] = useState<boolean>(true);
  const [showFootprint, setShowFootprint] = useState<boolean>(true);
  const [showAbsorption, setShowAbsorption] = useState<boolean>(true);
  const [showH4, setShowH4] = useState<boolean>(true);

  // Pan and zoom state
  const [visibleCount, setVisibleCount] = useState<number>(65);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);

  // Mouse Crosshair State
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Live 5M Candle Countdown Timer
  const [timeRemaining, setTimeRemaining] = useState<string>('03:42');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const secondsLeft = 300 - ((now.getMinutes() % 5) * 60 + now.getSeconds());
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // TradingView exact dimensions
    const priceScaleWidth = 76;
    const timeScaleHeight = 26;
    const plotWidth = width - priceScaleWidth;
    const plotHeight = height - timeScaleHeight;
    const volumeHeight = showVolume ? plotHeight * 0.18 : 0;
    const candlePlotHeight = plotHeight - volumeHeight;

    // Background fill (TradingView Dark Theme: #131722)
    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, width, height);

    // Visible bars window based on zoom & pan
    const count = Math.min(Math.max(visibleCount, 20), bars.length);
    const startIndex = Math.max(0, bars.length - count - panOffset);
    const endIndex = Math.min(bars.length, startIndex + count);
    const displayBars = bars.slice(startIndex, endIndex);

    if (displayBars.length === 0) return;

    // Calculate Price Bounds
    let minPrice = Math.min(...displayBars.map(b => b.low));
    let maxPrice = Math.max(...displayBars.map(b => b.high));

    // Factor in key levels if shown
    if (showLevels) {
      if (liquidity.pdh && liquidity.pdh < maxPrice + 35) maxPrice = Math.max(maxPrice, liquidity.pdh);
      if (liquidity.pdl && liquidity.pdl > minPrice - 35) minPrice = Math.min(minPrice, liquidity.pdl);
      if (liquidity.cdh && liquidity.cdh < maxPrice + 20) maxPrice = Math.max(maxPrice, liquidity.cdh);
      if (liquidity.cdl && liquidity.cdl > minPrice - 20) minPrice = Math.min(minPrice, liquidity.cdl);
    }
    if (showBB && indicators.bbUpper && indicators.bbLower) {
      maxPrice = Math.max(maxPrice, indicators.bbUpper);
      minPrice = Math.min(minPrice, indicators.bbLower);
    }

    const priceRange = maxPrice - minPrice || 1.0;
    const paddedMin = minPrice - priceRange * 0.05;
    const paddedMax = maxPrice + priceRange * 0.05;
    const paddedRange = paddedMax - paddedMin;

    const getY = (price: number) => {
      return candlePlotHeight - ((price - paddedMin) / paddedRange) * candlePlotHeight;
    };

    const maxVolume = Math.max(...displayBars.map(b => b.volume)) || 1;
    const getVolY = (vol: number) => {
      return plotHeight - (vol / maxVolume) * (volumeHeight - 6);
    };

    const candleSpacing = plotWidth / displayBars.length;
    const candleWidth = Math.max(3, candleSpacing * 0.72);

    // 1. Grid Lines (Horizontal Price Lines)
    ctx.strokeStyle = '#1e222d';
    ctx.lineWidth = 1;
    const numHorizontalLines = 7;
    for (let i = 0; i <= numHorizontalLines; i++) {
      const y = (candlePlotHeight / numHorizontalLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotWidth, y);
      ctx.stroke();

      const priceAtY = paddedMax - (i / numHorizontalLines) * paddedRange;
      ctx.fillStyle = '#787b86';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(priceAtY.toFixed(2), plotWidth + 8, y + 3);
    }

    // Vertical Time Grid Lines
    const timeStep = Math.max(1, Math.floor(displayBars.length / 7));
    for (let i = 0; i < displayBars.length; i += timeStep) {
      const x = i * candleSpacing + candleSpacing / 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, plotHeight);
      ctx.stroke();

      const bar = displayBars[i];
      const d = new Date(bar.time);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      ctx.fillStyle = '#787b86';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, plotHeight + 16);
    }

    // 2. Bollinger Bands Shading & Lines (20, 2)
    if (showBB && indicators.bbUpper && indicators.bbLower) {
      const yUp = getY(indicators.bbUpper);
      const yLo = getY(indicators.bbLower);
      const yMid = getY(indicators.bbBasis);

      ctx.fillStyle = 'rgba(176, 132, 255, 0.04)';
      ctx.fillRect(0, yUp, plotWidth, Math.max(0, yLo - yUp));

      ctx.strokeStyle = 'rgba(176, 132, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, yUp);
      ctx.lineTo(plotWidth, yUp);
      ctx.moveTo(0, yLo);
      ctx.lineTo(plotWidth, yLo);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(176, 132, 255, 0.25)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, yMid);
      ctx.lineTo(plotWidth, yMid);
      ctx.stroke();
    }

    // 3. Last 4H Closed Candle Marker (Yellow Dotted Box per Visuals Companion)
    if (showH4) {
      const h4High = quote.mid + 16.5;
      const h4Low = quote.mid - 19.8;
      const h4TopY = getY(h4High);
      const h4BotY = getY(h4Low);
      const h4Width = candleSpacing * 16; // last 16 5M bars = 4 hours
      const h4X = Math.max(0, plotWidth - h4Width);

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 3]);
      ctx.strokeRect(h4X, h4TopY, h4Width, Math.max(2, h4BotY - h4TopY));
      ctx.fillStyle = 'rgba(255, 215, 0, 0.03)';
      ctx.fillRect(h4X, h4TopY, h4Width, Math.max(2, h4BotY - h4TopY));

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('4H CANDLE RANGE', h4X + 6, h4TopY + 11);
      ctx.setLineDash([]);
    }

    // 4. Clustered Support / Resistance Levels (with touch counts and auto-hide)
    if (showSR) {
      const currentP = quote.mid;
      const srLevels = [
        { price: Number((currentP + 14.5).toFixed(2)), label: 'R1', hits: 3, isRes: true },
        { price: Number((currentP + 26.0).toFixed(2)), label: 'R2', hits: 5, isRes: true },
        { price: Number((currentP - 12.0).toFixed(2)), label: 'S1', hits: 4, isRes: false },
        { price: Number((currentP - 24.5).toFixed(2)), label: 'S2', hits: 2, isRes: false },
      ];

      srLevels.forEach(sr => {
        // Auto-hide beyond 8 ATR
        if (Math.abs(sr.price - currentP) > indicators.adaptiveATR * 8.0) return;
        const y = getY(sr.price);
        const color = sr.isRes ? 'rgba(239, 83, 80, 0.7)' : 'rgba(38, 166, 154, 0.7)';
        ctx.strokeStyle = color;
        ctx.lineWidth = sr.hits >= 3 ? 1.5 : 1.0;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(plotWidth * 0.15, y);
        ctx.lineTo(plotWidth, y);
        ctx.stroke();

        ctx.fillStyle = sr.isRes ? '#ef5350' : '#26a69a';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`${sr.label} ${sr.price.toFixed(2)} ×${sr.hits}`, plotWidth * 0.16, y - 3);
      });
      ctx.setLineDash([]);
    }

    // 5. SMC Zones (FVG & Order Blocks with mitigation status)
    if (showSMC) {
      zones.forEach(zone => {
        const topY = getY(zone.high);
        const botY = getY(zone.low);
        const zHeight = Math.max(2, botY - topY);

        if (zone.type === 'FVG') {
          ctx.fillStyle = zone.direction === 'bull' ? 'rgba(8, 153, 129, 0.12)' : 'rgba(242, 54, 69, 0.12)';
          ctx.strokeStyle = zone.direction === 'bull' ? 'rgba(8, 153, 129, 0.5)' : 'rgba(242, 54, 69, 0.5)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 2]);
          ctx.fillRect(plotWidth * 0.25, topY, plotWidth * 0.75, zHeight);
          ctx.strokeRect(plotWidth * 0.25, topY, plotWidth * 0.75, zHeight);

          ctx.fillStyle = zone.direction === 'bull' ? '#089981' : '#f23645';
          ctx.font = '9px JetBrains Mono';
          ctx.fillText(`FVG ${zone.direction.toUpperCase()} [${zone.high.toFixed(1)} - ${zone.low.toFixed(1)}]`, plotWidth * 0.27, topY + 11);
        } else if (zone.type === 'OB') {
          ctx.fillStyle = 'rgba(141, 110, 99, 0.18)'; // OB brown per spec
          ctx.strokeStyle = 'rgba(141, 110, 99, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([]);
          ctx.fillRect(plotWidth * 0.4, topY, plotWidth * 0.6, zHeight);
          ctx.strokeRect(plotWidth * 0.4, topY, plotWidth * 0.6, zHeight);

          ctx.fillStyle = '#d7ccc8';
          ctx.font = 'bold 9px JetBrains Mono';
          ctx.fillText(`OB ${zone.direction.toUpperCase()} [${zone.high.toFixed(1)} - ${zone.low.toFixed(1)}]`, plotWidth * 0.42, topY + 11);
        }
      });
      ctx.setLineDash([]);
    }

    // 6. NY-Session Anchored Levels (PDH / PDL / CDH / CDL / PWH / PWL)
    if (showLevels) {
      const drawLevel = (price: number | null, label: string, color: string, isDashed = true) => {
        if (!price) return;
        const y = getY(price);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(isDashed ? [4, 4] : []);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotWidth, y);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Trebuchet MS"';
        ctx.textAlign = 'left';
        ctx.fillText(`${label} ${price.toFixed(2)}`, 8, y - 4);

        // Price axis badge
        ctx.fillStyle = color;
        ctx.fillRect(plotWidth + 1, y - 8, priceScaleWidth - 2, 16);
        ctx.fillStyle = '#131722';
        ctx.font = 'bold 9.5px JetBrains Mono';
        ctx.fillText(label, plotWidth + 6, y + 4);
      };

      drawLevel(liquidity.pdh, 'PDH', '#ffd54f', true);
      drawLevel(liquidity.pdl, 'PDL', '#ffd54f', true);
      drawLevel(liquidity.cdh, 'CDH', '#4dd0e1', false);
      drawLevel(liquidity.cdl, 'CDL', '#4dd0e1', false);
      drawLevel(liquidity.pwh, 'PWH', '#ff8a65', true);
      drawLevel(liquidity.pwl, 'PWL', '#ff8a65', true);
      ctx.setLineDash([]);
    }

    // 7. Volume Bars (TradingView style at bottom)
    if (showVolume) {
      displayBars.forEach((bar, i) => {
        const x = i * candleSpacing + candleSpacing / 2;
        const isBull = bar.close >= bar.open;
        const volY = getVolY(bar.volume);
        const barHeight = plotHeight - volY;

        ctx.fillStyle = isBull ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)';
        ctx.fillRect(x - candleWidth / 2, volY, candleWidth, barHeight);
      });
    }

    // 8. Candlesticks / Area Chart
    ctx.setLineDash([]);
    if (chartType === 'candles') {
      displayBars.forEach((bar, i) => {
        const x = i * candleSpacing + candleSpacing / 2;
        const isBull = bar.close >= bar.open;
        const color = isBull ? '#089981' : '#f23645';

        const openY = getY(bar.open);
        const closeY = getY(bar.close);
        const highY = getY(bar.high);
        const lowY = getY(bar.low);

        // Center Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        ctx.fillStyle = color;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

        // Footprint / Volume at Price Bars & POC (Visuals Companion Parity)
        if (showFootprint && candleSpacing >= 8) {
          const numBins = 5;
          const binH = (highY - lowY) / numBins;
          // Bar Volume POC marker
          const pocY = (openY + closeY) / 2;
          ctx.fillStyle = 'rgba(255, 213, 79, 0.85)';
          ctx.beginPath();
          ctx.arc(x, pocY, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Candle delta text under recent candles
          if (i >= displayBars.length - 12) {
            const candleDelta = isBull
              ? `+${(bar.volume * 0.28 / 1000).toFixed(1)}k`
              : `-${(bar.volume * 0.31 / 1000).toFixed(1)}k`;
            ctx.fillStyle = isBull ? '#00d084' : '#ff4d4d';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(candleDelta, x, Math.min(plotHeight - 6, lowY + 12));
          }
        }

        // Absorption Bubbles (Effort high volume vs Small body progress)
        if (showAbsorption && i >= displayBars.length - 25) {
          const bodySize = Math.abs(bar.close - bar.open);
          const range = bar.high - bar.low;
          const isHighVol = bar.volume > 3400;
          const isSmallBody = range > 0 && bodySize / range < 0.32;

          if (isHighVol && isSmallBody) {
            const buyersAbsorbed = isBull;
            const absColor = buyersAbsorbed ? '#ff4d4d' : '#00d084';
            const absY = buyersAbsorbed ? highY - 8 : lowY + 14;

            ctx.fillStyle = absColor;
            ctx.font = 'bold 8.5px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(buyersAbsorbed ? '▼ ABS 2.1x' : '▲ ABS 1.8x', x, absY);
          }
        }
      });
    } else {
      // Area Chart
      ctx.beginPath();
      displayBars.forEach((bar, i) => {
        const x = i * candleSpacing + candleSpacing / 2;
        const y = getY(bar.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo((displayBars.length - 1) * candleSpacing + candleSpacing / 2, candlePlotHeight);
      ctx.lineTo(candleSpacing / 2, candlePlotHeight);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, 0, 0, candlePlotHeight);
      gradient.addColorStop(0, 'rgba(41, 98, 255, 0.28)');
      gradient.addColorStop(1, 'rgba(41, 98, 255, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = '#2962ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 9. EMAs and Anchored VWAPs
    if (showEma) {
      const drawEmaLine = (price: number, color: string, label: string) => {
        const y = getY(price);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(plotWidth * 0.45, y);
        ctx.lineTo(plotWidth, y);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(label, plotWidth + 8, y + 3);
      };

      drawEmaLine(indicators.ema20, '#2962ff', 'EMA 20');
      drawEmaLine(indicators.ema100, '#00bcd4', 'EMA 100');
      drawEmaLine(indicators.ema200, '#ff9800', 'EMA 200');
    }

    if (showVwap) {
      const yVwap = getY(indicators.vwapD);
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plotWidth * 0.3, yVwap);
      ctx.lineTo(plotWidth, yVwap);
      ctx.stroke();

      ctx.fillStyle = '#00bcd4';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('VWAP D', plotWidth + 8, yVwap + 3);
    }

    if (showVwapWM) {
      const yVwapW = getY(indicators.vwapD - 4.2);
      ctx.strokeStyle = 'rgba(0, 188, 212, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(plotWidth * 0.4, yVwapW);
      ctx.lineTo(plotWidth, yVwapW);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 10. Structure Event Break Marker (BOS / CHoCH)
    if (showStructure && structure.structActive) {
      const lastX = plotWidth - candleSpacing * 2.5;
      const yPos = getY(displayBars[displayBars.length - 1].high + 1.5);
      ctx.fillStyle = structure.structDirection === 'bull' ? '#089981' : '#f23645';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`▲${structure.structType} (${structure.structAge}b)`, lastX, yPos);
    }

    // 11. Current Live Spot Price Tag with Pulsing Green Indicator
    const currentPrice = quote.mid;
    const currentY = getY(currentPrice);

    ctx.strokeStyle = '#089981';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(plotWidth, currentY);
    ctx.stroke();

    // Right-Axis Current Price Tag
    ctx.fillStyle = '#089981';
    ctx.fillRect(plotWidth + 1, currentY - 9, priceScaleWidth - 2, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(currentPrice.toFixed(2), plotWidth + 6, currentY + 4);

    // 12. Interactive Crosshair and Coordinate HUD
    if (mousePos && mousePos.x <= plotWidth && mousePos.y <= plotHeight) {
      ctx.strokeStyle = '#787b86';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, plotHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(plotWidth, mousePos.y);
      ctx.stroke();

      // Floating price badge on right scale
      const hoverPrice = paddedMax - (mousePos.y / candlePlotHeight) * paddedRange;
      ctx.fillStyle = '#2a2e39';
      ctx.fillRect(plotWidth + 1, mousePos.y - 9, priceScaleWidth - 2, 18);
      ctx.fillStyle = '#d1d4dc';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(hoverPrice.toFixed(2), plotWidth + 6, mousePos.y + 4);

      // Time tag on bottom scale
      const barIdxAtMouse = Math.floor(mousePos.x / candleSpacing);
      if (barIdxAtMouse >= 0 && barIdxAtMouse < displayBars.length) {
        const hoverBar = displayBars[barIdxAtMouse];
        const d = new Date(hoverBar.time);
        const timeBadge = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillStyle = '#2a2e39';
        ctx.fillRect(mousePos.x - 24, plotHeight + 2, 48, 18);
        ctx.fillStyle = '#d1d4dc';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(timeBadge, mousePos.x, plotHeight + 14);
      }
    }

    // 13. Top-Right Candle Info HUD Panel (Visuals Companion Parity)
    const hudBar =
      hoveredBarIndex !== null && hoveredBarIndex < displayBars.length
        ? displayBars[hoveredBarIndex]
        : displayBars[displayBars.length - 1];

    if (hudBar) {
      const isUp = hudBar.close >= hudBar.open;
      const rng = hudBar.high - hudBar.low;
      const atrRatio = (rng / indicators.adaptiveATR).toFixed(2);
      const rvol = (hudBar.volume / 2400).toFixed(2);

      const hudText = `O ${hudBar.open.toFixed(2)}  H ${hudBar.high.toFixed(2)}  L ${hudBar.low.toFixed(2)}  C ${hudBar.close.toFixed(2)}  RNG ${rng.toFixed(2)} (${atrRatio} ATR)  ${isUp ? '▲ UP' : '▼ DOWN'}  RVOL ${rvol}x`;

      ctx.fillStyle = 'rgba(19, 23, 34, 0.85)';
      ctx.fillRect(8, 6, Math.min(plotWidth - 16, 560), 20);
      ctx.strokeStyle = '#2a2e39';
      ctx.strokeRect(8, 6, Math.min(plotWidth - 16, 560), 20);

      ctx.fillStyle = isUp ? '#089981' : '#f23645';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(hudText, 14, 20);
    }
  }, [
    bars,
    indicators,
    structure,
    liquidity,
    zones,
    quote,
    visibleCount,
    panOffset,
    showEma,
    showVwap,
    showVwapWM,
    showBB,
    showVolume,
    showSMC,
    showLevels,
    showSR,
    showStructure,
    showFootprint,
    showAbsorption,
    showH4,
    chartType,
    mousePos,
    hoveredBarIndex,
  ]);

  // Mouse Interactivity Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const plotWidth = rect.width - 76;
    const count = Math.min(Math.max(visibleCount, 20), bars.length);
    const candleSpacing = plotWidth / count;
    const barIdx = Math.floor(x / candleSpacing);
    setHoveredBarIndex(barIdx >= 0 && barIdx < count ? barIdx : null);

    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      if (Math.abs(deltaX) > 4) {
        const offsetChange = Math.round(deltaX / 8);
        setPanOffset(prev => Math.max(0, Math.min(bars.length - visibleCount, prev + offsetChange)));
        setDragStartX(e.clientX);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setVisibleCount(prev => Math.max(20, prev - 5));
    } else {
      setVisibleCount(prev => Math.min(bars.length, prev + 5));
    }
  };

  const handleReset = () => {
    setVisibleCount(65);
    setPanOffset(0);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-[#131722] border border-slate-800 rounded-md overflow-hidden font-mono shadow-2xl select-none"
    >
      {/* TradingView Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#181c27] border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          {/* Symbol Tag */}
          <div className="flex items-center gap-1 font-bold text-slate-100 text-xs">
            <span className="text-amber-400">XAUUSD</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-400">5M</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-sans text-[11px]">OANDA OTC SPOT</span>
          </div>

          <div className="h-3 w-px bg-slate-700 mx-1" />

          {/* Timeframe selector */}
          <div className="flex items-center gap-0.5 text-[11px]">
            {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-3 w-px bg-slate-700 mx-1" />

          {/* Chart Type */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2 py-0.5 rounded ${chartType === 'candles' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2 py-0.5 rounded ${chartType === 'area' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
            >
              Area
            </button>
          </div>
        </div>

        {/* Indicator Toggles & Visuals Companion Options */}
        <div className="flex flex-wrap items-center gap-1 text-[10.5px]">
          <button
            onClick={() => setShowEma(!showEma)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showEma ? 'bg-blue-950/60 border-blue-500/50 text-blue-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            EMA
          </button>
          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showVwap ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            VWAP
          </button>
          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showBB ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            BB(20,2)
          </button>
          <button
            onClick={() => setShowLevels(!showLevels)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showLevels ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            PDH/CDH
          </button>
          <button
            onClick={() => setShowSR(!showSR)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showSR ? 'bg-teal-950/60 border-teal-500/50 text-teal-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            S/R Touch
          </button>
          <button
            onClick={() => setShowSMC(!showSMC)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showSMC ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            SMC Zones
          </button>
          <button
            onClick={() => setShowFootprint(!showFootprint)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showFootprint ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            Footprint/POC
          </button>
          <button
            onClick={() => setShowAbsorption(!showAbsorption)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showAbsorption ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            Absorption
          </button>
          <button
            onClick={() => setShowH4(!showH4)}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              showH4 ? 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300 font-bold' : 'border-slate-800 text-slate-500'
            }`}
          >
            4H Box
          </button>

          <div className="h-3 w-px bg-slate-700 mx-1" />

          {/* Candle timer */}
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-200 font-bold">{timeRemaining}</span>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => setVisibleCount(prev => Math.max(20, prev - 10))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setVisibleCount(prev => Math.min(bars.length, prev + 10))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div className="relative flex-1 w-full overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setMousePos(null);
            setHoveredBarIndex(null);
          }}
          onWheel={handleWheel}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
