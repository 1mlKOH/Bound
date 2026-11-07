import React from 'react';
import { View, Text } from 'react-native';
import { PooledStats } from '../types';

interface HeroAttendanceCardProps {
  stats: PooledStats;
}

export const HeroAttendanceCard: React.FC<HeroAttendanceCardProps> = ({ stats }) => {
  const isSafe = stats.statusTier === 'safe';
  const isWarning = stats.statusTier === 'warning';

  const badgeBg = isSafe
    ? 'bg-emerald-500/20'
    : isWarning
    ? 'bg-amber-500/20'
    : 'bg-rose-500/20';

  const badgeBorder = isSafe
    ? 'border-emerald-500/40'
    : isWarning
    ? 'border-amber-500/40'
    : 'border-rose-500/40';

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

  const progressWidth = `${Math.min(100, Math.max(0, stats.pooledPercentage))}%`;

  const summarySubtitle =
    stats.subjectsBelowTarget === 0
      ? `Target ${stats.globalTarget}% · All subjects safe`
      : `Target ${stats.globalTarget}% · ${stats.subjectsBelowTarget} ${
          stats.subjectsBelowTarget === 1 ? 'subject' : 'subjects'
        } below target`;

  return (
    <View
      className="mx-4 my-2 p-5 rounded-[28px] border border-emerald-950/60"
      style={{ backgroundColor: '#0B2317' }}
    >
      {/* Top Row: Label & Status Badge */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className="text-xs font-semibold tracking-wider text-emerald-400/80 uppercase"
          style={{ letterSpacing: 1 }}
        >
          OVERALL ATTENDANCE
        </Text>
        <View
          className={`px-3 py-1 rounded-full border ${badgeBg} ${badgeBorder}`}
        >
          <Text className={`text-xs font-bold ${badgeText}`}>
            {badgeLabel}
          </Text>
        </View>
      </View>

      {/* Hero Percentage Display */}
      <Text className="text-5xl font-black text-white my-1 tracking-tight">
        {Math.round(stats.pooledPercentage)}%
      </Text>

      {/* Progress Bar Track */}
      <View className="w-full h-2.5 bg-[#143D27] rounded-full overflow-hidden my-3">
        <View
          style={{
            width: progressWidth as any,
            backgroundColor: progressColor,
            height: '100%',
            borderRadius: 999,
          }}
        />
      </View>

      {/* Target and Below-Target Counter */}
      <Text className="text-xs font-medium text-emerald-200/70">
        {summarySubtitle}
      </Text>
    </View>
  );
};
