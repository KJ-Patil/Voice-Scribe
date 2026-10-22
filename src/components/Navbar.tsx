'use client';

import React, { useState, useEffect } from 'react';
import { Waves, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial document state
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <nav className="glass-panel sticky top-4 z-40 mx-auto max-w-6xl rounded-2xl px-5 py-3.5 mb-8 flex items-center justify-between transition-all">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl shadow-clay-sm flex items-center justify-center">
          <Waves className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent">
              VoiceScribe
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Multilingual Indian & Hinglish Speech Intelligence
          </p>
        </div>
      </div>

      {/* Badges & Dark Mode Toggle */}
      <div className="flex items-center gap-3">
        {/* Claymorphic Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Light and Dark Mode"
          className="clay-btn p-2.5 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center justify-center"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </nav>
  );
}
