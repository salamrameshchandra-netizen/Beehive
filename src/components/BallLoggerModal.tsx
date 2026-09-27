import React, { useState } from 'react';
import {
  BallDelivery,
  BallOutcome,
  BatterStance,
  ContactType,
  DeliveryType,
} from '../types/cricket';
import { classifyBallZone } from '../utils/cricketMath';
import { X, Check, Trash2, Gauge, Zap } from 'lucide-react';

interface BallLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ball: BallDelivery) => void;
  onDelete?: (id: string) => void;
  initialCoords: { xCm: number; yCm: number };
  existingBall?: BallDelivery | null;
  batterStance: BatterStance;
  defaultBowler?: string;
  defaultBatter?: string;
  currentOver?: number;
  currentBall?: number;
}

export const BallLoggerModal: React.FC<BallLoggerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCoords,
  existingBall,
  batterStance,
  defaultBowler = 'James Anderson',
  defaultBatter = 'Batter 1',
  currentOver = 1,
  currentBall = 1,
}) => {
  if (!isOpen) return null;

  const [over, setOver] = useState<number>(existingBall ? existingBall.over : currentOver);
  const [ballNumber, setBallNumber] = useState<number>(existingBall ? existingBall.ballNumber : currentBall);
  const [bowlerName, setBowlerName] = useState<string>(existingBall ? existingBall.bowlerName : defaultBowler);
  const [batterName, setBatterName] = useState<string>(existingBall ? existingBall.batterName : defaultBatter);
  const [speedKph, setSpeedKph] = useState<number>(existingBall ? existingBall.speedKph : 135.0);
  const [outcome, setOutcome] = useState<BallOutcome>(existingBall ? existingBall.outcome : 'dot');
  const [contact, setContact] = useState<ContactType>(existingBall ? existingBall.contact : 'middle');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    existingBall ? existingBall.deliveryType : 'outswinger'
  );
  const [notes, setNotes] = useState<string>(existingBall?.notes || '');

  const rawX = existingBall ? existingBall.xCm : initialCoords.xCm;
  const rawY = existingBall ? existingBall.yCm : initialCoords.yCm;
  const xCm = Number.isFinite(rawX) ? rawX : 0;
  const yCm = Number.isFinite(rawY) ? rawY : 70;

  const zone = classifyBallZone(xCm, yCm, batterStance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ball: BallDelivery = {
      id: existingBall ? existingBall.id : `ball-${Date.now()}`,
      over: Number.isFinite(Number(over)) ? Math.max(1, Number(over)) : 1,
      ballNumber: Number.isFinite(Number(ballNumber)) ? Math.max(1, Number(ballNumber)) : 1,
      bowlerName: bowlerName.trim() || 'Bowler',
      batterName: batterName.trim() || 'Batter',
      batterStance,
      xCm,
      yCm,
      speedKph: Number.isFinite(Number(speedKph)) ? Number(speedKph) : 135.0,
      outcome,
      contact,
      deliveryType,
      notes,
      timestamp: Date.now(),
    };
    onSave(ball);
    onClose();
  };

  const outcomesList: { value: BallOutcome; label: string; group: string }[] = [
    { value: 'dot', label: 'Dot (0)', group: 'Scoring' },
    { value: '1', label: '1 Run', group: 'Scoring' },
    { value: '2', label: '2 Runs', group: 'Scoring' },
    { value: '3', label: '3 Runs', group: 'Scoring' },
    { value: '4', label: '4 (Boundary)', group: 'Boundary' },
    { value: '6', label: '6 (Six)', group: 'Boundary' },
    { value: 'wicket-bowled', label: 'Wicket: Bowled', group: 'Wicket' },
    { value: 'wicket-lbw', label: 'Wicket: LBW', group: 'Wicket' },
    { value: 'wicket-caught-behind', label: 'Wicket: Caught Behind', group: 'Wicket' },
    { value: 'wicket-slips', label: 'Wicket: Caught Slips', group: 'Wicket' },
    { value: 'wicket-caught', label: 'Wicket: Caught Field', group: 'Wicket' },
    { value: 'wicket-stumped', label: 'Wicket: Stumped', group: 'Wicket' },
  ];

  const contactList: { value: ContactType; label: string }[] = [
    { value: 'middle', label: 'Middle of Bat' },
    { value: 'outside-edge', label: 'Outside Edge' },
    { value: 'inside-edge', label: 'Inside Edge' },
    { value: 'beaten', label: 'Beaten / Play & Miss' },
    { value: 'leave', label: 'Left Alone' },
    { value: 'pad', label: 'Padded Away / Hit Pad' },
  ];

  const deliveryList: { value: DeliveryType; label: string }[] = [
    { value: 'outswinger', label: 'Outswinger' },
    { value: 'inswinger', label: 'Inswinger' },
    { value: 'seam-up', label: 'Seam Up / Wobble' },
    { value: 'yorker', label: 'Yorker' },
    { value: 'bouncer', label: 'Bouncer' },
    { value: 'slower-ball', label: 'Slower Ball / Cutter' },
    { value: 'off-break', label: 'Off Break' },
    { value: 'leg-break', label: 'Leg Break' },
    { value: 'googly', label: 'Googly' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h3 className="text-sm font-bold text-white">
              {existingBall ? 'Edit Marked Delivery' : 'Log Delivery Coordinates'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Coordinate Readout Banner */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Stump Plane Coordinates</span>
            <div className="font-mono text-emerald-400 font-bold flex items-center gap-2">
              <span>X: {xCm > 0 ? `+${xCm}` : xCm} cm</span>
              <span className="text-slate-600">·</span>
              <span>Y: {yCm} cm</span>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                zone.isHittingStumps
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {zone.label}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Over & Ball + Bowler */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Over</label>
              <input
                type="number"
                min="1"
                value={over}
                onChange={(e) => setOver(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Ball #</label>
              <input
                type="number"
                min="1"
                max="10"
                value={ballNumber}
                onChange={(e) => setBallNumber(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Speed (km/h)</label>
              <input
                type="number"
                step="0.5"
                min="60"
                max="165"
                value={speedKph}
                onChange={(e) => setSpeedKph(parseFloat(e.target.value) || 135)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Bowler & Batter Names */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Bowler</label>
              <input
                type="text"
                value={bowlerName}
                onChange={(e) => setBowlerName(e.target.value)}
                placeholder="e.g. Jasprit Bumrah"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Batter</label>
              <input
                type="text"
                value={batterName}
                onChange={(e) => setBatterName(e.target.value)}
                placeholder="e.g. Virat Kohli"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Ball Outcome */}
          <div>
            <label className="block text-slate-400 mb-1.5 text-xs font-medium">
              Ball Outcome
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {outcomesList.map((item) => {
                const isSelected = outcome === item.value;
                const isWicket = item.group === 'Wicket';
                const isBoundary = item.group === 'Boundary';

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setOutcome(item.value)}
                    className={`px-2 py-1.5 rounded text-left transition-all truncate border ${
                      isSelected
                        ? isWicket
                          ? 'bg-rose-600 text-white border-rose-500 font-semibold'
                          : isBoundary
                          ? 'bg-amber-600 text-white border-amber-500 font-semibold'
                          : 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Quality & Delivery Type */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Contact Quality</label>
              <select
                value={contact}
                onChange={(e) => setContact(e.target.value as ContactType)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none"
              >
                {contactList.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Delivery Type</label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none"
              >
                {deliveryList.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="text-xs">
            <label className="block text-slate-400 mb-1 font-medium">Notes / Observations</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drew false drive, squared up batter, clipped off bail"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            {existingBall && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(existingBall.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Ball</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">Auto-calibrated to stumps grid</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{existingBall ? 'Update Delivery' : 'Save Delivery'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
