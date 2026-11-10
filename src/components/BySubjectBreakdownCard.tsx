import React, { useRef, useEffect } from 'react';
import { View, Text, Platform, StyleSheet, Animated } from 'react-native';
import { SubjectStats } from '../types';
import { useTheme } from '../utils/theme';
import { SubjectDuotoneIcon } from './icons/SubjectDuotoneIcon';

interface BySubjectBreakdownCardProps {
  statsList: SubjectStats[];
}

const SubjectRow: React.FC<{
  item: SubjectStats;
  isLast: boolean;
  index: number;
}> = ({ item, isLast, index }) => {
  const { colors, isDark } = useTheme();
  const { subject, attended, totalHeld, percentage, isSafe, isClose, statusLabel } = item;

  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: Math.min(100, Math.max(0, percentage)),
      duration: 320,
      delay: index * 40,
      useNativeDriver: false,
    }).start();
  }, [percentage, index]);

  const progressWidth = animWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const statusColor = isSafe
    ? isDark ? '#3DDC84' : '#15803D'
    : isClose
    ? isDark ? '#FFB020' : '#D97706'
    : isDark ? '#FF6B72' : '#E11D48';

  return (
    <View
      style={{
        borderBottomColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.06)',
        borderBottomWidth: isLast ? 0 : 1,
      }}
      className="py-3.5"
    >
      {/* Header: Dot + Name + Percentage */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 pr-2">
          <View
            style={{
              backgroundColor: subject.color,
              borderRadius: 8,
              borderCurve: 'continuous',
              shadowColor: subject.color,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.4,
              shadowRadius: 3,
              flexShrink: 0,
            }}
            className="w-6 h-6 items-center justify-center mr-2.5"
          >
            <SubjectDuotoneIcon
              name={subject.name}
              code={subject.code}
              size={15}
            />
          </View>
          <Text
            style={[
              styles.sfText,
              { letterSpacing: -0.2, color: colors.text, flex: 1 },
            ]}
            className="text-[16px] font-semibold"
            numberOfLines={1}
          >
            {subject.name}
          </Text>
        </View>
        <Text
          style={[
            styles.sfText,
            { color: statusColor, letterSpacing: -0.4, flexShrink: 0, fontVariant: ['tabular-nums'] },
          ]}
          className="text-[16px] font-bold"
        >
          {Math.round(percentage)}%
        </Text>
      </View>

      {/* Progress Bar Track with Smooth Fluid Animated Fill */}
      <View
        style={{
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
        }}
        className="w-full h-1.5 rounded-full overflow-hidden my-1"
      >
        <Animated.View
          style={{
            width: progressWidth,
            backgroundColor: statusColor,
            height: '100%',
            borderRadius: 999,
          }}
        />
      </View>

      {/* Sub-label: Attended on left, Buffer/Recovery on right */}
      <View className="flex-row items-center justify-between mt-1">
        <Text
          style={[
            styles.sfText,
            { letterSpacing: 0, color: colors.textDim },
          ]}
          className="text-[12px]"
        >
          {attended}/{totalHeld} attended
        </Text>
        <Text
          style={[
            styles.sfText,
            { color: statusColor, letterSpacing: 0.1 },
          ]}
          className="text-[12px] font-medium"
        >
          {statusLabel}
        </Text>
      </View>
    </View>
  );
};

export const BySubjectBreakdownCard: React.FC<BySubjectBreakdownCardProps> = ({
  statsList,
}) => {
  const { colors } = useTheme();
  // Sort lowest attendance first
  const sortedStats = [...statsList].sort((a, b) => a.percentage - b.percentage);

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderRadius: 28,
          borderCurve: 'continuous',
          backgroundColor: colors.card,
          shadowColor: colors.cardShadow,
        },
      ]}
      className="mx-4 my-3 p-5"
    >
      {/* Title & Sorting Caption */}
      <Text
        style={[
          styles.sfText,
          { letterSpacing: -0.4, color: colors.text },
        ]}
        className="text-[20px] font-bold"
      >
        By Subject
      </Text>
      <Text
        style={[
          styles.sfText,
          { letterSpacing: 0.1, color: colors.textMuted },
        ]}
        className="text-[13px] mt-0.5 mb-4"
      >
        Sorted lowest attendance first
      </Text>

      {/* Subject rows with staggered fluid entrance */}
      {sortedStats.map((item, index) => (
        <SubjectRow
          key={item.subject.id}
          item={item}
          index={index}
          isLast={index === sortedStats.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
