import React, { useRef } from 'react';
import { View, Text, Platform, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Haptics } from '../utils/haptics';
import { SubjectStats } from '../types';
import { useTheme } from '../utils/theme';
import { ChevronRightIcon, SubjectsIcon } from './icons';
import { fontFamilyNames } from '../utils/typography';
import { ProgressBar } from './ProgressBar';

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
  const { subject, percentage, isSafe, isClose } = item;

  const scale = useRef(new Animated.Value(1)).current;

  const isZeroState = item.totalHeld === 0;

  const statusColor = isZeroState
    ? colors.textMuted
    : isSafe
    ? isDark ? '#3DDC84' : '#15803D'
    : isClose
    ? isDark ? '#FFB020' : '#D97706'
    : isDark ? '#FF6B72' : '#E11D48';

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 40,
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
    router.push(`/stats/${subject.id}`);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.82}
        delayPressIn={0}
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

          <View className="flex-row items-center">
            {/* Attendance Margin status + Pct + Chevron */}
            {isZeroState ? (
              <Text
                style={[
                  styles.sfText,
                  { letterSpacing: 0, color: colors.textMuted, marginRight: 8 },
                ]}
                className="text-[12px]"
              >
                No classes yet
              </Text>
            ) : item.canMiss > 0 ? (
              <Text
                style={[
                  styles.sfText,
                  { letterSpacing: 0, color: colors.textMuted, marginRight: 8 },
                ]}
                className="text-[12px]"
              >
                +{item.canMiss} safe
              </Text>
            ) : item.statusLabel ? (
              <Text
                style={[
                  styles.sfText,
                  { letterSpacing: 0, color: colors.textMuted, marginRight: 8 },
                ]}
                className="text-[12px]"
              >
                {item.statusLabel}
              </Text>
            ) : null}

            {/* Percentage & Chevron */}
            <Text
              style={[
                styles.sfText,
                {
                  color: isZeroState ? colors.textMuted : colors.text,
                  letterSpacing: -0.3,
                  fontVariant: ['tabular-nums'],
                },
              ]}
              className="text-[15px] font-bold"
            >
              {isZeroState ? '—%' : `${Math.round(percentage)}%`}
            </Text>
            <View className="ml-1">
              <ChevronRightIcon size={13} color={colors.textMuted} strokeWidth={2.4} />
            </View>
          </View>
        </View>

        {/* Full-width Animated Subject Colored Progress Bar */}
        <ProgressBar
          value={percentage}
          isZeroState={isZeroState}
          fillColor={subject.color || statusColor}
          height={4}
          delay={index * 40}
          duration={340}
          className="my-1"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const BySubjectBreakdownCard: React.FC<BySubjectBreakdownCardProps> = ({
  statsList,
}) => {
  const { colors, isDark } = useTheme();
  // Sort subjects with classes held lowest first; zero-state subjects at the bottom
  const sortedStats = [...statsList].sort((a, b) => {
    if (a.totalHeld === 0 && b.totalHeld > 0) return 1;
    if (a.totalHeld > 0 && b.totalHeld === 0) return -1;
    if (a.totalHeld === 0 && b.totalHeld === 0) return a.subject.name.localeCompare(b.subject.name);
    return a.percentage - b.percentage;
  });

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
          { letterSpacing: -0.4, color: colors.text, fontFamily: fontFamilyNames.bold },
        ]}
        className="text-[19px] font-bold"
      >
        By subject
      </Text>
      <Text
        style={[
          styles.sfText,
          { letterSpacing: 0, color: colors.textMuted, fontFamily: fontFamilyNames.regular },
        ]}
        className="text-[12px] mt-0.5 mb-3.5"
      >
        {sortedStats.length === 0
          ? 'Course analytics & skip runway'
          : 'Tap a course for detailed statistics & skip runway'}
      </Text>

      {/* Subject rows with staggered fluid entrance or dedicated empty state */}
      {sortedStats.length === 0 ? (
        <View className="items-center justify-center py-6 px-4">
          <View
            style={{
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.04)',
              borderRadius: 20,
              borderCurve: 'continuous',
            }}
            className="w-12 h-12 items-center justify-center mb-2.5"
          >
            <SubjectsIcon size={24} color={colors.textMuted} />
          </View>
          <Text
            style={[
              styles.sfText,
              {
                letterSpacing: -0.2,
                color: colors.text,
                fontFamily: fontFamilyNames.bold,
              },
            ]}
            className="text-[14px] font-bold text-center mb-1"
          >
            No subjects added yet
          </Text>
          <Text
            style={[
              styles.sfText,
              {
                letterSpacing: 0,
                color: colors.textMuted,
                fontFamily: fontFamilyNames.regular,
                lineHeight: 18,
              },
            ]}
            className="text-[12px] text-center max-w-[280px]"
          >
            Detailed attendance percentage, subject charts, and safe skip buffers will appear here once you add courses.
          </Text>
        </View>
      ) : (
        sortedStats.map((item, index) => (
          <SubjectRow
            key={item.subject.id}
            item={item}
            index={index}
            isLast={index === sortedStats.length - 1}
          />
        ))
      )}
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
