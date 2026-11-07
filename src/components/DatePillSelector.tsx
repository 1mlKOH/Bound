import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

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
  const isToday = selectedDate === todayDate;

  const stepDay = (delta: number) => {
    Haptics.selectionAsync();
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
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
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="flex-row items-center justify-center space-x-2 my-2">
      {/* Left Chevron */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => stepDay(-1)}
        style={[
          styles.glassCapsule,
          {
            borderRadius: 18,
            borderCurve: 'continuous',
          },
        ]}
        className="w-10 h-9 bg-white/[0.08] border border-white/[0.12] items-center justify-center mr-1"
      >
        <ChevronLeftIcon size={16} color="rgba(255, 255, 255, 0.85)" strokeWidth={2.4} />
      </TouchableOpacity>

      {/* Center Pill */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleResetToday}
        style={[
          styles.glassCapsule,
          {
            borderRadius: 18,
            borderCurve: 'continuous',
          },
        ]}
        className="px-6 h-9 bg-white/[0.08] border border-white/[0.12] items-center justify-center min-w-[100px]"
      >
        <Text
          style={[
            styles.dateText,
            {
              letterSpacing: -0.2,
            },
          ]}
          className="text-[13px] font-semibold text-white"
        >
          {formatDisplay()}
        </Text>
      </TouchableOpacity>

      {/* Right Chevron */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => stepDay(1)}
        style={[
          styles.glassCapsule,
          {
            borderRadius: 18,
            borderCurve: 'continuous',
          },
        ]}
        className="w-10 h-9 bg-white/[0.08] border border-white/[0.12] items-center justify-center ml-1"
      >
        <ChevronRightIcon size={16} color="rgba(255, 255, 255, 0.85)" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCapsule: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
  },
  dateText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});

