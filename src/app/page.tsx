'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroRecorder from '@/components/HeroRecorder';
import Dashboard, { TranscriptionRecord } from '@/components/Dashboard';
import EditModal from '@/components/EditModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterLanguage, setSelectedFilterLanguage] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('Hinglish');
  const [liveTranscript, setLiveTranscript] = useState('');

  // Modals state
  const [editingRecord, setEditingRecord] = useState<TranscriptionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<TranscriptionRecord | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch paginated transcriptions with search and language filters
  const fetchTranscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (selectedFilterLanguage && selectedFilterLanguage !== 'All') {
        params.set('language', selectedFilterLanguage);
      }

      const res = await fetch(`/api/transcriptions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setTranscriptions(json.data || []);
        setTotalRecords(json.pagination?.total || 0);
        setTotalPages(json.pagination?.totalPages || 1);
      } else {
        console.warn('Could not load transcriptions:', res.status);
      }
    } catch (err: any) {
      console.error('Fetch transcriptions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedFilterLanguage]);

  useEffect(() => {
    fetchTranscriptions();
  }, [fetchTranscriptions]);

  // Handle incoming live partial stream
  const handlePartialTranscript = useCallback((text: string) => {
    setLiveTranscript(text);
  }, []);

  // Handle final saved transcript event
  const handleFinalTranscript = useCallback((record: any) => {
    setLiveTranscript('');
    showToast(`Transcription saved successfully!`);
    fetchTranscriptions();
  }, [fetchTranscriptions]);

  const {
    isRecording,
    recordingDuration,
    audioLevel,
    errorMessage,
    wsStatus,
    startRecording,
    stopRecording,
    setErrorMessage,
  } = useVoiceRecorder({
    onPartialTranscript: handlePartialTranscript,
    onFinalTranscript: handleFinalTranscript,
    selectedLanguage,
  });

  // Edit action handler
  const handleSaveEdit = async (id: number, updatedText: string) => {
    const res = await fetch(`/api/transcriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: updatedText }),
    });

    if (res.ok) {
      showToast('Transcription updated successfully.');
      fetchTranscriptions();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to update record', 'error');
    }
  };

  // Delete action handler
  const handleConfirmDelete = async (id: number) => {
    const res = await fetch(`/api/transcriptions/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      showToast(`Record #${id} deleted.`);
      fetchTranscriptions();
    } else {
      showToast('Failed to delete record.', 'error');
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 md:px-10 lg:px-16 selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-modal shadow-2xl text-xs font-semibold animate-in slide-in-from-top-4">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          )}
          <span className="text-slate-800 dark:text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Speech Recorder with Claymorphism & Glassmorphism */}
      <HeroRecorder
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        audioLevel={audioLevel}
        liveTranscript={liveTranscript}
        errorMessage={errorMessage}
        wsStatus={wsStatus}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onStart={startRecording}
        onStop={stopRecording}
        onClearError={() => setErrorMessage(null)}
      />

      {/* Dashboard with Search, Language Filter, Pagination, Copy & CRUD */}
      <Dashboard
        transcriptions={transcriptions}
        totalRecords={totalRecords}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        searchQuery={searchQuery}
        selectedFilterLanguage={selectedFilterLanguage}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        onFilterLanguageChange={(lang) => {
          setSelectedFilterLanguage(lang);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        onEditClick={setEditingRecord}
        onDeleteClick={setDeletingRecord}
      />

      {/* Edit Modal */}
      <EditModal
        record={editingRecord}
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        record={deletingRecord}
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Footer */}
      <footer className="mx-auto max-w-5xl text-center text-xs text-slate-500 dark:text-slate-400 pb-12 border-t border-slate-200 dark:border-white/10 pt-6">
        <p>
          VoiceScribe • Real-Time Speech Intelligence with Google Gemini Live API & PostgreSQL (Prisma).
        </p>
      </footer>
    </main>
  );
}
