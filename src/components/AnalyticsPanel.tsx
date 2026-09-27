import React from 'react';
import { BallDelivery, BatterStance, CRICKET_SPECS } from '../types/cricket';
import { classifyBallZone, getOutcomeColor } from '../utils/cricketMath';
import { BarChart3, TrendingUp, ShieldAlert, Zap, Copy, Download, Check, Trash2 } from 'lucide-react';

interface AnalyticsPanelProps {
  deliveries: BallDelivery[];
  batterStance: BatterStance;
  onSelectBall: (ball: BallDelivery | null) => void;
  selectedBallId: string | null;
  onDeleteBall?: (id: string) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  deliveries,
  batterStance,
  onSelectBall,
  selectedBallId,
  onDeleteBall,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  const totalBalls = deliveries.length;

  if (totalBalls === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No Deliveries Marked Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Click deliveries on the Marking Board or load a preset spell (like Anderson or Bumrah) to generate advanced beehive analytics.
        </p>
      </div>
    );
  }

  // Calculate Metrics
  const wicketsCount = deliveries.filter((d) => d.outcome.startsWith('wicket')).length;
  const dotsCount = deliveries.filter((d) => d.outcome === 'dot').length;
  const boundariesCount = deliveries.filter((d) => d.outcome === '4' || d.outcome === '6').length;
  const runsDeliveries = deliveries.filter((d) => ['1', '2', '3', '4', '6'].includes(d.outcome));

  const dotPercentage = Math.round((dotsCount / totalBalls) * 100);
  const boundaryPercentage = Math.round((boundariesCount / totalBalls) * 100);

  const avgSpeed = Math.round(
    deliveries.reduce((sum, d) => sum + d.speedKph, 0) / totalBalls
  );

  // Line Distribution
  let outsideOffCount = 0;
  let onStumpsCount = 0;
  let downLegCount = 0;

  // Height Distribution
  let lowYorkerCount = 0;
  let stumpsHeightCount = 0;
  let waistHeightCount = 0;
  let bouncerHeightCount = 0;

  deliveries.forEach((d) => {
    const zone = classifyBallZone(d.xCm, d.yCm, batterStance);
    // Line
    if (zone.lineZone === 'corridor-outside-off' || zone.lineZone === 'wide-off') {
      outsideOffCount++;
    } else if (zone.lineZone === 'stumps') {
      onStumpsCount++;
    } else {
      downLegCount++;
    }

    // Height
    if (d.yCm <= 20) {
      lowYorkerCount++;
    } else if (d.yCm <= CRICKET_SPECS.TOTAL_WICKET_HEIGHT_CM + 4) {
      stumpsHeightCount++;
    } else if (d.yCm <= 120) {
      waistHeightCount++;
    } else {
      bouncerHeightCount++;
    }
  });

  const outsideOffPct = Math.round((outsideOffCount / totalBalls) * 100);
  const onStumpsPct = Math.round((onStumpsCount / totalBalls) * 100);
  const downLegPct = Math.round((downLegCount / totalBalls) * 100);

  const lowYorkerPct = Math.round((lowYorkerCount / totalBalls) * 100);
  const stumpsHeightPct = Math.round((stumpsHeightCount / totalBalls) * 100);
  const waistHeightPct = Math.round((waistHeightCount / totalBalls) * 100);
  const bouncerHeightPct = Math.round((bouncerHeightCount / totalBalls) * 100);

  // Copy Summary text
  const handleCopySummary = () => {
    const summary = `CRICKET BEEHIVE ANALYSIS REPORT
Total Deliveries: ${totalBalls}
Dot Ball %: ${dotPercentage}%
Wickets: ${wicketsCount} | Boundaries: ${boundariesCount}
Average Pace: ${avgSpeed} km/h

LINE BREAKDOWN:
- Outside Off / Corridor: ${outsideOffPct}% (${outsideOffCount} balls)
- On Stumps Line: ${onStumpsPct}% (${onStumpsCount} balls)
- On Pads / Down Leg: ${downLegPct}% (${downLegCount} balls)

HEIGHT BREAKDOWN:
- Low / Yorker (<20cm): ${lowYorkerPct}%
- Top of Stumps (20-72cm): ${stumpsHeightPct}%
- Waist / Thigh (72-120cm): ${waistHeightPct}%
- Bouncer / Helmet (>120cm): ${bouncerHeightPct}%
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const headers = ['Over', 'Ball', 'Bowler', 'Batter', 'Stance', 'X_cm', 'Y_cm', 'Outcome', 'Contact', 'Type', 'Speed_kph', 'Notes'];
    const rows = deliveries.map((d) => [
      d.over,
      d.ballNumber,
      `"${d.bowlerName}"`,
      `"${d.batterName}"`,
      d.batterStance,
      d.xCm,
      d.yCm,
      d.outcome,
      d.contact,
      d.deliveryType,
      d.speedKph,
      `"${d.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `beehive_deliveries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Deliveries</span>
          <div className="text-2xl font-bold text-white font-mono">{totalBalls}</div>
          <span className="text-[10px] text-slate-500">{wicketsCount} Wickets taken</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Dot Ball Pressure</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{dotPercentage}%</div>
          <span className="text-[10px] text-slate-500">{dotsCount} Dots recorded</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Boundary Leaked</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">{boundaryPercentage}%</div>
          <span className="text-[10px] text-slate-500">{boundariesCount} Fours / Sixes</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Mean Release Pace</span>
          <div className="text-2xl font-bold text-sky-400 font-mono">{avgSpeed} <span className="text-xs font-normal text-slate-400">km/h</span></div>
          <span className="text-[10px] text-slate-500">Hawk-Eye radar tracked</span>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Line Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Lateral Line Breakdown (X-Axis)
            </h4>
            <span className="text-[11px] text-slate-400">Corridor vs Stumps</span>
          </div>

          {/* Bar Segment Visual */}
          <div className="h-4 rounded-full overflow-hidden flex bg-slate-950">
            <div
              style={{ width: `${outsideOffPct}%` }}
              className="bg-amber-500"
              title={`Outside Off: ${outsideOffPct}%`}
            />
            <div
              style={{ width: `${onStumpsPct}%` }}
              className="bg-emerald-500"
              title={`On Stumps: ${onStumpsPct}%`}
            />
            <div
              style={{ width: `${downLegPct}%` }}
              className="bg-sky-500"
              title={`Down Leg: ${downLegPct}%`}
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Outside Off / Corridor
              </span>
              <span className="font-mono text-white font-semibold">{outsideOffPct}% ({outsideOffCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> On Stumps Line (Wicket to Wicket)
              </span>
              <span className="font-mono text-white font-semibold">{onStumpsPct}% ({onStumpsCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> On Pads / Down Leg
              </span>
              <span className="font-mono text-white font-semibold">{downLegPct}% ({downLegCount})</span>
            </div>
          </div>
        </div>

        {/* Height Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Height at Stumps Breakdown (Y-Axis)
            </h4>
            <span className="text-[11px] text-slate-400">Vertical Length</span>
          </div>

          {/* Bar Segment Visual */}
          <div className="h-4 rounded-full overflow-hidden flex bg-slate-950">
            <div
              style={{ width: `${lowYorkerPct}%` }}
              className="bg-rose-500"
              title={`Yorker: ${lowYorkerPct}%`}
            />
            <div
              style={{ width: `${stumpsHeightPct}%` }}
              className="bg-emerald-500"
              title={`Stumps: ${stumpsHeightPct}%`}
            />
            <div
              style={{ width: `${waistHeightPct}%` }}
              className="bg-sky-500"
              title={`Waist: ${waistHeightPct}%`}
            />
            <div
              style={{ width: `${bouncerHeightPct}%` }}
              className="bg-purple-500"
              title={`Bouncer: ${bouncerHeightPct}%`}
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Yorker / Base of Stumps (&lt;20cm)
              </span>
              <span className="font-mono text-white font-semibold">{lowYorkerPct}% ({lowYorkerCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Top of Stumps (20–72cm)
              </span>
              <span className="font-mono text-white font-semibold">{stumpsHeightPct}% ({stumpsHeightCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> Thigh / Waist Height (72–120cm)
              </span>
              <span className="font-mono text-white font-semibold">{waistHeightPct}% ({waistHeightCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Chest / Bouncer (&gt;120cm)
              </span>
              <span className="font-mono text-white font-semibold">{bouncerHeightPct}% ({bouncerHeightCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Marked Deliveries Log ({totalBalls})
            </h4>
            <p className="text-[11px] text-slate-400">
              Click any row to focus the delivery on the Beehive board
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Report' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Ball</th>
                <th className="py-2.5 px-3">Bowler</th>
                <th className="py-2.5 px-3">X Offset</th>
                <th className="py-2.5 px-3">Height</th>
                <th className="py-2.5 px-3">Speed</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-4">Notes</th>
                {onDeleteBall && <th className="py-2.5 px-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {deliveries.map((ball) => {
                const isSelected = selectedBallId === ball.id;
                const colorInfo = getOutcomeColor(ball.outcome);
                return (
                  <tr
                    key={ball.id}
                    onClick={() => onSelectBall(isSelected ? null : ball)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/40 text-white font-medium'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2 px-4 font-mono font-bold text-slate-200">
                      {ball.over}.{ball.ballNumber}
                    </td>
                    <td className="py-2 px-3">{ball.bowlerName}</td>
                    <td className="py-2 px-3 font-mono">
                      {ball.xCm > 0 ? `+${ball.xCm}` : ball.xCm} cm
                    </td>
                    <td className="py-2 px-3 font-mono">{ball.yCm} cm</td>
                    <td className="py-2 px-3 font-mono">{ball.speedKph} km/h</td>
                    <td className="py-2 px-3 capitalize">{ball.deliveryType.replace('-', ' ')}</td>
                    <td className="py-2 px-3 capitalize">{ball.contact.replace('-', ' ')}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${colorInfo.bg} ${colorInfo.text}`}
                      >
                        {colorInfo.label}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-400 truncate max-w-[200px]">
                      {ball.notes || '—'}
                    </td>
                    {onDeleteBall && (
                      <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDeleteBall(ball.id)}
                          title="Delete delivery"
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
