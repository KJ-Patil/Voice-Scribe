'use client';

import React from 'react';
import { Mic, Square, Radio, AlertTriangle, Sparkles, Volume2, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/validations';

interface HeroRecorderProps {
  isRecording: boolean;
  recordingDuration: number;
  audioLevel: number;
  liveTranscript: string;
  errorMessage: string | null;
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onStart: () => void;
  onStop: () => void;
  onClearError: () => void;
}

export default function HeroRecorder({
  isRecording,
  recordingDuration,
  audioLevel,
  liveTranscript,
  errorMessage,
  wsStatus,
  selectedLanguage,
  onSelectLanguage,
  onStart,
  onStop,
  onClearError,
}: HeroRecorderProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="glass-panel mx-auto max-w-4xl rounded-3xl p-6 sm:p-8 mb-10 transition-all shadow-glass-glow dark:shadow-glass-glow-dark">
      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 text-rose-600 dark:text-rose-400 text-sm animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Microphone or Connection Notice</p>
              <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={onClearError}
            className="text-xs font-semibold px-2 py-1 hover:bg-rose-500/20 rounded-lg cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Language Selector Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Spoken Language / Dialect:
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Current: <strong className="text-indigo-600 dark:text-indigo-400">{selectedLanguage}</strong>
          </span>
        </div>

        {/* Claymorphic Language Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                disabled={isRecording}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'clay-chip-active scale-[1.03]'
                    : 'clay-btn text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {lang === 'Hinglish' && '🇮🇳 '}
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Mic Centerpiece */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center mb-6">
          {/* Animated Glow Rings when recording */}
          {isRecording && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full bg-rose-500/10 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Clay Mic Button */}
          <button
            onClick={isRecording ? onStop : onStart}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            className={`w-28 h-28 flex flex-col items-center justify-center text-white cursor-pointer relative z-10 transition-transform active:scale-95 ${
              isRecording ? 'clay-mic-hero-recording' : 'clay-mic-hero hover:scale-105'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-8 h-8 fill-current mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9 mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Recording Status & Waveform Audio Level */}
        <div className="flex flex-col items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <Radio className="w-4 h-4 text-rose-500 animate-ping" />
              <span className="font-mono text-sm font-bold text-rose-500 dark:text-rose-400">
                {formatTime(recordingDuration)}
              </span>
              <div className="flex items-center gap-1 pl-2 border-l border-rose-500/20">
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                {/* 5-bar live audio visualizer driven by audioLevel */}
                <div className="flex items-end gap-0.5 h-4 w-12">
                  {[15, 30, 50, 75, 95].map((threshold, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        audioLevel >= threshold ? 'bg-rose-500' : 'bg-rose-500/20'
                      }`}
                      style={{
                        height: audioLevel >= threshold ? `${Math.max(4, (audioLevel / 100) * 16)}px` : '4px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Click the mic to speak in {selectedLanguage} or mixed Hinglish
            </p>
          )}
        </div>
      </div>

      {/* Live Transcript Display Box */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Real-Time Streaming Transcript:
          </label>
          {isRecording && (
            <span className="text-[11px] font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Stream Active
            </span>
          )}
        </div>

        <div className="neu-input min-h-[140px] max-h-[220px] overflow-y-auto p-4 sm:p-5 text-sm sm:text-base leading-relaxed font-sans">
          {liveTranscript ? (
            <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-medium">
              {liveTranscript}
              {isRecording && (
                <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
              )}
            </p>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic text-sm">
              {isRecording
                ? `Listening to your voice... Start speaking in ${selectedLanguage}.`
                : 'Your live speech will appear here automatically with real-time word streaming...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
