import React, { useState } from 'react';
import { BallDelivery } from '../types/cricket';
import { Users, User, Shield, Target, Plus, Check, Filter, X, Award, Zap } from 'lucide-react';

interface PlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: BallDelivery[];
  activeBowler: string;
  activeBatter: string;
  onSelectActiveBowler: (name: string) => void;
  onSelectActiveBatter: (name: string) => void;
  selectedPlayerFilter: string | null;
  onSelectPlayerFilter: (name: string | null) => void;
  onAddNewPlayer: (name: string, role: 'bowler' | 'batter') => void;
}

export const PlayersModal: React.FC<PlayersModalProps> = ({
  isOpen,
  onClose,
  deliveries,
  activeBowler,
  activeBatter,
  onSelectActiveBowler,
  onSelectActiveBatter,
  selectedPlayerFilter,
  onSelectPlayerFilter,
  onAddNewPlayer,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'bowler' | 'batter'>('bowler');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  // Extract unique bowlers and their match statistics from deliveries
  const bowlerNames = Array.from(new Set([
    'James Anderson',
    'Jasprit Bumrah',
    'Mitchell Starc',
    'Shane Warne',
    ...deliveries.map((d) => d.bowlerName),
  ]));

  const batterNames = Array.from(new Set([
    'Shubman Gill',
    'Joe Root',
    'Virat Kohli',
    'Steve Smith',
    ...deliveries.map((d) => d.batterName),
  ]));

  const getBowlerStats = (name: string) => {
    const balls = deliveries.filter((d) => d.bowlerName.toLowerCase() === name.toLowerCase());
    const wickets = balls.filter((d) => d.outcome.startsWith('wicket')).length;
    const dots = balls.filter((d) => d.outcome === 'dot').length;
    const avgSpeed = balls.length > 0
      ? (balls.reduce((acc, b) => acc + (b.speedKph || 135), 0) / balls.length).toFixed(1)
      : '—';
    return { count: balls.length, wickets, dots, avgSpeed };
  };

  const getBatterStats = (name: string) => {
    const balls = deliveries.filter((d) => d.batterName.toLowerCase() === name.toLowerCase());
    const dismissed = balls.filter((d) => d.outcome.startsWith('wicket')).length;
    const boundaries = balls.filter((d) => d.outcome === '4' || d.outcome === '6').length;
    return { count: balls.length, dismissed, boundaries };
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    onAddNewPlayer(newPlayerName.trim(), newPlayerRole);
    if (newPlayerRole === 'bowler') {
      onSelectActiveBowler(newPlayerName.trim());
    } else {
      onSelectActiveBatter(newPlayerName.trim());
    }
    setNewPlayerName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Players &amp; Roster Management</h3>
                <span className="text-[10px] font-semibold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                  Active Match
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Filter Beehive deliveries by player or select active bowler and batter for new markings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter State Bar */}
        {selectedPlayerFilter && (
          <div className="px-5 py-2.5 bg-emerald-950/30 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Currently filtering Beehive board to: <strong>{selectedPlayerFilter}</strong>
              </span>
            </div>
            <button
              onClick={() => onSelectPlayerFilter(null)}
              className="text-[11px] underline hover:text-white flex items-center gap-1 font-semibold"
            >
              <X className="w-3 h-3" />
              <span>Clear Filter (Show All)</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Active Assignment Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Active Bowler (Next Ball)
                </span>
                <span className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {activeBowler}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between sm:border-l sm:border-slate-800 sm:pl-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Active Batter (Next Ball)
                </span>
                <span className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  {activeBatter}
                </span>
              </div>
            </div>
          </div>

          {/* Bowlers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bowlers</span>
              </h4>
              <span className="text-[10px] text-slate-500">{bowlerNames.length} Registered</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bowlerNames.map((name) => {
                const stats = getBowlerStats(name);
                const isActive = activeBowler.toLowerCase() === name.toLowerCase();
                const isFiltered = selectedPlayerFilter?.toLowerCase() === name.toLowerCase();

                return (
                  <div
                    key={`bowler-${name}`}
                    className={`p-3 rounded-xl border transition-all ${
                      isFiltered
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : isActive
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white text-xs">{name}</span>
                          {isActive && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-400">
                          <span>{stats.count} balls</span>
                          <span>·</span>
                          <span className="text-emerald-400">{stats.wickets} wkt</span>
                          <span>·</span>
                          <span>{stats.dots} dots</span>
                          {stats.avgSpeed !== '—' && (
                            <>
                              <span>·</span>
                              <span className="text-sky-400">{stats.avgSpeed} km/h</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          onSelectActiveBowler(name);
                        }}
                        className={`flex-1 py-1 px-2 rounded text-[10px] font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isActive ? 'Current Bowler' : 'Set as Bowler'}
                      </button>

                      <button
                        onClick={() => {
                          onSelectPlayerFilter(isFiltered ? null : name);
                        }}
                        className={`py-1 px-2.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors ${
                          isFiltered
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                        title="Filter Beehive to only this player's deliveries"
                      >
                        <Filter className="w-3 h-3" />
                        <span>{isFiltered ? 'Filtering' : 'Filter Board'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batters Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>Batters</span>
              </h4>
              <span className="text-[10px] text-slate-500">{batterNames.length} Registered</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {batterNames.map((name) => {
                const stats = getBatterStats(name);
                const isActive = activeBatter.toLowerCase() === name.toLowerCase();
                const isFiltered = selectedPlayerFilter?.toLowerCase() === name.toLowerCase();

                return (
                  <div
                    key={`batter-${name}`}
                    className={`p-3 rounded-xl border transition-all ${
                      isFiltered
                        ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                        : isActive
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white text-xs">{name}</span>
                          {isActive && (
                            <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-400">
                          <span>{stats.count} balls faced</span>
                          <span>·</span>
                          <span className="text-rose-400">{stats.dismissed} out</span>
                          <span>·</span>
                          <span className="text-amber-400">{stats.boundaries} bdys</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          onSelectActiveBatter(name);
                        }}
                        className={`flex-1 py-1 px-2 rounded text-[10px] font-medium transition-colors ${
                          isActive
                            ? 'bg-sky-600/30 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isActive ? 'Current Batter' : 'Set as Batter'}
                      </button>

                      <button
                        onClick={() => {
                          onSelectPlayerFilter(isFiltered ? null : name);
                        }}
                        className={`py-1 px-2.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors ${
                          isFiltered
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                        title="Filter Beehive to deliveries faced by this batter"
                      >
                        <Filter className="w-3 h-3" />
                        <span>{isFiltered ? 'Filtering' : 'Filter Board'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Player Form */}
          <div className="pt-2 border-t border-slate-800">
            {isAdding ? (
              <form onSubmit={handleAddSubmit} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Add New Player</span>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Enter player name (e.g. Pat Cummins)"
                    className="sm:col-span-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    autoFocus
                  />
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setNewPlayerRole('bowler')}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                        newPlayerRole === 'bowler' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Bowler
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPlayerRole('batter')}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                        newPlayerRole === 'batter' ? 'bg-sky-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Batter
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs shadow-sm transition-colors"
                  >
                    Add Player
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 border-dashed rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Player / Bowler / Batter</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onSelectPlayerFilter(null)}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
          >
            Reset All Player Filters
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
