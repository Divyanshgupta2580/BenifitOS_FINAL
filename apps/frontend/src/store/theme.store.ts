import { create } from 'zustand';
import { storageService } from '../services/storage.service';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => Promise<void>;
  initTheme: () => Promise<void>;
}

const applyThemeToDom = (isDark: boolean) => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

const getSystemPreference = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  initTheme: async () => {
    try {
      const stored = await storageService.getItem('app_theme');
      const theme: ThemeMode = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
      const resolved = theme === 'system' ? getSystemPreference() : theme;
      
      applyThemeToDom(resolved === 'dark');
      set({ theme, resolvedTheme: resolved });

      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
          if (get().theme === 'system') {
            const newResolved = e.matches ? 'dark' : 'light';
            applyThemeToDom(newResolved === 'dark');
            set({ resolvedTheme: newResolved });
          }
        });
      }
    } catch {
      const resolved = getSystemPreference();
      applyThemeToDom(resolved === 'dark');
      set({ theme: 'system', resolvedTheme: resolved });
    }
  },

  setTheme: async (theme: ThemeMode) => {
    await storageService.setItem('app_theme', theme);
    const resolved = theme === 'system' ? getSystemPreference() : theme;
    applyThemeToDom(resolved === 'dark');
    set({ theme, resolvedTheme: resolved });
  },
}));
