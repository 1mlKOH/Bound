import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
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

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.cardContainer,
        {
          borderRadius: 24,
          borderCurve: 'continuous',
        },
      ]}
      className="mx-4 my-2 p-4 bg-[#1B1C22] flex-row items-center justify-between"
    >
      {/* Left: Avatar Circle & Details */}
      <View className="flex-row items-center flex-1 pr-3">
        {/* Avatar Circle with subtle specular rim */}
        <View
          style={{
            backgroundColor: subject.color,
            shadowColor: subject.color,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 5,
          }}
          className="w-12 h-12 rounded-full items-center justify-center mr-3.5 border border-white/20"
        >
          <Text style={styles.sfText} className="text-xl font-bold text-white">
            {initial}
          </Text>
        </View>

        {/* Name, Code, and Attended Ratio */}
        <View className="flex-1">
          <Text
            style={[
              styles.sfText,
              { letterSpacing: -0.3 },
            ]}
            className="text-[17px] font-semibold text-white"
            numberOfLines={1}
          >
            {subject.name}
          </Text>
          <Text
            style={[
              styles.sfText,
              { letterSpacing: 0.1 },
            ]}
            className="text-[13px] text-white/50 mt-0.5"
          >
            {subject.code || 'No code'}
          </Text>
          <Text
            style={[
              styles.sfText,
              { letterSpacing: 0 },
            ]}
            className="text-[12px] text-white/40 mt-1"
          >
            {attended}/{totalHeld} attended
          </Text>
        </View>
      </View>

      {/* Right: Percentage & Status Buffer Chip */}
      <View className="items-end justify-center">
        <Text
          style={[
            styles.sfText,
            { color: statusColor, letterSpacing: -0.8 },
          ]}
          className="text-[26px] font-bold"
        >
          {Math.round(percentage)}%
        </Text>
        <Text
          style={[
            styles.sfText,
            { color: statusColor, letterSpacing: 0.1 },
          ]}
          className="text-[12px] font-semibold mt-0.5"
        >
          {statusLabel}
        </Text>
      </View>
    </TouchableOpacity>
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
