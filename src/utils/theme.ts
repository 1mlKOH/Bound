import { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import { useAttendanceStore } from '../store/useAttendanceStore';

export const darkPalette = {
  canvas: '#0F1015',
  card: '#1B1C22',
  cardSubtle: '#22232B',
  cardBorder: 'transparent',
  cardBorderTop: 'transparent',
  cardShadow: '#000000',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.70)',
  textMuted: 'rgba(255, 255, 255, 0.50)',
  textDim: 'rgba(255, 255, 255, 0.35)',
  glassBg: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'transparent',
  glassBorderTop: 'transparent',
  actionBg: 'rgba(255, 255, 255, 0.06)',
  actionBorder: 'transparent',
  divider: 'rgba(255, 255, 255, 0.06)',
  inputBg: '#22232B',
  inputBorder: '#282932',
  placeholderText: 'rgba(255, 255, 255, 0.35)',
  navBg: 'rgba(21, 22, 28, 0.72)',
  navBorder: 'transparent',
  navBorderTop: 'transparent',
  navActiveBg: 'rgba(255, 255, 255, 0.14)',
  navActiveBorder: 'transparent',
  navActiveIcon: '#FFFFFF',
  navActiveText: '#FFFFFF',
  navInactiveIcon: 'rgba(255, 255, 255, 0.45)',
  navInactiveText: 'rgba(255, 255, 255, 0.50)',
  blurTint: 'dark' as const,
  heroBg: '#0B2317',
  heroBorder: 'transparent',
  heroBorderTop: 'transparent',
  heroTrack: '#143D27',
  heroNumber: '#FFFFFF',
  heroSubtitle: 'rgba(167, 243, 208, 0.75)',
  heroLabel: 'rgba(61, 220, 132, 0.8)',
  statusSafe: '#3DDC84',
  statusWarning: '#FFB020',
  statusDanger: '#FF6B72',
  presentBadgeBg: 'rgba(16, 185, 129, 0.15)',
  presentBadgeBorder: 'transparent',
  presentBadgeText: '#3DDC84',
  absentBadgeBg: '#D6336C',
  absentBadgeBorder: 'transparent',
  absentBadgeText: '#FFFFFF',
  cancelledBadgeBg: 'rgba(255, 255, 255, 0.10)',
  cancelledBadgeBorder: 'transparent',
  cancelledBadgeText: '#A1A1AA',
};

export const lightPalette = {
  canvas: '#F2F2F7',
  card: '#FFFFFF',
  cardSubtle: '#F8F9FA',
  cardBorder: 'transparent',
  cardBorderTop: 'transparent',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textDim: '#9CA3AF',
  glassBg: 'rgba(0, 0, 0, 0.05)',
  glassBorder: 'transparent',
  glassBorderTop: 'transparent',
  actionBg: 'rgba(0, 0, 0, 0.04)',
  actionBorder: 'transparent',
  divider: 'rgba(0, 0, 0, 0.06)',
  inputBg: '#F3F4F6',
  inputBorder: '#E5E7EB',
  placeholderText: '#9CA3AF',
  navBg: 'rgba(255, 255, 255, 0.82)',
  navBorder: 'transparent',
  navBorderTop: 'transparent',
  navActiveBg: 'rgba(0, 0, 0, 0.07)',
  navActiveBorder: 'transparent',
  navActiveIcon: '#111827',
  navActiveText: '#111827',
  navInactiveIcon: '#8E8E93',
  navInactiveText: '#8E8E93',
  blurTint: 'light' as const,
  heroBg: '#EAF8F0',
  heroBorder: 'transparent',
  heroBorderTop: 'transparent',
  heroTrack: '#C8EED9',
  heroNumber: '#064E3B',
  heroSubtitle: '#047857',
  heroLabel: '#047857',
  statusSafe: '#15803D',
  statusWarning: '#D97706',
  statusDanger: '#E11D48',
  presentBadgeBg: 'rgba(16, 185, 129, 0.12)',
  presentBadgeBorder: 'transparent',
  presentBadgeText: '#15803D',
  absentBadgeBg: 'rgba(225, 29, 72, 0.12)',
  absentBadgeBorder: 'transparent',
  absentBadgeText: '#BE123C',
  cancelledBadgeBg: 'rgba(0, 0, 0, 0.05)',
  cancelledBadgeBorder: 'transparent',
  cancelledBadgeText: '#64748B',
};

export function useTheme() {
  const themePref = useAttendanceStore((state) => state.settings.theme);
  const systemScheme = useSystemColorScheme();

  const isDark =
    themePref === 'dark' || (themePref === 'system' && systemScheme !== 'light');

  useEffect(() => {
    try {
      nwColorScheme.set(isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  const colors = isDark ? darkPalette : lightPalette;

  return {
    isDark,
    theme: themePref,
    colors,
  };
}
