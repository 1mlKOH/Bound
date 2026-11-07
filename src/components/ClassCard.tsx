import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Session, Subject, AttendanceStatus } from '../types';

interface ClassCardProps {
  session: Session;
  subject?: Subject;
  primaryLabel?: 'name' | 'code';
  onMark: (status: AttendanceStatus) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  session,
  subject,
  primaryLabel = 'name',
  onMark,
}) => {
  const [isExpanded, setIsExpanded] = useState(session.status === null);

  const title =
    primaryLabel === 'code' && subject?.code
      ? subject.code
      : subject?.name || 'Unknown Class';

  const subjectColor = subject?.color || '#1FB45A';

  const renderCollapsedBadge = () => {
    if (session.status === 'present') {
      return (
        <View className="flex-row items-center space-x-1.5 px-3 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10">
          <Text className="text-xs font-semibold text-[#3DDC84]">Present</Text>
          <Text className="text-xs text-[#3DDC84]">⌄</Text>
        </View>
      );
    }
    if (session.status === 'absent') {
      return (
        <View className="flex-row items-center space-x-1.5 px-3 py-1.5 rounded-full border border-rose-500/50 bg-[#D6336C]">
          <Text className="text-xs font-semibold text-white">Absent</Text>
          <Text className="text-xs text-white">⌄</Text>
        </View>
      );
    }
    if (session.status === 'cancelled') {
      return (
        <View className="flex-row items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#2A2B33]">
          <Text className="text-xs font-semibold text-zinc-400">Cancelled</Text>
          <Text className="text-xs text-zinc-400">⌄</Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center space-x-1.5">
        <Text className="text-xs font-medium text-zinc-400">Tap to mark</Text>
        <Text className="text-xs text-zinc-400">{isExpanded ? '⌃' : '⌄'}</Text>
      </View>
    );
  };

  return (
    <View className="mx-4 my-1.5 p-4 rounded-[24px] bg-[#1B1C22] border border-[#282932]">
      {/* Header Row */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center space-x-3 flex-1">
          {/* Subject Color Dot */}
          <View
            style={{ backgroundColor: subjectColor }}
            className="w-3.5 h-3.5 rounded-full mr-3"
          />
          <View>
            <Text className="text-base font-bold text-white tracking-tight">
              {title}
            </Text>
            <Text className="text-xs text-zinc-400 mt-0.5">
              {session.startTime} - {session.endTime}
            </Text>
          </View>
        </View>

        {/* Right side Badge / Chevron */}
        <View>{renderCollapsedBadge()}</View>
      </TouchableOpacity>

      {/* Expanded Actions Row */}
      {isExpanded && (
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-zinc-800/80 space-x-2">
          {/* Present Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onMark('present')}
            className={`flex-1 py-2.5 rounded-full items-center justify-center mr-1.5 ${
              session.status === 'present'
                ? 'bg-emerald-500/20 border border-emerald-400'
                : 'bg-[#262730]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                session.status === 'present' ? 'text-[#3DDC84]' : 'text-zinc-300'
              }`}
            >
              Present
            </Text>
          </TouchableOpacity>

          {/* Absent Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onMark('absent')}
            className={`flex-1 py-2.5 rounded-full items-center justify-center mx-1.5 ${
              session.status === 'absent' ? 'bg-[#D6336C]' : 'bg-[#262730]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                session.status === 'absent' ? 'text-white' : 'text-zinc-300'
              }`}
            >
              Absent
            </Text>
          </TouchableOpacity>

          {/* Cancelled Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onMark('cancelled')}
            className={`flex-1 py-2.5 rounded-full items-center justify-center ml-1.5 ${
              session.status === 'cancelled' ? 'bg-[#4A5568]' : 'bg-[#262730]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                session.status === 'cancelled' ? 'text-white' : 'text-zinc-300'
              }`}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
