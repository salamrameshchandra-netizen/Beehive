/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { BeehiveCanvas } from './components/BeehiveCanvas';
import { SidePanel } from './components/SidePanel';
import { BeehiveGuide } from './components/BeehiveGuide';
import { PracticeMarkingMode } from './components/PracticeMarkingMode';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { BallLoggerModal } from './components/BallLoggerModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PlayersModal } from './components/PlayersModal';
import { BallDelivery, BatterStance, ViewPerspective } from './types/cricket';
import { PRESET_SPELLS, PresetSpell } from './data/presets';
import { Sparkles, Layers, Info, Check, Trash2, Users } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'guide' | 'practice' | 'analytics'>('board');
  const [presets, setPresets] = useState<PresetSpell[]>(PRESET_SPELLS);
  const [deliveries, setDeliveries] = useState<BallDelivery[]>(PRESET_SPELLS[0].deliveries);
  const [activePresetId, setActivePresetId] = useState<string | null>(PRESET_SPELLS[0].id);
  const [batterStance, setBatterStance] = useState<BatterStance>('RHB');
  const [perspective, setPerspective] = useState<ViewPerspective>('bowler');
  const [selectedBall, setSelectedBall] = useState<BallDelivery | null>(null);

  // Player roster and filtering state
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState<boolean>(false);
  const [activeBowler, setActiveBowler] = useState<string>('James Anderson');
  const [activeBatter, setActiveBatter] = useState<string>('Shubman Gill');
  const [selectedPlayerFilter, setSelectedPlayerFilter] = useState<string | null>(null);

  // Ball Logger Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalCoords, setModalCoords] = useState<{ xCm: number; yCm: number }>({ xCm: -18, yCm: 70 });
  const [editingBall, setEditingBall] = useState<BallDelivery | null>(null);

  // Reset Confirmation Modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter deliveries if a player filter is active
  const displayedDeliveries = useMemo(() => {
    if (!selectedPlayerFilter) return deliveries;
    const filterLower = selectedPlayerFilter.toLowerCase();
    return deliveries.filter(
      (d) =>
        d.bowlerName.toLowerCase() === filterLower ||
        d.batterName.toLowerCase() === filterLower
    );
  }, [deliveries, selectedPlayerFilter]);

  // Canvas click handler
  const handleCanvasClick = (xCm: number, yCm: number) => {
    setModalCoords({ xCm, yCm });
    setEditingBall(null);
    setIsModalOpen(true);
  };

  // Edit ball handler
  const handleEditBall = (ball: BallDelivery) => {
    setEditingBall(ball);
    setModalCoords({ xCm: ball.xCm, yCm: ball.yCm });
    setIsModalOpen(true);
  };

  // Save ball
  const handleSaveBall = (ball: BallDelivery) => {
    if (editingBall) {
      setDeliveries((prev) => prev.map((d) => (d.id === ball.id ? ball : d)));
      setSelectedBall(ball);
      showToast('Delivery updated successfully');
    } else {
      setDeliveries((prev) => [...prev, ball]);
      setSelectedBall(ball);
      showToast(`Ball ${ball.over}.${ball.ballNumber} marked on Beehive`);
    }
  };

  // Delete individual ball
  const handleDeleteBall = (id: string) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
    if (selectedBall?.id === id) {
      setSelectedBall(null);
    }
    showToast('Delivery removed');
  };

  // Reset confirmation triggers
  const handleResetClick = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setDeliveries([]);
    setSelectedBall(null);
    setActivePresetId(null);
    setSelectedPlayerFilter(null);
    showToast('Beehive canvas cleared');
    setIsResetConfirmOpen(false);
  };

  // Delete / clear the currently active preloaded deliveries
  const handleClearActivePreset = () => {
    setDeliveries([]);
    setSelectedBall(null);
    setActivePresetId(null);
    showToast('Cleared preloaded deliveries');
  };

  // Delete a preset from the presets collection
  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const presetToDelete = presets.find((p) => p.id === presetId);
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
    if (activePresetId === presetId) {
      setDeliveries([]);
      setSelectedBall(null);
      setActivePresetId(null);
    }
    showToast(`Deleted "${presetToDelete?.bowler || 'Preset'}"`);
  };

  // Restore default preset spells
  const handleRestorePresets = () => {
    setPresets(PRESET_SPELLS);
    showToast('Restored all default presets');
  };

  // Load Preset Spell
  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId) || PRESET_SPELLS.find((p) => p.id === presetId);
    if (!preset) return;

    setDeliveries(preset.deliveries);
    setBatterStance(preset.batterStance);
    setActivePresetId(preset.id);
    setActiveBowler(preset.bowler);
    setActiveBatter(preset.batter);
    setSelectedPlayerFilter(null);
    setSelectedBall(null);
    setActiveTab('board');
    showToast(`Loaded "${preset.name}"`);
  };

  // Export Deliveries JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deliveries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `beehive_session_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported session data');
  };

  // Find next ball number
  const nextBallNum = deliveries.length > 0 ? (deliveries.length % 6) + 1 : 1;
  const nextOverNum = deliveries.length > 0 ? Math.floor(deliveries.length / 6) + 1 : 1;

  const currentActivePreset = presets.find((p) => p.id === activePresetId) || PRESET_SPELLS.find((p) => p.id === activePresetId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* App Header with Players Button */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ballCount={deliveries.length}
        onReset={handleResetClick}
        onExport={handleExport}
        onOpenPlayers={() => setIsPlayersModalOpen(true)}
        selectedPlayerFilter={selectedPlayerFilter}
        activeBowler={activeBowler}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'board' && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-4">
            {/* Context bar / Active Preset Notice with Delete Preloaded Data button */}
            {activePresetId && currentActivePreset && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Viewing Preset: <strong className="text-white font-semibold">{currentActivePreset.name}</strong>
                  </span>
                  <span className="hidden sm:inline text-slate-500">·</span>
                  <span className="hidden sm:inline text-slate-400">
                    {currentActivePreset.description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearActivePreset}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-medium transition-colors"
                    title="Delete preloaded deliveries from canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Preloaded Data</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 shrink-0"
                  >
                    View Guide
                  </button>
                </div>
              </div>
            )}

            {/* Grid Layout: Canvas & Side Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left/Center: Interactive Beehive Canvas (8 cols) */}
              <div className="lg:col-span-8 flex flex-col">
                <BeehiveCanvas
                  deliveries={displayedDeliveries}
                  batterStance={batterStance}
                  setBatterStance={setBatterStance}
                  perspective={perspective}
                  setPerspective={setPerspective}
                  onCanvasClick={handleCanvasClick}
                  selectedBallId={selectedBall?.id || null}
                  onSelectBall={setSelectedBall}
                  onOpenPlayers={() => setIsPlayersModalOpen(true)}
                  selectedPlayerFilter={selectedPlayerFilter}
                  onClearPlayerFilter={() => setSelectedPlayerFilter(null)}
                />
              </div>

              {/* Right: Side Panel (4 cols) */}
              <div className="lg:col-span-4">
                <SidePanel
                  selectedBall={selectedBall}
                  onEditBall={handleEditBall}
                  onDeleteBall={handleDeleteBall}
                  onDeselectBall={() => setSelectedBall(null)}
                  onLoadPreset={handleLoadPreset}
                  onDeletePreset={handleDeletePreset}
                  onRestorePresets={handleRestorePresets}
                  presets={presets}
                  activePresetId={activePresetId}
                  deliveries={displayedDeliveries}
                  batterStance={batterStance}
                  onSelectBall={setSelectedBall}
                  onOpenGuide={() => setActiveTab('guide')}
                  onOpenPlayers={() => setIsPlayersModalOpen(true)}
                  onSelectPlayerFilter={(name) => {
                    setSelectedPlayerFilter(name);
                    if (name) showToast(`Filtered board to ${name}`);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <BeehiveGuide
            onSwitchToBoard={() => setActiveTab('board')}
            onLoadPreset={handleLoadPreset}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeMarkingMode />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel
            deliveries={displayedDeliveries}
            batterStance={batterStance}
            onSelectBall={setSelectedBall}
            selectedBallId={selectedBall?.id || null}
            onDeleteBall={handleDeleteBall}
          />
        )}
      </main>

      {/* Modal for Logging / Editing a Ball */}
      <BallLoggerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBall(null);
        }}
        onSave={handleSaveBall}
        onDelete={handleDeleteBall}
        initialCoords={modalCoords}
        existingBall={editingBall}
        batterStance={batterStance}
        defaultBowler={activeBowler}
        defaultBatter={activeBatter}
        currentOver={nextOverNum}
        currentBall={nextBallNum}
      />

      {/* In-App Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        ballCount={deliveries.length}
      />

      {/* Players Roster & Filter Modal */}
      <PlayersModal
        isOpen={isPlayersModalOpen}
        onClose={() => setIsPlayersModalOpen(false)}
        deliveries={deliveries}
        activeBowler={activeBowler}
        activeBatter={activeBatter}
        onSelectActiveBowler={(name) => {
          setActiveBowler(name);
          showToast(`Active bowler set to ${name}`);
        }}
        onSelectActiveBatter={(name) => {
          setActiveBatter(name);
          showToast(`Active batter set to ${name}`);
        }}
        selectedPlayerFilter={selectedPlayerFilter}
        onSelectPlayerFilter={(name) => {
          setSelectedPlayerFilter(name);
          if (name) {
            showToast(`Filtering Beehive to ${name}`);
          } else {
            showToast('Showing all players');
          }
        }}
        onAddNewPlayer={(name, role) => {
          showToast(`Added ${role}: ${name}`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-2 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500">
        <p>
          Cricket Beehive Marking &amp; Trajectory Analytics · Calibrated to MCC Official Stumps (28" × 9") &amp; Hawk-Eye Tracking Guidelines
        </p>
      </footer>
    </div>
  );
}
