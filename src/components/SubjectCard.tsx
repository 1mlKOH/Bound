import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SubjectStats } from '../types';

interface SubjectCardProps {
  stats: SubjectStats;
  onPress: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ stats, onPress }) => {
  const { subject, attended, totalHeld, percentage, isSafe, isClose, statusLabel } =
    stats;

  const initial = subject.name.trim().charAt(0).toUpperCase();

  const statusColor = isSafe
    ? '#3DDC84'
    : isClose
    ? '#FFB020'
    : '#FF6B72';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mx-4 my-2 p-4 rounded-[28px] bg-[#1B1C22] border border-[#282932] flex-row items-center justify-between"
    >
      {/* Left: Avatar Circle & Details */}
      <View className="flex-row items-center flex-1 pr-3">
        {/* Avatar Circle */}
        <View
          style={{ backgroundColor: subject.color }}
          className="w-12 h-12 rounded-full items-center justify-center mr-3.5"
        >
          <Text className="text-xl font-bold text-white">{initial}</Text>
        </View>

        {/* Name, Code, and Attended Ratio */}
        <View className="flex-1">
          <Text className="text-base font-bold text-white tracking-tight" numberOfLines={1}>
            {subject.name}
          </Text>
          <Text className="text-xs text-zinc-400 mt-0.5">
            {subject.code || 'No code'}
          </Text>
          <Text className="text-xs text-zinc-500 mt-1">
            {attended}/{totalHeld} attended
          </Text>
        </View>
      </View>

      {/* Right: Percentage & Status Buffer Chip */}
      <View className="items-end justify-center">
        <Text
          style={{ color: statusColor }}
          className="text-2xl font-black tracking-tight"
        >
          {Math.round(percentage)}%
        </Text>
        <Text
          style={{ color: statusColor }}
          className="text-xs font-semibold mt-1"
        >
          {statusLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
