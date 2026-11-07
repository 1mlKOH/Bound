import React, { useRef, useEffect } from 'react';
import { View, Text, Platform, StyleSheet, Animated } from 'react-native';
import { PooledStats } from '../types';

interface HeroAttendanceCardProps {
  stats: PooledStats;
}

export const HeroAttendanceCard: React.FC<HeroAttendanceCardProps> = ({ stats }) => {
  const isSafe = stats.statusTier === 'safe';
  const isWarning = stats.statusTier === 'warning';

  const badgeBg = isSafe
    ? 'bg-emerald-500/15'
    : isWarning
    ? 'bg-amber-500/15'
    : 'bg-rose-500/15';

  const badgeBorder = isSafe
    ? 'border-emerald-400/30'
    : isWarning
    ? 'border-amber-400/30'
    : 'border-rose-400/30';

  const badgeText = isSafe
    ? 'text-[#3DDC84]'
    : isWarning
    ? 'text-[#FFB020]'
    : 'text-[#FF6B72]';

  const badgeLabel = isSafe ? 'Safe' : isWarning ? 'Close' : 'Below';

  const progressColor = isSafe
    ? '#3DDC84'
    : isWarning
    ? '#FFB020'
    : '#FF6B72';

  const animatedPercent = useRef(
    new Animated.Value(Math.min(100, Math.max(0, stats.pooledPercentage)))
  ).current;

  useEffect(() => {
    Animated.spring(animatedPercent, {
      toValue: Math.min(100, Math.max(0, stats.pooledPercentage)),
      damping: 20,
      stiffness: 150,
      mass: 0.6,
      useNativeDriver: false,
    }).start();
  }, [stats.pooledPercentage]);

  const animatedWidth = animatedPercent.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });


  const summarySubtitle =
    stats.subjectsBelowTarget === 0
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
        },
      ]}
      className="mx-4 my-2 p-5"
    >
      {/* Top Row: Label & Status Badge */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          style={[
            styles.sfText,
            { letterSpacing: 0.8 },
          ]}
          className="text-[11px] font-semibold text-emerald-400/80 uppercase"
        >
          OVERALL ATTENDANCE
        </Text>
        <View
          style={{ borderRadius: 12, borderCurve: 'continuous' }}
          className={`px-3 py-1 border ${badgeBg} ${badgeBorder}`}
        >
          <Text
            style={[styles.sfText, { letterSpacing: -0.1 }]}
            className={`text-xs font-semibold ${badgeText}`}
          >
            {badgeLabel}
          </Text>
        </View>
      </View>

      {/* Hero Percentage Display with Apple SF Optical Sizing */}
      <Text
        style={[
          styles.heroNumber,
          {
            letterSpacing: -1.6,
          },
        ]}
        className="text-[52px] font-bold text-white my-0.5 leading-none"
      >
        {Math.round(stats.pooledPercentage)}%
      </Text>

      {/* Progress Bar Track with Smooth Liquid Fill */}
      <View className="w-full h-2.5 bg-[#143D27] rounded-full overflow-hidden my-3">
        <Animated.View
          style={{
            width: animatedWidth,
            backgroundColor: progressColor,
            height: '100%',
            borderRadius: 999,
          }}
        />

      </View>

      {/* Target and Below-Target Counter */}
      <Text
        style={[styles.sfText, { letterSpacing: -0.1 }]}
        className="text-[13px] font-normal text-emerald-200/75"
      >
        {summarySubtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0B2317',
    borderWidth: 1,
    borderColor: 'rgba(61, 220, 132, 0.18)',
    borderTopColor: 'rgba(61, 220, 132, 0.40)', // Apple light catcher
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  heroNumber: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
