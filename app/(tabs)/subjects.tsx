import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform, StyleSheet, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Haptics } from '../../src/utils/haptics';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { TopHeader } from '../../src/components/TopHeader';
import { SubjectCard } from '../../src/components/SubjectCard';
import { SearchIcon, CloseIcon, SubjectsIcon, BookPlusIcon } from '../../src/components/icons';
import { useTheme } from '../../src/utils/theme';

export default function SubjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { getAllSubjectStats } = useAttendanceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

  // Position FAB safely above the 70px FloatingBottomNav
  const fabBottom = Math.max(insets.bottom, 16) + 70 + 16;

  const fabScale = useRef(new Animated.Value(1)).current;

  const onFabPressIn = () => {
    Animated.timing(fabScale, {
      toValue: 0.94,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={['top']}
    >
      {/* Top Header */}
      <TopHeader title="Subjects" />

      {/* Search Bar with Apple liquid glass styling and subtle focus highlight */}
      <View
        style={[
          styles.searchBar,
          {
            borderRadius: 20,
            borderCurve: 'continuous',
            backgroundColor: colors.glassBg,
            borderColor: isSearchFocused
              ? colors.textSecondary
              : isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
            shadowColor: colors.cardShadow,
          },
        ]}
        className="mx-4 my-2 px-4 py-2.5 flex-row items-center"
      >
        <View className="mr-2.5">
          <SearchIcon size={16} color={isSearchFocused ? colors.text : colors.textMuted} />
        </View>
        <TextInput
          placeholder="Search subjects or codes..."
          placeholderTextColor={colors.placeholderText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={[styles.sfText, { color: colors.text }]}
          className="flex-1 text-[14px] font-medium p-0"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setSearchQuery('');
            }}
            className="p-1"
          >
            <CloseIcon size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Subjects Cards List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: fabBottom + 64, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredStats.length === 0 ? (
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
            className="mx-4 my-8 p-8 items-center justify-center"
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
              <SubjectsIcon size={32} color={colors.textMuted} />
            </View>
            <Text
              style={[styles.sfText, { color: colors.text }]}
              className="text-base font-semibold mb-1"
            >
              No subjects found
            </Text>

            <Text
              style={[styles.sfText, { color: colors.textMuted }]}
              className="text-xs text-center"
            >
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

      {/* Floating Action Button: + Add Subject (with spring press feedback) */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: fabBottom,
          right: 20,
          transform: [{ scale: fabScale }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPressIn={onFabPressIn}
          onPressOut={onFabPressOut}
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
            <BookPlusIcon size={18} color="#06210F" strokeWidth={2} />
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  fab: {
    shadowColor: '#00BF63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyCard: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
