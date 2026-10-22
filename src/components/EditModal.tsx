'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, FileEdit } from 'lucide-react';
import { TranscriptionRecord } from './Dashboard';

interface EditModalProps {
  record: TranscriptionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updatedText: string) => Promise<void>;
}

export default function EditModal({ record, isOpen, onClose, onSave }: EditModalProps) {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setText(record.text);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSaving(true);
    try {
      await onSave(record.id, text.trim());
      onClose();
    } catch (err) {
      console.error('Failed to save edit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal max-w-lg w-full rounded-3xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Edit Transcription</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record #{record.id} ({record.language})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Transcript Text:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="neu-input w-full p-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              rows={5}
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="clay-btn px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !text.trim()}
              className="clay-chip-active px-5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
