import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { CloseIcon } from '../../src/components/icons';

export default function ExtraClassModal() {
  const router = useRouter();
  const { subjects, selectedDate, addExtraClass } = useAttendanceStore();

  const activeSubjects = subjects.filter((s) => !s.archivedAt);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeSubjects[0]?.id || ''
  );
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');

  const handleSave = () => {
    if (!selectedSubjectId) {
      Alert.alert('Required', 'Please select a subject.');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    addExtraClass(selectedSubjectId, date, startTime, endTime);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F1015]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-zinc-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center"
        >
          <CloseIcon size={16} color="#D4D4D8" strokeWidth={2.4} />
        </TouchableOpacity>


        <Text className="text-xl font-black text-white tracking-tight">
          Add Extra Class
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          className="px-4 py-2 rounded-full bg-[#00BF63]"
        >
          <Text className="text-xs font-black text-[#06210F]">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
        {/* Subject Selection */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-2">Select Subject</Text>
          <View className="flex-row flex-wrap gap-2">
            {activeSubjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => setSelectedSubjectId(sub.id)}
                  style={{
                    backgroundColor: isSelected ? sub.color : '#22232B',
                    borderColor: isSelected ? '#FFFFFF' : '#282932',
                  }}
                  className="px-4 py-2.5 rounded-full border mb-2 mr-1"
                >
                  <Text
                    style={{ color: isSelected ? '#FFFFFF' : '#D4D4D8' }}
                    className="text-xs font-bold"
                  >
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date & Time Settings */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-3">Time & Date</Text>

          <Text className="text-xs font-semibold text-zinc-400 mb-1">
            Date (YYYY-MM-DD)
          </Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-11-07"
            placeholderTextColor="#71717A"
            className="p-3.5 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold mb-3"
          />

          <View className="flex-row justify-between space-x-2">
            <View className="flex-1 mr-1.5">
              <Text className="text-xs font-semibold text-zinc-400 mb-1">
                Start Time
              </Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="15:00"
                placeholderTextColor="#71717A"
                className="p-3 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold text-center"
              />
            </View>

            <View className="flex-1 ml-1.5">
              <Text className="text-xs font-semibold text-zinc-400 mb-1">
                End Time
              </Text>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="16:00"
                placeholderTextColor="#71717A"
                className="p-3 rounded-xl bg-[#22232B] border border-[#282932] text-white text-sm font-semibold text-center"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
