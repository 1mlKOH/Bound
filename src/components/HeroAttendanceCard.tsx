import React, { useRef, useEffect } from 'react';
import { View, Text, Platform, StyleSheet, Animated } from 'react-native';
import { NumberFlow } from 'number-flow-react-native';
import { PooledStats } from '../types';
import { useTheme } from '../utils/theme';

interface HeroAttendanceCardProps {
  stats: PooledStats;
}

export const HeroAttendanceCard: React.FC<HeroAttendanceCardProps> = ({ stats }) => {
  const { colors, isDark } = useTheme();

  const isZeroState = stats.totalHeld === 0 || stats.statusTier === 'neutral';

  // Tier-based chromatic atmosphere
  const tierConfig = {
    neutral: {
      cardBg: colors.card,
      labelColor: colors.textMuted,
      trackBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      progressColor: isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.15)',
      subtitleColor: colors.textMuted,
      badgeBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      badgeText: colors.textSecondary,
      badgeLabel: 'No Data',
    },
    safe: {
      cardBg: isDark ? '#0B2317' : '#EAF8F0',
      labelColor: isDark ? 'rgba(61, 220, 132, 0.85)' : '#047857',
      trackBg: isDark ? '#143D27' : '#C8EED9',
      progressColor: isDark ? '#3DDC84' : '#1FB45A',
      subtitleColor: isDark ? 'rgba(167, 243, 208, 0.80)' : '#047857',
      badgeBg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.15)',
      badgeText: isDark ? '#3DDC84' : '#15803D',
      badgeLabel: 'Safe',
    },
    warning: {
      cardBg: isDark ? '#221607' : '#FEF9C3',
      labelColor: isDark ? 'rgba(255, 176, 32, 0.85)' : '#B45309',
      trackBg: isDark ? '#3D270E' : '#FDE68A',
      progressColor: isDark ? '#FFB020' : '#D97706',
      subtitleColor: isDark ? 'rgba(253, 230, 138, 0.80)' : '#92400E',
      badgeBg: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.18)',
      badgeText: isDark ? '#FFB020' : '#D97706',
      badgeLabel: 'Close',
    },
    danger: {
      cardBg: isDark ? '#240B12' : '#FFE4E6',
      labelColor: isDark ? 'rgba(255, 107, 114, 0.85)' : '#BE123C',
      trackBg: isDark ? '#3D121B' : '#FECDD3',
      progressColor: isDark ? '#FF6B72' : '#E11D48',
      subtitleColor: isDark ? 'rgba(254, 205, 211, 0.80)' : '#9F1239',
      badgeBg: isDark ? 'rgba(244, 63, 94, 0.18)' : 'rgba(244, 63, 94, 0.18)',
      badgeText: isDark ? '#FF6B72' : '#E11D48',
      badgeLabel: 'Below',
    },
  };

  const currentTier = isZeroState ? tierConfig.neutral : (tierConfig[stats.statusTier] || tierConfig.safe);

  const targetPercent = isZeroState ? 0 : Math.min(100, Math.max(0, stats.pooledPercentage));

  const animatedPercent = useRef(
    new Animated.Value(targetPercent)
  ).current;

  useEffect(() => {
    Animated.spring(animatedPercent, {
      toValue: targetPercent,
      damping: 20,
      stiffness: 150,
      mass: 0.6,
      useNativeDriver: false,
    }).start();
  }, [targetPercent]);

  const animatedWidth = animatedPercent.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const summarySubtitle = isZeroState
    ? `Target ${stats.globalTarget}% · No classes recorded yet`
    : stats.subjectsBelowTarget === 0
    ? `Target ${stats.globalTarget}% · All subjects safe`
    : `Target ${stats.globalTarget}% · ${stats.subjectsBelowTarget} ${
        stats.subjectsBelowTarget === 1 ? 'subject' : 'subjects'
      } below target`;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderRadius: 28,
          borderCurve: 'continuous',
          backgroundColor: currentTier.cardBg,
          shadowColor: colors.cardShadow,
          borderWidth: 1,
          borderColor: isZeroState
            ? (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)')
            : 'transparent',
        },
      ]}
      className="mx-4 my-2 p-5"
    >
      {/* Top Row: Label & Status Badge */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          style={[
            styles.sfText,
            { letterSpacing: 0.8, color: currentTier.labelColor },
          ]}
          className="text-[11px] font-semibold uppercase"
        >
          OVERALL ATTENDANCE
        </Text>
        <View
          style={{
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: currentTier.badgeBg,
          }}
          className="px-3 py-1"
        >
          <Text
            style={[
              styles.sfText,
              { letterSpacing: -0.1, color: currentTier.badgeText },
            ]}
            className="text-xs font-semibold"
          >
            {currentTier.badgeLabel}
          </Text>
        </View>
      </View>

      {/* Hero Percentage Display with Apple SF Optical Sizing & NumberFlow animation */}
      {isZeroState ? (
        <Text
          style={[
            styles.heroNumber,
            {
              letterSpacing: -1.6,
              color: isDark ? 'rgba(255, 255, 255, 0.40)' : 'rgba(0, 0, 0, 0.35)',
              fontSize: 52,
              fontWeight: '700',
              lineHeight: 58,
            },
          ]}
          className="my-0.5"
        >
          —%
        </Text>
      ) : (

        <View className="my-0.5">
          <NumberFlow
            value={Math.round(stats.pooledPercentage)}
            suffix="%"
            style={{
              fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
              fontSize: 52,
              fontWeight: '700',
              letterSpacing: -1.6,
              color: isDark ? '#FFFFFF' : '#0F172A',
            }}
          />
        </View>
      )}

      {/* Progress Bar Track with Smooth Liquid Fill */}
      <View
        style={{ backgroundColor: currentTier.trackBg }}
        className="w-full h-2.5 rounded-full overflow-hidden my-3"
      >
        <Animated.View
          style={{
            width: animatedWidth,
            backgroundColor: currentTier.progressColor,
            height: '100%',
            borderRadius: 999,
          }}
        />
      </View>

      {/* Target and Below-Target Counter */}
      <Text
        style={[
          styles.sfText,
          { letterSpacing: -0.1, color: currentTier.subtitleColor },
        ]}
        className="text-[13px] font-medium"
      >
        {summarySubtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  heroNumber: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    fontVariant: ['tabular-nums'],
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
