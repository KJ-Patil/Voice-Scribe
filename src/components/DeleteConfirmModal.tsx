'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { TranscriptionRecord } from './Dashboard';

interface DeleteConfirmModalProps {
  record: TranscriptionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export default function DeleteConfirmModal({
  record,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !record) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(record.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal max-w-md w-full rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white">Delete Transcription?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          Are you sure you want to permanently delete transcription <strong>#{record.id}</strong>?
        </p>

        <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-6 text-xs text-slate-500 italic max-h-24 overflow-y-auto border border-slate-200 dark:border-white/5">
          "{record.text}"
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="clay-btn px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md hover:shadow-rose-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
