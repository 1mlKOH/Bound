import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Session, Subject, AttendanceStatus } from '../types';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ActionPressButtonProps {
  onPress: () => void;
  selectedClass: string;
  textClass: string;
  label: string;
  marginClass?: string;
}

const ActionPressButton: React.FC<ActionPressButtonProps> = ({
  onPress,
  selectedClass,
  textClass,
  label,
  marginClass = '',
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
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

  return (
    <Animated.View
      style={{ flex: 1, transform: [{ scale }] }}
      className={marginClass}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[
          styles.actionButton,
          {
            borderRadius: 16,
            borderCurve: 'continuous',
          },
        ]}
        className={`py-2.5 items-center justify-center ${selectedClass}`}
      >
        <Text
          style={styles.sfText}
          className={`text-xs font-semibold ${textClass}`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

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

  const handleMark = (status: AttendanceStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMark(status);
  };

  const renderCollapsedBadge = () => {
    if (session.status === 'present') {
      return (
        <View
          style={{ borderRadius: 12, borderCurve: 'continuous' }}
          className="flex-row items-center space-x-1.5 px-3 py-1.5 border border-emerald-400/40 bg-emerald-500/15"
        >
          <Text style={styles.sfText} className="text-xs font-semibold text-[#3DDC84]">
            Present
          </Text>
          <Text className="text-xs text-[#3DDC84]">⌄</Text>
        </View>
      );
    }
    if (session.status === 'absent') {
      return (
        <View
          style={{ borderRadius: 12, borderCurve: 'continuous' }}
          className="flex-row items-center space-x-1.5 px-3 py-1.5 border border-rose-400/40 bg-[#D6336C]"
        >
          <Text style={styles.sfText} className="text-xs font-semibold text-white">
            Absent
          </Text>
          <Text className="text-xs text-white">⌄</Text>
        </View>
      );
    }
    if (session.status === 'cancelled') {
      return (
        <View
          style={{ borderRadius: 12, borderCurve: 'continuous' }}
          className="flex-row items-center space-x-1.5 px-3 py-1.5 bg-white/[0.10] border border-white/[0.08]"
        >
          <Text style={styles.sfText} className="text-xs font-semibold text-zinc-400">
            Cancelled
          </Text>
          <Text className="text-xs text-zinc-400">⌄</Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center space-x-1.5">
        <Text style={styles.sfText} className="text-xs font-medium text-white/50">
          Tap to mark
        </Text>
        <Text className="text-xs text-white/50">{isExpanded ? '⌃' : '⌄'}</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderRadius: 24,
          borderCurve: 'continuous',
        },
      ]}
      className="mx-4 my-1.5 p-4 bg-[#1B1C22]"
    >
      {/* Header Row */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          Haptics.selectionAsync();
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsExpanded(!isExpanded);
        }}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center space-x-3 flex-1">
          {/* Subject Color Dot with subtle specular rim */}
          <View
            style={{
              backgroundColor: subjectColor,
              shadowColor: subjectColor,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.5,
              shadowRadius: 3,
            }}
            className="w-3.5 h-3.5 rounded-full mr-3"
          />
          <View>
            <Text
              style={[
                styles.titleText,
                { letterSpacing: -0.2 },
              ]}
              className="text-[16px] font-semibold text-white"
            >
              {title}
            </Text>
            <Text
              style={[
                styles.sfText,
                { letterSpacing: 0.1 },
              ]}
              className="text-[12px] text-white/50 mt-0.5"
            >
              {session.startTime} - {session.endTime}
            </Text>
          </View>
        </View>

        {/* Right side Badge / Chevron */}
        <View>{renderCollapsedBadge()}</View>
      </TouchableOpacity>

      {/* Expanded Actions Row */}
      {isExpanded && (
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-white/[0.08] space-x-2">
          {/* Present Button */}
          <ActionPressButton
            label="Present"
            marginClass="mr-1.5"
            onPress={() => handleMark('present')}
            selectedClass={
              session.status === 'present'
                ? 'bg-emerald-500/20 border border-emerald-400/50'
                : 'bg-white/[0.06] border border-white/[0.08]'
            }
            textClass={
              session.status === 'present' ? 'text-[#3DDC84]' : 'text-zinc-300'
            }
          />

          {/* Absent Button */}
          <ActionPressButton
            label="Absent"
            marginClass="mx-1.5"
            onPress={() => handleMark('absent')}
            selectedClass={
              session.status === 'absent'
                ? 'bg-[#D6336C] border border-rose-400/50'
                : 'bg-white/[0.06] border border-white/[0.08]'
            }
            textClass={
              session.status === 'absent' ? 'text-white' : 'text-zinc-300'
            }
          />

          {/* Cancelled Button */}
          <ActionPressButton
            label="Cancelled"
            marginClass="ml-1.5"
            onPress={() => handleMark('cancelled')}
            selectedClass={
              session.status === 'cancelled'
                ? 'bg-[#4A5568] border border-zinc-500/50'
                : 'bg-white/[0.06] border border-white/[0.08]'
            }
            textClass={
              session.status === 'cancelled' ? 'text-white' : 'text-zinc-300'
            }
          />
        </View>
      )}

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
  actionButton: {
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
