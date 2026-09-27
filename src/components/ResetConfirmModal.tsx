import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ballCount: number;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ballCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Reset Beehive Board?</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            This will clear all <span className="font-semibold text-rose-400">{ballCount} marked {ballCount === 1 ? 'delivery' : 'deliveries'}</span> from the current session (including any preloaded data). You can start marking fresh or reload a preset anytime.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
