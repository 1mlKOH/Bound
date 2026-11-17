import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Platform, StyleSheet, Animated, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Haptics } from '../../src/utils/haptics';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { DatePillSelector } from '../../src/components/DatePillSelector';
import { HeroAttendanceCard } from '../../src/components/HeroAttendanceCard';
import { getTodayDateString } from '../../src/domain/attendance';
import { ClassCard } from '../../src/components/ClassCard';
import {
  PlusIcon,
  CalendarIcon,
  MoreHorizontalIcon,
  CopyCheckIcon,
  CalendarSparklesIcon,
  CalendarOffIcon,
  CalendarPlusIcon,
} from '../../src/components/icons';
import { DropdownMenu } from '../../src/components/DropdownMenu';
import { useTheme } from '../../src/utils/theme';
import { fontFamilyNames } from '../../src/utils/typography';
import { toast } from 'sonner-native';

interface TactilePillProps {
  onPress: () => void;
  style?: any;
  className?: string;
  hitSlop?: any;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: any;
  children: React.ReactNode;
}

const TactilePill: React.FC<TactilePillProps> = ({
  onPress,
  style,
  className = '',
  hitSlop = { top: 8, bottom: 8, left: 6, right: 6 },
  disabled = false,
  accessibilityLabel,
  accessibilityRole = 'button',
  children,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        hitSlop={hitSlop}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={style}
        className={className}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AttendanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const {
    subjects,
    selectedDate,
    setSelectedDate,
    getPooledStats,
    getAllSubjectStats,
    getSessionsForDate,
    markSession,
    batchMarkDay,
    toggleHoliday,
    isDateHoliday,
    settings,
  } = useAttendanceStore();

  const scrollBottomPadding = Math.max(insets.bottom, 16) + 70 + 24;

  const pooledStats = getPooledStats();
  const allSubjectStats = getAllSubjectStats();
  const daySessions = getSessionsForDate(selectedDate);
  const isHoliday = isDateHoliday(selectedDate);

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((s) => [s.id, s]));
  }, [subjects]);

  const subjectStatsMap = useMemo(() => {
    return new Map(allSubjectStats.map((st) => [st.subject.id, st]));
  }, [allSubjectStats]);

  const isTogglingHolidayRef = useRef(false);
  const handleToggleHoliday = () => {
    if (isTogglingHolidayRef.current) return;
    isTogglingHolidayRef.current = true;
    Haptics.selectionAsync();
    toggleHoliday(selectedDate);
    setTimeout(() => {
      isTogglingHolidayRef.current = false;
    }, 400);
  };

  // Midnight date rollover handler when app resumes
  useEffect(() => {
    let lastKnownToday = getTodayDateString();
    const sub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const currentToday = getTodayDateString();
        if (currentToday !== lastKnownToday) {
          const prev = lastKnownToday;
          lastKnownToday = currentToday;
          if (useAttendanceStore.getState().selectedDate === prev) {
            setSelectedDate(currentToday);
          }
        }
      }
    });
    return () => sub.remove();
  }, [setSelectedDate]);

  const activePooledStats = pooledStats;
  const activeDaySessions = daySessions;
  const activeSubjectMap = subjectMap;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Date Navigation Pill */}
      <DatePillSelector
        selectedDate={selectedDate}
        todayDate={getTodayDateString()}
        onSelectDate={setSelectedDate}
      />

      <FlatList
        data={activeDaySessions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListHeaderComponent={
          <>
            {/* Hero Card */}
            <HeroAttendanceCard stats={activePooledStats} />

            {/* Holiday Banner if day is marked as Holiday */}
            {isHoliday && (
              <View
                style={{
                  backgroundColor: isDark
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(245, 158, 11, 0.14)',
                }}
                className="mx-4 my-2 p-4 rounded-2xl flex-row items-center justify-between"
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center mb-0.5">
                    <CalendarSparklesIcon
                      size={16}
                      color={isDark ? '#FFB020' : '#D97706'}
                      strokeWidth={2}
                    />
                    <Text
                      style={{ color: isDark ? '#FFB020' : '#D97706' }}
                      className="text-sm font-bold ml-1.5"
                    >
                      Holiday Marked
                    </Text>
                  </View>
                  <Text
                    style={{ color: colors.textMuted }}
                    className="text-xs mt-0.5"
                  >
                    Classes on this day are excluded from attendance counts.
                  </Text>
                </View>
                <TactilePill
                  onPress={handleToggleHoliday}
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.20)'
                      : 'rgba(245, 158, 11, 0.18)',
                  }}
                  className="px-3 py-1.5 rounded-full"
                >
                  <Text
                    style={{ color: isDark ? '#FFB020' : '#D97706' }}
                    className="text-xs font-bold"
                  >
                    Undo
                  </Text>
                </TactilePill>
              </View>
            )}

            {/* Section Header: Today's Classes & Action Pills */}
            <View className="flex-row items-center justify-between px-5 mt-4 mb-2">
              <Text
                style={[
                  styles.sfText,
                  { letterSpacing: -0.3, color: colors.text, flexShrink: 0 },
                ]}
                className="text-[18px] font-bold mr-2"
              >
                Today's classes
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                {/* Batch Mark Pill */}
                <TactilePill
                  accessibilityRole="button"
                  accessibilityLabel="Mark all classes present"
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (activeDaySessions.length === 0) {
                      toast.info("No classes scheduled today. Tap '+ Add Subject' to get started");
                      return;
                    }
                    const count = batchMarkDay(selectedDate);
                    if (count > 0) {
                      toast.success(
                        count === 1
                          ? 'Class marked Present'
                          : `All ${count} classes marked Present`
                      );
                    } else {
                      toast.info('All classes are already marked');
                    }
                  }}
                  style={[
                    styles.pillButton,
                    {
                      paddingHorizontal: 12,
                      backgroundColor: colors.glassBg,
                      shadowColor: colors.cardShadow,
                      flexDirection: 'row',
                      opacity: activeDaySessions.length === 0 ? 0.6 : 1,
                    },
                  ]}
                >
                  <View style={{ marginRight: 5 }}>
                    <CopyCheckIcon
                      size={13.5}
                      color={colors.textSecondary}
                      strokeWidth={2}
                    />
                  </View>
                  <Text
                    style={[
                      styles.sfText,
                      {
                        color: colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '600',
                        includeFontPadding: false,
                      },
                    ]}
                  >
                    All Present
                  </Text>
                </TactilePill>

                {/* Dropdown Menu (Extra Class & Holiday) */}
                <DropdownMenu
                  items={[
                    {
                      key: 'extra-class',
                      label: 'Add Extra Class',
                      description: 'Log an unscheduled or makeup lecture',
                      icon: (
                        <CalendarPlusIcon
                          size={16}
                          color={colors.textSecondary}
                          strokeWidth={2}
                        />
                      ),
                      onSelect: () => {
                        router.push('/modals/extra-class');
                      },
                    },
                    {
                      key: 'holiday-toggle',
                      label: isHoliday ? 'Remove Holiday' : 'Mark as Holiday',
                      description: isHoliday
                        ? 'Resume attendance tracking for today'
                        : 'Exclude today from attendance counts',
                      active: isHoliday,
                      badge: isHoliday ? 'Active' : undefined,
                      separatorBefore: true,
                      icon: isHoliday ? (
                        <CalendarOffIcon
                          size={16}
                          color={isDark ? '#FFB020' : '#D97706'}
                          strokeWidth={2}
                        />
                      ) : (
                        <CalendarSparklesIcon
                          size={16}
                          color={colors.textSecondary}
                          strokeWidth={2}
                        />
                      ),
                      onSelect: () => {
                        const willBeHoliday = !isHoliday;
                        handleToggleHoliday();
                        if (willBeHoliday) {
                          toast.info('Marked as Holiday', {
                            description: 'Classes excluded from attendance statistics',
                          });
                        } else {
                          toast.info('Holiday removed');
                        }
                      },
                    },
                  ]}
                  trigger={({ open }) => (
                    <TactilePill
                      onPress={open}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[
                        styles.pillButton,
                        {
                          width: 34,
                          backgroundColor: isHoliday
                            ? isDark
                              ? 'rgba(245, 158, 11, 0.20)'
                              : 'rgba(245, 158, 11, 0.15)'
                            : colors.glassBg,
                          shadowColor: colors.cardShadow,
                        },
                      ]}
                    >
                      <MoreHorizontalIcon
                        size={16}
                        color={
                          isHoliday
                            ? isDark
                              ? '#FFB020'
                              : '#D97706'
                            : colors.textSecondary
                        }
                      />
                    </TactilePill>
                  )}
                />
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View
            style={[
              styles.emptyCard,
              {
                borderRadius: 28,
                borderCurve: 'continuous',
                backgroundColor: colors.card,
                shadowColor: colors.cardShadow,
              },
            ]}
            className="mx-4 my-6 p-8 items-center justify-center"
          >
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.07)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 22,
                borderCurve: 'continuous',
              }}
              className="w-16 h-16 items-center justify-center mb-3"
            >
              <CalendarIcon size={32} color={colors.textMuted} />
            </View>
            <Text
              style={[
                styles.sfText,
                { color: colors.text, fontFamily: fontFamilyNames.bold },
              ]}
              className="text-base font-semibold mb-1 text-center"
            >
              {subjects.length === 0 ? 'No subjects yet' : 'No classes today'}
            </Text>

            <Text
              style={{
                color: colors.textMuted,
                fontFamily: fontFamilyNames.regular,
              }}
              className={`text-xs text-center ${subjects.length === 0 ? 'mb-4' : 'mb-1'}`}
            >
              {subjects.length === 0
                ? 'Add your subjects to start tracking attendance and safe skips.'
                : 'Enjoy your free time, or tap the menu (···) to log a makeup class.'}
            </Text>

            {subjects.length === 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Add Your First Subject"
                onPress={() => router.push('/modals/subject-editor')}
                style={{
                  backgroundColor: '#00BF63',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 999,
                }}
                className="flex-row items-center gap-2"
              >
                <PlusIcon size={16} color="#06210F" strokeWidth={2.6} />
                <Text style={[styles.sfText, { color: '#06210F', fontWeight: '800', fontSize: 13 }]}>
                  Add Your First Subject
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item: session }) => {
          const st = subjectStatsMap.get(session.subjectId);
          const bufferTier: 'safe' | 'warning' | 'danger' | 'neutral' =
            !st || st.totalHeld === 0
              ? 'neutral'
              : st.totalHeld === 1 && st.attended === 1
              ? 'safe'
              : st.canMiss === 0 && st.totalHeld > 1 && !st.isBelow
              ? 'warning'
              : st.isSafe
              ? 'safe'
              : st.isClose
              ? 'warning'
              : 'danger';

          return (
            <ClassCard
              session={session}
              subject={activeSubjectMap.get(session.subjectId)}
              primaryLabel={settings.primaryCardLabel}
              bufferLabel={st?.statusLabel}
              bufferTier={bufferTier}
              onMark={(status) => markSession(session.id, status)}
            />
          );
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  pillButton: {
    height: 34,
    borderRadius: 17,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyCard: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  sfText: {
    fontFamily: fontFamilyNames.semiBold,
  },
});
