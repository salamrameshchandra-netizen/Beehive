import React, { useState, useRef, useMemo } from 'react';
import {
  BallDelivery,
  BatterStance,
  CRICKET_SPECS,
  ViewPerspective,
} from '../types/cricket';
import {
  classifyBallZone,
  getOutcomeColor,
  realToSvg,
  svgToReal,
  SVG_CONFIG,
} from '../utils/cricketMath';
import { Eye, Layers, Flame, Users, Info, Plus } from 'lucide-react';

interface BeehiveCanvasProps {
  deliveries: BallDelivery[];
  batterStance: BatterStance;
  setBatterStance: (stance: BatterStance) => void;
  perspective: ViewPerspective;
  setPerspective: (p: ViewPerspective) => void;
  onCanvasClick: (xCm: number, yCm: number) => void;
  selectedBallId: string | null;
  onSelectBall: (ball: BallDelivery | null) => void;
  onOpenPlayers?: () => void;
  selectedPlayerFilter?: string | null;
  onClearPlayerFilter?: () => void;
}

export const BeehiveCanvas: React.FC<BeehiveCanvasProps> = ({
  deliveries,
  batterStance,
  setBatterStance,
  perspective,
  setPerspective,
  onCanvasClick,
  selectedBallId,
  onSelectBall,
  onOpenPlayers,
  selectedPlayerFilter,
  onClearPlayerFilter,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // View toggles
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showSilhouette, setShowSilhouette] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'wickets' | 'dots' | 'boundaries'>('all');

  // Live mouse hover coordinates in cm
  const [hoverCoords, setHoverCoords] = useState<{ xCm: number; yCm: number } | null>(null);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (outcomeFilter === 'wickets') return d.outcome.startsWith('wicket');
      if (outcomeFilter === 'dots') return d.outcome === 'dot';
      if (outcomeFilter === 'boundaries') return d.outcome === '4' || d.outcome === '6';
      return true;
    });
  }, [deliveries, outcomeFilter]);

  // Handle mouse move on SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;

    const scaleX = SVG_CONFIG.viewBoxWidth / rect.width;
    const scaleY = SVG_CONFIG.viewBoxHeight / rect.height;

    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    if (!Number.isFinite(svgX) || !Number.isFinite(svgY)) return;

    const real = svgToReal(svgX, svgY, perspective);
    if (Number.isFinite(real.xCm) && Number.isFinite(real.yCm)) {
      setHoverCoords(real);
    }
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;

    const scaleX = SVG_CONFIG.viewBoxWidth / rect.width;
    const scaleY = SVG_CONFIG.viewBoxHeight / rect.height;

    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    if (!Number.isFinite(svgX) || !Number.isFinite(svgY)) return;

    const real = svgToReal(svgX, svgY, perspective);
    if (Number.isFinite(real.xCm) && Number.isFinite(real.yCm)) {
      onCanvasClick(real.xCm, real.yCm);
    }
  };

  // Convert key landmark coordinates to SVG space
  const groundSvg = realToSvg(0, 0, perspective);
  const stumpTopSvg = realToSvg(0, CRICKET_SPECS.TOTAL_WICKET_HEIGHT_CM, perspective);

  // Stumps horizontal positions
  // Total wicket width is 22.86 cm (-11.43 to +11.43)
  const offStumpCm = batterStance === 'RHB' ? -CRICKET_SPECS.OFF_STUMP_OFFSET_CM : CRICKET_SPECS.OFF_STUMP_OFFSET_CM;
  const legStumpCm = batterStance === 'RHB' ? CRICKET_SPECS.LEG_STUMP_OFFSET_CM : -CRICKET_SPECS.LEG_STUMP_OFFSET_CM;

  const offStumpSvg = realToSvg(offStumpCm, 0, perspective);
  const middleStumpSvg = realToSvg(0, 0, perspective);
  const legStumpSvg = realToSvg(legStumpCm, 0, perspective);

  const stumpHeightPixels = groundSvg.svgY - stumpTopSvg.svgY;
  const stumpWidthPixels = 8;

  // Wide lines
  const offWideSvg = realToSvg(batterStance === 'RHB' ? -CRICKET_SPECS.OFF_WIDE_LINE_CM : CRICKET_SPECS.OFF_WIDE_LINE_CM, 0, perspective);
  const legWideSvg = realToSvg(batterStance === 'RHB' ? CRICKET_SPECS.LEG_WIDE_LINE_CM : -CRICKET_SPECS.LEG_WIDE_LINE_CM, 0, perspective);

  // Corridor of Uncertainty: 15cm to 35cm outside off stump
  const corridorStartCm = batterStance === 'RHB' ? -15 : 15;
  const corridorEndCm = batterStance === 'RHB' ? -38 : 38;
  const corridorStartSvg = realToSvg(corridorStartCm, 0, perspective);
  const corridorEndSvg = realToSvg(corridorEndCm, 0, perspective);
  const corridorLeft = Math.min(corridorStartSvg.svgX, corridorEndSvg.svgX);
  const corridorWidth = Math.abs(corridorEndSvg.svgX - corridorStartSvg.svgX);

  // Hover zone classification
  const hoverZone = hoverCoords ? classifyBallZone(hoverCoords.xCm, hoverCoords.yCm, batterStance) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: View & Batter Stance Controls */}
        <div className="flex items-center gap-2">
          {/* Stance Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setBatterStance('RHB')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                batterStance === 'RHB'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RHB (Right)
            </button>
            <button
              onClick={() => setBatterStance('LHB')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                batterStance === 'LHB'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LHB (Left)
            </button>
          </div>

          {/* Perspective Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setPerspective('bowler')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                perspective === 'bowler'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View from Bowler's end facing the batsman"
            >
              <Eye className="w-3 h-3" />
              <span>Bowler's View</span>
            </button>
            <button
              onClick={() => setPerspective('batter')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                perspective === 'batter'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View from Batsman / Keeper's perspective"
            >
              <span>Keeper's View</span>
            </button>
          </div>
        </div>

        {/* Center: Outcome Filters */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setOutcomeFilter('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              outcomeFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Balls ({deliveries.length})
          </button>
          <button
            onClick={() => setOutcomeFilter('wickets')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              outcomeFilter === 'wickets'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Wickets
          </button>
          <button
            onClick={() => setOutcomeFilter('dots')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              outcomeFilter === 'dots'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dots
          </button>
          <button
            onClick={() => setOutcomeFilter('boundaries')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              outcomeFilter === 'boundaries'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Boundaries
          </button>
        </div>

        {/* Right: Layer Overlays */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors ${
              showZones
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Zones</span>
          </button>

          <button
            onClick={() => setShowSilhouette(!showSilhouette)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors ${
              showSilhouette
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Batter</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors ${
              showHeatmap
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Heatmap</span>
          </button>

          {onOpenPlayers && (
            <button
              onClick={onOpenPlayers}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                selectedPlayerFilter
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Filter by player or select active bowler/batter"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Players</span>
              {selectedPlayerFilter && (
                <span className="font-mono text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full">
                  {selectedPlayerFilter.split(' ')[0]}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Player Filter Active Banner */}
      {selectedPlayerFilter && (
        <div className="px-4 py-1.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filtering deliveries for: <strong className="text-white">{selectedPlayerFilter}</strong></span>
          </div>
          {onClearPlayerFilter && (
            <button
              onClick={onClearPlayerFilter}
              className="text-[11px] underline hover:text-white font-medium"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 select-none overflow-hidden min-h-[480px]">
        {/* Background Pitch Turf Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_CONFIG.viewBoxWidth} ${SVG_CONFIG.viewBoxHeight}`}
          className="w-full h-full cursor-crosshair block"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <defs>
            {/* Wooden Stump Gradient */}
            <linearGradient id="stumpWood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="30%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Bail Metallic / Wood Gradient */}
            <linearGradient id="bailGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Heatmap Blur Filter */}
            <filter id="heatBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="18" result="blur" />
              <feColorMatrix
                type="matrix"
                values="
                  1 0 0 0 0
                  0 0.8 0 0 0
                  0 0 0.2 0 0
                  0 0 0 0.85 0"
              />
            </filter>

            {/* Subtle glow filter for wickets */}
            <filter id="wicketGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Turf Surface Line */}
          <line
            x1="20"
            y1={groundSvg.svgY}
            x2={SVG_CONFIG.viewBoxWidth - 20}
            y2={groundSvg.svgY}
            stroke="#10b981"
            strokeWidth="3"
            strokeOpacity="0.6"
          />

          {/* Popping Crease Ground Bed */}
          <rect
            x="20"
            y={groundSvg.svgY}
            width={SVG_CONFIG.viewBoxWidth - 40}
            height={SVG_CONFIG.paddingBottom}
            fill="#064e3b"
            fillOpacity="0.2"
          />
          <text
            x="40"
            y={groundSvg.svgY + 20}
            fill="#10b981"
            fontSize="10"
            fontWeight="600"
            opacity="0.7"
          >
            PITCH SURFACE / POPPING CREASE (0 cm)
          </text>

          {/* Strategic Zones Layer */}
          {showZones && (
            <g className="zones-layer" opacity="0.85">
              {/* Corridor of Uncertainty Column */}
              <rect
                x={corridorLeft}
                y={realToSvg(0, 120, perspective).svgY}
                width={corridorWidth}
                height={groundSvg.svgY - realToSvg(0, 120, perspective).svgY}
                fill="#f59e0b"
                fillOpacity="0.08"
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
              />
              <text
                x={corridorLeft + corridorWidth / 2}
                y={realToSvg(0, 115, perspective).svgY}
                fill="#fbbf24"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                opacity="0.85"
              >
                CORRIDOR OF UNCERTAINTY
              </text>
              <text
                x={corridorLeft + corridorWidth / 2}
                y={realToSvg(0, 105, perspective).svgY}
                fill="#fbbf24"
                fontSize="8.5"
                textAnchor="middle"
                opacity="0.6"
              >
                4th &amp; 5th Stump Channel (15–35cm Off)
              </text>

              {/* Stumps Zone Box */}
              <rect
                x={Math.min(offStumpSvg.svgX, legStumpSvg.svgX) - stumpWidthPixels}
                y={stumpTopSvg.svgY - 6}
                width={Math.abs(legStumpSvg.svgX - offStumpSvg.svgX) + stumpWidthPixels * 2}
                height={stumpHeightPixels + 6}
                fill="#10b981"
                fillOpacity="0.06"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="3 3"
                strokeOpacity="0.4"
              />

              {/* Chest / Bouncer Line */}
              <line
                x1={SVG_CONFIG.paddingSides}
                y1={realToSvg(0, 140, perspective).svgY}
                x2={SVG_CONFIG.viewBoxWidth - SVG_CONFIG.paddingSides}
                y2={realToSvg(0, 140, perspective).svgY}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.3"
              />
              <text
                x={SVG_CONFIG.viewBoxWidth - SVG_CONFIG.paddingSides - 10}
                y={realToSvg(0, 140, perspective).svgY - 5}
                fill="#ef4444"
                fontSize="9"
                fontWeight="500"
                textAnchor="end"
                opacity="0.7"
              >
                BOUNCER / CHEST HEIGHT (140 cm)
              </text>

              {/* Waist Height Line */}
              <line
                x1={SVG_CONFIG.paddingSides}
                y1={realToSvg(0, 100, perspective).svgY}
                x2={SVG_CONFIG.viewBoxWidth - SVG_CONFIG.paddingSides}
                y2={realToSvg(0, 100, perspective).svgY}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 4"
                strokeOpacity="0.25"
              />
              <text
                x={SVG_CONFIG.viewBoxWidth - SVG_CONFIG.paddingSides - 10}
                y={realToSvg(0, 100, perspective).svgY - 5}
                fill="#38bdf8"
                fontSize="9"
                textAnchor="end"
                opacity="0.6"
              >
                WAIST HEIGHT (100 cm)
              </text>
            </g>
          )}

          {/* Off-Side Wide Guideline (89 cm) */}
          <line
            x1={offWideSvg.svgX}
            y1={groundSvg.svgY - 200}
            x2={offWideSvg.svgX}
            y2={groundSvg.svgY}
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            strokeOpacity="0.75"
          />
          <text
            x={offWideSvg.svgX}
            y={groundSvg.svgY - 208}
            fill="#fbbf24"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            opacity="0.8"
          >
            OFF WIDE (89cm)
          </text>

          {/* Leg-Side Wide Line (30 cm) */}
          <line
            x1={legWideSvg.svgX}
            y1={groundSvg.svgY - 140}
            x2={legWideSvg.svgX}
            y2={groundSvg.svgY}
            stroke="#f87171"
            strokeWidth="1.2"
            strokeDasharray="5 3"
            strokeOpacity="0.5"
          />
          <text
            x={legWideSvg.svgX}
            y={groundSvg.svgY - 145}
            fill="#f87171"
            fontSize="8.5"
            fontWeight="600"
            textAnchor="middle"
            opacity="0.7"
          >
            LEG WIDE
          </text>

          {/* Batter Silhouette (Anatomical Reference) */}
          {showSilhouette && (
            <g
              className="batter-silhouette"
              opacity="0.45"
              transform={
                batterStance === 'RHB'
                  ? `translate(${middleStumpSvg.svgX + 25}, 0)`
                  : `translate(${middleStumpSvg.svgX - 25}, 0) scale(-1, 1)`
              }
            >
              {/* Helmet / Head (155cm - 180cm) */}
              <circle
                cx="15"
                cy={realToSvg(0, 168, perspective).svgY}
                r="18"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="1.5"
              />
              {/* Helmet Peak & Grille */}
              <path
                d={`M 15 ${realToSvg(0, 168, perspective).svgY} L -5 ${realToSvg(0, 168, perspective).svgY + 5} L 0 ${realToSvg(0, 168, perspective).svgY + 16} Z`}
                fill="#475569"
              />

              {/* Torso & Shoulders (110cm - 155cm) */}
              <path
                d={`M -5 ${realToSvg(0, 150, perspective).svgY} 
                   C 10 ${realToSvg(0, 155, perspective).svgY}, 25 ${realToSvg(0, 155, perspective).svgY}, 40 ${realToSvg(0, 150, perspective).svgY}
                   L 30 ${realToSvg(0, 105, perspective).svgY}
                   L 5 ${realToSvg(0, 105, perspective).svgY} Z`}
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1"
              />

              {/* Front Leg & Pad (45cm - 105cm) */}
              <rect
                x="0"
                y={realToSvg(0, 105, perspective).svgY}
                width="18"
                height={groundSvg.svgY - realToSvg(0, 105, perspective).svgY - 12}
                rx="6"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="1"
              />
              {/* Back Leg & Pad */}
              <rect
                x="18"
                y={realToSvg(0, 105, perspective).svgY + 5}
                width="16"
                height={groundSvg.svgY - realToSvg(0, 105, perspective).svgY - 17}
                rx="5"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1"
              />

              {/* Cricket Bat in Stance (touching ground near popping crease) */}
              <g
                transform={`rotate(-8, -12, ${groundSvg.svgY})`}
              >
                {/* Bat Handle */}
                <rect
                  x="-13"
                  y={realToSvg(0, 108, perspective).svgY}
                  width="4"
                  height="36"
                  rx="1"
                  fill="#fef08a"
                  stroke="#78350f"
                  strokeWidth="0.8"
                />
                {/* Bat Blade */}
                <rect
                  x="-16"
                  y={realToSvg(0, 75, perspective).svgY}
                  width="11"
                  height={groundSvg.svgY - realToSvg(0, 75, perspective).svgY - 2}
                  rx="2"
                  fill="#d97706"
                  stroke="#92400e"
                  strokeWidth="1"
                />
              </g>
            </g>
          )}

          {/* Stumps & Bails Structure */}
          <g className="stumps-group">
            {/* Ground Shadows under Stumps */}
            <ellipse
              cx={middleStumpSvg.svgX}
              cy={groundSvg.svgY + 2}
              rx={Math.abs(legStumpSvg.svgX - offStumpSvg.svgX) / 2 + 10}
              ry="4"
              fill="#000000"
              opacity="0.4"
            />

            {/* Off Stump */}
            <rect
              x={offStumpSvg.svgX - stumpWidthPixels / 2}
              y={stumpTopSvg.svgY}
              width={stumpWidthPixels}
              height={stumpHeightPixels}
              rx="2"
              fill="url(#stumpWood)"
              stroke="#451a03"
              strokeWidth="0.8"
            />
            {/* Off Stump Cap */}
            <ellipse
              cx={offStumpSvg.svgX}
              cy={stumpTopSvg.svgY}
              rx={stumpWidthPixels / 2}
              ry="2"
              fill="#fef3c7"
            />

            {/* Middle Stump */}
            <rect
              x={middleStumpSvg.svgX - stumpWidthPixels / 2}
              y={stumpTopSvg.svgY}
              width={stumpWidthPixels}
              height={stumpHeightPixels}
              rx="2"
              fill="url(#stumpWood)"
              stroke="#451a03"
              strokeWidth="0.8"
            />
            {/* Middle Stump Cap */}
            <ellipse
              cx={middleStumpSvg.svgX}
              cy={stumpTopSvg.svgY}
              rx={stumpWidthPixels / 2}
              ry="2"
              fill="#fef3c7"
            />

            {/* Leg Stump */}
            <rect
              x={legStumpSvg.svgX - stumpWidthPixels / 2}
              y={stumpTopSvg.svgY}
              width={stumpWidthPixels}
              height={stumpHeightPixels}
              rx="2"
              fill="url(#stumpWood)"
              stroke="#451a03"
              strokeWidth="0.8"
            />
            {/* Leg Stump Cap */}
            <ellipse
              cx={legStumpSvg.svgX}
              cy={stumpTopSvg.svgY}
              rx={stumpWidthPixels / 2}
              ry="2"
              fill="#fef3c7"
            />

            {/* Bails: Pair resting across the 3 stumps */}
            {/* Bail 1: Off to Middle */}
            <rect
              x={Math.min(offStumpSvg.svgX, middleStumpSvg.svgX) - 1}
              y={stumpTopSvg.svgY - 4.5}
              width={Math.abs(middleStumpSvg.svgX - offStumpSvg.svgX) + 2}
              height="4"
              rx="1.5"
              fill="url(#bailGradient)"
              stroke="#78350f"
              strokeWidth="0.6"
            />
            {/* Bail 2: Middle to Leg */}
            <rect
              x={Math.min(middleStumpSvg.svgX, legStumpSvg.svgX) - 1}
              y={stumpTopSvg.svgY - 4.5}
              width={Math.abs(legStumpSvg.svgX - middleStumpSvg.svgX) + 2}
              height="4"
              rx="1.5"
              fill="url(#bailGradient)"
              stroke="#78350f"
              strokeWidth="0.6"
            />

            {/* Stump Labels */}
            <text
              x={offStumpSvg.svgX}
              y={groundSvg.svgY + 14}
              fill="#94a3b8"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
            >
              OFF
            </text>
            <text
              x={middleStumpSvg.svgX}
              y={groundSvg.svgY + 14}
              fill="#94a3b8"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
            >
              MID
            </text>
            <text
              x={legStumpSvg.svgX}
              y={groundSvg.svgY + 14}
              fill="#94a3b8"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
            >
              LEG
            </text>
          </g>

          {/* Stumps Height Indicator */}
          <line
            x1={Math.min(offStumpSvg.svgX, legStumpSvg.svgX) - 15}
            y1={stumpTopSvg.svgY}
            x2={Math.min(offStumpSvg.svgX, legStumpSvg.svgX) - 15}
            y2={groundSvg.svgY}
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text
            x={Math.min(offStumpSvg.svgX, legStumpSvg.svgX) - 20}
            y={(stumpTopSvg.svgY + groundSvg.svgY) / 2}
            fill="#10b981"
            fontSize="8"
            fontWeight="bold"
            textAnchor="end"
            dominantBaseline="middle"
          >
            28" (71.1cm)
          </text>

          {/* Heatmap Density Layer (Soft Radial Glows) */}
          {showHeatmap && filteredDeliveries.length > 0 && (
            <g className="heatmap-layer" filter="url(#heatBlur)">
              {filteredDeliveries.map((ball) => {
                const { svgX, svgY } = realToSvg(ball.xCm, ball.yCm, perspective);
                return (
                  <circle
                    key={`heat-${ball.id}`}
                    cx={svgX}
                    cy={svgY}
                    r="28"
                    fill="#f59e0b"
                    opacity="0.4"
                  />
                );
              })}
            </g>
          )}

          {/* Marked Deliveries Points */}
          <g className="deliveries-layer">
            {filteredDeliveries.map((ball, idx) => {
              const { svgX, svgY } = realToSvg(ball.xCm, ball.yCm, perspective);
              const colorInfo = getOutcomeColor(ball.outcome);
              const isSelected = selectedBallId === ball.id;
              const isWicket = ball.outcome.startsWith('wicket');

              return (
                <g
                  key={ball.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBall(isSelected ? null : ball);
                  }}
                  className="cursor-pointer transition-transform hover:scale-125"
                  filter={isWicket ? 'url(#wicketGlow)' : undefined}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r="16"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Outer Disc Shadow */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r="8.5"
                    fill="#0f172a"
                    stroke={colorInfo.dotColor}
                    strokeWidth="2"
                  />

                  {/* Inner Dot with Color */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r="5"
                    fill={colorInfo.dotColor}
                  />

                  {/* Over/Ball Number Label */}
                  <text
                    x={svgX}
                    y={svgY + 3}
                    fill={isWicket ? '#ffffff' : '#000000'}
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {ball.ballNumber}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Live Interactive Crosshair Cursor */}
          {hoverCoords && Number.isFinite(hoverCoords.xCm) && Number.isFinite(hoverCoords.yCm) && (
            <g className="crosshair-indicator pointer-events-none">
              {(() => {
                const { svgX, svgY } = realToSvg(hoverCoords.xCm, hoverCoords.yCm, perspective);
                if (!Number.isFinite(svgX) || !Number.isFinite(svgY)) return null;
                return (
                  <>
                    {/* Horizontal Guideline */}
                    <line
                      x1="30"
                      y1={svgY}
                      x2={SVG_CONFIG.viewBoxWidth - 30}
                      y2={svgY}
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      strokeOpacity="0.6"
                    />
                    {/* Vertical Guideline */}
                    <line
                      x1={svgX}
                      y1="30"
                      x2={svgX}
                      y2={groundSvg.svgY}
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      strokeDasharray="2 3"
                      strokeOpacity="0.6"
                    />

                    {/* Crosshair Target Circle */}
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r="10"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeOpacity="0.8"
                    />
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r="2"
                      fill="#38bdf8"
                    />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Live Coordinate Badge / Instructions (Bottom Floating Bar) */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
          {hoverCoords && hoverZone ? (
            <div className="bg-slate-950/90 border border-slate-700/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs shadow-lg flex items-center gap-3 pointer-events-auto">
              <span className="font-mono text-emerald-400 font-semibold">
                X: {hoverCoords.xCm > 0 ? `+${hoverCoords.xCm}` : hoverCoords.xCm}cm
              </span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-sky-400 font-semibold">
                Y: {hoverCoords.yCm}cm
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-200 font-medium">{hoverZone.label}</span>
              <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Click to mark delivery
              </span>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-slate-800 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-slate-400 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hover to inspect coordinates · Click anywhere on the plane to mark a ball</span>
            </div>
          )}

          {/* Quick Legend */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/80 border border-slate-800 backdrop-blur px-2.5 py-1 rounded-lg text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Wicket
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Boundary
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Runs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Dot
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
