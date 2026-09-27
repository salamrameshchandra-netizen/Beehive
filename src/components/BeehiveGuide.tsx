import React, { useState } from 'react';
import { Target, Layers, Ruler, CheckCircle2, ChevronRight, Sparkles, AlertCircle, Compass, HelpCircle } from 'lucide-react';
import { CRICKET_SPECS } from '../types/cricket';

interface BeehiveGuideProps {
  onSwitchToBoard: () => void;
  onLoadPreset: (presetId: string) => void;
}

export const BeehiveGuide: React.FC<BeehiveGuideProps> = ({
  onSwitchToBoard,
  onLoadPreset,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: '1. Understand the 2D Stumps Plane',
      subtitle: 'Beehive vs Pitch Map vs Wagon Wheel',
      badge: 'Core Concept',
    },
    {
      id: 2,
      title: '2. The Coordinate Calibration',
      subtitle: 'Origin, Dimensions & Stumps Grid',
      badge: 'Measurements',
    },
    {
      id: 3,
      title: '3. Step-by-Step Marking Protocol',
      subtitle: 'From Release to Crease Crossing',
      badge: 'Action Protocol',
    },
    {
      id: 4,
      title: '4. Scoring & Metadata Tagging',
      subtitle: 'Outcomes, Contact & Ball Types',
      badge: 'Data Encoding',
    },
    {
      id: 5,
      title: '5. Tactical Analysis & Cluster Reading',
      subtitle: 'Corridors, Dispersions & Dismissals',
      badge: 'Coach Analytics',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-xl p-6 lg:p-8 relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Performance Analyst Handbook
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">Broadcaster &amp; Coaching Standard</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            How to Mark a Beehive in Cricket
          </h2>
          <p className="text-sm lg:text-base text-slate-300 leading-relaxed">
            A <strong>Beehive</strong> is a vertical elevation chart that plots the exact height and lateral position of cricket balls as they cross the batsman’s crease and stumps. Learn the exact coordinate system, measurement rules, and analytical workflow used by Hawk-Eye and elite cricket coaches.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onSwitchToBoard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>Launch Interactive Marking Board</span>
            </button>
            <button
              onClick={() => onLoadPreset('anderson-corridor')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>View James Anderson Example</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step Selector Horizontal Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStep(s.id)}
            className={`text-left p-3 rounded-lg border transition-all ${
              activeStep === s.id
                ? 'bg-slate-800 border-emerald-500/50 shadow-sm'
                : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-emerald-400">{s.badge}</span>
              <span className="text-slate-500 font-mono">0{s.id}</span>
            </div>
            <div className="text-xs font-medium text-slate-200 line-clamp-1">{s.title}</div>
            <div className="text-[11px] text-slate-400 line-clamp-1">{s.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Detailed Content for Active Step */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                1. What is a Beehive vs Pitch Map vs Wagon Wheel?
              </h3>
              <p className="text-sm text-slate-400">
                Cricket visual analytics uses three complementary projections to track a delivery. Understanding the distinction is the fundamental first step.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">The Beehive</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Elevation View</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Vertical Plane at Stumps</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Looks straight down the pitch at the batter and stumps. Shows <strong>height</strong> (ankle to helmet) and <strong>lateral deviation</strong> (off-side to leg-side). Named because balls group like a buzzing swarm of bees.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Pitch Map</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">Plan (Top-Down) View</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Turf Impact Location</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Shows where the ball bounced on the 22 yards of grass. Categorized as Yorker, Full, Good Length, Back of a Length, or Short. Tells you <em>where it landed</em>, not where it reached the batter.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Wagon Wheel</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">Radial Field View</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Shot Direction &amp; Outfield</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Plots the trajectory of the ball off the bat around the 360-degree boundary field (Cover, Mid-wicket, Third Man, Fine Leg). Shows scoring zones rather than bowling accuracy.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200">Why coaches prioritize the Beehive:</p>
                <p>
                  Two balls can pitch at the exact same "good length" on the turf, but depending on bowler height, release angle, pace, and pitch bounce, one might hit the top of off-stump (lethal) while the other sails over waist height (easy leave). The Beehive reveals the true danger to the stumps and the batter’s edge.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ruler className="w-5 h-5 text-emerald-400" />
                2. Calibration &amp; Official Dimensions
              </h3>
              <p className="text-sm text-slate-400">
                To mark a beehive accurately, you must map every delivery to calibrated physical landmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Dimensions table */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Official MCC Stumps &amp; Crease Dimensions
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-300">Stump Height (Ground to Bails)</span>
                    <span className="font-mono text-emerald-400 font-semibold">28 inches (71.12 cm)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-300">Total Wicket Width (Off to Leg)</span>
                    <span className="font-mono text-emerald-400 font-semibold">9 inches (22.86 cm)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-300">Stump Diameter</span>
                    <span className="font-mono text-emerald-400 font-semibold">1.38 – 1.5 in (~3.5 cm)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-300">Off-Side Wide Guideline (White Ball)</span>
                    <span className="font-mono text-emerald-400 font-semibold">89 cm (35 inches) from Middle</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-300">Popping Crease Depth</span>
                    <span className="font-mono text-emerald-400 font-semibold">4 feet (1.22 m) in front of stumps</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Coordinate axes */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  The Cartesian Coordinate Setup
                </h4>
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 text-xs text-slate-300">
                  <div>
                    <span className="font-semibold text-white">Origin Point (0, 0):</span>
                    <p className="text-slate-400">
                      Located at ground level directly under the <strong>Middle Stump</strong>.
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-white">X-Axis (Lateral Deviation):</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 mt-1">
                      <li><strong>Negative X</strong>: Towards Off-side (for a Right-Hand Batsman from bowler's view).</li>
                      <li><strong>X = 0</strong>: Straight on Middle Stump.</li>
                      <li><strong>Positive X</strong>: Towards Leg-side (for a Right-Hand Batsman).</li>
                      <li><em>Note:</em> For a Left-Hand Batsman (LHB), the off and leg directions flip!</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-white">Y-Axis (Elevation Height):</span>
                    <p className="text-slate-400">
                      Measured in centimeters from turf (0 cm) up past 180+ cm (bouncer / over-head).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                3. The 5-Step Ball Marking Protocol
              </h3>
              <p className="text-sm text-slate-400">
                Follow this consistent workflow for each ball in an over to build a broadcast-quality beehive.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-white">Set Batter Stance &amp; View Perspective</h4>
                  <p className="text-slate-400">
                    Always confirm whether you are charting for a Right-Handed (RHB) or Left-Handed (LHB) batsman. In our interactive tool, toggling RHB/LHB automatically mirrors the corridor of uncertainty and pad lines.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-white">Identify the Crossing Plane</h4>
                  <p className="text-slate-400">
                    The beehive represents the <strong>vertical plane where the ball crosses the stumps / popping crease</strong>. If the ball is played forward on the front foot, estimate where the trajectory intersects the stump line (or impact point if hitting pads for LBW).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-white">Pinpoint Lateral Line (X-Axis)</h4>
                  <p className="text-slate-400">
                    Judge the line relative to the 3 stumps:
                    <br />
                    • <strong>Inside the Wicket (X between -11.5cm &amp; +11.5cm)</strong>: Hitting stumps.
                    <br />
                    • <strong>4th &amp; 5th Stump Channel (X between -15cm &amp; -35cm)</strong>: The classic "Corridor of Uncertainty".
                    <br />
                    • <strong>Wide Outside Off (X &lt; -50cm)</strong>: Easy leave / driving width.
                    <br />
                    • <strong>Leg Stump / Pads (X between +12cm &amp; +35cm)</strong>: Tuckable into leg side or LBW danger.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-white">Estimate Ball Height (Y-Axis)</h4>
                  <p className="text-slate-400">
                    Use batter body references as height anchors:
                    <br />
                    • <strong>0 to 18 cm</strong>: Yorker / base of stumps (toe-crushers)
                    <br />
                    • <strong>18 to 50 cm</strong>: Shins / lower knee roll
                    <br />
                    • <strong>50 to 72 cm</strong>: Top of stumps / bails (prime bowled/LBW height)
                    <br />
                    • <strong>72 to 110 cm</strong>: Thigh pad / waist height
                    <br />
                    • <strong>110 to 150 cm</strong>: Chest / rib cage (cramping line)
                    <br />
                    • <strong>150+ cm</strong>: Shoulder / helmet (bouncer territory)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  5
                </span>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-white">Tag Metadata (Outcome &amp; Contact)</h4>
                  <p className="text-slate-400">
                    A beehive dot is only half-useful without the outcome. Tag whether it yielded a dot, boundary, single, or wicket, and note whether contact was middle of bat, outside edge, play &amp; miss, or leave.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                4. Scoring &amp; Visual Tagging Standards
              </h3>
              <p className="text-sm text-slate-400">
                Standard color-coding conventions used across broadcast television and analytics platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                  <span className="text-xs font-bold text-rose-400">Wickets (Red)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Bowled, LBW, Caught behind, Slips catch, Stumped. The most critical data points on any beehive.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
                  <span className="text-xs font-bold text-amber-400">Boundaries (Gold/Orange)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fours and Sixes. Reveals where the bowler erred in line (width outside off or straying down leg).
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <span className="text-xs font-bold text-slate-300">Dot Balls (Slate/White)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Defensive blocks, beaten outside edge, well-judged leaves. Demonstrates bowling pressure.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                  <span className="text-xs font-bold text-sky-400">Runs / Singles (Cyan)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Rotated strike, 1s, 2s, and 3s. Shows where the batter feels safe to work the ball into gaps.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-200">Contact Quality Coding:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
                <span className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
                  <strong>Middle:</strong> Clean bat face
                </span>
                <span className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
                  <strong>Outside Edge:</strong> Nicked to keeper/slips
                </span>
                <span className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
                  <strong>Inside Edge:</strong> Chopped onto pad/stumps
                </span>
                <span className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
                  <strong>Beaten:</strong> Play and miss
                </span>
                <span className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
                  <strong>Leave:</strong> Shouldered arms
                </span>
                <span className="p-1.5 bg-slate-900 rounded border border-slate-800/80">
                  <strong>Pad:</strong> Struck batsman's pads
                </span>
              </div>
            </div>
          </div>
        )}

        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                5. How Analysts Read the Beehive
              </h3>
              <p className="text-sm text-slate-400">
                A completed beehive reveals tactical mastery or tactical failure in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-emerald-400">1. Cluster Density &amp; Standard Deviation</h4>
                <p className="text-slate-400 leading-relaxed">
                  Elite fast bowlers (McGrath, Anderson, Hazlewood) boast a cluster standard deviation of under 10 cm. 80%+ of their deliveries pack into a credit-card sized region right at the top of off-stump. A scattered beehive indicates lack of release control.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-emerald-400">2. The 5th Stump False Shot Hotspot</h4>
                <p className="text-slate-400 leading-relaxed">
                  Look at balls between 20 cm and 35 cm outside off stump. If dots and play-and-misses congregate here, the bowler is building pressure. If boundaries start appearing here, the line is too wide or too full.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-emerald-400">3. Bimodal Height Traps (Yorker + Bouncer)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Modern T20 death bowlers (Bumrah, Malinga) split their beehive into two distinct poles: toe height (&lt;15cm) and throat height (&gt;150cm). This prevents the batter from pre-setting their eye level.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-emerald-400">4. Batter-Specific Dismissal Blueprints</h4>
                <p className="text-slate-400 leading-relaxed">
                  By overlaying all wickets taken against a specific batter across 20 matches, coaches identify the exact coordinates of vulnerability (e.g. Virat Kohli's edges in the 5th stump channel at 70cm height).
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <div className="text-xs text-slate-300">
                Ready to try marking deliveries yourself?
              </div>
              <button
                onClick={onSwitchToBoard}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Go to Marking Board
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
