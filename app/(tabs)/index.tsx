import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { TopHeader } from '../../src/components/TopHeader';
import { DatePillSelector } from '../../src/components/DatePillSelector';
import { HeroAttendanceCard } from '../../src/components/HeroAttendanceCard';
import { ClassCard } from '../../src/components/ClassCard';
import { PlusIcon, CalendarIcon } from '../../src/components/icons';

export default function AttendanceScreen() {
  const router = useRouter();
  const {
    subjects,
    selectedDate,
    setSelectedDate,
    getPooledStats,
    getSessionsForDate,
    markSession,
    batchMarkDay,
    toggleHoliday,
    isDateHoliday,
    settings,
  } = useAttendanceStore();

  const pooledStats = getPooledStats();
  const daySessions = getSessionsForDate(selectedDate);
  const isHoliday = isDateHoliday(selectedDate);

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((s) => [s.id, s]));
  }, [subjects]);

  return (
    <SafeAreaView className="flex-1 bg-[#0F1015]" edges={['top']}>
      {/* Top Header */}
      <TopHeader title="Attendance" />

      {/* Date Navigation Pill */}
      <DatePillSelector
        selectedDate={selectedDate}
        todayDate="2026-11-07"
        onSelectDate={setSelectedDate}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <HeroAttendanceCard stats={pooledStats} />

        {/* Holiday Banner if day is marked as Holiday */}
        {isHoliday && (
          <View className="mx-4 my-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-bold text-[#FFB020]">
                Holiday Marked
              </Text>
              <Text className="text-xs text-zinc-400 mt-0.5">
                Classes on this day are excluded from attendance counts.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleHoliday(selectedDate)}
              className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40"
            >
              <Text className="text-xs font-bold text-[#FFB020]">Undo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Header: Today's Classes & Action Pills */}
        <View className="flex-row items-center justify-between px-5 mt-4 mb-2">
          <Text className="text-lg font-bold text-white tracking-tight">
            Today's classes
          </Text>

          <View className="flex-row items-center space-x-2">
            {/* Batch Mark Pill */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => batchMarkDay(selectedDate)}
              className="flex-row items-center px-3 py-1.5 rounded-full bg-[#1B1C22] border border-[#282932] mr-1.5"
            >
              <Text className="text-xs mr-1 text-zinc-300">⎘</Text>
              <Text className="text-xs font-bold text-zinc-300">Batch</Text>
            </TouchableOpacity>

            {/* + Extra Class Pill */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/modals/extra-class')}
              className="flex-row items-center px-3 py-1.5 rounded-full bg-[#1B1C22] border border-[#282932] mr-1.5"
            >
              <View className="mr-1.5">
                <PlusIcon size={12} color="#D4D4D8" strokeWidth={2.4} />
              </View>
              <Text className="text-xs font-bold text-zinc-300">Extra</Text>
            </TouchableOpacity>

            {/* Holiday Toggle Pill */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleHoliday(selectedDate)}
              className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                isHoliday
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : 'bg-[#1B1C22] border-[#282932]'
              }`}
            >
              <View className="mr-1.5">
                <CalendarIcon
                  size={12}
                  color={isHoliday ? '#FFB020' : '#D4D4D8'}
                />
              </View>
              <Text
                className={`text-xs font-bold ${
                  isHoliday ? 'text-[#FFB020]' : 'text-zinc-300'
                }`}
              >
                Holiday
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Cards List */}
        {daySessions.length === 0 ? (
          <View className="mx-4 my-6 p-8 rounded-[28px] bg-[#1B1C22] border border-[#282932] items-center justify-center">
            <View className="mb-3">
              <CalendarIcon size={38} color="#71717A" />
            </View>
            <Text className="text-base font-bold text-white mb-1">
              No classes scheduled
            </Text>

            <Text className="text-xs text-zinc-400 text-center">
              Enjoy your free time, or tap '+ Extra' to log an unscheduled class.
            </Text>
          </View>
        ) : (
          daySessions.map((session) => (
            <ClassCard
              key={session.id}
              session={session}
              subject={subjectMap.get(session.subjectId)}
              primaryLabel={settings.primaryCardLabel}
              onMark={(status) => markSession(session.id, status)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
