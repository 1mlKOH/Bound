import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
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

      {/* Search Bar with Apple liquid glass styling */}
      <View
        style={[
          styles.searchBar,
          {
            borderRadius: 20,
            borderCurve: 'continuous',
          },
        ]}
        className="mx-4 my-2 px-4 py-2.5 bg-white/[0.08] border border-white/[0.12] flex-row items-center"
      >
        <View className="mr-2.5">
          <SearchIcon size={16} color="rgba(255, 255, 255, 0.45)" />
        </View>
        <TextInput
          placeholder="Search subjects or codes..."
          placeholderTextColor="rgba(255, 255, 255, 0.35)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.sfText}
          className="flex-1 text-[14px] text-white font-medium p-0"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setSearchQuery('');
            }}
            className="p-1"
          >
            <CloseIcon size={14} color="rgba(255, 255, 255, 0.6)" />
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
          <View
            style={[
              styles.emptyCard,
              { borderRadius: 28, borderCurve: 'continuous' },
            ]}
            className="mx-4 my-8 p-8 bg-[#1B1C22] items-center justify-center"
          >
            <View className="mb-3">
              <SubjectsIcon size={40} color="#71717A" />
            </View>
            <Text style={styles.sfText} className="text-base font-semibold text-white mb-1">
              No subjects found
            </Text>

            <Text style={styles.sfText} className="text-xs text-white/50 text-center">
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

      {/* Floating Action Button: + Add Subject */}
      <View className="absolute bottom-24 right-5">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/modals/subject-editor');
          }}
          style={[
            styles.fab,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
            },
          ]}
          className="flex-row items-center px-5 py-3.5 bg-[#00BF63]"
        >
          <View className="mr-2">
            <PlusIcon size={16} color="#06210F" strokeWidth={2.8} />
          </View>
          <Text
            style={[
              styles.sfText,
              { letterSpacing: -0.2 },
            ]}
            className="text-[14px] font-bold text-[#06210F]"
          >
            Add subject
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
  },
  fab: {
    shadowColor: '#00BF63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
