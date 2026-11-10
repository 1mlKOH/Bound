import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  StyleSheet,
  Animated,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import { useTheme } from '../src/utils/theme';
import { Haptics } from '../src/utils/haptics';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  BellIcon,
  RefreshIcon,
  PlusIcon,
  InfoIcon,
  ZapIcon,
} from '../src/components/icons';
import { toast } from 'sonner-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { completeOnboarding, settings } = useAttendanceStore();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  // Screen 1: Simulation state
  const [simulatedMissed, setSimulatedMissed] = useState<boolean>(false);
  const cardScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0.784)).current;

  // Screen 2: Target percentage state
  const [targetPct, setTargetPct] = useState<number>(settings.globalTargetPct || 75);

  // Screen 3: Pathway & Notification preferences
  const [loadSampleData, setLoadSampleData] = useState<boolean>(true);
  const [enableReminders, setEnableReminders] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Smooth programmatic page navigation
  const goToPage = (pageIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPage(pageIndex);
    scrollViewRef.current?.scrollTo({
      x: pageIndex * width,
      animated: true,
    });
  };

  // Sync state on horizontal swipe gesture
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex <= 2) {
      setCurrentPage(pageIndex);
      Haptics.selectionAsync();
    }
  };

  // Toggle Screen 1 simulation
  const toggleSimulation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextState = !simulatedMissed;
    setSimulatedMissed(nextState);

    // Fast spring card pulse
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.97,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        damping: 14,
        stiffness: 260,
        useNativeDriver: true,
      }),
    ]).start();

    // Snappy progress bar fill transition
    Animated.timing(progressAnim, {
      toValue: nextState ? 0.748 : 0.784,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  // Adjust Target percentage
  const adjustTarget = (delta: number) => {
    Haptics.selectionAsync();
    setTargetPct((prev) => {
      const next = Math.round(prev + delta);
      return Math.min(95, Math.max(50, next));
    });
  };

  // Complete onboarding
  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await completeOnboarding({
        targetPct,
        loadSampleData,
        enableReminders,
      });

      toast.success('Welcome to Bound!', {
        description: loadSampleData
          ? 'Sample college timetable loaded. Happy tracking!'
          : 'Ready for your first subject.',
      });

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error completing onboarding:', e);
      setIsSubmitting(false);
    }
  };

  // Skip onboarding with standard defaults
  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await completeOnboarding({
      targetPct: 75,
      loadSampleData: true,
      enableReminders: true,
    });
    router.replace('/(tabs)');
  };

  // Target preset chips
  const presets = [75, 80, 85, 90];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-2">
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={currentPage === 0}
          onPress={() => goToPage(currentPage - 1)}
          style={{ opacity: currentPage > 0 ? 1 : 0 }}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <ChevronLeftIcon size={22} color={colors.text} strokeWidth={2.4} />
        </TouchableOpacity>

        {/* 3-Dot Interactive Progress Indicator */}
        <View className="flex-row items-center gap-2">
          {[0, 1, 2].map((idx) => {
            const isActive = currentPage === idx;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => goToPage(idx)}
                style={{
                  width: isActive ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isActive
                    ? colors.statusSafe
                    : isDark
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.15)',
                }}
              />
            );
          })}
        </View>

        {/* Skip Button */}
        {currentPage < 2 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            className="px-3 py-1.5 rounded-full"
          >
            <Text
              style={[styles.sfText, { color: colors.textSecondary }]}
              className="text-sm font-semibold"
            >
              Skip
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}
      </View>

      {/* Main Gesture-Enabled Horizontal Pager */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* ========================================================= */}
        {/* SCREEN 1: Visual Hero & Attendance Math Pitch             */}
        {/* ========================================================= */}
        <View style={{ width, flex: 1 }} className="px-6 justify-between py-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          >
            {/* Title & Subtitle without eyebrow labels */}
            <Text
              style={[styles.sfText, { color: colors.text }]}
              className="text-3xl font-extrabold tracking-tight mb-1.5"
            >
              Stop guessing.{'\n'}Know when you can miss.
            </Text>
            <Text
              style={[styles.sfText, { color: colors.textSecondary }]}
              className="text-sm font-medium leading-5 mb-4"
            >
              Bound calculates your exact safety buffer in real time so you never
              drop below college cutoff thresholds.
            </Text>

            {/* Interactive Simulation Hero Card */}
            <Animated.View
              style={[
                styles.cardShadow,
                {
                  transform: [{ scale: cardScale }],
                  backgroundColor: colors.card,
                  borderColor: simulatedMissed
                    ? isDark
                      ? '#FF6B72'
                      : '#D1323A'
                    : colors.cardBorder,
                  borderWidth: 1.5,
                  borderRadius: 24,
                  borderCurve: 'continuous',
                },
              ]}
              className="p-4 my-1"
            >
              {/* Subject Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2.5">
                  <View
                    style={{ backgroundColor: '#A25CF2' }}
                    className="w-3.5 h-3.5 rounded-full"
                  />
                  <View>
                    <Text
                      style={[styles.sfText, { color: colors.text }]}
                      className="text-base font-bold"
                    >
                      Data Structures
                    </Text>
                    <Text
                      style={[styles.sfText, { color: colors.textSecondary }]}
                      className="text-xs font-medium"
                    >
                      CS201 · 11:00 – 12:00
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={{
                    backgroundColor: simulatedMissed
                      ? isDark
                        ? 'rgba(255, 107, 114, 0.15)'
                        : 'rgba(209, 50, 58, 0.10)'
                      : isDark
                      ? 'rgba(61, 220, 132, 0.15)'
                      : 'rgba(13, 138, 51, 0.10)',
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: simulatedMissed
                      ? isDark
                        ? '#FF6B72'
                        : '#D1323A'
                      : isDark
                      ? '#3DDC84'
                      : '#0D8A33',
                  }}
                  className="px-2.5 py-1 flex-row items-center gap-1.5"
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: simulatedMissed
                        ? isDark
                          ? '#FF6B72'
                          : '#D1323A'
                        : isDark
                        ? '#3DDC84'
                        : '#0D8A33',
                    }}
                  />
                  <Text
                    style={[
                      styles.sfText,
                      styles.tabular,
                      {
                        color: simulatedMissed
                          ? isDark
                            ? '#FF6B72'
                            : '#D1323A'
                          : isDark
                          ? '#3DDC84'
                          : '#0D8A33',
                      },
                    ]}
                    className="text-xs font-bold"
                  >
                    {simulatedMissed ? 'Below Target' : 'Safe'}
                  </Text>
                </View>
              </View>

              {/* Percentage Display */}
              <View className="flex-row items-baseline justify-between mb-2">
                <View className="flex-row items-baseline gap-1">
                  <Text
                    style={[
                      styles.sfText,
                      styles.tabular,
                      {
                        color: simulatedMissed
                          ? isDark
                            ? '#FF6B72'
                            : '#D1323A'
                          : isDark
                          ? '#3DDC84'
                          : '#0D8A33',
                      },
                    ]}
                    className="text-3xl font-extrabold"
                  >
                    {simulatedMissed ? '74.8%' : '78.4%'}
                  </Text>
                  <Text
                    style={[styles.sfText, { color: colors.textSecondary }]}
                    className="text-xs font-semibold"
                  >
                    / 75% target
                  </Text>
                </View>

                <Text
                  style={[
                    styles.sfText,
                    styles.tabular,
                    { color: colors.textSecondary },
                  ]}
                  className="text-xs font-semibold"
                >
                  {simulatedMissed ? '18 / 24 classes' : '18 / 23 classes'}
                </Text>
              </View>

              {/* Animated Progress Bar */}
              <View
                style={{
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                }}
                className="mb-3.5"
              >
                <Animated.View
                  style={{
                    height: '100%',
                    borderRadius: 4,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: simulatedMissed
                      ? isDark
                        ? '#FF6B72'
                        : '#D1323A'
                      : isDark
                      ? '#3DDC84'
                      : '#0D8A33',
                  }}
                />
              </View>

              {/* Dynamic Buffer Pill */}
              <View
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                  borderRadius: 14,
                  borderCurve: 'continuous',
                }}
                className="p-2.5 mb-3.5 flex-row items-center justify-between"
              >
                <Text
                  style={[styles.sfText, { color: colors.textSecondary }]}
                  className="text-xs font-medium"
                >
                  Actionable Margin:
                </Text>
                <Text
                  style={[
                    styles.sfText,
                    styles.tabular,
                    {
                      color: simulatedMissed
                        ? isDark
                          ? '#FF6B72'
                          : '#D1323A'
                        : isDark
                        ? '#3DDC84'
                        : '#0D8A33',
                    },
                  ]}
                  className="text-xs font-bold"
                >
                  {simulatedMissed
                    ? 'Attend next 1 class to recover'
                    : 'Can miss 2 classes safely'}
                </Text>
              </View>

              {/* Interactive Simulation Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleSimulation}
                style={{
                  backgroundColor: simulatedMissed
                    ? isDark
                      ? 'rgba(61, 220, 132, 0.15)'
                      : 'rgba(13, 138, 51, 0.12)'
                    : isDark
                    ? 'rgba(255, 107, 114, 0.15)'
                    : 'rgba(209, 50, 58, 0.12)',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: simulatedMissed
                    ? isDark
                      ? '#3DDC84'
                      : '#0D8A33'
                    : isDark
                    ? '#FF6B72'
                    : '#D1323A',
                }}
                className="py-2.5 px-4 flex-row items-center justify-center gap-2"
              >
                {simulatedMissed ? (
                  <RefreshIcon
                    size={14}
                    color={isDark ? '#3DDC84' : '#0D8A33'}
                  />
                ) : (
                  <ZapIcon
                    size={14}
                    color={isDark ? '#FF6B72' : '#D1323A'}
                  />
                )}
                <Text
                  style={[
                    styles.sfText,
                    {
                      color: simulatedMissed
                        ? isDark
                          ? '#3DDC84'
                          : '#0D8A33'
                        : isDark
                        ? '#FF6B72'
                        : '#D1323A',
                    },
                  ]}
                  className="text-xs font-bold"
                >
                  {simulatedMissed
                    ? 'Reset to Safe State'
                    : "Simulate Missing Today's Class"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Helper callout with SVG icon */}
            <View className="mt-3 px-1 flex-row items-center justify-center gap-1.5">
              <InfoIcon size={14} color={colors.textSecondary} />
              <Text
                style={[styles.sfText, { color: colors.textSecondary }]}
                className="text-xs text-center leading-4"
              >
                Swipe left or tap Continue to set your college cutoff.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* ========================================================= */}
        {/* SCREEN 2: Attendance Cutoff Target Configuration          */}
        {/* ========================================================= */}
        <View style={{ width, flex: 1 }} className="px-6 justify-between py-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          >
            {/* Title & Subtitle without eyebrow labels */}
            <Text
              style={[styles.sfText, { color: colors.text }]}
              className="text-3xl font-extrabold tracking-tight mb-1.5"
            >
              Set your attendance{'\n'}minimum cutoff
            </Text>
            <Text
              style={[styles.sfText, { color: colors.textSecondary }]}
              className="text-sm font-medium leading-5 mb-4"
            >
              Pick your university requirement. You can also override targets
              per-subject later.
            </Text>

            {/* Target Picker Card */}
            <View
              style={[
                styles.cardShadow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                  borderRadius: 24,
                  borderCurve: 'continuous',
                },
              ]}
              className="p-5 my-1 items-center"
            >
              {/* Big Display Number */}
              <View className="flex-row items-baseline mb-0.5">
                <Text
                  style={[
                    styles.sfText,
                    styles.tabular,
                    { color: colors.statusSafe },
                  ]}
                  className="text-5xl font-black"
                >
                  {targetPct}
                </Text>
                <Text
                  style={[
                    styles.sfText,
                    { color: colors.statusSafe },
                  ]}
                  className="text-2xl font-extrabold ml-1"
                >
                  %
                </Text>
              </View>

              {/* Subtitle Policy Description */}
              <Text
                style={[styles.sfText, { color: colors.textSecondary }]}
                className="text-xs font-semibold uppercase tracking-wider mb-5"
              >
                {targetPct === 75
                  ? 'Standard University Requirement'
                  : targetPct === 80
                  ? 'Strict Engineering / Medical Policy'
                  : targetPct === 85
                  ? 'High Honors / Scholarship Cutoff'
                  : targetPct >= 90
                  ? 'Maximum Compliance Threshold'
                  : 'Custom Cutoff Target'}
              </Text>

              {/* Preset Chips */}
              <View className="flex-row items-center justify-center gap-2 mb-5 w-full">
                {presets.map((val) => {
                  const isSelected = targetPct === val;
                  return (
                    <TouchableOpacity
                      key={val}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setTargetPct(val);
                      }}
                      style={{
                        backgroundColor: isSelected
                          ? colors.statusSafe
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: isSelected
                          ? colors.statusSafe
                          : colors.cardBorder,
                      }}
                      className="flex-1 py-2 items-center justify-center"
                    >
                      <Text
                        style={[
                          styles.sfText,
                          styles.tabular,
                          {
                            color: isSelected ? '#06210F' : colors.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                        className="text-sm"
                      >
                        {val}%
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Granular Stepper Row */}
              <View className="flex-row items-center justify-between w-full pt-3.5 border-t border-black/5 dark:border-white/10">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => adjustTarget(-5)}
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 12,
                      borderCurve: 'continuous',
                    }}
                    className="px-2.5 py-1.5"
                  >
                    <Text
                      style={[styles.sfText, { color: colors.text }]}
                      className="text-xs font-bold"
                    >
                      -5%
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => adjustTarget(-1)}
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 12,
                      borderCurve: 'continuous',
                    }}
                    className="px-2.5 py-1.5"
                  >
                    <Text
                      style={[styles.sfText, { color: colors.text }]}
                      className="text-xs font-bold"
                    >
                      -1%
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[styles.sfText, { color: colors.textSecondary }]}
                  className="text-xs font-medium"
                >
                  Fine-tune
                </Text>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => adjustTarget(1)}
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 12,
                      borderCurve: 'continuous',
                    }}
                    className="px-2.5 py-1.5"
                  >
                    <Text
                      style={[styles.sfText, { color: colors.text }]}
                      className="text-xs font-bold"
                    >
                      +1%
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => adjustTarget(5)}
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 12,
                      borderCurve: 'continuous',
                    }}
                    className="px-2.5 py-1.5"
                  >
                    <Text
                      style={[styles.sfText, { color: colors.text }]}
                      className="text-xs font-bold"
                    >
                      +5%
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Dynamic Impact Explanation */}
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.03)',
                borderRadius: 16,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
              className="p-3 mt-2.5 flex-row items-start gap-2"
            >
              <InfoIcon size={16} color={colors.statusSafe} />
              <Text
                style={[styles.sfText, { color: colors.textSecondary }]}
                className="text-xs leading-4 flex-1"
              >
                At <Text style={{ color: colors.text }} className="font-bold">{targetPct}%</Text>,
                a 40-session semester allows you to miss up to{' '}
                <Text style={{ color: colors.statusSafe }} className="font-bold">
                  {Math.floor(40 * (1 - targetPct / 100))} classes
                </Text>{' '}
                while maintaining your safe threshold.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* ========================================================= */}
        {/* SCREEN 3: Quick Start Pathway & Reminders                 */}
        {/* ========================================================= */}
        <View style={{ width, flex: 1 }} className="px-6 justify-between py-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          >
            {/* Title & Subtitle without eyebrow labels */}
            <Text
              style={[styles.sfText, { color: colors.text }]}
              className="text-3xl font-extrabold tracking-tight mb-1.5"
            >
              Choose how you{'\n'}want to start
            </Text>
            <Text
              style={[styles.sfText, { color: colors.textSecondary }]}
              className="text-sm font-medium leading-5 mb-4"
            >
              Test drive with a sample university timetable or start with a clean
              slate. You can reset in Settings anytime.
            </Text>

            {/* Pathway Card 1: Sample Timetable */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync();
                setLoadSampleData(true);
              }}
              style={[
                styles.cardShadow,
                {
                  backgroundColor: colors.card,
                  borderColor: loadSampleData
                    ? colors.statusSafe
                    : colors.cardBorder,
                  borderWidth: loadSampleData ? 2 : 1,
                  borderRadius: 22,
                  borderCurve: 'continuous',
                },
              ]}
              className="p-3.5 mb-2.5"
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2.5">
                  <View
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(0, 191, 99, 0.2)'
                        : 'rgba(0, 191, 99, 0.15)',
                    }}
                    className="w-7 h-7 rounded-full items-center justify-center"
                  >
                    <RefreshIcon size={14} color={colors.statusSafe} />
                  </View>
                  <View>
                    <Text
                      style={[styles.sfText, { color: colors.text }]}
                      className="text-sm font-bold"
                    >
                      Sample University Timetable
                    </Text>
                    <Text
                      style={[styles.sfText, { color: colors.statusSafe }]}
                      className="text-xs font-semibold"
                    >
                      Recommended for exploring
                    </Text>
                  </View>
                </View>

                {/* Radio Indicator */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: loadSampleData
                      ? colors.statusSafe
                      : colors.cardBorder,
                    backgroundColor: loadSampleData
                      ? colors.statusSafe
                      : 'transparent',
                  }}
                  className="items-center justify-center"
                >
                  {loadSampleData && <CheckIcon size={11} color="#06210F" strokeWidth={3} />}
                </View>
              </View>

              <Text
                style={[styles.sfText, { color: colors.textSecondary }]}
                className="text-xs font-medium leading-4 mb-2"
              >
                Preloads 4 realistic courses (Physics, Data Structures, Economics,
                Chemistry) with daily slots and calendar stats.
              </Text>

              {/* Preview color dots */}
              <View className="flex-row items-center gap-1.5">
                {['#1E9BFF', '#A25CF2', '#FF8A1F', '#1FB45A'].map((c, i) => (
                  <View
                    key={i}
                    style={{ backgroundColor: c }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
                <Text
                  style={[styles.sfText, { color: colors.textSecondary }]}
                  className="text-xs font-medium ml-1"
                >
                  4 courses included
                </Text>
              </View>
            </TouchableOpacity>

            {/* Pathway Card 2: Clean Slate */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.selectionAsync();
                setLoadSampleData(false);
              }}
              style={[
                styles.cardShadow,
                {
                  backgroundColor: colors.card,
                  borderColor: !loadSampleData
                    ? colors.statusSafe
                    : colors.cardBorder,
                  borderWidth: !loadSampleData ? 2 : 1,
                  borderRadius: 22,
                  borderCurve: 'continuous',
                },
              ]}
              className="p-3.5 mb-3"
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2.5">
                  <View
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.06)',
                    }}
                    className="w-7 h-7 rounded-full items-center justify-center"
                  >
                    <PlusIcon size={14} color={colors.text} />
                  </View>
                  <View>
                    <Text
                      style={[styles.sfText, { color: colors.text }]}
                      className="text-sm font-bold"
                    >
                      Start Clean Slate
                    </Text>
                    <Text
                      style={[styles.sfText, { color: colors.textSecondary }]}
                      className="text-xs font-medium"
                    >
                      Empty timetable
                    </Text>
                  </View>
                </View>

                {/* Radio Indicator */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: !loadSampleData
                      ? colors.statusSafe
                      : colors.cardBorder,
                    backgroundColor: !loadSampleData
                      ? colors.statusSafe
                      : 'transparent',
                  }}
                  className="items-center justify-center"
                >
                  {!loadSampleData && <CheckIcon size={11} color="#06210F" strokeWidth={3} />}
                </View>
              </View>

              <Text
                style={[styles.sfText, { color: colors.textSecondary }]}
                className="text-xs font-medium leading-4"
              >
                Start completely fresh and add your actual subjects and time slots
                one by one.
              </Text>
            </TouchableOpacity>

            {/* Notification Card */}
            <View
              style={[
                styles.cardShadow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                  borderRadius: 20,
                  borderCurve: 'continuous',
                },
              ]}
              className="p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3 flex-1 pr-3">
                <View
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)',
                  }}
                  className="w-7 h-7 rounded-full items-center justify-center"
                >
                  <BellIcon size={14} color={colors.text} />
                </View>
                <View className="flex-1">
                  <Text
                    style={[styles.sfText, { color: colors.text }]}
                    className="text-sm font-bold"
                  >
                    Class Reminders
                  </Text>
                  <Text
                    style={[styles.sfText, { color: colors.textSecondary }]}
                    className="text-xs font-medium"
                  >
                    5 mins before class & 18:00 daily check
                  </Text>
                </View>
              </View>

              <Switch
                value={enableReminders}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setEnableReminders(val);
                }}
                trackColor={{
                  false: isDark ? '#2C2D34' : '#E3E3E8',
                  true: colors.statusSafe,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          backgroundColor: colors.canvas,
        }}
        className="px-6 pt-3"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (currentPage < 2) {
              goToPage(currentPage + 1);
            } else {
              handleFinish();
            }
          }}
          disabled={isSubmitting}
          style={[
            styles.ctaShadow,
            {
              backgroundColor: colors.statusSafe,
              borderRadius: 999,
            },
          ]}
          className="py-3.5 items-center justify-center flex-row gap-2"
        >
          <Text
            style={[styles.sfText, { color: '#06210F' }]}
            className="text-base font-extrabold tracking-wide"
          >
            {currentPage < 2
              ? 'Continue'
              : isSubmitting
              ? 'Preparing your semester...'
              : 'Enter Bound'}
          </Text>
          {currentPage < 2 && (
            <ChevronRightIcon size={18} color="#06210F" strokeWidth={2.6} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaShadow: {
    shadowColor: '#00BF63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
