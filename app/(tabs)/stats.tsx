import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { TopHeader } from '../../src/components/TopHeader';
import { CalendarCard } from '../../src/components/CalendarCard';
import { BySubjectBreakdownCard } from '../../src/components/BySubjectBreakdownCard';
import { useTheme } from '../../src/utils/theme';
import { getTodayDateString } from '../../src/domain/attendance';

export default function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    selectedDate,
    setSelectedDate,
    statsFilter,
    setStatsFilter,
    sessions,
    subjects,
    scheduleSlots,
    getSessionsForDate,
    getAllSubjectStats,
  } = useAttendanceStore();

  const statsList = getAllSubjectStats();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + 70 + 24;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={['top']}
    >
      {/* Top Header */}
      <TopHeader title="Stats" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* By Subject Progress Breakdown Card (Top Card) */}
        <BySubjectBreakdownCard statsList={statsList} />

        {/* Integrated Calendar Log Card (Month or Week with daily agenda) */}
        <CalendarCard
          selectedDate={selectedDate}
          sessions={sessions}
          subjects={subjects}
          scheduleSlots={scheduleSlots}
          getSessionsForDate={getSessionsForDate}
          onSelectDate={setSelectedDate}
          viewMode={statsFilter}
          onViewModeChange={setStatsFilter}
          todayDate={getTodayDateString()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
