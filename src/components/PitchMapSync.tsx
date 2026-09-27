import React from 'react';
import { BallDelivery, BatterStance, CRICKET_SPECS } from '../types/cricket';
import { getOutcomeColor } from '../utils/cricketMath';

interface PitchMapSyncProps {
  deliveries: BallDelivery[];
  batterStance: BatterStance;
  selectedBallId: string | null;
  onSelectBall: (ball: BallDelivery | null) => void;
}

export const PitchMapSync: React.FC<PitchMapSyncProps> = ({
  deliveries,
  batterStance,
  selectedBallId,
  onSelectBall,
}) => {
  // Pitch dimensions representation:
  // Bowling crease to popping crease = 20.12m (~22 yards)
  // Length zones (meters from bowling crease towards batsman):
  // 0 - 11m: Short pitch
  // 11 - 14m: Back of a length
  // 14 - 16.5m: Good length (The corridor)
  // 16.5 - 18.5m: Full length
  // 18.5 - 20.12m: Yorker / Crease line
  const pitchWidth = 320;
  const pitchHeight = 260;

  // Length zones definition in SVG Y coordinates (from top = bowling crease, bottom = batting crease)
  const zones = [
    { name: 'Yorker / Full Toss', startM: 18.5, endM: 20.12, color: 'bg-rose-500/10', border: '#ef4444' },
    { name: 'Full Length', startM: 16.5, endM: 18.5, color: 'bg-amber-500/10', border: '#f59e0b' },
    { name: 'Good Length (The Channel)', startM: 14.0, endM: 16.5, color: 'bg-emerald-500/10', border: '#10b981' },
    { name: 'Back of Length', startM: 11.0, endM: 14.0, color: 'bg-sky-500/10', border: '#38bdf8' },
    { name: 'Short Pitch / Bouncer', startM: 8.0, endM: 11.0, color: 'bg-purple-500/10', border: '#a855f7' },
  ];

  // Helper to map pitch distance in meters (0 to 20m) to SVG Y (top to bottom)
  // We zoom into the 8m to 20.5m hitting zone of the 22 yards
  const minMeters = 8.0;
  const maxMeters = 20.2;

  const metersToSvgY = (meters: number) => {
    const safeM = Number.isFinite(meters) ? meters : 15.0;
    const fraction = (safeM - minMeters) / (maxMeters - minMeters);
    const y = 30 + fraction * (pitchHeight - 60);
    return Number.isFinite(y) ? y : pitchHeight / 2;
  };

  const lateralToSvgX = (lateralCm: number) => {
    const safeLat = Number.isFinite(lateralCm) ? lateralCm : 0;
    const scale = (pitchWidth - 80) / 100;
    const x = pitchWidth / 2 + safeLat * scale;
    return Number.isFinite(x) ? x : pitchWidth / 2;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-white tracking-tight">
            Synced Pitch Map (22-Yard Plan View)
          </h4>
          <p className="text-[11px] text-slate-400">
            Bounce locations corresponding to marked Beehive deliveries
          </p>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
          Hawk-Eye Sync
        </span>
      </div>

      {/* Pitch Turf SVG */}
      <div className="relative bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-hidden flex justify-center">
        <svg
          viewBox={`0 0 ${pitchWidth} ${pitchHeight}`}
          className="w-full max-w-[340px] h-auto select-none"
        >
          {/* Turf Surface Background */}
          <rect
            x="40"
            y="20"
            width={pitchWidth - 80}
            height={pitchHeight - 40}
            fill="#064e3b"
            fillOpacity="0.25"
            stroke="#047857"
            strokeWidth="1.5"
            rx="4"
          />

          {/* Center Pitch Line */}
          <line
            x1={pitchWidth / 2}
            y1="20"
            x2={pitchWidth / 2}
            y2={pitchHeight - 20}
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="2 3"
            strokeOpacity="0.3"
          />

          {/* Length Zone Dividers */}
          {zones.map((z, idx) => {
            const yPos = metersToSvgY(z.startM);
            return (
              <g key={idx}>
                <line
                  x1="40"
                  y1={yPos}
                  x2={pitchWidth - 40}
                  y2={yPos}
                  stroke={z.border}
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <text
                  x="44"
                  y={yPos - 3}
                  fill={z.border}
                  fontSize="7.5"
                  fontWeight="600"
                  opacity="0.8"
                >
                  {z.name}
                </text>
              </g>
            );
          })}

          {/* Batting Popping Crease Line at bottom */}
          <line
            x1="30"
            y1={metersToSvgY(18.9)}
            x2={pitchWidth - 30}
            y2={metersToSvgY(18.9)}
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.9"
          />
          <text
            x={pitchWidth / 2}
            y={metersToSvgY(18.9) + 12}
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            opacity="0.85"
          >
            POPPING CREASE &amp; STUMPS
          </text>

          {/* Stumps symbol at bottom */}
          <rect
            x={pitchWidth / 2 - 8}
            y={metersToSvgY(20.0)}
            width="16"
            height="3"
            fill="#d97706"
            rx="1"
          />

          {/* Deliveries on Pitch Map */}
          {deliveries.map((ball) => {
            // Pitch distance calculation:
            // If ball already has pitchDistanceMeters, use it; otherwise estimate from height and delivery type
            let distM = ball.pitchDistanceMeters;
            if (!distM) {
              if (ball.deliveryType === 'yorker' || ball.yCm < 20) distM = 18.8;
              else if (ball.deliveryType === 'bouncer' || ball.yCm > 140) distM = 10.5;
              else if (ball.yCm > 100) distM = 13.0;
              else distM = 15.3;
            }

            const lateralCm = ball.pitchLateralCm !== undefined ? ball.pitchLateralCm : (Number.isFinite(ball.xCm) ? ball.xCm * 0.7 : 0);
            const svgX = lateralToSvgX(lateralCm);
            const svgY = metersToSvgY(distM);
            if (!Number.isFinite(svgX) || !Number.isFinite(svgY)) return null;

            const colorInfo = getOutcomeColor(ball.outcome);
            const isSelected = selectedBallId === ball.id;

            return (
              <g
                key={`pitch-${ball.id}`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => onSelectBall(isSelected ? null : ball)}
              >
                {isSelected && (
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r="9"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r="5"
                  fill={colorInfo.dotColor}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                <text
                  x={svgX}
                  y={svgY + 2.5}
                  fill="#000000"
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {ball.ballNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>Top: Bowling Crease</span>
        <span className="font-semibold text-emerald-400">Green = Good Length (6–8m from stumps)</span>
        <span>Bottom: Stumps</span>
      </div>
    </div>
  );
};
