import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
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
    <View
      style={[
        styles.cardContainer,
        {
          borderRadius: 28,
          borderCurve: 'continuous',
        },
      ]}
      className="mx-4 my-3 p-5 bg-[#1B1C22]"
    >
      {/* Title & Sorting Caption */}
      <Text
        style={[
          styles.sfText,
          { letterSpacing: -0.4 },
        ]}
        className="text-[20px] font-bold text-white"
      >
        By Subject
      </Text>
      <Text
        style={[
          styles.sfText,
          { letterSpacing: 0.1 },
        ]}
        className="text-[13px] text-white/50 mt-0.5 mb-4"
      >
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
              index < sortedStats.length - 1 ? 'border-b border-white/[0.06]' : ''
            }`}
          >
            {/* Header: Dot + Name + Percentage */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1 pr-2">
                <View
                  style={{
                    backgroundColor: subject.color,
                    shadowColor: subject.color,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.4,
                    shadowRadius: 3,
                  }}
                  className="w-3.5 h-3.5 rounded-full mr-2.5"
                />
                <Text
                  style={[
                    styles.sfText,
                    { letterSpacing: -0.2 },
                  ]}
                  className="text-[16px] font-semibold text-white"
                  numberOfLines={1}
                >
                  {subject.name}
                </Text>
              </View>
              <Text
                style={[
                  styles.sfText,
                  { color: statusColor, letterSpacing: -0.4 },
                ]}
                className="text-[16px] font-bold"
              >
                {Math.round(percentage)}%
              </Text>
            </View>

            {/* Progress Bar Track */}
            <View className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden my-1">
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
              <Text
                style={[
                  styles.sfText,
                  { letterSpacing: 0 },
                ]}
                className="text-[12px] text-white/40"
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
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.18)', // Apple specular highlight
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
