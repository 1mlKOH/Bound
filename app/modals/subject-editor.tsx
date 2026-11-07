import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { timesOverlap } from '../../src/domain/attendance';
import { CloseIcon, CheckIcon, PlusIcon } from '../../src/components/icons';

const PALETTE = [
  '#1FB45A', // Emerald
  '#1E9BFF', // Sky Blue
  '#A25CF2', // Purple
  '#F2459B', // Pink
  '#FF8A1F', // Orange
  '#FFC21A', // Yellow
  '#14B8A6', // Teal
  '#6C7BFF', // Indigo
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SubjectEditorModal() {
  const router = useRouter();
  const { subjectId } = useLocalSearchParams<{ subjectId?: string }>();
  const { subjects, scheduleSlots, saveSubject, archiveSubject, deleteSubject, settings } =
    useAttendanceStore();

  const existingSubject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  const existingSlots = useMemo(
    () =>
      scheduleSlots.filter(
        (slot) =>
          slot.subjectId === subjectId &&
          (slot.effectiveTo === null || slot.effectiveTo >= '2026-11-07')
      ),
    [scheduleSlots, subjectId]
  );

  const [name, setName] = useState(existingSubject?.name || '');
  const [code, setCode] = useState(existingSubject?.code || '');
  const [color, setColor] = useState(existingSubject?.color || PALETTE[0]);
  const [targetPct, setTargetPct] = useState(
    existingSubject?.targetPct ? String(existingSubject.targetPct) : ''
  );
  const [baselinePresent, setBaselinePresent] = useState(
    String(existingSubject?.baselinePresent ?? 0)
  );
  const [baselineAbsent, setBaselineAbsent] = useState(
    String(existingSubject?.baselineAbsent ?? 0)
  );

  // Slots state
  const [slots, setSlots] = useState<
    { weekday: number; startTime: string; endTime: string }[]
  >(() => {
    if (existingSlots.length > 0) {
      return existingSlots.map((s) => ({
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
      }));
    }
    return [{ weekday: 1, startTime: '09:00', endTime: '10:00' }];
  });

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { weekday: 1, startTime: '10:00', endTime: '11:00' },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (
    index: number,
    field: 'weekday' | 'startTime' | 'endTime',
    value: any
  ) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  // Conflict warning
  const hasConflict = useMemo(() => {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (
          slots[i].weekday === slots[j].weekday &&
          timesOverlap(
            slots[i].startTime,
            slots[i].endTime,
            slots[j].startTime,
            slots[j].endTime
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }, [slots]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a subject name.');
      return;
    }

    // Validate times
    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        Alert.alert(
          'Invalid Time',
          `Slot end time (${slot.endTime}) must be later than start time (${slot.startTime}).`
        );
        return;
      }
    }

    const parsedTarget = targetPct.trim() ? parseFloat(targetPct) : null;
    const parsedPresent = parseInt(baselinePresent) || 0;
    const parsedAbsent = parseInt(baselineAbsent) || 0;

    saveSubject(
      {
        id: existingSubject?.id,
        name: name.trim(),
        code: code.trim(),
        color,
        targetPct: parsedTarget,
        baselinePresent: parsedPresent,
        baselineAbsent: parsedAbsent,
        startDate: existingSubject?.startDate || '2026-08-01',
        endDate: existingSubject?.endDate || null,
      },
      slots
    );

    router.back();
  };

  const handleArchive = () => {
    if (!existingSubject) return;
    Alert.alert(
      'Archive Subject',
      'Archiving will hide this subject from active attendance tracking without deleting historical records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            archiveSubject(existingSubject.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!existingSubject) return;
    Alert.alert(
      'Delete Subject',
      'Permanently remove this subject and all its timetable logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSubject(existingSubject.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F1015]" edges={['top']}>
      {/* Modal Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-zinc-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center"
        >
          <CloseIcon size={16} color="#D4D4D8" strokeWidth={2.4} />
        </TouchableOpacity>


        <Text className="text-xl font-black text-white tracking-tight">
          {existingSubject ? 'Edit Subject' : 'Add Subject'}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          className="px-4 py-2 rounded-full bg-[#00BF63]"
        >
          <Text className="text-xs font-black text-[#06210F]">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Details Card */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-3">Course Info</Text>

          {/* Name Input */}
          <Text className="text-xs font-semibold text-zinc-400 mb-1">
            Subject Name *
          </Text>
          <TextInput
            placeholder="e.g. Data Structures"
            placeholderTextColor="#71717A"
            value={name}
            onChangeText={setName}
            className="p-3.5 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold mb-3"
          />

          {/* Course Code Input */}
          <Text className="text-xs font-semibold text-zinc-400 mb-1">
            Course Code (Optional)
          </Text>
          <TextInput
            placeholder="e.g. CS201"
            placeholderTextColor="#71717A"
            value={code}
            onChangeText={setCode}
            className="p-3.5 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold mb-3"
          />

          {/* Color Palette Selector */}
          <Text className="text-xs font-semibold text-zinc-400 mb-2">
            Subject Color Swatch
          </Text>
          <View className="flex-row justify-between mb-2">
            {PALETTE.map((swatch) => {
              const isSelected = color === swatch;
              return (
                <TouchableOpacity
                  key={swatch}
                  onPress={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    isSelected ? 'border-2 border-white scale-110' : ''
                  }`}
                >
                  {isSelected && <CheckIcon size={14} color="#FFFFFF" strokeWidth={2.6} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>


        {/* Target & Baseline History Card */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-1">
            Target & Starting History
          </Text>
          <Text className="text-xs text-zinc-400 mb-3">
            Backfill past attendance or override the global {settings.globalTargetPct}% target.
          </Text>

          <View className="flex-row justify-between space-x-2 mb-3">
            <View className="flex-1 mr-1">
              <Text className="text-xs font-semibold text-zinc-400 mb-1">
                Target % (Optional)
              </Text>
              <TextInput
                placeholder={String(settings.globalTargetPct)}
                placeholderTextColor="#71717A"
                value={targetPct}
                onChangeText={setTargetPct}
                keyboardType="numeric"
                className="p-3 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold"
              />
            </View>

            <View className="flex-1 mx-1">
              <Text className="text-xs font-semibold text-zinc-400 mb-1">
                Attended So Far
              </Text>
              <TextInput
                value={baselinePresent}
                onChangeText={setBaselinePresent}
                keyboardType="numeric"
                className="p-3 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold"
              />
            </View>

            <View className="flex-1 ml-1">
              <Text className="text-xs font-semibold text-zinc-400 mb-1">
                Absent So Far
              </Text>
              <TextInput
                value={baselineAbsent}
                onChangeText={setBaselineAbsent}
                keyboardType="numeric"
                className="p-3 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold"
              />
            </View>
          </View>
        </View>

        {/* Weekly Timetable Schedule Slots Card */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-white">
              Weekly Schedule Slots
            </Text>
            <TouchableOpacity
              onPress={addSlot}
              className="flex-row items-center px-3 py-1.5 rounded-full bg-[#262730] border border-zinc-700"
            >
              <View className="mr-1">
                <PlusIcon size={12} color="#3DDC84" strokeWidth={2.4} />
              </View>
              <Text className="text-xs font-bold text-[#3DDC84]">Add Slot</Text>
            </TouchableOpacity>

          </View>

          {hasConflict && (
            <View className="p-3 mb-3 rounded-xl bg-amber-500/15 border border-amber-500/40">
              <Text className="text-xs font-bold text-[#FFB020]">
                ⚠️ Conflict Detected
              </Text>
              <Text className="text-xs text-zinc-300 mt-0.5">
                Two slots on the same day overlap in time.
              </Text>
            </View>
          )}

          {slots.map((slot, index) => (
            <View
              key={index}
              className="p-3.5 mb-2.5 rounded-2xl bg-[#22232B] border border-[#282932]"
            >
              {/* Day Chips */}
              <View className="flex-row justify-between mb-2">
                {WEEKDAY_NAMES.map((name, dIdx) => {
                  const isSelected = slot.weekday === dIdx;
                  return (
                    <TouchableOpacity
                      key={name}
                      onPress={() => updateSlot(index, 'weekday', dIdx)}
                      className={`px-2 py-1 rounded-lg ${
                        isSelected ? 'bg-[#3DDC84]' : 'bg-[#181920]'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-black' : 'text-zinc-400'
                        }`}
                      >
                        {name.slice(0, 1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Time inputs and remove button */}
              <View className="flex-row items-center justify-between mt-1">
                <View className="flex-row items-center space-x-2">
                  <TextInput
                    value={slot.startTime}
                    onChangeText={(val) => updateSlot(index, 'startTime', val)}
                    placeholder="09:00"
                    placeholderTextColor="#71717A"
                    className="w-20 p-2 rounded-lg bg-[#181920] border border-zinc-800 text-white text-xs font-bold text-center"
                  />
                  <Text className="text-zinc-400 text-xs px-1.5">to</Text>
                  <TextInput
                    value={slot.endTime}
                    onChangeText={(val) => updateSlot(index, 'endTime', val)}
                    placeholder="10:00"
                    placeholderTextColor="#71717A"
                    className="w-20 p-2 rounded-lg bg-[#181920] border border-zinc-800 text-white text-xs font-bold text-center"
                  />
                </View>

                {slots.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeSlot(index)}
                    className="p-2"
                  >
                    <Text className="text-rose-400 text-xs font-bold">Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Archive & Delete Actions for Existing Subjects */}
        {existingSubject && (
          <View className="flex-row space-x-3 my-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleArchive}
              className="flex-1 py-3.5 rounded-full bg-[#22232B] border border-zinc-700 items-center mr-1.5"
            >
              <Text className="text-xs font-bold text-amber-400">
                Archive Subject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDelete}
              className="flex-1 py-3.5 rounded-full bg-rose-950/20 border border-rose-900/40 items-center ml-1.5"
            >
              <Text className="text-xs font-bold text-[#FF6B72]">
                Delete Subject
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
