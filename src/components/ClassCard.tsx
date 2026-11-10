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
import { Haptics } from '../utils/haptics';
import { Session, Subject, AttendanceStatus } from '../types';
import { useTheme } from '../utils/theme';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  CircleXIcon,
  CircleMinusIcon,
} from './icons';
import { SubjectDuotoneIcon } from './icons/SubjectDuotoneIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ActionPressButtonProps {
  onPress: () => void;
  label: string;
  buttonStyle: any;
  textStyle: any;
  marginClass?: string;
  icon?: React.ReactNode;
}

const ActionPressButton: React.FC<ActionPressButtonProps> = ({
  onPress,
  label,
  buttonStyle,
  textStyle,
  marginClass = '',
  icon,
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
          buttonStyle,
        ]}
        className="py-2.5 flex-row items-center justify-center"
      >
        {icon && <View className="mr-1.5">{icon}</View>}
        <Text
          style={[styles.sfText, textStyle]}
          className="text-xs font-semibold"
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
  const { colors, isDark } = useTheme();
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
          style={{
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: colors.presentBadgeBg,
          }}
          className="flex-row items-center px-2.5 py-1"
        >
          <View className="mr-1.5">
            <CircleCheckIcon size={12} color={colors.presentBadgeText} />
          </View>
          <Text
            style={[styles.sfText, { color: colors.presentBadgeText }]}
            className="text-xs font-semibold"
          >
            Present
          </Text>
        </View>
      );
    }
    if (session.status === 'absent') {
      return (
        <View
          style={{
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: colors.absentBadgeBg,
          }}
          className="flex-row items-center px-2.5 py-1"
        >
          <View className="mr-1.5">
            <CircleXIcon size={12} color={colors.absentBadgeText} />
          </View>
          <Text
            style={[styles.sfText, { color: colors.absentBadgeText }]}
            className="text-xs font-semibold"
          >
            Absent
          </Text>
        </View>
      );
    }
    if (session.status === 'cancelled') {
      return (
        <View
          style={{
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: colors.cancelledBadgeBg,
          }}
          className="flex-row items-center px-2.5 py-1"
        >
          <View className="mr-1.5">
            <CircleMinusIcon size={12} color={colors.cancelledBadgeText} />
          </View>
          <Text
            style={[styles.sfText, { color: colors.cancelledBadgeText }]}
            className="text-xs font-semibold"
          >
            Cancelled
          </Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center space-x-1">
        <Text
          style={[styles.sfText, { color: colors.textMuted }]}
          className="text-xs font-medium mr-1"
        >
          Tap to mark
        </Text>
        {isExpanded ? (
          <ChevronUpIcon size={14} color={colors.textMuted} />
        ) : (
          <ChevronDownIcon size={14} color={colors.textMuted} />
        )}
      </View>
    );
  };

  const headerScale = useRef(new Animated.Value(1)).current;

  const onHeaderPressIn = () => {
    Animated.timing(headerScale, {
      toValue: 0.985,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onHeaderPressOut = () => {
    Animated.spring(headerScale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const toggleExpand = () => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setIsExpanded(!isExpanded);
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          borderRadius: 24,
          borderCurve: 'continuous',
          backgroundColor: colors.card,
          shadowColor: colors.cardShadow,
          transform: [{ scale: headerScale }],
        },
      ]}
      className="mx-4 my-1.5 p-4"
    >
      {/* Header Row */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={onHeaderPressIn}
        onPressOut={onHeaderPressOut}
        onPress={toggleExpand}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center space-x-3 flex-1">
          {/* Subject Color Icon Badge */}
          <View
            style={{
              backgroundColor: subjectColor,
              borderRadius: 14,
              borderCurve: 'continuous',
              shadowColor: subjectColor,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              flexShrink: 0,
            }}
            className="w-10 h-10 items-center justify-center mr-3"
          >
            <SubjectDuotoneIcon
              name={subject?.name || title}
              code={subject?.code}
              size={20}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
            <Text
              style={[
                styles.titleText,
                { letterSpacing: -0.2, color: colors.text },
              ]}
              className="text-[16px] font-semibold"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <Text
              style={[
                styles.sfText,
                { letterSpacing: 0.1, color: colors.textMuted },
              ]}
              className="text-[12px] mt-0.5"
            >
              {session.startTime} - {session.endTime}
            </Text>
          </View>
        </View>

        {/* Right side Badge / Chevron */}
        <View style={{ flexShrink: 0 }}>{renderCollapsedBadge()}</View>
      </TouchableOpacity>

      {/* Expanded Actions Row */}
      {isExpanded && (
        <View
          style={{ borderTopColor: colors.divider }}
          className="flex-row items-center justify-between mt-4 pt-3 border-t space-x-2"
        >
          {/* Present Button */}
          <ActionPressButton
            label="Present"
            icon={
              <CircleCheckIcon
                size={13}
                color={
                  session.status === 'present'
                    ? colors.presentBadgeText
                    : colors.textSecondary
                }
              />
            }
            marginClass="mr-1.5"
            onPress={() => handleMark('present')}
            buttonStyle={{
              backgroundColor:
                session.status === 'present'
                  ? colors.presentBadgeBg
                  : colors.actionBg,
            }}
            textStyle={{
              color:
                session.status === 'present'
                  ? colors.presentBadgeText
                  : colors.textSecondary,
            }}
          />

          {/* Absent Button */}
          <ActionPressButton
            label="Absent"
            icon={
              <CircleXIcon
                size={13}
                color={
                  session.status === 'absent'
                    ? colors.absentBadgeText
                    : colors.textSecondary
                }
              />
            }
            marginClass="mx-1.5"
            onPress={() => handleMark('absent')}
            buttonStyle={{
              backgroundColor:
                session.status === 'absent'
                  ? colors.absentBadgeBg
                  : colors.actionBg,
            }}
            textStyle={{
              color:
                session.status === 'absent'
                  ? colors.absentBadgeText
                  : colors.textSecondary,
            }}
          />

          {/* Cancelled Button */}
          <ActionPressButton
            label="Cancelled"
            icon={
              <CircleMinusIcon
                size={13}
                color={
                  session.status === 'cancelled'
                    ? colors.cancelledBadgeText
                    : colors.textSecondary
                }
              />
            }
            marginClass="ml-1.5"
            onPress={() => handleMark('cancelled')}
            buttonStyle={{
              backgroundColor:
                session.status === 'cancelled'
                  ? colors.cancelledBadgeBg
                  : colors.actionBg,
            }}
            textStyle={{
              color:
                session.status === 'cancelled'
                  ? colors.cancelledBadgeText
                  : colors.textSecondary,
            }}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  actionButton: {},
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
