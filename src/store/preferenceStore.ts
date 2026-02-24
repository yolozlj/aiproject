import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Language } from '@/types';

interface PreferenceState {
  theme: Theme;
  language: Language;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      theme: 'minimal',
      language: 'zh-CN',

      setTheme: (theme: Theme) => {
        set({ theme });
        // 应用主题到 document
        document.documentElement.setAttribute('data-theme', theme);
      },

      setLanguage: (language: Language) => {
        set({ language });
      },
    }),
    {
      name: 'preference-storage',
    }
  )
);
