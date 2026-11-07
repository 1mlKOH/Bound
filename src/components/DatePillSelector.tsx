import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    const nextStr = date.toISOString().slice(0, 10);
    onSelectDate(nextStr);
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
        className="w-10 h-9 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center mr-1"
      >
        <ChevronLeftIcon size={16} color="#D4D4D8" strokeWidth={2.4} />
      </TouchableOpacity>

      {/* Center Pill */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelectDate(todayDate)}
        className="px-6 h-9 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center min-w-[100px]"
      >
        <Text className="text-sm font-bold text-white tracking-wide">
          {formatDisplay()}
        </Text>
      </TouchableOpacity>

      {/* Right Chevron */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => stepDay(1)}
        className="w-10 h-9 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center ml-1"
      >
        <ChevronRightIcon size={16} color="#D4D4D8" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
};

