import { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme, Platform } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import { useAttendanceStore } from '../store/useAttendanceStore';

export const darkPalette = {
  // Canvases & Surfaces
  canvas: '#0F1014', // app dark: #0F1014
  canvasMidnight: '#0C1E3A', // bg #0C1E3A
  card: '#1B1C21', // surface #1B1C21
  cardSubtle: '#22232A',
  cardBorder: '#2C2D34', // line #2C2D34
  cardBorderTop: 'rgba(255, 255, 255, 0.08)',
  cardShadow: '#000000',

  // Typography Colors
  text: '#F5F5F7', // text #F5F5F7
  textSecondary: 'rgba(245, 245, 247, 0.70)',
  textMuted: '#A4A4B0', // subtext #A4A4B0
  textDim: 'rgba(245, 245, 247, 0.35)',

  // Glass & Layering
  glassBg: 'rgba(30, 32, 40, 0.50)', // liquid glass dark
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  actionBg: '#25262E', // pillBg #25262E
  actionBorder: '#2C2D34',
  divider: '#2C2D34', // line #2C2D34
  inputBg: '#25262E', // pillBg #25262E
  inputBorder: '#2C2D34', // line #2C2D34
  placeholderText: '#6E6E78',

  // Bottom Navigation
  navBg: 'rgba(27, 28, 33, 0.85)',
  navBorder: 'rgba(255, 255, 255, 0.14)',
  navBorderTop: 'transparent',
  navActiveBg: '#2C2E37', // navActive #2C2E37
  navActiveBorder: 'transparent',
  navActiveIcon: '#F5F5F7',
  navActiveText: '#F5F5F7',
  navInactiveIcon: '#A4A4B0',
  navInactiveText: '#A4A4B0',
  blurTint: 'dark' as const,

  // Status & Actions
  statusSafe: '#3DDC84', // safe dark: #3DDC84
  statusWarning: '#FFB020', // close dark: #FFB020
  statusDanger: '#FF6B72', // below dark: #FF6B72
  statusAbsent: '#D6336C', // absent #D6336C
  statusCancelled: '#5F6B80', // cancelled #5F6B80
  primaryButton: '#00BF63', // primary button #00BF63
  primaryButtonText: '#06210F', // text: #06210F

  // Hero Card Atmospheres
  heroBg: '#0B2317',
  heroBorder: 'rgba(61, 220, 132, 0.20)',
  heroBorderTop: 'transparent',
  heroTrack: '#143D27',
  heroNumber: '#F5F5F7',
  heroSubtitle: 'rgba(167, 243, 208, 0.80)',
  heroLabel: 'rgba(61, 220, 132, 0.85)',

  // Badges
  presentBadgeBg: 'rgba(61, 220, 132, 0.15)',
  presentBadgeBorder: 'transparent',
  presentBadgeText: '#3DDC84',
  absentBadgeBg: '#D6336C',
  absentBadgeBorder: 'transparent',
  absentBadgeText: '#FFFFFF',
  cancelledBadgeBg: 'rgba(95, 107, 128, 0.20)',
  cancelledBadgeBorder: 'transparent',
  cancelledBadgeText: '#A4A4B0',
};

export const lightPalette = {
  // Canvases & Surfaces
  canvas: '#F3F3F5', // bg #F3F3F5
  canvasMidnight: '#F3F3F5',
  card: '#FBFBFD', // surface #FBFBFD
  cardSubtle: '#F3F4F7',
  cardBorder: '#E3E3E8', // line #E3E3E8
  cardBorderTop: 'rgba(255, 255, 255, 0.75)',
  cardShadow: 'rgba(0, 0, 0, 0.06)',

  // Typography Colors
  text: '#111114', // text #111114
  textSecondary: '#4A4A52',
  textMuted: '#6E6E78', // subtext #6E6E78
  textDim: '#9D9DA8',

  // Glass & Layering
  glassBg: 'rgba(255, 255, 255, 0.55)', // liquid glass light
  glassBorder: 'rgba(255, 255, 255, 0.75)',
  actionBg: '#E4E5EA', // pillBg #E4E5EA
  actionBorder: '#E3E3E8',
  divider: '#E3E3E8', // line #E3E3E8
  inputBg: '#E4E5EA', // pillBg #E4E5EA
  inputBorder: '#E3E3E8', // line #E3E3E8
  placeholderText: '#9D9DA8',

  // Bottom Navigation
  navBg: 'rgba(251, 251, 253, 0.88)',
  navBorder: 'rgba(0, 0, 0, 0.05)',
  navBorderTop: 'transparent',
  navActiveBg: '#DFDFE4', // navActive #DFDFE4
  navActiveBorder: 'transparent',
  navActiveIcon: '#111114',
  navActiveText: '#111114',
  navInactiveIcon: '#6E6E78',
  navInactiveText: '#6E6E78',
  blurTint: 'light' as const,

  // Status & Actions
  statusSafe: '#0D8A33', // safe light: #0D8A33
  statusWarning: '#B26A00', // close light: #B26A00
  statusDanger: '#D1323A', // below light: #D1323A
  statusAbsent: '#D6336C', // absent #D6336C
  statusCancelled: '#5F6B80', // cancelled #5F6B80
  primaryButton: '#00BF63', // primary button #00BF63
  primaryButtonText: '#06210F', // text: #06210F

  // Hero Card Atmospheres
  heroBg: '#EAF8F0',
  heroBorder: 'rgba(13, 138, 51, 0.15)',
  heroBorderTop: 'transparent',
  heroTrack: '#C8EED9',
  heroNumber: '#064E3B',
  heroSubtitle: '#047857',
  heroLabel: '#047857',

  // Badges
  presentBadgeBg: 'rgba(13, 138, 51, 0.12)',
  presentBadgeBorder: 'transparent',
  presentBadgeText: '#0D8A33',
  absentBadgeBg: 'rgba(214, 51, 108, 0.12)',
  absentBadgeBorder: 'transparent',
  absentBadgeText: '#D6336C',
  cancelledBadgeBg: 'rgba(95, 107, 128, 0.12)',
  cancelledBadgeBorder: 'transparent',
  cancelledBadgeText: '#5F6B80',
};

// Radii & Spacing Ergonomics from Token Sheet
export const radii = {
  card: Platform.OS === 'ios' ? 26 : 28,
  inner: 16,
  pill: 999,
  nav: 999,
  button: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const ergonomics = {
  phoneFrameRadius: 40,
  navPillHeight: 64,
  activeTabHeight: 52,
  minHitbox: 44,
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
    radii,
    spacing,
    ergonomics,
  };
}
