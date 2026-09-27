import React from 'react';
import { Target, BookOpen, Crosshair, BarChart3, RotateCcw, Download, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: 'board' | 'guide' | 'practice' | 'analytics';
  setActiveTab: (tab: 'board' | 'guide' | 'practice' | 'analytics') => void;
  ballCount: number;
  onReset: () => void;
  onExport: () => void;
  onOpenPlayers: () => void;
  selectedPlayerFilter?: string | null;
  activeBowler?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  ballCount,
  onReset,
  onExport,
  onOpenPlayers,
  selectedPlayerFilter,
  activeBowler,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                Cricket Beehive Studio
              </h1>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Hawk-Eye Calibrated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vertical stumps plane coordinate marking &amp; delivery trajectory analysis
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'board'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Marking Board</span>
            {ballCount > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full font-mono">
                {ballCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>How to Mark Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'practice'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Marking Drill</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Players Roster & Filter Button */}
          <button
            onClick={onOpenPlayers}
            title="Manage players, bowlers, and rosters"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
              selectedPlayerFilter
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Players</span>
            {selectedPlayerFilter ? (
              <span className="text-[10px] font-mono bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full">
                {selectedPlayerFilter.split(' ')[0]}
              </span>
            ) : activeBowler ? (
              <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">
                ({activeBowler.split(' ')[0]})
              </span>
            ) : null}
          </button>

          {ballCount > 0 && (
            <>
              <button
                onClick={onReset}
                title="Clear all marked balls"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={onExport}
                title="Export session data"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
