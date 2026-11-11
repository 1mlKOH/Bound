import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, Animated } from 'react-native';
import { Haptics } from '../utils/haptics';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useTheme } from '../utils/theme';

interface DatePillSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  todayDate?: string;
  onSelectDate: (dateStr: string) => void;
}

export const DatePillSelector: React.FC<DatePillSelectorProps> = ({
  selectedDate,
  todayDate = '2026-11-07',
  onSelectDate,
}) => {
  const { colors } = useTheme();
  const isToday = selectedDate === todayDate;

  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;
  const centerScale = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    textFade.setValue(0.5);
    Animated.timing(textFade, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    }).start();
  }, [selectedDate]);

  const animatePress = (val: Animated.Value, target: number) => {
    Animated.spring(val, {
      toValue: target,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const stepDay = (delta: number) => {
    Haptics.selectionAsync();
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + delta));
    const nextStr = date.toISOString().slice(0, 10);
    onSelectDate(nextStr);
  };

  const handleResetToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(todayDate);
  };

  const formatDisplay = () => {
    if (isToday) return 'Today';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString(undefined, {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="flex-row items-center justify-center space-x-2 my-2">
      {/* Left Chevron */}
      <Animated.View style={{ transform: [{ scale: leftScale }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 6 }}
          onPressIn={() => animatePress(leftScale, 0.92)}
          onPressOut={() => animatePress(leftScale, 1)}
          onPress={() => stepDay(-1)}
          style={[
            styles.glassCapsule,
            {
              borderRadius: 18,
              borderCurve: 'continuous',
              backgroundColor: colors.glassBg,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="w-10 h-9 items-center justify-center mr-1"
        >
          <ChevronLeftIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
        </TouchableOpacity>
      </Animated.View>

      {/* Center Pill */}
      <Animated.View style={{ transform: [{ scale: centerScale }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          onPressIn={() => animatePress(centerScale, 0.95)}
          onPressOut={() => animatePress(centerScale, 1)}
          onPress={handleResetToday}
          style={[
            styles.glassCapsule,
            {
              borderRadius: 18,
              borderCurve: 'continuous',
              backgroundColor: colors.glassBg,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="px-6 h-9 items-center justify-center min-w-[100px]"
        >
          <Animated.Text
            style={[
              styles.dateText,
              {
                letterSpacing: -0.2,
                color: colors.text,
                opacity: textFade,
              },
            ]}
            className="text-[13px] font-semibold"
          >
            {formatDisplay()}
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Right Chevron */}
      <Animated.View style={{ transform: [{ scale: rightScale }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
          onPressIn={() => animatePress(rightScale, 0.92)}
          onPressOut={() => animatePress(rightScale, 1)}
          onPress={() => stepDay(1)}
          style={[
            styles.glassCapsule,
            {
              borderRadius: 18,
              borderCurve: 'continuous',
              backgroundColor: colors.glassBg,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="w-10 h-9 items-center justify-center ml-1"
        >
          <ChevronRightIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCapsule: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
