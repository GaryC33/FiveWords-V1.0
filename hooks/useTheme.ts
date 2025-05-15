import { useColorScheme } from 'react-native';
import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { isDark, toggleTheme } = useThemeStore();

  const theme = {
    colors: {
      primary: '#4a4381',
      background: isDark ? '#1a1a1a' : '#ffffff',
      text: isDark ? '#ffffff' : '#000000',
      border: isDark ? '#333333' : '#e5e5e5',
      card: isDark ? '#2a2a2a' : '#ffffff',
    },
  };

  return {
    theme,
    isDark,
    toggleTheme,
  };
}