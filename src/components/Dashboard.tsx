'use client';

import React, { useState } from 'react';
import {
  Search,
  Copy,
  Check,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/validations';

export interface TranscriptionRecord {
  id: number;
  text: string;
  language: string;
  duration_s: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  transcriptions: TranscriptionRecord[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  searchQuery: string;
  selectedFilterLanguage: string;
  onSearchChange: (query: string) => void;
  onFilterLanguageChange: (lang: string) => void;
  onPageChange: (page: number) => void;
  onEditClick: (record: TranscriptionRecord) => void;
  onDeleteClick: (record: TranscriptionRecord) => void;
}

export default function Dashboard({
  transcriptions,
  totalRecords,
  currentPage,
  totalPages,
  isLoading,
  searchQuery,
  selectedFilterLanguage,
  onSearchChange,
  onFilterLanguageChange,
  onPageChange,
  onEditClick,
  onDeleteClick,
}: DashboardProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return iso;
    }
  };

  const filterOptions = ['All', ...SUPPORTED_LANGUAGES];

  return (
    <div className="glass-panel mx-auto max-w-5xl rounded-3xl p-6 sm:p-8 mb-16 shadow-glass-glow dark:shadow-glass-glow-dark">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Transcription History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full CRUD management with search, multi-language filtering, and instant clipboard export
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 shadow-sm">
            Total Records: <strong>{totalRecords}</strong>
          </span>
        </div>
      </div>

      {/* Neumorphic Search Bar & Filter Chips */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transcripts by keywords or phrases..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="neu-input w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
          {filterOptions.map((lang) => {
            const isSelected = selectedFilterLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => onFilterLanguageChange(lang)}
                className={`px-3 py-1 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'clay-chip-active font-semibold'
                    : 'clay-btn text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transcriptions List / Cards */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="neu-input h-24 rounded-2xl animate-pulse bg-slate-200/50 dark:bg-slate-800/50"
            />
          ))}
        </div>
      ) : transcriptions.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
          <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No transcriptions found
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedFilterLanguage !== 'All'
              ? 'Try modifying your search query or language filter.'
              : 'Click "Speak" on the mic above to create your first speech transcription.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {transcriptions.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Transcript Text and Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    #{item.id}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {item.language}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.duration_s}s
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <p className="text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed break-words font-sans">
                  {item.text}
                </p>
              </div>

              {/* Action Buttons (Claymorphic) */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {/* Copy to Clipboard */}
                <button
                  onClick={() => handleCopy(item.id, item.text)}
                  className="clay-btn p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  title="Copy to clipboard"
                  aria-label="Copy transcript text"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Edit */}
                <button
                  onClick={() => onEditClick(item)}
                  className="clay-btn p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                  title="Edit transcription"
                  aria-label="Edit transcript"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDeleteClick(item)}
                  className="clay-btn p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                  title="Delete transcription"
                  aria-label="Delete transcript"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Page <strong className="text-indigo-600 dark:text-indigo-400">{currentPage}</strong> of{' '}
            <strong>{totalPages}</strong>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`clay-btn px-3 py-1.5 flex items-center gap-1 ${
                currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`clay-btn px-3 py-1.5 flex items-center gap-1 ${
                currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
