import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NumberFlow } from 'number-flow-react-native';
import { toast } from 'sonner-native';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { useTheme } from '../../src/utils/theme';
import { Haptics } from '../../src/utils/haptics';
import { ChevronLeftIcon, RefreshIcon, PlusIcon, MinusIcon } from '../../src/components/icons';
import { AttendanceStatus } from '../../src/types';
import { fontFamilyNames } from '../../src/utils/typography';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SubjectDetailStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const subjects = useAttendanceStore((state) => state.subjects);
  const sessions = useAttendanceStore((state) => state.sessions);
  const markSession = useAttendanceStore((state) => state.markSession);
  const settings = useAttendanceStore((state) => state.settings);

  const [activeSubjectId, setActiveSubjectId] = useState<string>(id || subjects[0]?.id || '');

  // What-if simulator deltas
  const [simAttendDelta, setSimAttendDelta] = useState<number>(0);
  const [simSkipDelta, setSimSkipDelta] = useState<number>(0);

  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  }, [subjects, activeSubjectId]);

  const targetPercentage = activeSubject?.targetPct ?? settings.globalTargetPct ?? 75;

  // Filter marked sessions for active subject sorted newest first (most recent marked class on top)
  const markedSessions = useMemo(() => {
    if (!activeSubject) return [];
    return sessions
      .filter(
        (s) =>
          s.subjectId === activeSubject.id &&
          s.status !== null &&
          (s.status === 'present' || s.status === 'absent' || s.status === 'cancelled')
      )
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (b.startTime || '').localeCompare(a.startTime || '');
      });
  }, [sessions, activeSubject]);

  // Base counts
  const actualAttended = useMemo(() => {
    return (
      (activeSubject?.baselinePresent || 0) +
      markedSessions.filter((s) => s.status === 'present').length
    );
  }, [markedSessions, activeSubject]);

  const actualMissed = useMemo(() => {
    return (
      (activeSubject?.baselineAbsent || 0) +
      markedSessions.filter((s) => s.status === 'absent').length
    );
  }, [markedSessions, activeSubject]);

  const actualHeld = useMemo(() => {
    return actualAttended + actualMissed;
  }, [actualAttended, actualMissed]);

  // Simulated counts
  const simAttended = actualAttended + simAttendDelta;
  const simMissed = actualMissed + simSkipDelta;
  const simTotalHeld = actualHeld + simAttendDelta + simSkipDelta;

  const percentage = simTotalHeld > 0 ? (simAttended / simTotalHeld) * 100 : 0;
  const isSimulationActive = simAttendDelta > 0 || simSkipDelta > 0;

  // Buffer and Recovery Math
  const targetFrac = targetPercentage / 100;
  const isSafe = percentage >= targetPercentage;
  const isClose = isSafe && percentage - targetPercentage <= 5;

  let safeSkips = 0;
  let mustAttend = 0;
  let marginText = '';
  let adviceCopy = '';

  if (simTotalHeld === 0) {
    marginText = 'No classes held';
    adviceCopy = 'Start logging attendance once semester sessions begin.';
  } else if (isSafe) {
    if (targetFrac >= 1) {
      safeSkips = 0;
    } else if (targetFrac <= 0) {
      safeSkips = 999;
    } else {
      const allowedMiss = (simAttended - targetFrac * simTotalHeld) / targetFrac;
      safeSkips = Math.max(0, Math.floor(allowedMiss));
    }
    marginText = `+${safeSkips} skips margin`;
    adviceCopy = safeSkips === 0
      ? `On track at ${targetPercentage}%. You cannot skip upcoming lectures without dropping.`
      : `Can skip ${safeSkips} upcoming lecture${safeSkips > 1 ? 's' : ''} and remain at ${targetPercentage}%.`;
  } else {
    if (targetFrac >= 1) {
      mustAttend = 999;
      marginText = 'Cannot reach 100%';
      adviceCopy = 'Missed sessions make 100% attendance mathematically impossible.';
    } else {
      const needed = (targetFrac * simTotalHeld - simAttended) / (1 - targetFrac);
      mustAttend = Math.max(1, Math.ceil(needed));
      marginText = `Need ${mustAttend} classes`;
      adviceCopy = `Attend the next ${mustAttend} lecture${mustAttend > 1 ? 's' : ''} in a row to recover to ${targetPercentage}%.`;
    }
  }

  const statusColor = simTotalHeld === 0
    ? colors.textMuted
    : isSafe
    ? isDark ? '#3DDC84' : '#15803D'
    : isClose
    ? isDark ? '#FFB020' : '#D97706'
    : isDark ? '#FF6B72' : '#DC2626';

  // Fast date formatting without Hermes Intl overhead: "Nov 3  Tue · 11:00"
  const formatSessionLabel = (dateStr: string, time?: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const monthStr = SHORT_MONTHS[m - 1] || '';
    const weekdayStr = SHORT_DAYS[dateObj.getDay()] || '';
    const timeStr = time ? ` · ${time}` : '';
    return `${monthStr} ${d}  ${weekdayStr}${timeStr}`;
  };

  // Quick cycle session status
  const cycleStatus = (sessionId: string, currentStatus: AttendanceStatus) => {
    let nextStatus: AttendanceStatus = 'present';
    if (currentStatus === 'present') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'cancelled';
    else if (currentStatus === 'cancelled') nextStatus = 'present';
    else nextStatus = 'present';

    Haptics.selectionAsync();
    markSession(sessionId, nextStatus);

    const labels: Record<string, string> = {
      present: 'Marked Present',
      absent: 'Marked Absent',
      cancelled: 'Marked Cancelled',
    };
    toast.success(labels[nextStatus] || 'Attendance updated');
  };

  if (!activeSubject) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['top']}>
        <View className="p-5">
          <Text style={[styles.sfText, { color: colors.text }]}>No subject found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={['top']}
    >
      {/* Top Navigation Bar: Back button */}
      <View
        style={{ borderBottomColor: colors.divider }}
        className="flex-row items-center justify-between px-4 py-2.5 border-b"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          className="flex-row items-center py-1 pr-3"
        >
          <ChevronLeftIcon size={18} color={colors.textSecondary} strokeWidth={2.4} />
          <Text
            style={[
              styles.sfText,
              { color: colors.textSecondary, letterSpacing: -0.2 },
            ]}
            className="text-base font-semibold ml-1"
          >
            All stats
          </Text>
        </TouchableOpacity>

        {isSimulationActive && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.selectionAsync();
              setSimAttendDelta(0);
              setSimSkipDelta(0);
              toast.info('Simulation reset');
            }}
            style={{
              backgroundColor: isDark ? 'rgba(255, 176, 32, 0.16)' : 'rgba(217, 119, 6, 0.12)',
              borderRadius: 999,
            }}
            className="flex-row items-center px-2.5 py-1"
          >
            <RefreshIcon size={12} color={isDark ? '#FFB020' : '#D97706'} />
            <Text
              style={[
                styles.sfText,
                { color: isDark ? '#FFB020' : '#D97706' },
              ]}
              className="text-xs font-semibold ml-1.5"
            >
              Reset What-If
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Subject Switcher Carousel */}
      <View className="py-2.5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {subjects.map((s) => {
            const isActive = s.id === activeSubject.id;
            return (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveSubjectId(s.id);
                  setSimAttendDelta(0);
                  setSimSkipDelta(0);
                }}
                style={{
                  borderRadius: 999,
                  borderCurve: 'continuous',
                  backgroundColor: isActive
                    ? isDark ? '#FFFFFF' : '#111114'
                    : colors.actionBg,
                  shadowColor: colors.cardShadow,
                  shadowOpacity: isActive ? 0.16 : 0,
                  shadowRadius: 4,
                  elevation: isActive ? 2 : 0,
                }}
                className="flex-row items-center px-3.5 py-2 mr-2"
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: s.color,
                    marginRight: 7,
                  }}
                />
                <Text
                  style={[
                    styles.sfText,
                    {
                      color: isActive
                        ? isDark ? '#0F1014' : '#FFFFFF'
                        : colors.textSecondary,
                      letterSpacing: -0.15,
                    },
                  ]}
                  className="text-xs font-bold"
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Subject Metric Card */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          {/* Card Header: Subject Name + Target % */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 pr-2">
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 4.5,
                  backgroundColor: activeSubject.color,
                  marginRight: 8,
                }}
              />
              <Text
                style={[
                  styles.sfText,
                  { letterSpacing: -0.3, color: colors.text },
                ]}
                className="text-[17px] font-bold"
                numberOfLines={1}
              >
                {activeSubject.name}
              </Text>
            </View>

            <Text
              style={[
                styles.sfText,
                { color: colors.textMuted, letterSpacing: -0.1 },
              ]}
              className="text-xs font-medium"
            >
              Target {targetPercentage}%
            </Text>
          </View>

          {/* Hero Numbers Row: Large NumberFlow Percentage + Margin */}
          <View className="flex-row items-center justify-between mt-1 mb-2">
            <NumberFlow
              value={percentage}
              suffix="%"
              format={{ maximumFractionDigits: 1, minimumFractionDigits: 1 }}
              style={{
                fontFamily: fontFamilyNames.extraBold,
                fontSize: 44,
                fontWeight: '800',
                color: statusColor,
                letterSpacing: -1.3,
              }}
            />

            <View className="items-end">
              <Text
                style={[
                  styles.sfText,
                  { color: colors.textDim },
                ]}
                className="text-[10px] font-medium uppercase tracking-wider mb-0.5"
              >
                Status
              </Text>
              <Text
                style={[
                  styles.sfText,
                  { color: statusColor, letterSpacing: -0.2 },
                ]}
                className="text-sm font-bold"
              >
                {marginText}
              </Text>
            </View>
          </View>

          {/* Actionable Advice Sentence */}
          <Text
            style={[
              styles.sfText,
              { color: colors.textSecondary },
            ]}
            className="text-xs font-medium mb-3"
          >
            {adviceCopy}
          </Text>

          {/* Target Cutoff Notch Progress Bar */}
          <View className="my-2.5">
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                height: 8,
                borderRadius: 999,
                position: 'relative',
              }}
              className="w-full justify-center"
            >
              {/* Progress Fill */}
              <View
                style={{
                  width: `${Math.min(100, Math.max(0, percentage))}%`,
                  backgroundColor: statusColor,
                  height: '100%',
                  borderRadius: 999,
                }}
              />

              {/* Vertical Cutoff Notch Line at Target % */}
              <View
                style={{
                  position: 'absolute',
                  left: `${targetPercentage}%`,
                  width: 2.5,
                  height: 16,
                  borderRadius: 1.5,
                  backgroundColor: isDark ? '#FFFFFF' : '#111114',
                  top: -4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              />
            </View>

            {/* Notch legend guide */}
            <View className="flex-row items-center justify-between mt-1 px-0.5">
              <Text style={[styles.sfText, { color: colors.textDim }]} className="text-[10px]">
                0%
              </Text>
              <View
                style={{ left: `${targetPercentage - 5}%`, position: 'absolute' }}
                className="items-center"
              >
                <Text
                  style={[
                    styles.sfText,
                    { color: isDark ? '#FFFFFF' : '#111114' },
                  ]}
                  className="text-[10px] font-bold"
                >
                  {targetPercentage}% Cutoff
                </Text>
              </View>
              <Text style={[styles.sfText, { color: colors.textDim }]} className="text-[10px]">
                100%
              </Text>
            </View>
          </View>

          {/* Stat Pillars: Attended, Missed, Total Held */}
          <View
            style={{
              borderTopColor: colors.divider,
            }}
            className="flex-row items-center justify-between pt-4 mt-3 border-t"
          >
            <View className="items-center flex-1">
              <Text style={[styles.sfText, { color: colors.textDim }]} className="text-xs mb-1">
                Attended
              </Text>
              <Text
                style={[
                  styles.sfText,
                  {
                    fontFamily: fontFamilyNames.bold,
                    fontSize: 19,
                    color: colors.text,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              >
                {simAttended}
              </Text>
            </View>

            <View style={{ width: 1, height: 26, backgroundColor: colors.divider }} />

            <View className="items-center flex-1">
              <Text style={[styles.sfText, { color: colors.textDim }]} className="text-xs mb-1">
                Missed
              </Text>
              <Text
                style={[
                  styles.sfText,
                  {
                    fontFamily: fontFamilyNames.bold,
                    fontSize: 19,
                    color: colors.text,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              >
                {simMissed}
              </Text>
            </View>

            <View style={{ width: 1, height: 26, backgroundColor: colors.divider }} />

            <View className="items-center flex-1">
              <Text style={[styles.sfText, { color: colors.textDim }]} className="text-xs mb-1">
                Total Held
              </Text>
              <Text
                style={[
                  styles.sfText,
                  {
                    fontFamily: fontFamilyNames.bold,
                    fontSize: 19,
                    color: colors.text,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              >
                {simTotalHeld}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive What-If Simulator Card */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          <View className="mb-3">
            <View className="flex-row items-center justify-between">
              <Text
                style={[styles.sfText, { letterSpacing: -0.3, color: colors.text }]}
                className="text-base font-bold"
              >
                What-If Simulation
              </Text>
              {isSimulationActive && (
                <View
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255, 176, 32, 0.16)'
                      : 'rgba(217, 119, 6, 0.12)',
                    borderRadius: 999,
                  }}
                  className="px-2.5 py-0.5"
                >
                  <Text
                    style={[
                      styles.sfText,
                      { color: isDark ? '#FFB020' : '#D97706' },
                    ]}
                    className="text-[11px] font-semibold"
                  >
                    +{simAttendDelta} attend, +{simSkipDelta} skip
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.sfText, { color: colors.textMuted }]}
              className="text-xs mt-0.5"
            >
              Test future attendance to see how decisions affect your buffer
            </Text>
          </View>

          <View className="flex-row gap-2.5 mt-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                setSimAttendDelta((prev) => prev + 1);
              }}
              style={{
                borderRadius: 14,
                borderCurve: 'continuous',
                backgroundColor: colors.presentBadgeBg,
              }}
              className="flex-1 py-2.5 flex-row items-center justify-center"
            >
              <PlusIcon size={14} color={colors.presentBadgeText} strokeWidth={2.4} />
              <Text
                style={[
                  styles.sfText,
                  { color: colors.presentBadgeText },
                ]}
                className="text-xs font-bold ml-1.5"
              >
                Attend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                setSimSkipDelta((prev) => prev + 1);
              }}
              style={{
                borderRadius: 14,
                borderCurve: 'continuous',
                backgroundColor: colors.absentBadgeBg,
              }}
              className="flex-1 py-2.5 flex-row items-center justify-center"
            >
              <MinusIcon size={14} color={colors.absentBadgeText} strokeWidth={2.4} />
              <Text
                style={[
                  styles.sfText,
                  { color: colors.absentBadgeText },
                ]}
                className="text-xs font-bold ml-1.5"
              >
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Historical Session Ledger with Quick Correction */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          {/* Header Row: Title + Hint */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text
                style={[styles.sfText, { letterSpacing: -0.3, color: colors.text }]}
                className="text-base font-bold"
              >
                Recent lectures
              </Text>
              <Text
                style={[styles.sfText, { color: colors.textDim }]}
                className="text-xs font-medium ml-1.5"
              >
                ({markedSessions.length})
              </Text>
            </View>

            <Text
              style={[styles.sfText, { color: colors.textMuted }]}
              className="text-xs font-medium"
            >
              Tap status to edit
            </Text>
          </View>

          {/* Session Rows */}
          {markedSessions.length === 0 ? (
            <View className="py-6 items-center justify-center">
              <Text style={[styles.sfText, { color: colors.textMuted }]} className="text-xs">
                No marked lectures for this subject yet.
              </Text>
            </View>
          ) : (
            markedSessions.map((session, idx) => {
              const isLast = idx === markedSessions.length - 1;
              const status = session.status;

              return (
                <View
                  key={session.id}
                  style={{
                    borderBottomColor: colors.divider,
                    borderBottomWidth: isLast ? 0 : 1,
                  }}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-1 pr-3">
                    <Text
                      style={[
                        styles.sfText,
                        { color: colors.text, letterSpacing: -0.15 },
                      ]}
                      className="text-sm font-semibold"
                    >
                      {formatSessionLabel(session.date, session.startTime)}
                    </Text>
                    {session.slotId === null && (
                      <Text
                        style={[styles.sfText, { color: colors.textDim }]}
                        className="text-[11px] mt-0.5"
                      >
                        Extra class
                      </Text>
                    )}
                  </View>

                  {/* Quick-Flip Status Pill */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => cycleStatus(session.id, status)}
                    style={{
                      borderRadius: 12,
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
                          color:
                            status === 'present'
                              ? colors.presentBadgeText
                              : status === 'absent'
                              ? colors.absentBadgeText
                              : status === 'cancelled'
                              ? colors.cancelledBadgeText
                              : colors.textMuted,
                        },
                      ]}
                      className="text-xs font-bold capitalize"
                    >
                      {status || 'Unmarked'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  sfText: {
    fontFamily: fontFamilyNames.semiBold,
    includeFontPadding: false,
  },
});
