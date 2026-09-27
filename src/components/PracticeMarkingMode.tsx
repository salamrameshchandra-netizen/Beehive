import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Target, Award, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { realToSvg, svgToReal, SVG_CONFIG } from '../utils/cricketMath';
import { CRICKET_SPECS } from '../types/cricket';

interface DrillScenario {
  id: string;
  name: string;
  type: string;
  speedKph: number;
  bowlerType: string;
  description: string;
  clues: string;
  actualXCm: number;
  actualYCm: number;
  zoneDescription: string;
}

const DRILL_SCENARIOS: DrillScenario[] = [
  {
    id: 'drill-1',
    name: 'Classic Test Match Outswinger',
    type: 'Top of Off-Stump Channel',
    speedKph: 136.5,
    bowlerType: 'Right-Arm Fast Medium',
    description: 'Pitches good length on middle-and-off, nips away late towards the off bail.',
    clues: 'Watch the late away movement. Notice where it passes relative to the batter’s top of off-stump (knee roll height).',
    actualXCm: -18.5,
    actualYCm: 70.0,
    zoneDescription: '18.5cm outside Off · Top of Stumps (Bail height)',
  },
  {
    id: 'drill-2',
    name: 'Toe-Crushing Yorker',
    type: 'Base of Middle Stump',
    speedKph: 144.0,
    bowlerType: 'Right-Arm Express Fast',
    description: 'Spearing directly at the popping crease into the batter’s toes.',
    clues: 'Extremely full trajectory, almost zero bounce, exploding right at ground level under the bat.',
    actualXCm: -1.0,
    actualYCm: 12.0,
    zoneDescription: '1cm from Middle Stump · Base of Stumps (Boots)',
  },
  {
    id: 'drill-3',
    name: 'Sharp Throat Bouncer',
    type: 'Rib & Helmet Cramper',
    speedKph: 141.2,
    bowlerType: 'Right-Arm Fast',
    description: 'Dug in halfway down the pitch, steep bounce leaping towards the chest and grille.',
    clues: 'High trajectory, well above waist height, batter tucks gloves in defense near collarbone.',
    actualXCm: 12.0,
    actualYCm: 154.0,
    zoneDescription: '12cm on Pad/Body line · Helmet / Chest Height',
  },
  {
    id: 'drill-4',
    name: 'The 5th Stump Tease',
    type: 'Corridor of Uncertainty Drive Lure',
    speedKph: 133.0,
    bowlerType: 'Right-Arm Seam',
    description: 'Fullish length dangling outside off stump, enticing a cover drive.',
    clues: 'Clear daylight between off stump and ball. Tempting channel for an outside edge.',
    actualXCm: -34.0,
    actualYCm: 62.0,
    zoneDescription: '34cm outside Off (5th Stump Channel) · Shin/Knee height',
  },
  {
    id: 'drill-5',
    name: 'Drifting Leg Break',
    type: 'Turn from Outside Leg onto Off Bail',
    speedKph: 87.0,
    bowlerType: 'Right-Arm Leg Spin',
    description: 'Flighted delivery dipping and ripping across the right-hander.',
    clues: 'Slow looping trajectory, sharp right-to-left spin clipping top of off.',
    actualXCm: -11.5,
    actualYCm: 71.8,
    zoneDescription: 'Directly on Off Stump Bail · Hitting Timber',
  },
];

export const PracticeMarkingMode: React.FC = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [ballProgress, setBallProgress] = useState<number>(0); // 0 (bowler end) to 1 (stumps)
  const [userMark, setUserMark] = useState<{ xCm: number; yCm: number } | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [scoreHistory, setScoreHistory] = useState<{ id: string; errorCm: number }[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const scenario = DRILL_SCENARIOS[currentScenarioIndex];

  // Run delivery animation
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const startTime = performance.now();
      const durationMs = 1400; // Simulated ball flight time

      const step = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        setBallProgress(progress);

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else {
          setIsPlaying(false);
        }
      };

      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleStartDelivery = () => {
    setUserMark(null);
    setIsRevealed(false);
    setBallProgress(0);
    setIsPlaying(true);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isRevealed || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.width <= 0 || rect.height <= 0) return;

    const scaleX = SVG_CONFIG.viewBoxWidth / rect.width;
    const scaleY = SVG_CONFIG.viewBoxHeight / rect.height;

    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    if (!Number.isFinite(svgX) || !Number.isFinite(svgY)) return;

    const real = svgToReal(svgX, svgY, 'bowler');
    if (Number.isFinite(real.xCm) && Number.isFinite(real.yCm)) {
      setUserMark(real);
    }
  };

  const handleReveal = () => {
    if (!userMark) return;
    setIsRevealed(true);

    // Calculate Euclidean distance in centimeters
    const dx = userMark.xCm - scenario.actualXCm;
    const dy = userMark.yCm - scenario.actualYCm;
    const errorCm = Math.sqrt(dx * dx + dy * dy);

    setScoreHistory((prev) => [...prev.filter((s) => s.id !== scenario.id), { id: scenario.id, errorCm }]);
  };

  const handleNextDrill = () => {
    setUserMark(null);
    setIsRevealed(false);
    setBallProgress(0);
    setCurrentScenarioIndex((prev) => (prev + 1) % DRILL_SCENARIOS.length);
  };

  // Coordinates
  const actualSvg = realToSvg(scenario.actualXCm, scenario.actualYCm, 'bowler');
  const userSvg = userMark && Number.isFinite(userMark.xCm) && Number.isFinite(userMark.yCm)
    ? realToSvg(userMark.xCm, userMark.yCm, 'bowler')
    : null;

  // Stumps landmarks
  const groundSvg = realToSvg(0, 0, 'bowler');
  const stumpTopSvg = realToSvg(0, CRICKET_SPECS.TOTAL_WICKET_HEIGHT_CM, 'bowler');
  const offStumpSvg = realToSvg(-CRICKET_SPECS.OFF_STUMP_OFFSET_CM, 0, 'bowler');
  const legStumpSvg = realToSvg(CRICKET_SPECS.LEG_STUMP_OFFSET_CM, 0, 'bowler');
  const middleStumpSvg = realToSvg(0, 0, 'bowler');

  // Animation ball coordinates in 3D projection
  // When progress = 0: Ball is distant (small, near center top)
  // When progress = 1: Ball hits actualSvg
  const startX = SVG_CONFIG.viewBoxWidth / 2 + 10;
  const startY = 180;
  const safeProgress = Number.isFinite(ballProgress) ? Math.max(0, Math.min(1, ballProgress)) : 0;
  const rawAnimX = startX + (actualSvg.svgX - startX) * safeProgress;
  const rawAnimY = startY + (actualSvg.svgY - startY) * Math.pow(safeProgress, 1.2);
  const currentAnimX = Number.isFinite(rawAnimX) ? rawAnimX : startX;
  const currentAnimY = Number.isFinite(rawAnimY) ? rawAnimY : startY;
  const currentBallRadius = Number.isFinite(4 + 12 * safeProgress) ? 4 + 12 * safeProgress : 8;

  // Error distance
  const currentErrorCm =
    userMark !== null
      ? Math.sqrt(
          Math.pow(userMark.xCm - scenario.actualXCm, 2) + Math.pow(userMark.yCm - scenario.actualYCm, 2)
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Scorer Eye Calibration
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">Drill {currentScenarioIndex + 1} of {DRILL_SCENARIOS.length}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {scenario.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {scenario.bowlerType} · {scenario.speedKph} km/h · {scenario.type}
          </p>
        </div>

        {/* Drill Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartDelivery}
            disabled={isPlaying}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
              isPlaying
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPlaying ? 'Delivering...' : ballProgress > 0 ? 'Replay Delivery' : 'Bowl Delivery'}</span>
          </button>

          {userMark && !isRevealed && (
            <button
              onClick={handleReveal}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check Accuracy</span>
            </button>
          )}

          {isRevealed && (
            <button
              onClick={handleNextDrill}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Next Drill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clues Card */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-3 text-xs">
        <Target className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-200">How to score:</span>
          <p className="text-slate-400">
            Click <strong>Bowl Delivery</strong> to watch the ball travel towards the stumps. Then click on the stumps elevation board where you think the ball crossed the crease.
          </p>
        </div>
      </div>

      {/* Interactive Simulation SVG Canvas */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_CONFIG.viewBoxWidth} ${SVG_CONFIG.viewBoxHeight}`}
          className={`w-full h-[460px] block select-none ${
            !isRevealed ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onClick={handleSvgClick}
        >
          {/* Turf Surface */}
          <line
            x1="30"
            y1={groundSvg.svgY}
            x2={SVG_CONFIG.viewBoxWidth - 30}
            y2={groundSvg.svgY}
            stroke="#10b981"
            strokeWidth="3"
            strokeOpacity="0.6"
          />

          {/* Perspective Pitch Track */}
          <polygon
            points={`
              ${SVG_CONFIG.viewBoxWidth / 2 - 40},160 
              ${SVG_CONFIG.viewBoxWidth / 2 + 40},160 
              ${SVG_CONFIG.viewBoxWidth - 100},${groundSvg.svgY} 
              100,${groundSvg.svgY}
            `}
            fill="#064e3b"
            fillOpacity="0.15"
          />

          {/* Stumps */}
          <g>
            {/* Off Stump */}
            <rect
              x={offStumpSvg.svgX - 4}
              y={stumpTopSvg.svgY}
              width="8"
              height={groundSvg.svgY - stumpTopSvg.svgY}
              rx="2"
              fill="#d97706"
              stroke="#78350f"
              strokeWidth="0.8"
            />
            {/* Middle Stump */}
            <rect
              x={middleStumpSvg.svgX - 4}
              y={stumpTopSvg.svgY}
              width="8"
              height={groundSvg.svgY - stumpTopSvg.svgY}
              rx="2"
              fill="#d97706"
              stroke="#78350f"
              strokeWidth="0.8"
            />
            {/* Leg Stump */}
            <rect
              x={legStumpSvg.svgX - 4}
              y={stumpTopSvg.svgY}
              width="8"
              height={groundSvg.svgY - stumpTopSvg.svgY}
              rx="2"
              fill="#d97706"
              stroke="#78350f"
              strokeWidth="0.8"
            />

            {/* Bails */}
            <rect
              x={offStumpSvg.svgX - 4}
              y={stumpTopSvg.svgY - 4}
              width={legStumpSvg.svgX - offStumpSvg.svgX + 8}
              height="3.5"
              rx="1.5"
              fill="#fef08a"
              stroke="#78350f"
              strokeWidth="0.6"
            />
          </g>

          {/* Animated Ball in Flight */}
          {(isPlaying || ballProgress > 0) && (
            <g>
              {/* Ball Shadow */}
              <ellipse
                cx={currentAnimX}
                cy={groundSvg.svgY + 2}
                rx={currentBallRadius * 0.8}
                ry="3"
                fill="#000000"
                opacity="0.4"
              />
              {/* Cricket Ball */}
              <circle
                cx={currentAnimX}
                cy={currentAnimY}
                r={currentBallRadius}
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth={ballProgress > 0.7 ? 1.5 : 0.8}
              />
              {/* Seam line */}
              <line
                x1={currentAnimX - currentBallRadius * 0.7}
                y1={currentAnimY}
                x2={currentAnimX + currentBallRadius * 0.7}
                y2={currentAnimY}
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="2 1"
              />
            </g>
          )}

          {/* User's Placed Mark */}
          {userSvg && Number.isFinite(userSvg.svgX) && Number.isFinite(userSvg.svgY) && (
            <g>
              <circle
                cx={userSvg.svgX}
                cy={userSvg.svgY}
                r="7"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={userSvg.svgX}
                y={userSvg.svgY - 12}
                fill="#38bdf8"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                Your Mark
              </text>
            </g>
          )}

          {/* Revealed True Hawk-Eye Target */}
          {isRevealed && userSvg && Number.isFinite(userSvg.svgX) && Number.isFinite(userSvg.svgY) && Number.isFinite(actualSvg.svgX) && Number.isFinite(actualSvg.svgY) && (
            <g>
              {/* Line connecting user mark to true mark */}
              <line
                x1={userSvg.svgX}
                y1={userSvg.svgY}
                x2={actualSvg.svgX}
                y2={actualSvg.svgY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* True Mark */}
              <circle
                cx={actualSvg.svgX}
                cy={actualSvg.svgY}
                r="8"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={actualSvg.svgX}
                y={actualSvg.svgY - 12}
                fill="#10b981"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                Hawk-Eye Truth
              </text>
            </g>
          )}
        </svg>

        {/* Evaluation Banner (When revealed) */}
        {isRevealed && userMark && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  currentErrorCm < 5
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : currentErrorCm < 12
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {currentErrorCm < 5 ? 'A+' : currentErrorCm < 12 ? 'B' : 'C'}
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {currentErrorCm < 5
                      ? 'Elite Hawk-Eye Precision!'
                      : currentErrorCm < 12
                      ? 'Good Analyst Accuracy'
                      : 'Needs Calibration'}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    Error: {currentErrorCm.toFixed(1)} cm
                  </span>
                </div>
                <p className="text-slate-400">
                  Target: {scenario.zoneDescription}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextDrill}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors self-end sm:self-auto"
            >
              Continue to Next Drill
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
