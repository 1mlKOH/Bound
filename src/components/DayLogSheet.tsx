import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Haptics } from '../utils/haptics';
import { useTheme } from '../utils/theme';
import { fontFamilyNames } from '../utils/typography';
import { Session, Subject, Holiday } from '../types';
import { CloseIcon } from './icons';
import { getTodayDateString } from '../domain/attendance';

export interface DayLogSheetProps {
  visible: boolean;
  dateStr: string | null;
  sessions: Session[];
  subjectsMap: Map<string, Subject>;
  holidays?: Holiday[];
  todayDate?: string;
  onClose: () => void;
}

function formatLongDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${days[date.getUTCDay()]}, ${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export const DayLogSheet: React.FC<DayLogSheetProps> = ({
  visible,
  dateStr,
  sessions = [],
  subjectsMap,
  holidays = [],
  todayDate = getTodayDateString(),
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [mounted, setMounted] = useState(visible);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(350)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 24,
          stiffness: 300,
          mass: 0.7,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 350,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
      });
    }
  }, [visible]);

  const handleDismiss = () => {
    Haptics.selectionAsync();
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 350,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMounted(false);
      onClose();
    });
  };

  if (!mounted || !dateStr) {
    return null;
  }

  const isToday = dateStr === todayDate;
  const longDateLabel = formatLongDate(dateStr);
  const holiday = holidays.find((h) => h.date === dateStr);

  // Compute daily outcome summary
  const attendedCount = sessions.filter((s) => s.status === 'present').length;
  const absentCount = sessions.filter((s) => s.status === 'absent').length;
  const cancelledCount = sessions.filter((s) => s.status === 'cancelled').length;
  const heldCount = attendedCount + absentCount;

  let summaryBadgeText = '';
  let summaryBadgeBg = colors.actionBg;
  let summaryBadgeTextColor = colors.textSecondary;

  if (holiday) {
    summaryBadgeText = `Holiday · ${holiday.label || 'Observed'}`;
    summaryBadgeBg = isDark ? 'rgba(255, 176, 32, 0.16)' : 'rgba(217, 119, 6, 0.12)';
    summaryBadgeTextColor = isDark ? '#FFB020' : '#D97706';
  } else if (sessions.length === 0) {
    summaryBadgeText = 'No classes held';
    summaryBadgeBg = colors.actionBg;
    summaryBadgeTextColor = colors.textMuted;
  } else if (heldCount > 0 && absentCount === 0) {
    summaryBadgeText = `All attended (${attendedCount}/${attendedCount})`;
    summaryBadgeBg = colors.presentBadgeBg;
    summaryBadgeTextColor = colors.presentBadgeText;
  } else if (absentCount > 0) {
    summaryBadgeText = `${attendedCount} attended · ${absentCount} missed`;
    summaryBadgeBg = colors.absentBadgeBg;
    summaryBadgeTextColor = colors.absentBadgeText;
  } else if (cancelledCount === sessions.length) {
    summaryBadgeText = 'All classes cancelled';
    summaryBadgeBg = colors.cancelledBadgeBg;
    summaryBadgeTextColor = colors.cancelledBadgeText;
  } else {
    summaryBadgeText = `${sessions.length} class${sessions.length > 1 ? 'es' : ''} scheduled`;
    summaryBadgeBg = colors.actionBg;
    summaryBadgeTextColor = colors.textSecondary;
  }

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={StyleSheet.absoluteFill} className="justify-end">
        {/* Dimmed Backdrop */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Slide-Up Bottom Sheet Card */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderCurve: 'continuous',
              paddingBottom: Math.max(insets.bottom, 20) + 12,
              transform: [{ translateY: slideAnim }],
              maxHeight: '80%',
            },
          ]}
          className="px-5 pt-3"
        >
          {/* Top Grab Handle Pill */}
          <View
            style={{
              width: 38,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.16)',
              alignSelf: 'center',
              marginBottom: 12,
            }}
          />

          {/* Sheet Header: Date + Today Tag + Close Button */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 pr-2">
              <Text
                style={[
                  styles.sfText,
                  {
                    fontFamily: fontFamilyNames.bold,
                    color: colors.text,
                    letterSpacing: -0.3,
                  },
                ]}
                className="text-[17px] font-bold"
                numberOfLines={1}
              >
                {longDateLabel}
              </Text>
              {isToday && (
                <View
                  style={{
                    backgroundColor: colors.presentBadgeBg,
                    borderRadius: 6,
                  }}
                  className="ml-2 px-1.5 py-0.5"
                >
                  <Text
                    style={[
                      styles.sfText,
                      {
                        fontFamily: fontFamilyNames.bold,
                        color: colors.presentBadgeText,
                      },
                    ]}
                    className="text-[10px] font-bold uppercase tracking-wider"
                  >
                    Today
                  </Text>
                </View>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.actionBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloseIcon size={13} color={colors.textSecondary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Outcome Summary Tag */}
          <View className="flex-row items-center mb-3">
            <View
              style={{
                backgroundColor: summaryBadgeBg,
                borderRadius: 999,
              }}
              className="px-2.5 py-1"
            >
              <Text
                style={[
                  styles.sfText,
                  {
                    fontFamily: fontFamilyNames.semiBold,
                    color: summaryBadgeTextColor,
                    letterSpacing: -0.1,
                  },
                ]}
                className="text-xs font-semibold"
              >
                {summaryBadgeText}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.08)] mb-2" />

          {/* Sessions List (Read-Only Log) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {sessions.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <Text
                  style={[
                    styles.sfText,
                    {
                      fontFamily: fontFamilyNames.bold,
                      color: colors.text,
                      letterSpacing: -0.2,
                    },
                  ]}
                  className="text-base font-bold mb-1"
                >
                  {holiday ? `Holiday: ${holiday.label}` : 'No lectures recorded'}
                </Text>
                <Text
                  style={[
                    styles.sfText,
                    {
                      fontFamily: fontFamilyNames.medium,
                      color: colors.textMuted,
                    },
                  ]}
                  className="text-xs text-center px-6"
                >
                  {holiday
                    ? 'Classes were suspended for this observed holiday.'
                    : 'No lectures were scheduled or logged on this date.'}
                </Text>
              </View>
            ) : (
              sessions.map((ses, idx) => {
                const sub = subjectsMap.get(ses.subjectId);
                const subColor = sub?.color || '#30D158';
                const subName = sub?.name || 'Class';
                const isLast = idx === sessions.length - 1;

                const timeStr = ses.startTime && ses.endTime
                  ? `${ses.startTime} – ${ses.endTime}`
                  : ses.startTime || '';

                const status = ses.status;

                return (
                  <View
                    key={ses.id}
                    style={{
                      borderBottomColor: colors.divider,
                      borderBottomWidth: isLast ? 0 : 1,
                    }}
                    className="flex-row items-center justify-between py-3.5"
                  >
                    {/* Left: Color dot + Subject name + Scheduled time */}
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center mb-1">
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: subColor,
                            marginRight: 8,
                          }}
                        />
                        <Text
                          style={[
                            styles.sfText,
                            {
                              fontFamily: fontFamilyNames.bold,
                              color: colors.text,
                              letterSpacing: -0.2,
                            },
                          ]}
                          className="text-[15px] font-bold"
                          numberOfLines={1}
                        >
                          {subName}
                        </Text>
                      </View>

                      <View className="flex-row items-center ml-4">
                        {timeStr ? (
                          <Text
                            style={[
                              styles.sfText,
                              {
                                fontFamily: fontFamilyNames.medium,
                                color: colors.textMuted,
                              },
                            ]}
                            className="text-xs font-medium"
                          >
                            {timeStr}
                          </Text>
                        ) : null}
                        {ses.slotId === null && (
                          <Text
                            style={[
                              styles.sfText,
                              {
                                fontFamily: fontFamilyNames.semiBold,
                                color: isDark ? '#FFB020' : '#D97706',
                              },
                            ]}
                            className="text-[11px] font-semibold ml-2"
                          >
                            Extra class
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Right: Read-Only Status Badge (Non-clickable Pure Log) */}
                    <View
                      style={{
                        borderRadius: 10,
                        borderCurve: 'continuous',
                        backgroundColor:
                          status === 'present'
                            ? colors.presentBadgeBg
                            : status === 'absent'
                            ? colors.absentBadgeBg
                            : status === 'cancelled'
                            ? colors.cancelledBadgeBg
                            : colors.actionBg,
                      }}
                      className="px-3 py-1.5 items-center justify-center min-w-[76px]"
                    >
                      <Text
                        style={[
                          styles.sfText,
                          {
                            fontFamily: fontFamilyNames.bold,
                            color:
                              status === 'present'
                                ? colors.presentBadgeText
                                : status === 'absent'
                                ? colors.absentBadgeText
                                : status === 'cancelled'
                                ? colors.cancelledBadgeText
                                : colors.textMuted,
                            letterSpacing: -0.1,
                          },
                        ]}
                        className="text-xs font-bold capitalize"
                      >
                        {status || 'Unmarked'}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  sfText: {
    fontFamily: fontFamilyNames.semiBold,
    includeFontPadding: false,
  },
});
