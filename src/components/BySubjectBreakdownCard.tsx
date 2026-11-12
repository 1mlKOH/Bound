import React, { useRef, useEffect } from 'react';
import { View, Text, Platform, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Haptics } from '../utils/haptics';
import { SubjectStats } from '../types';
import { useTheme } from '../utils/theme';
import { ChevronRightIcon } from './icons';
import { fontFamilyNames } from '../utils/typography';

interface BySubjectBreakdownCardProps {
  statsList: SubjectStats[];
}

const SubjectRow: React.FC<{
  item: SubjectStats;
  isLast: boolean;
  index: number;
}> = ({ item, isLast, index }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { subject, percentage, isSafe, isClose, statusLabel } = item;

  const animWidth = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

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

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/stats/[id]',
      params: { id: subject.id },
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        style={{
          borderBottomColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
          borderBottomWidth: isLast ? 0 : 1,
        }}
        className="py-3.5"
      >
        {/* Header: Dot + Name (Left) | Margin + Pct + Chevron (Right) */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1 pr-2">
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 4.5,
                backgroundColor: subject.color,
                marginRight: 9,
              }}
            />
            <Text
              style={[
                styles.sfText,
                { letterSpacing: -0.2, color: colors.text },
              ]}
              className="text-[15px] font-semibold"
              numberOfLines={1}
            >
              {subject.name}
            </Text>
          </View>

          <View className="flex-row items-center space-x-2">
            {/* Inline Safe Buffer / Recovery Tag */}
            <Text
              style={[
                styles.sfText,
                { color: statusColor, letterSpacing: -0.1 },
              ]}
              className="text-[12px] font-semibold mr-2"
            >
              {statusLabel}
            </Text>

            {/* Percentage & Chevron */}
            <Text
              style={[
                styles.sfText,
                { color: colors.text, letterSpacing: -0.3, fontVariant: ['tabular-nums'] },
              ]}
              className="text-[15px] font-bold"
            >
              {Math.round(percentage)}%
            </Text>
            <View className="ml-1">
              <ChevronRightIcon size={13} color={colors.textMuted} strokeWidth={2.4} />
            </View>
          </View>
        </View>

        {/* Full-width Animated Subject Colored Progress Bar */}
        <View
          style={{
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
            height: 4,
            borderRadius: 999,
            overflow: 'hidden',
          }}
          className="w-full my-1"
        >
          <Animated.View
            style={{
              width: progressWidth,
              backgroundColor: subject.color || statusColor,
              height: '100%',
              borderRadius: 999,
            }}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
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
      {/* Title & Drilldown Caption */}
      <Text
        style={[
          styles.sfText,
          { letterSpacing: -0.4, color: colors.text },
        ]}
        className="text-[19px] font-bold"
      >
        By subject
      </Text>
      <Text
        style={[
          styles.sfText,
          { letterSpacing: 0, color: colors.textMuted },
        ]}
        className="text-[12px] mt-0.5 mb-3.5"
      >
        Tap a course for detailed statistics & skip runway
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
    fontFamily: fontFamilyNames.semiBold,
    includeFontPadding: false,
  },
});
