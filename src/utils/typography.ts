import { Platform, StyleSheet, TextStyle } from 'react-native';

/**
 * Design Token Typography Scale
 * Android: Figtree (Google Fonts, SIL Open Font License 1.1)
 * iOS: System font (San Francisco / SF Pro)
 */
export const fontFamilyNames = {
  regular: Platform.select({ ios: 'System', android: 'Figtree_400Regular' }),
  medium: Platform.select({ ios: 'System', android: 'Figtree_500Medium' }),
  semiBold: Platform.select({ ios: 'System', android: 'Figtree_600SemiBold' }),
  bold: Platform.select({ ios: 'System', android: 'Figtree_700Bold' }),
  extraBold: Platform.select({ ios: 'System', android: 'Figtree_800ExtraBold' }),
};

export const typography = StyleSheet.create({
  // Base font families
  regular: {
    fontFamily: fontFamilyNames.regular,
  },
  medium: {
    fontFamily: fontFamilyNames.medium,
    fontWeight: '500',
  },
  semiBold: {
    fontFamily: fontFamilyNames.semiBold,
    fontWeight: '600',
  },
  bold: {
    fontFamily: fontFamilyNames.bold,
    fontWeight: '700',
  },
  extraBold: {
    fontFamily: fontFamilyNames.extraBold,
    fontWeight: '800',
  },

  // Token Sheet Type Scale
  onboardingDisplay: {
    fontFamily: fontFamilyNames.extraBold,
    fontSize: 96,
    fontWeight: '800',
    letterSpacing: -4.8, // -0.05em
    fontVariant: ['tabular-nums'],
  },
  displayHero: {
    fontFamily: fontFamilyNames.extraBold,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.56, // -0.03em
    fontVariant: ['tabular-nums'],
  },
  h1: {
    fontFamily: fontFamilyNames.bold,
    fontSize: Platform.OS === 'ios' ? 34 : 28,
    fontWeight: Platform.OS === 'ios' ? '700' : '800',
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: fontFamilyNames.bold,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 21.25, // 17 * 1.25
  },
  body: {
    fontFamily: fontFamilyNames.medium,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21.75, // 15 * 1.45
  },
  caption: {
    fontFamily: fontFamilyNames.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  pill: {
    fontFamily: fontFamilyNames.bold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabularNums: {
    fontVariant: ['tabular-nums'],
  },
});
