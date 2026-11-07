import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { TopHeader } from '../../src/components/TopHeader';
import { SubjectCard } from '../../src/components/SubjectCard';
import { SearchIcon, CloseIcon, SubjectsIcon, PlusIcon } from '../../src/components/icons';

export default function SubjectsScreen() {
  const router = useRouter();
  const { getAllSubjectStats } = useAttendanceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const statsList = getAllSubjectStats();

  const filteredStats = useMemo(() => {
    if (!searchQuery.trim()) return statsList;
    const q = searchQuery.toLowerCase();
    return statsList.filter(
      (s) =>
        s.subject.name.toLowerCase().includes(q) ||
        s.subject.code.toLowerCase().includes(q)
    );
  }, [statsList, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-[#0F1015]" edges={['top']}>
      {/* Top Header */}
      <TopHeader title="Subjects" />

      {/* Search Bar matching screenshot 3 */}
      <View className="mx-4 my-2 px-4 py-3 rounded-full bg-[#1B1C22] border border-[#282932] flex-row items-center">
        <View className="mr-2.5">
          <SearchIcon size={16} color="#71717A" />
        </View>
        <TextInput
          placeholder="Search subjects or codes..."
          placeholderTextColor="#71717A"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-sm text-white font-medium p-0"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
            <CloseIcon size={14} color="#A1A1AA" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subjects Cards List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredStats.length === 0 ? (
          <View className="mx-4 my-8 p-8 rounded-[28px] bg-[#1B1C22] border border-[#282932] items-center justify-center">
            <View className="mb-3">
              <SubjectsIcon size={40} color="#71717A" />
            </View>
            <Text className="text-base font-bold text-white mb-1">
              No subjects found
            </Text>

            <Text className="text-xs text-zinc-400 text-center">
              {searchQuery
                ? 'Try a different search term.'
                : "Tap '+ Add subject' below to register your first course."}
            </Text>
          </View>
        ) : (
          filteredStats.map((item) => (
            <SubjectCard
              key={item.subject.id}
              stats={item}
              onPress={() =>
                router.push({
                  pathname: '/modals/subject-editor',
                  params: { subjectId: item.subject.id },
                })
              }
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button: + Add Subject (positioned above bottom nav) */}
      <View className="absolute bottom-24 right-5">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/modals/subject-editor')}
          className="flex-row items-center px-5 py-3.5 rounded-full bg-[#00BF63] shadow-xl"
        >
          <View className="mr-2">
            <PlusIcon size={16} color="#06210F" strokeWidth={2.8} />
          </View>
          <Text className="text-sm font-extrabold text-[#06210F]">
            Add subject
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
