import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Session } from '../types';

interface CalendarCardProps {
  selectedDate: string; // YYYY-MM-DD
  sessions: Session[];
  onSelectDate: (dateStr: string) => void;
  viewMode: 'month' | 'week';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const CalendarCard: React.FC<CalendarCardProps> = ({
  selectedDate,
  sessions,
  onSelectDate,
  viewMode,
}) => {
  const [currentYear, setCurrentYear] = useState(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || 2026;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return (m || 11) - 1; // 0-indexed
  });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Build attendance status map for days: dateStr -> 'all-present' | 'any-absent' | 'mixed' | null
  const dayStatusMap = new Map<string, string>();
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
      dayStatusMap.set(date, 'amber');
    } else if (hasAbsent) {
      dayStatusMap.set(date, 'red');
    } else {
      dayStatusMap.set(date, 'green');
    }
  });

  // Calculate days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday.
  // We want Monday = 0, ... Sunday = 6
  let firstDayCol = firstDayOfMonth.getDay() - 1;
  if (firstDayCol < 0) firstDayCol = 6;

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayCol; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    cells.push(d);
  }
  // Pad until multiple of 7
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const renderMonthView = () => (
    <View>
      {/* Month Header with Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={prevMonth}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-1"
        >
          <Text className="text-zinc-400 text-lg font-bold">‹</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-white tracking-wide">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity
          onPress={nextMonth}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-1"
        >
          <Text className="text-zinc-400 text-lg font-bold">›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Labels (M T W T F S S) */}
      <View className="flex-row justify-between mb-3">
        {WEEKDAYS.map((label, idx) => (
          <View key={idx} className="w-10 items-center">
            <Text
              className={`text-xs font-bold ${
                idx === 6 ? 'text-[#FF6B72]' : 'text-zinc-400'
              }`}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {cells.map((dayNum, idx) => {
          if (dayNum === null) {
            return <View key={idx} className="w-[14.28%] h-12" />;
          }

          const monthStr = String(currentMonth + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const cellDateStr = `${currentYear}-${monthStr}-${dayStr}`;
          const isSelected = selectedDate === cellDateStr;
          const isSunday = idx % 7 === 6;
          const status = dayStatusMap.get(cellDateStr);

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => onSelectDate(cellDateStr)}
              className="w-[14.28%] h-12 items-center justify-center relative"
            >
              <View
                className={`w-9 h-9 items-center justify-center rounded-xl ${
                  isSelected ? 'border-2 border-[#3DDC84]' : ''
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSunday
                      ? 'text-[#FF6B72]'
                      : isSelected
                      ? 'text-white font-bold'
                      : 'text-zinc-200'
                  }`}
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
                          : '#3DDC84',
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View className="mx-4 my-2 p-5 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
      {renderMonthView()}
    </View>
  );
};
