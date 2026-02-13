import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { darkTheme, lightTheme, type AppTheme } from '../theme/theme';

/**
 * Returns current theme (dark or light) and screen colors.
 */
export function useTheme(): AppTheme {
  const themeMode = useSettingsStore((s) => s.theme);
  const systemDark = useColorScheme() === 'dark';
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemDark);
  return isDark ? darkTheme : lightTheme;
}
