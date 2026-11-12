import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Animated,
  Easing,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Haptics } from '../utils/haptics';
import { Session, Subject, ScheduleSlot } from '../types';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from './icons';
import { useTheme } from '../utils/theme';
import {
  isSlotEffectiveOnDate,
  isSubjectActiveOnDate,
  getMondayOfDate,
  getWeekDates,
  formatCardDate,
  getTodayDateString,
} from '../domain/attendance';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CalendarCardProps {
  selectedDate: string; // YYYY-MM-DD
  sessions: Session[];
  subjects?: Subject[];
  scheduleSlots?: ScheduleSlot[];
  getSessionsForDate?: (dateStr: string) => Session[];
  onSelectDate: (dateStr: string) => void;
  viewMode: 'month' | 'week';
  todayDate?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Summarizes attendance status for a day's classes
 */
function getDaySummary(daySessions: Session[]): {
  text: string;
  type: 'present' | 'absent' | 'mixed' | 'neutral';
} | null {
  if (daySessions.length === 0) return null;
  const presentCount = daySessions.filter((s) => s.status === 'present').length;
  const absentCount = daySessions.filter((s) => s.status === 'absent').length;
  const cancelledCount = daySessions.filter((s) => s.status === 'cancelled').length;
  const total = daySessions.length;

  if (presentCount === total) {
    return { text: `${total} Present`, type: 'present' };
  }
  if (absentCount === total) {
    return { text: `${total} Absent`, type: 'absent' };
  }
  if (presentCount > 0 && absentCount > 0) {
    return { text: `${presentCount} Present · ${absentCount} Absent`, type: 'mixed' };
  }
  if (presentCount > 0) {
    return { text: `${presentCount}/${total} Present`, type: 'present' };
  }
  if (absentCount > 0) {
    return { text: `${absentCount}/${total} Absent`, type: 'absent' };
  }
  if (cancelledCount === total) {
    return { text: `${total} Cancelled`, type: 'neutral' };
  }
  return {
    text: `${total} ${total === 1 ? 'class' : 'classes'}`,
    type: 'neutral',
  };
}

/**
 * Tactile spring press chevron for navigation
 */
const TactileChevronButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
}> = ({ onPress, children }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
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
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="p-1.5 items-center justify-center"
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const CalendarCard: React.FC<CalendarCardProps> = ({
  selectedDate,
  sessions,
  subjects = [],
  scheduleSlots = [],
  getSessionsForDate,
  onSelectDate,
  viewMode,
  todayDate = getTodayDateString(),
}) => {
  const { colors, isDark } = useTheme();

  // Month navigation state
  const [currentYear, setCurrentYear] = useState(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return (m || (new Date().getMonth() + 1)) - 1; // 0-indexed
  });

  // Week navigation state
  const [currentWeekMonday, setCurrentWeekMonday] = useState(() =>
    getMondayOfDate(selectedDate)
  );

  // Collapsed state for days: true = collapsed, false = expanded
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  // Sync state when selectedDate changes externally
  useEffect(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    if (y && m) {
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    }
    const mon = getMondayOfDate(selectedDate);
    setCurrentWeekMonday(mon);
  }, [selectedDate]);

  // Pre-generate sessions for the active week in SQLite if handler exists
  useEffect(() => {
    if (viewMode === 'week' && getSessionsForDate) {
      const dates = getWeekDates(currentWeekMonday);
      dates.forEach((d) => {
        getSessionsForDate(d);
      });
    }
  }, [currentWeekMonday, viewMode, getSessionsForDate]);

  // Animated transitions
  const gridFade = useRef(new Animated.Value(1)).current;
  const gridTranslateX = useRef(new Animated.Value(0)).current;

  const weekFade = useRef(new Animated.Value(1)).current;
  const weekTranslateX = useRef(new Animated.Value(0)).current;

  const triggerMonthTransition = (direction: 'left' | 'right') => {
    Haptics.selectionAsync();
    gridFade.setValue(0.68);
    gridTranslateX.setValue(direction === 'left' ? 14 : -14);
    Animated.parallel([
      Animated.timing(gridFade, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(gridTranslateX, {
        toValue: 0,
        damping: 18,
        stiffness: 240,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const prevMonth = () => {
    triggerMonthTransition('right');
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    triggerMonthTransition('left');
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const triggerWeekTransition = (direction: 'left' | 'right') => {
    Haptics.selectionAsync();
    weekFade.setValue(0.68);
    weekTranslateX.setValue(direction === 'left' ? 14 : -14);
    Animated.parallel([
      Animated.timing(weekFade, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(weekTranslateX, {
        toValue: 0,
        damping: 18,
        stiffness: 240,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const prevWeek = () => {
    triggerWeekTransition('right');
    const [y, m, d] = currentWeekMonday.split('-').map(Number);
    const newMon = new Date(Date.UTC(y, m - 1, d - 7));
    setCurrentWeekMonday(newMon.toISOString().slice(0, 10));
  };

  const nextWeek = () => {
    triggerWeekTransition('left');
    const [y, m, d] = currentWeekMonday.split('-').map(Number);
    const newMon = new Date(Date.UTC(y, m - 1, d + 7));
    setCurrentWeekMonday(newMon.toISOString().slice(0, 10));
  };

  // Subjects lookup map
  const subjectsMap = useMemo(() => {
    const map = new Map<string, Subject>();
    for (const sub of subjects) {
      map.set(sub.id, sub);
    }
    return map;
  }, [subjects]);

  // Build attendance status map for days: dateStr -> 'green' | 'amber' | 'red'
  const dayStatusMap = useMemo(() => {
    const statusMap = new Map<string, 'green' | 'amber' | 'red'>();
    const sessionsByDate = new Map<string, Session[]>();
    for (const s of sessions) {
      if (!sessionsByDate.has(s.date)) {
        sessionsByDate.set(s.date, []);
      }
      sessionsByDate.get(s.date)!.push(s);
    }

    sessionsByDate.forEach((dayList, date) => {
      const held = dayList.filter((s) => s.status === 'present' || s.status === 'absent');
      if (held.length === 0) return;
      const hasAbsent = held.some((s) => s.status === 'absent');
      const hasPresent = held.some((s) => s.status === 'present');
      if (hasAbsent && hasPresent) {
        statusMap.set(date, 'amber');
      } else if (hasAbsent) {
        statusMap.set(date, 'red');
      } else {
        statusMap.set(date, 'green');
      }
    });

    return statusMap;
  }, [sessions]);

  // Resolves sessions for a date from sessions prop, falling back to scheduleSlots
  const getDaySessions = (dateStr: string): Session[] => {
    const existing = sessions.filter((s) => s.date === dateStr);
    if (existing.length > 0) {
      return [...existing].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    if (scheduleSlots.length > 0 && subjects.length > 0) {
      const activeSubjectsMap = new Map(
        subjects.filter((s) => !s.archivedAt).map((s) => [s.id, s])
      );
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      const dayOfWeek = date.getUTCDay();

      const slotsForDay = scheduleSlots.filter((slot) => {
        const sub = activeSubjectsMap.get(slot.subjectId);
        if (!sub) return false;
        return (
          slot.weekday === dayOfWeek &&
          isSlotEffectiveOnDate(slot, dateStr) &&
          isSubjectActiveOnDate(sub, dateStr)
        );
      });

      const derived: Session[] = slotsForDay.map((slot) => ({
        id: `slot-${slot.id}-${dateStr}`,
        subjectId: slot.subjectId,
        slotId: slot.id,
        date: dateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: null,
        markedAt: null,
      }));
      return derived.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return [];
  };

  // Month grid calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  let firstDayCol = firstDayOfMonth.getDay() - 1;
  if (firstDayCol < 0) firstDayCol = 6;
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayCol; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    cells.push(d);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  // Group month cells into rows of 7 for pixel-perfect column alignment
  const monthRows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    monthRows.push(cells.slice(i, i + 7));
  }

  // --- MONTH VIEW ---
  const renderMonthView = () => (
    <View>
      {/* Month Header with Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <TactileChevronButton onPress={prevMonth}>
          <ChevronLeftIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
        </TactileChevronButton>
        <Text
          style={[styles.sfText, { color: colors.text }]}
          className="text-base font-bold tracking-wide"
        >
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TactileChevronButton onPress={nextMonth}>
          <ChevronRightIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
        </TactileChevronButton>
      </View>

      {/* Weekday Labels (M T W T F S S) */}
      <View className="flex-row mb-3">
        {WEEKDAYS.map((label, idx) => (
          <View key={idx} style={{ flex: 1 }} className="items-center justify-center">
            <Text
              style={{
                color: idx === 6 ? '#FF6B72' : colors.textMuted,
              }}
              className="text-xs font-bold"
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <Animated.View
        style={{ opacity: gridFade, transform: [{ translateX: gridTranslateX }] }}
      >
        {monthRows.map((row, rowIdx) => (
          <View key={rowIdx} className="flex-row h-12">
            {row.map((dayNum, colIdx) => {
              const cellIdx = rowIdx * 7 + colIdx;
              if (dayNum === null) {
                return <View key={cellIdx} style={{ flex: 1 }} className="h-12" />;
              }

              const monthStr = String(currentMonth + 1).padStart(2, '0');
              const dayStr = String(dayNum).padStart(2, '0');
              const cellDateStr = `${currentYear}-${monthStr}-${dayStr}`;
              const isSelected = selectedDate === cellDateStr;
              const isSunday = colIdx === 6;
              const status = dayStatusMap.get(cellDateStr);

              return (
                <TouchableOpacity
                  key={cellIdx}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelectDate(cellDateStr);
                  }}
                  style={{ flex: 1 }}
                  className="h-12 items-center justify-center relative"
                >
                  <View
                    style={[
                      isSelected && styles.selectedCell,
                      {
                        borderRadius: 12,
                        borderCurve: 'continuous',
                        backgroundColor: isSelected
                          ? colors.presentBadgeBg
                          : 'transparent',
                      },
                    ]}
                    className="w-9 h-9 items-center justify-center"
                  >
                    <Text
                      style={[
                        styles.sfText,
                        {
                          letterSpacing: -0.1,
                          color: isSunday
                            ? '#FF6B72'
                            : isSelected
                            ? colors.text
                            : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '600',
                          fontVariant: ['tabular-nums'],
                        },
                      ]}
                      className="text-[13px]"
                    >
                      {dayNum}
                    </Text>

                    {/* Status indicator dot */}
                    {(isSelected || status) && (
                      <View
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{
                          backgroundColor:
                            status === 'red'
                              ? '#FF6B72'
                              : status === 'amber'
                              ? '#FFB020'
                              : colors.statusSafe,
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );

  // --- WEEK VIEW ---
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentWeekMonday);
    const weekRangeLabel = `${weekDates[0]} — ${weekDates[6]}`;

    return (
      <View>
        {/* Week Header with Stepper */}
        <View className="flex-row items-center justify-between mb-4">
          <TactileChevronButton onPress={prevWeek}>
            <ChevronLeftIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
          </TactileChevronButton>
          <Animated.View
            style={{
              opacity: weekFade,
              transform: [{ translateX: weekTranslateX }],
            }}
          >
            <Text
              style={[
                styles.sfText,
                { color: colors.text, fontVariant: ['tabular-nums'] },
              ]}
              className="text-sm font-bold tracking-wide"
            >
              {weekRangeLabel}
            </Text>
          </Animated.View>
          <TactileChevronButton onPress={nextWeek}>
            <ChevronRightIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
          </TactileChevronButton>
        </View>

        {/* Weekday Labels (M T W T F S S) */}
        <View className="flex-row mb-2">
          {WEEKDAYS.map((label, idx) => (
            <View key={idx} style={{ flex: 1 }} className="items-center justify-center">
              <Text
                style={{
                  color: idx === 6 ? '#FF6B72' : colors.textMuted,
                }}
                className="text-xs font-bold"
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekday Date Strip */}
        <Animated.View
          style={{
            opacity: weekFade,
            transform: [{ translateX: weekTranslateX }],
          }}
          className="flex-row mb-4"
        >
          {weekDates.map((dateStr, idx) => {
            const isSelected = selectedDate === dateStr;
            const isSunday = idx === 6;
            const dayNum = Number(dateStr.slice(8, 10));
            const status = dayStatusMap.get(dateStr);

            return (
              <WeekDateCell
                key={dateStr}
                dateStr={dateStr}
                isSelected={isSelected}
                isSunday={isSunday}
                dayNum={dayNum}
                status={status}
                isDark={isDark}
                colors={colors}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelectDate(dateStr);
                  // Auto-expand this day's card if it was collapsed
                  if (collapsedDays[dateStr]) {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.create(200, 'easeOut', 'opacity')
                    );
                    setCollapsedDays((prev) => ({
                      ...prev,
                      [dateStr]: false,
                    }));
                  }
                }}
              />
            );
          })}
        </Animated.View>

        {/* Subtle Divider */}
        <View className="h-[1px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.08)] mb-4" />

        {/* 7 Daily Agenda Cards */}
        <View>
          {weekDates.map((dateStr) => {
            const daySessions = getDaySessions(dateStr);
            const isSelected = selectedDate === dateStr;
            const isCollapsed =
              collapsedDays[dateStr] ?? (daySessions.length === 0);

            return (
              <CollapsibleDayCard
                key={dateStr}
                dateStr={dateStr}
                isToday={dateStr === todayDate}
                isSelected={isSelected}
                sessions={daySessions}
                subjectsMap={subjectsMap}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.create(200, 'easeOut', 'opacity')
                  );
                  setCollapsedDays((prev) => ({
                    ...prev,
                    [dateStr]: !isCollapsed,
                  }));
                }}
                onSelect={() => onSelectDate(dateStr)}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderRadius: 28,
          borderCurve: 'continuous',
          backgroundColor: colors.card,
          shadowColor: colors.cardShadow,
        },
      ]}
      className="mx-4 my-2 p-5"
    >
      {viewMode === 'week' ? renderWeekView() : renderMonthView()}
    </View>
  );
};

interface WeekDateCellProps {
  dateStr: string;
  isSelected: boolean;
  isSunday: boolean;
  dayNum: number;
  status?: string;
  isDark: boolean;
  colors: any;
  onPress: () => void;
}

const WeekDateCell: React.FC<WeekDateCellProps> = ({
  isSelected,
  isSunday,
  dayNum,
  status,
  isDark,
  colors,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 14,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ flex: 1 }}
      className="items-center justify-center relative"
    >
      <Animated.View
        style={[
          isSelected && styles.selectedWeekPill,
          {
            borderRadius: 14,
            borderCurve: 'continuous',
            backgroundColor: isSelected
              ? isDark
                ? 'rgba(255, 255, 255, 0.14)'
                : '#E5E7EB'
              : 'transparent',
            transform: [{ scale }],
          },
        ]}
        className="w-9 h-11 items-center justify-center"
      >
        <Text
          style={[
            styles.sfText,
            {
              letterSpacing: -0.1,
              color: isSunday
                ? '#FF6B72'
                : isSelected
                ? colors.text
                : colors.textSecondary,
              fontWeight: isSelected ? '700' : '600',
              fontVariant: ['tabular-nums'],
            },
          ]}
          className="text-[13px]"
        >
          {dayNum}
        </Text>

        {/* Status dot under date */}
        <View className="h-2 items-center justify-center">
          {status ? (
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  status === 'red'
                    ? '#FF6B72'
                    : status === 'amber'
                    ? '#FFB020'
                    : colors.statusSafe,
              }}
            />
          ) : null}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface CollapsibleDayCardProps {
  dateStr: string;
  isToday: boolean;
  isSelected: boolean;
  sessions: Session[];
  subjectsMap: Map<string, Subject>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: () => void;
}

const CollapsibleDayCard: React.FC<CollapsibleDayCardProps> = ({
  dateStr,
  isToday,
  isSelected,
  sessions,
  subjectsMap,
  isCollapsed,
  onToggleCollapse,
  onSelect,
}) => {
  const { colors, isDark } = useTheme();
  const headerScale = useRef(new Animated.Value(1)).current;
  const chevronRotation = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(chevronRotation, {
      toValue: isCollapsed ? 0 : 1,
      damping: 18,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [isCollapsed]);

  const chevronAngle = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const onPressIn = () => {
    Animated.timing(headerScale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(headerScale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const handleHeaderPress = () => {
    Haptics.selectionAsync();
    onSelect();
    onToggleCollapse();
  };

  const dayTitle = formatCardDate(dateStr);
  const summary = getDaySummary(sessions);

  // If 0 classes, render quiet minimal card matching mockup with tactile press feedback
  if (sessions.length === 0) {
    return (
      <Animated.View style={{ transform: [{ scale: headerScale }] }}>
        <View
          style={{
            borderRadius: 18,
            borderCurve: 'continuous',
            backgroundColor: isDark ? colors.cardSubtle : '#F5F5F7',
            borderWidth: 1,
            borderColor: isSelected
              ? colors.statusSafe
              : isDark
              ? 'transparent'
              : 'rgba(0, 0, 0, 0.04)',
          }}
          className="mb-2.5 p-3.5"
        >
          <TouchableOpacity
            activeOpacity={0.88}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect();
            }}
            className="flex-row items-center justify-between"
          >
          <View>
            <Text
              style={[
                styles.sfText,
                { color: colors.text, fontWeight: '700', letterSpacing: -0.2 },
              ]}
              className="text-[13px]"
            >
              {dayTitle}
            </Text>
            <Text
              style={[styles.sfText, { color: colors.textMuted }]}
              className="text-xs mt-1 font-normal"
            >
              No classes recorded
            </Text>
          </View>
          {isToday && (
            <View
              style={{
                borderRadius: 6,
                backgroundColor: colors.presentBadgeBg,
              }}
              className="px-1.5 py-0.5"
            >
              <Text
                style={{ color: colors.statusSafe }}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                Today
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
    );
  }

  return (
    <View
      style={{
        borderRadius: 18,
        borderCurve: 'continuous',
        backgroundColor: isDark ? colors.cardSubtle : '#F5F5F7',
        borderWidth: 1,
        borderColor: isSelected
          ? colors.statusSafe
          : isDark
          ? 'transparent'
          : 'rgba(0, 0, 0, 0.04)',
      }}
      className="mb-2.5 p-3.5 overflow-hidden"
    >
      <Animated.View style={{ transform: [{ scale: headerScale }] }}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handleHeaderPress}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 pr-2">
            <Text
              style={[
                styles.sfText,
                {
                  color: colors.text,
                  fontWeight: '700',
                  letterSpacing: -0.2,
                },
              ]}
              className="text-[13px]"
            >
              {dayTitle}
            </Text>
            {isToday && (
              <View
                style={{
                  borderRadius: 6,
                  backgroundColor: colors.presentBadgeBg,
                }}
                className="ml-2 px-1.5 py-0.5"
              >
                <Text
                  style={{ color: colors.statusSafe }}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  Today
                </Text>
              </View>
            )}
          </View>

          {/* Right Header: Summary Pill + Chevron */}
          <View className="flex-row items-center">
            {summary && (
              <View
                style={{
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  backgroundColor:
                    summary.type === 'present'
                      ? colors.presentBadgeBg
                      : summary.type === 'absent'
                      ? colors.absentBadgeBg
                      : summary.type === 'mixed'
                      ? 'rgba(255, 176, 32, 0.15)'
                      : colors.actionBg,
                }}
                className="px-2 py-0.5 mr-1.5"
              >
                <Text
                  style={[
                    styles.sfText,
                    {
                      color:
                        summary.type === 'present'
                          ? colors.presentBadgeText
                          : summary.type === 'absent'
                          ? colors.absentBadgeText
                          : summary.type === 'mixed'
                          ? '#FFB020'
                          : colors.textSecondary,
                    },
                  ]}
                  className="text-[11px] font-semibold"
                >
                  {summary.text}
                </Text>
              </View>
            )}

            <Animated.View
              style={{ transform: [{ rotate: chevronAngle }] }}
              className="p-0.5"
            >
              <ChevronDownIcon size={14} color={colors.textMuted} strokeWidth={2.4} />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Expanded Class List */}
      {!isCollapsed && (
        <View className="mt-2.5 pt-2 border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.06)]">
          {sessions.map((ses, idx) => {
            const sub = subjectsMap.get(ses.subjectId);
            const subColor = sub?.color || '#1FB45A';
            const subName = sub?.name || 'Class';
            const isLast = idx === sessions.length - 1;

            return (
              <View
                key={ses.id}
                className={`flex-row items-center justify-between py-2 ${
                  !isLast
                    ? 'border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.05)]'
                    : ''
                }`}
              >
                {/* Left: Color dot, Subject Name, Time */}
                <View className="flex-row items-center flex-1 pr-2">
                  <View
                    style={{ backgroundColor: subColor }}
                    className="w-2.5 h-2.5 rounded-full mr-2.5"
                  />
                  <Text
                    style={[styles.sfText, { color: colors.text }]}
                    numberOfLines={1}
                    className="text-[13px] font-semibold mr-2 max-w-[150px]"
                  >
                    {subName}
                  </Text>
                  <Text
                    style={[
                      styles.sfText,
                      { color: colors.textMuted, fontVariant: ['tabular-nums'] },
                    ]}
                    className="text-xs font-medium"
                  >
                    {ses.startTime}
                  </Text>
                </View>

                {/* Right: Read-only Status Badge */}
                <View>
                  {ses.status === 'present' ? (
                    <View
                      style={{
                        borderRadius: 10,
                        borderCurve: 'continuous',
                        backgroundColor: colors.presentBadgeBg,
                      }}
                      className="px-2.5 py-1"
                    >
                      <Text
                        style={[
                          styles.sfText,
                          { color: colors.presentBadgeText },
                        ]}
                        className="text-[11px] font-semibold"
                      >
                        Present
                      </Text>
                    </View>
                  ) : ses.status === 'absent' ? (
                    <View
                      style={{
                        borderRadius: 10,
                        borderCurve: 'continuous',
                        backgroundColor: colors.absentBadgeBg,
                      }}
                      className="px-2.5 py-1"
                    >
                      <Text
                        style={[
                          styles.sfText,
                          { color: colors.absentBadgeText },
                        ]}
                        className="text-[11px] font-semibold"
                      >
                        Absent
                      </Text>
                    </View>
                  ) : ses.status === 'cancelled' ? (
                    <View
                      style={{
                        borderRadius: 10,
                        borderCurve: 'continuous',
                        backgroundColor: colors.cancelledBadgeBg,
                      }}
                      className="px-2.5 py-1"
                    >
                      <Text
                        style={[
                          styles.sfText,
                          { color: colors.cancelledBadgeText },
                        ]}
                        className="text-[11px] font-semibold"
                      >
                        Cancelled
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        borderRadius: 10,
                        borderCurve: 'continuous',
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(0, 0, 0, 0.05)',
                      }}
                      className="px-2.5 py-1"
                    >
                      <Text
                        style={[styles.sfText, { color: colors.textMuted }]}
                        className="text-[11px] font-medium"
                      >
                        Unmarked
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  selectedCell: {
    shadowColor: '#3DDC84',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  selectedWeekPill: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
