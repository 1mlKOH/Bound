import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, Animated } from 'react-native';
import { Haptics } from '../utils/haptics';
import { SubjectStats } from '../types';
import { useTheme } from '../utils/theme';
import { SubjectDuotoneIcon } from './icons/SubjectDuotoneIcon';

interface SubjectCardProps {
  stats: SubjectStats;
  onPress: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ stats, onPress }) => {
  const { colors, isDark } = useTheme();
  const { subject, attended, totalHeld, percentage, isSafe, isClose, statusLabel } =
    stats;

  const scale = useRef(new Animated.Value(1)).current;

  const isZeroState = totalHeld === 0;

  const statusColor = isZeroState
    ? colors.textMuted
    : isSafe
    ? colors.statusSafe
    : isClose
    ? colors.statusWarning
    : colors.statusDanger;

  const badgeBg = isZeroState
    ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
    : isSafe
    ? colors.presentBadgeBg
    : isClose
    ? (isDark ? 'rgba(255, 176, 32, 0.18)' : 'rgba(178, 106, 0, 0.14)')
    : (isDark ? 'rgba(255, 107, 114, 0.18)' : 'rgba(209, 50, 58, 0.14)');

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
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        style={[
          styles.cardContainer,
          {
            borderRadius: 28,
            borderCurve: 'continuous',
            backgroundColor: colors.card,
            shadowColor: colors.cardShadow,
          },
        ]}
        className="mx-4 my-2 p-4 flex-row items-center justify-between"
      >
        {/* Left: Avatar Circle & Details */}
        <View className="flex-row items-center flex-1 pr-3">
          {/* Avatar Circle */}
          <View
            style={{
              backgroundColor: subject.color,
              shadowColor: subject.color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 5,
              flexShrink: 0,
            }}
            className="w-12 h-12 rounded-full items-center justify-center mr-3.5"
          >
            <SubjectDuotoneIcon name={subject.name} code={subject.code} size={24} />
          </View>

          {/* Name, Code, and Attended Ratio */}
          <View className="flex-1">
            <Text
              style={[
                styles.titleText,
                { letterSpacing: -0.3, color: colors.text },
              ]}
              className="text-[17px] font-bold"
              numberOfLines={1}
            >
              {subject.name}
            </Text>
            <Text
              style={[
                styles.sfText,
                { letterSpacing: 0.1, color: colors.textMuted },
              ]}
              className="text-[13px] mt-0.5"
            >
              {subject.code || 'No code'}
            </Text>
            <Text
              style={[
                styles.sfText,
                { letterSpacing: 0, color: colors.textDim, fontVariant: ['tabular-nums'] },
              ]}
              className="text-[12px] mt-1"
            >
              {attended}/{totalHeld} attended
            </Text>
          </View>
        </View>

        {/* Right: Percentage & Status Buffer Badge */}
        <View style={{ flexShrink: 0 }} className="items-end justify-center">
          <Text
            style={[
              styles.percentageText,
              { color: statusColor, letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
            ]}
            className="text-[26px] font-bold"
          >
            {isZeroState ? '—%' : `${Math.round(percentage)}%`}
          </Text>
          <View
            style={{
              backgroundColor: badgeBg,
              borderRadius: 999,
              borderCurve: 'continuous',
            }}
            className="px-2.5 py-0.5 mt-1"
          >
            <Text
              style={[
                styles.badgeText,
                { color: statusColor, letterSpacing: 0.1, fontVariant: ['tabular-nums'] },
              ]}
              className="text-[11px] font-bold"
            >
              {isZeroState ? 'No classes yet' : statusLabel}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  titleText: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Figtree_700Bold',
      default: undefined,
    }),
  },
  percentageText: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Figtree_800ExtraBold',
      default: undefined,
    }),
    fontWeight: '800',
  },
  sfText: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Figtree_500Medium',
      default: undefined,
    }),
  },
  badgeText: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Figtree_700Bold',
      default: undefined,
    }),
  },
});
