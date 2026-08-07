import { create } from 'zustand';
import { storageService } from '../services/storage.service';

export interface LanguageState {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  loadLocale: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: 'en',
  setLocale: async (locale) => {
    await storageService.setItem('locale', locale);
    set({ locale });
  },
  loadLocale: async () => {
    const saved = await storageService.getItem('locale');
    if (saved) set({ locale: saved });
  },
}));
