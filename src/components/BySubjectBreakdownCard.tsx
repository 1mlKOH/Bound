import React from 'react';
import { View, Text } from 'react-native';
import { SubjectStats } from '../types';

interface BySubjectBreakdownCardProps {
  statsList: SubjectStats[];
}

export const BySubjectBreakdownCard: React.FC<BySubjectBreakdownCardProps> = ({
  statsList,
}) => {
  // Sort lowest attendance first as shown in screenshot 1
  const sortedStats = [...statsList].sort((a, b) => a.percentage - b.percentage);

  return (
    <View className="mx-4 my-3 p-5 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
      {/* Title & Sorting Caption */}
      <Text className="text-lg font-bold text-white tracking-tight">By Subject</Text>
      <Text className="text-xs text-zinc-400 mt-0.5 mb-4">
        Sorted lowest attendance first
      </Text>

      {/* Subject rows */}
      {sortedStats.map((item, index) => {
        const { subject, attended, totalHeld, percentage, isSafe, isClose, statusLabel } =
          item;

        const statusColor = isSafe
          ? '#3DDC84'
          : isClose
          ? '#FFB020'
          : '#FF6B72';

        const progressWidth = `${Math.min(100, Math.max(0, percentage))}%`;

        return (
          <View
            key={subject.id}
            className={`py-3.5 ${
              index < sortedStats.length - 1 ? 'border-b border-zinc-800/60' : ''
            }`}
          >
            {/* Header: Dot + Name + Percentage */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1 pr-2">
                <View
                  style={{ backgroundColor: subject.color }}
                  className="w-3.5 h-3.5 rounded-full mr-2.5"
                />
                <Text
                  className="text-base font-bold text-white tracking-tight"
                  numberOfLines={1}
                >
                  {subject.name}
                </Text>
              </View>
              <Text
                style={{ color: statusColor }}
                className="text-base font-black tracking-tight"
              >
                {Math.round(percentage)}%
              </Text>
            </View>

            {/* Progress Bar Track */}
            <View className="w-full h-1.5 bg-[#282932] rounded-full overflow-hidden my-1">
              <View
                style={{
                  width: progressWidth as any,
                  backgroundColor: statusColor,
                  height: '100%',
                  borderRadius: 999,
                }}
              />
            </View>

            {/* Sub-label: Attended on left, Buffer/Recovery on right */}
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-xs text-zinc-400">
                {attended}/{totalHeld} attended
              </Text>
              <Text
                style={{ color: statusColor }}
                className="text-xs font-semibold"
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
