import React from 'react';
import { useThemeStore, ThemeMode } from '../../store/theme.store';
import { SunIcon, MoonIcon } from './Icons';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const toggleNext = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleNext}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        resolvedTheme === 'dark'
          ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
      } ${className}`}
      title={`Current Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / Auto)`}
      aria-label="Toggle Theme Mode"
    >
      {resolvedTheme === 'dark' ? (
        <MoonIcon className="w-4 h-4 text-amber-400" />
      ) : (
        <SunIcon className="w-4 h-4 text-amber-600" />
      )}
      <span className="hidden md:inline capitalize">{theme}</span>
    </button>
  );
};
