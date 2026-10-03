import React from 'react';
import { useThemeStore, ThemeMode } from '../../store/theme.store';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from './Icons';

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const handleNextMode = () => {
    if (theme === 'system') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('system');
    }
  };

  if (variant === 'segmented') {
    const options: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
      {
        mode: 'system',
        label: 'Auto',
        icon: <ComputerDesktopIcon className="w-4 h-4" />,
      },
      {
        mode: 'light',
        label: 'Light',
        icon: <SunIcon className="w-4 h-4" />,
      },
      {
        mode: 'dark',
        label: 'Dark',
        icon: <MoonIcon className="w-4 h-4" />,
      },
    ];

    return (
      <div
        role="group"
        aria-label="Theme mode selection"
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-forest-950 border border-slate-200 dark:border-[#1C3127] ${className}`}
      >
        {options.map((opt) => {
          const isSelected = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setTheme(opt.mode)}
              aria-pressed={isSelected}
              aria-label={`Select ${opt.mode} theme`}
              className={`min-h-[36px] min-w-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 ${
                isSelected
                  ? 'bg-white dark:bg-[#0B3B2B] text-slate-900 dark:text-mint-300 shadow-xs border border-slate-200 dark:border-mint-500/50 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default compact toggle button
  return (
    <button
      type="button"
      onClick={handleNextMode}
      className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 select-none ${
        resolvedTheme === 'dark'
          ? 'bg-forest-900 border-[#1C3127] text-slate-200 hover:bg-forest-800 hover:text-white hover:border-mint-500/40 shadow-sm'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
      } ${className}`}
      title={`Current Theme: ${theme.toUpperCase()} (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}). Click to toggle.`}
      aria-label={`Theme: ${theme}. Switch theme mode`}
    >
      {theme === 'system' ? (
        <ComputerDesktopIcon className="w-4 h-4 text-emerald-600 dark:text-mint-400" />
      ) : resolvedTheme === 'dark' ? (
        <MoonIcon className="w-4 h-4 text-amber-400" />
      ) : (
        <SunIcon className="w-4 h-4 text-amber-600" />
      )}

      <span className="hidden sm:inline capitalize">
        {theme === 'system' ? `Auto (${resolvedTheme})` : theme}
      </span>
    </button>
  );
};
