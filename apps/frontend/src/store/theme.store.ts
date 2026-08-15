import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'app_theme';

const getSystemPreference = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const applyThemeToDom = (isDark: boolean) => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }
};

let mediaListenerAttached = false;
let mediaQueryList: MediaQueryList | null = null;

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: getSystemPreference(),

  initTheme: () => {
    try {
      let storedTheme: ThemeMode = 'system';
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(STORAGE_KEY);
        if (item === 'light' || item === 'dark' || item === 'system') {
          storedTheme = item;
        } else if (item !== null) {
          // Reset invalid or corrupted values to 'system'
          window.localStorage.setItem(STORAGE_KEY, 'system');
        }
      }

      const resolved = storedTheme === 'system' ? getSystemPreference() : storedTheme;
      applyThemeToDom(resolved === 'dark');
      set({ theme: storedTheme, resolvedTheme: resolved });

      if (typeof window !== 'undefined' && window.matchMedia && !mediaListenerAttached) {
        mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent | MediaQueryList) => {
          if (get().theme === 'system') {
            const newResolved = e.matches ? 'dark' : 'light';
            applyThemeToDom(newResolved === 'dark');
            set({ resolvedTheme: newResolved });
          }
        };

        if (mediaQueryList.addEventListener) {
          mediaQueryList.addEventListener('change', listener);
        } else if ((mediaQueryList as any).addListener) {
          (mediaQueryList as any).addListener(listener);
        }
        mediaListenerAttached = true;
      }
    } catch {
      const resolved = getSystemPreference();
      applyThemeToDom(resolved === 'dark');
      set({ theme: 'system', resolvedTheme: resolved });
    }
  },

  setTheme: (theme: ThemeMode) => {
    const validTheme: ThemeMode = (theme === 'light' || theme === 'dark' || theme === 'system') ? theme : 'system';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, validTheme);
      }
    } catch {}

    const resolved = validTheme === 'system' ? getSystemPreference() : validTheme;
    applyThemeToDom(resolved === 'dark');
    set({ theme: validTheme, resolvedTheme: resolved });
  },
}));
