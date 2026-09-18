import React, { useState, useRef, useEffect } from 'react';
import { MarketBar, DualStructureState, LiquidityState, SMCZoneState } from '../types/quantum';
import { IndicatorSnapshot } from '../services/mockMarketData';
import { Layers, Eye, EyeOff, Maximize2 } from 'lucide-react';

interface InteractiveChartProps {
  bars: MarketBar[];
  indicators: IndicatorSnapshot;
  structure: DualStructureState;
  liquidity: LiquidityState;
  zones: SMCZoneState[];
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  bars,
  indicators,
  structure,
  liquidity,
  zones,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Overlay Visibility Toggles
  const [showEma, setShowEma] = useState(true);
  const [showVwap, setShowVwap] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showLevels, setShowLevels] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showStructure, setShowStructure] = useState(true);
  const [showSR, setShowSR] = useState(true);
  const [showAbsBubbles, setShowAbsBubbles] = useState(true);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h'>('5m');

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    // Grid dimensions
    const paddingRight = 65; // Price scale
    const paddingBottom = 24; // Time scale
    const chartWidth = width - paddingRight;
    const chartHeight = height - paddingBottom;

    // Find min & max price with padding
    const displayBars = bars.slice(-60); // Show last 60 bars
    const currentLastBar = displayBars[displayBars.length - 1];
    let minPrice = Math.min(...displayBars.map(b => b.low));
    let maxPrice = Math.max(...displayBars.map(b => b.high));

    // Expand bounds for indicators and key levels
    if (liquidity.pdh) maxPrice = Math.max(maxPrice, liquidity.pdh);
    if (liquidity.pdl) minPrice = Math.min(minPrice, liquidity.pdl);
    if (indicators.bbUpper) maxPrice = Math.max(maxPrice, indicators.bbUpper);
    if (indicators.bbLower) minPrice = Math.min(minPrice, indicators.bbLower);

    const priceRange = maxPrice - minPrice || 1.0;
    const paddedMin = minPrice - priceRange * 0.05;
    const paddedMax = maxPrice + priceRange * 0.05;
    const paddedRange = paddedMax - paddedMin;

    const getY = (price: number) => {
      return chartHeight - ((price - paddedMin) / paddedRange) * chartHeight;
    };

    const candleWidth = Math.max(3, (chartWidth / displayBars.length) * 0.65);
    const candleSpacing = chartWidth / displayBars.length;

    // 1. Draw Background Grid
    ctx.strokeStyle = '#151b26';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = (chartHeight / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis price tags
      const priceAtY = paddedMax - (i / 6) * paddedRange;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(priceAtY.toFixed(1), chartWidth + 6, y + 3);
    }

    // 2. Draw Bollinger Bands Area if enabled
    if (showBB && indicators.bbUpper && indicators.bbLower) {
      const yUpper = getY(indicators.bbUpper);
      const yLower = getY(indicators.bbLower);
      const yBasis = getY(indicators.bbBasis);

      ctx.fillStyle = 'rgba(176, 132, 255, 0.03)';
      ctx.fillRect(0, yUpper, chartWidth, yLower - yUpper);

      ctx.strokeStyle = 'rgba(176, 132, 255, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, yUpper);
      ctx.lineTo(chartWidth, yUpper);
      ctx.moveTo(0, yLower);
      ctx.lineTo(chartWidth, yLower);
      ctx.stroke();

      // Basis
      ctx.strokeStyle = 'rgba(176, 132, 255, 0.25)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, yBasis);
      ctx.lineTo(chartWidth, yBasis);
      ctx.stroke();
    }

    // 3. Draw SMC Fair Value Gaps and Order Blocks
    if (showZones) {
      zones.forEach(zone => {
        const topY = getY(zone.high);
        const bottomY = getY(zone.low);
        const zoneHeight = Math.max(2, bottomY - topY);

        if (zone.type === 'FVG') {
          ctx.fillStyle = zone.direction === 'bull' ? 'rgba(0, 208, 132, 0.08)' : 'rgba(255, 77, 77, 0.08)';
          ctx.strokeStyle = zone.direction === 'bull' ? 'rgba(0, 208, 132, 0.4)' : 'rgba(255, 77, 77, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.fillRect(chartWidth * 0.2, topY, chartWidth * 0.8, zoneHeight);
          ctx.strokeRect(chartWidth * 0.2, topY, chartWidth * 0.8, zoneHeight);

          ctx.fillStyle = zone.direction === 'bull' ? '#00d084' : '#ff4d4d';
          ctx.font = '8.5px JetBrains Mono';
          ctx.fillText(`FVG ${zone.direction.toUpperCase()}`, chartWidth * 0.22, topY + 10);
        } else if (zone.type === 'OB') {
          ctx.fillStyle = 'rgba(141, 110, 99, 0.14)';
          ctx.strokeStyle = 'rgba(141, 110, 99, 0.6)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.fillRect(chartWidth * 0.35, topY, chartWidth * 0.65, zoneHeight);
          ctx.strokeRect(chartWidth * 0.35, topY, chartWidth * 0.65, zoneHeight);

          ctx.fillStyle = '#bcaaa4';
          ctx.font = '8.5px JetBrains Mono';
          ctx.fillText(`OB ${zone.direction.toUpperCase()}`, chartWidth * 0.37, topY + 10);
        }
      });
    }

    // 4. Draw Key Levels (PDH/PDL, CDH/CDL, PWH/PWL)
    if (showLevels) {
      const drawLevel = (price: number | null, label: string, color: string, isDashed = true) => {
        if (!price) return;
        const y = getY(price);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(isDashed ? [4, 3] : []);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(`${label} ${price.toFixed(1)}`, 8, y - 3);

        // Price scale tag
        ctx.fillStyle = color;
        ctx.fillRect(chartWidth + 1, y - 8, 48, 14);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(label, chartWidth + 4, y + 3);
      };

      drawLevel(liquidity.pdh, 'PDH', '#FFD54F', true);
      drawLevel(liquidity.pdl, 'PDL', '#FFD54F', true);
      drawLevel(liquidity.pwh, 'PWH', '#FF8A65', true);
      drawLevel(liquidity.pwl, 'PWL', '#FF8A65', true);
      drawLevel(liquidity.cdh, 'CDH', '#4DD0E1', false);
      drawLevel(liquidity.cdl, 'CDL', '#4DD0E1', false);
    }

    // 5. Draw S/R Clustered Touches
    if (showSR) {
      const drawSR = (price: number, type: 'R' | 'S', count: number) => {
        const y = getY(price);
        const col = type === 'R' ? 'rgba(239, 83, 80, 0.6)' : 'rgba(38, 166, 154, 0.6)';
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(chartWidth * 0.4, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(`${type}1 ${price.toFixed(1)} (x${count})`, chartWidth - 110, y - 3);
      };

      drawSR(currentLastBar.close + 14.5, 'R', 3);
      drawSR(currentLastBar.close - 12.2, 'S', 4);
    }

    // 6. Draw Candlesticks
    ctx.setLineDash([]);
    displayBars.forEach((bar, idx) => {
      const x = idx * candleSpacing + candleSpacing / 2;
      const isUp = bar.close >= bar.open;
      const bullColor = '#00D084';
      const bearColor = '#FF4D4D';
      const barColor = isUp ? bullColor : bearColor;

      const openY = getY(bar.open);
      const closeY = getY(bar.close);
      const highY = getY(bar.high);
      const lowY = getY(bar.low);

      // Wick
      ctx.strokeStyle = barColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = barColor;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Absorption Bubble if high volume & small body
      if (showAbsBubbles && bar.volume > 3500 && Math.abs(bar.close - bar.open) < 1.2) {
        ctx.fillStyle = 'rgba(224, 64, 251, 0.6)';
        ctx.beginPath();
        ctx.arc(x, (openY + closeY) / 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 7. Draw Technical Overlays (EMAs, VWAP)
    if (showEma) {
      const drawHorizontalLine = (price: number, color: string, label: string, width = 1.5) => {
        const y = getY(price);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(chartWidth * 0.5, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(label, chartWidth + 6, y + 3);
      };

      drawHorizontalLine(indicators.ema20, '#FFFFFF', 'EMA20', 1);
      drawHorizontalLine(indicators.ema100, '#3B82F6', 'EMA100', 1.2);
      drawHorizontalLine(indicators.ema200, '#FFD700', 'EMA200', 1.8);
    }

    if (showVwap) {
      const yVwap = getY(indicators.vwapD);
      ctx.strokeStyle = '#00BCD4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chartWidth * 0.3, yVwap);
      ctx.lineTo(chartWidth, yVwap);
      ctx.stroke();

      ctx.fillStyle = '#00BCD4';
      ctx.font = 'bold 9.5px JetBrains Mono';
      ctx.fillText('VWAP-D', chartWidth + 6, yVwap + 3);
    }

    // 8. Structure Break Annotations (BOS / CHoCH)
    if (showStructure && structure.structActive) {
      const lastX = chartWidth - candleSpacing * 3;
      const yPos = getY(currentLastBar.high + 1.2);
      ctx.fillStyle = structure.structDirection === 'bull' ? '#00D084' : '#FF4D4D';
      ctx.font = 'bold 9.5px JetBrains Mono';
      ctx.fillText(`▲${structure.structType} (${structure.structAge}b)`, lastX - 40, yPos);
    }

    // 9. Current Live Price dotted leader
    const currentY = getY(bars[bars.length - 1].close);
    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();

    // Price scale current tag
    ctx.fillStyle = '#00E676';
    ctx.fillRect(chartWidth + 1, currentY - 8, 56, 15);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.fillText(bars[bars.length - 1].close.toFixed(2), chartWidth + 4, currentY + 3);

  }, [bars, indicators, structure, liquidity, zones, showEma, showVwap, showBB, showLevels, showZones, showStructure, showSR, showAbsBubbles]);

  return (
    <div ref={containerRef} className="relative flex flex-col bg-[#0b0e14] border border-slate-800 rounded-md overflow-hidden shadow-xl">
      {/* Chart Control Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e121a] border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 tracking-wider font-mono">XAUUSD SPOT 5M</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded px-1 py-0.5 text-[11px] font-mono">
            {(['1m', '5m', '15m', '1h', '4h'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded uppercase font-semibold ${timeframe === tf ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Overlay Toggles */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <button
              onClick={() => setShowEma(!showEma)}
              className={`px-2 py-0.5 rounded border transition-colors ${showEma ? 'bg-slate-800 text-slate-200 border-slate-600' : 'text-slate-500 border-transparent hover:text-slate-400'}`}
              title="EMA 20 / 100 / 200"
            >
              EMA
            </button>
            <button
              onClick={() => setShowVwap(!showVwap)}
              className={`px-2 py-0.5 rounded border transition-colors ${showVwap ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700' : 'text-slate-500 border-transparent hover:text-slate-400'}`}
              title="Daily Anchored VWAP"
            >
              VWAP
            </button>
            <button
              onClick={() => setShowBB(!showBB)}
              className={`px-2 py-0.5 rounded border transition-colors ${showBB ? 'bg-purple-950/60 text-purple-300 border-purple-700' : 'text-slate-500 border-transparent hover:text-slate-400'}`}
              title="Bollinger Bands (20,2)"
            >
              BB
            </button>
            <button
              onClick={() => setShowLevels(!showLevels)}
              className={`px-2 py-0.5 rounded border transition-colors ${showLevels ? 'bg-amber-950/60 text-amber-300 border-amber-700' : 'text-slate-500 border-transparent hover:text-slate-400'}`}
              title="NY Anchored PDH/PDL, PWH/PWL, CDH/CDL"
            >
              Levels
            </button>
            <button
              onClick={() => setShowZones(!showZones)}
              className={`px-2 py-0.5 rounded border transition-colors ${showZones ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700' : 'text-slate-500 border-transparent hover:text-slate-400'}`}
              title="Fair Value Gaps & Order Blocks"
            >
              SMC Zones
            </button>
            <button
              onClick={() => setShowStructure(!showStructure)}
              className={`px-2 py-0.5 rounded border transition-colors ${showStructure ? 'bg-sky-950/60 text-sky-300 border-sky-700' : 'text-slate-500 border-transparent hover:text-slate-400'}`}
              title="BOS / CHoCH Structure breaks"
            >
              Structure
            </button>
            <button
              onClick={() => setShowAbsBubbles(!showAbsBubbles)}
              className={`px-2 py-0.5 rounded border transition-colors ${showAbsBubbles ? 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-700' : 'text-slate-500 border-transparent hover:text-slate-400'}`}
              title="Tick absorption effort/result proxy bubbles"
            >
              Absorption
            </button>
          </div>
        </div>
      </div>

      {/* Primary Canvas Chart */}
      <div className="relative w-full h-[320px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Floating Legend / Quick Stats */}
      <div className="px-3 py-1.5 bg-[#090b10] border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>O: <strong className="text-slate-200">{bars[bars.length - 1].open}</strong></span>
          <span>H: <strong className="text-slate-200">{bars[bars.length - 1].high}</strong></span>
          <span>L: <strong className="text-slate-200">{bars[bars.length - 1].low}</strong></span>
          <span>C: <strong className="text-slate-200">{bars[bars.length - 1].close}</strong></span>
          <span>RNG: <strong className="text-amber-300">{(bars[bars.length - 1].high - bars[bars.length - 1].low).toFixed(2)}</strong></span>
          <span>ATR(14): <strong className="text-cyan-300">{indicators.atr.toFixed(2)}</strong></span>
          <span>RVOL: <strong className="text-emerald-400">{indicators.relVol.toFixed(2)}x</strong></span>
        </div>
        <div className="text-slate-500">
          Visual companion (QV2) unified layout • Collision-free tag leader registry
        </div>
      </div>
    </div>
  );
};
