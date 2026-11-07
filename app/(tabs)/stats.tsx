import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { TopHeader } from '../../src/components/TopHeader';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { CalendarCard } from '../../src/components/CalendarCard';
import { BySubjectBreakdownCard } from '../../src/components/BySubjectBreakdownCard';

export default function StatsScreen() {
  const {
    selectedDate,
    setSelectedDate,
    statsFilter,
    setStatsFilter,
    sessions,
    getAllSubjectStats,
  } = useAttendanceStore();

  const statsList = getAllSubjectStats();

  return (
    <SafeAreaView className="flex-1 bg-[#0F1015]" edges={['top']}>
      {/* Top Header */}
      <TopHeader title="Statistics" />

      {/* Segmented Control: Month | Week */}
      <SegmentedControl
        options={[
          { label: 'Month', value: 'month' },
          { label: 'Week', value: 'week' },
        ]}
        selectedValue={statsFilter}
        onSelect={(val) => setStatsFilter(val)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Card */}
        <CalendarCard
          selectedDate={selectedDate}
          sessions={sessions}
          onSelectDate={setSelectedDate}
          viewMode={statsFilter}
        />

        {/* By Subject Progress Breakdown Card */}
        <BySubjectBreakdownCard statsList={statsList} />
      </ScrollView>
    </SafeAreaView>
  );
}
