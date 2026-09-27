import React from 'react';
import { BallDelivery, BatterStance } from '../types/cricket';
import { PRESET_SPELLS, PresetSpell } from '../data/presets';
import { PitchMapSync } from './PitchMapSync';
import { classifyBallZone, getOutcomeColor } from '../utils/cricketMath';
import { Sparkles, Edit3, Trash2, Crosshair, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

interface SidePanelProps {
  selectedBall: BallDelivery | null;
  onEditBall: (ball: BallDelivery) => void;
  onDeleteBall: (id: string) => void;
  onDeselectBall: () => void;
  onLoadPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string, e: React.MouseEvent) => void;
  onRestorePresets: () => void;
  presets: PresetSpell[];
  activePresetId: string | null;
  deliveries: BallDelivery[];
  batterStance: BatterStance;
  onSelectBall: (ball: BallDelivery | null) => void;
  onOpenGuide: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedBall,
  onEditBall,
  onDeleteBall,
  onDeselectBall,
  onLoadPreset,
  onDeletePreset,
  onRestorePresets,
  presets,
  activePresetId,
  deliveries,
  batterStance,
  onSelectBall,
  onOpenGuide,
}) => {
  return (
    <div className="space-y-4">
      {/* Selected Ball Details Card */}
      {selectedBall ? (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Delivery #{selectedBall.over}.{selectedBall.ballNumber} Profile
              </h4>
            </div>
            <button
              onClick={onDeselectBall}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          {/* Coordinate Highlight */}
          {(() => {
            const zone = classifyBallZone(selectedBall.xCm, selectedBall.yCm, batterStance);
            const colorInfo = getOutcomeColor(selectedBall.outcome);

            return (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Stump Plane Intersection
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${colorInfo.bg} ${colorInfo.text}`}
                    >
                      {colorInfo.label}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">X: {selectedBall.xCm > 0 ? `+${selectedBall.xCm}` : selectedBall.xCm}cm</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-sky-400">Y: {selectedBall.yCm}cm</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{zone.label}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Bowler</span>
                    <span className="font-medium text-white">{selectedBall.bowlerName}</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Batter</span>
                    <span className="font-medium text-white">{selectedBall.batterName}</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Delivery Type</span>
                    <span className="font-medium text-white capitalize">{selectedBall.deliveryType.replace('-', ' ')}</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Speed</span>
                    <span className="font-medium text-white font-mono">{selectedBall.speedKph} km/h</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 col-span-2">
                    <span className="text-slate-400 text-[10px] block">Contact Type</span>
                    <span className="font-medium text-white capitalize">{selectedBall.contact.replace('-', ' ')}</span>
                  </div>
                </div>

                {selectedBall.notes && (
                  <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Analyst Notes:</span>
                    {selectedBall.notes}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onEditBall(selectedBall)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Ball</span>
                  </button>
                  <button
                    onClick={() => onDeleteBall(selectedBall.id)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 text-xs font-medium rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Ball</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* Presets & Pro Spells Selector */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Iconic Beehive Spells</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Presets ({presets.length})</span>
              {presets.length < PRESET_SPELLS.length && (
                <button
                  onClick={onRestorePresets}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Restore All
                </button>
              )}
            </div>
          </div>

          {presets.length === 0 ? (
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">All preloaded spells have been deleted.</p>
              <button
                onClick={onRestorePresets}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs transition-colors"
              >
                Restore Default Presets
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {presets.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`group relative flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-slate-800 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => onLoadPreset(preset.id)}
                      className="flex-1 text-left min-w-0 pr-2"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-100">
                        <span className="truncate">{preset.bowler}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0 ml-1">
                          {preset.deliveries.length} balls
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{preset.subtitle}</p>
                    </button>
                    <button
                      onClick={(e) => onDeletePreset(preset.id, e)}
                      title={`Delete "${preset.bowler}" preset from list`}
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={onOpenGuide}
            className="w-full mt-2 flex items-center justify-center gap-1.5 p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-emerald-400 transition-colors"
          >
            <span>Learn How to Mark a Beehive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Synced Pitch Map */}
      <PitchMapSync
        deliveries={deliveries}
        batterStance={batterStance}
        selectedBallId={selectedBall?.id || null}
        onSelectBall={onSelectBall}
      />
    </div>
  );
};
