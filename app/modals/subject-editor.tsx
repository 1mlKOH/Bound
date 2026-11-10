import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  LayoutAnimation,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { timesOverlap } from '../../src/domain/attendance';
import { CloseIcon, CheckIcon, PlusIcon } from '../../src/components/icons';
import { useTheme } from '../../src/utils/theme';
import { Haptics } from '../../src/utils/haptics';
import {
  SubjectDuotoneIcon,
  detectSubjectCategory,
} from '../../src/components/icons/SubjectDuotoneIcon';
import { toast } from 'sonner-native';

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

function formatTimeInput(val: string): string {
  const cleaned = val.replace(/[^0-9:]/g, '');
  if (cleaned.length === 4 && !cleaned.includes(':')) {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  }
  return cleaned;
}

const TactileCloseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={{
          backgroundColor: colors.glassBg,
        }}
        className="w-9 h-9 rounded-full items-center justify-center"
      >
        <CloseIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SubjectEditorModal() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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

  const detectedCategory = useMemo(
    () => detectSubjectCategory(name, code),
    [name, code]
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

  const scrollViewRef = useRef<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToSlot = (index?: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const addSlot = () => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setSlots((prev) => [
      ...prev,
      { weekday: 1, startTime: '10:00', endTime: '11:00' },
    ]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const removeSlot = (index: number) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
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
    const cleanName = name.replace(/[\r\n]+/g, ' ').trim();
    const cleanCode = code.replace(/[\r\n]+/g, ' ').trim();

    if (!cleanName) {
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
        name: cleanName,
        code: cleanCode,
        color,
        targetPct: parsedTarget,
        baselinePresent: parsedPresent,
        baselineAbsent: parsedAbsent,
        startDate: existingSubject?.startDate || '2026-08-01',
        endDate: existingSubject?.endDate || null,
      },
      slots
    );

    toast.success(existingSubject ? 'Subject updated' : 'Subject added', {
      description: cleanName,
    });
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
            toast.info(`"${existingSubject.name}" archived`);
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
            toast.info(`"${existingSubject.name}" deleted`);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={['top']}
    >
      {/* Modal Header */}
      <View
        style={{ borderBottomColor: colors.divider }}
        className="flex-row items-center justify-between px-4 pt-3 pb-3 border-b"
      >
        <View className="w-16 items-start">
          <TactileCloseButton onPress={() => router.back()} />
        </View>

        <Text
          style={[
            styles.sfText,
            { color: colors.text, letterSpacing: -0.3 },
          ]}
          numberOfLines={1}
          className="text-[17px] font-bold tracking-tight text-center flex-1"
        >
          {existingSubject ? 'Edit Subject' : 'Add Subject'}
        </Text>

        <View className="w-16 items-end">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            className="px-4 py-2 rounded-full bg-[#00BF63]"
          >
            <Text className="text-xs font-bold text-[#06210F]">Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-3"
          contentContainerStyle={{
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
        {/* Live Auto-Icon Preview Banner */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-4 my-2 rounded-[24px] flex-row items-center"
        >
          {/* Avatar Circle with Auto-Selected Duotone Icon */}
          <View
            style={{
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
            }}
            className="w-14 h-14 rounded-full items-center justify-center mr-3.5"
          >
            <SubjectDuotoneIcon name={name} code={code} size={28} />
          </View>

          {/* Synchronous Live Subject Details */}
          <View className="flex-1">
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
              }}
              className="self-start px-2 py-0.5 rounded-md mb-1"
            >
              <Text
                style={[styles.sfText, { color: colors.textDim }]}
                className="text-[10px] font-bold tracking-wider uppercase"
                numberOfLines={1}
              >
                Auto Icon • {detectedCategory.label}
              </Text>
            </View>

            {/* Synchronous Subject Name */}
            <Text
              style={[
                styles.sfText,
                {
                  color: name.trim() ? colors.text : colors.textMuted,
                  letterSpacing: -0.3,
                },
              ]}
              className="text-[17px] font-bold"
              numberOfLines={1}
            >
              {name.trim() || (code.trim() ? code.trim() : 'Subject Name')}
            </Text>

            {/* Course Code or Guidance */}
            <Text
              style={[
                styles.sfText,
                { color: colors.textMuted, letterSpacing: 0.1 },
              ]}
              className="text-[12px] mt-0.5"
              numberOfLines={1}
            >
              {code.trim()
                ? code.trim()
                : name.trim()
                ? 'No course code'
                : 'Type a subject name or code below'}
            </Text>
          </View>
        </View>

        {/* Basic Details Card */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2 rounded-[28px]"
        >
          <Text
            style={{ color: colors.text }}
            className="text-base font-bold mb-3"
          >
            Course Info
          </Text>

          {/* Name Input */}
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs font-semibold mb-1"
          >
            Subject Name *
          </Text>
          <TextInput
            placeholder="e.g. Data Structures"
            placeholderTextColor={colors.placeholderText}
            value={name}
            onChangeText={setName}
            maxLength={60}
            multiline={false}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            }}
            className="p-3.5 rounded-xl border text-sm font-semibold mb-3"
          />

          {/* Course Code Input */}
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs font-semibold mb-1"
          >
            Course Code (Optional)
          </Text>
          <TextInput
            placeholder="e.g. CS201"
            placeholderTextColor={colors.placeholderText}
            value={code}
            onChangeText={setCode}
            maxLength={15}
            multiline={false}
            autoCapitalize="characters"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            }}
            className="p-3.5 rounded-xl border text-sm font-semibold mb-3"
          />

          {/* Color Palette Selector */}
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs font-semibold mb-2"
          >
            Subject Color Swatch
          </Text>
          <View className="flex-row justify-between mb-2">
            {PALETTE.map((swatch) => {
              const isSelected = color === swatch;
              return (
                <TouchableOpacity
                  key={swatch}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    setColor(swatch);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.swatchItem,
                    {
                      backgroundColor: swatch,
                      transform: [{ scale: isSelected ? 1.14 : 1 }],
                      borderWidth: isSelected ? 2.5 : 0,
                      borderColor: '#FFFFFF',
                      shadowColor: isSelected ? swatch : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.45 : 0,
                      shadowRadius: 5,
                      elevation: isSelected ? 4 : 0,
                    },
                  ]}
                >
                  {isSelected && <CheckIcon size={14} color="#FFFFFF" strokeWidth={2.6} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Target & Baseline History Card */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2 rounded-[28px]"
        >
          <Text
            style={{ color: colors.text }}
            className="text-base font-bold mb-1"
          >
            Target & Starting History
          </Text>
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs mb-3"
          >
            Backfill past attendance or override the global {settings.globalTargetPct}% target.
          </Text>

          <View className="flex-row justify-between space-x-2 mb-3">
            <View className="flex-1 mr-1">
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs font-semibold mb-1"
              >
                Target % (Optional)
              </Text>
              <TextInput
                placeholder={String(settings.globalTargetPct)}
                placeholderTextColor={colors.placeholderText}
                value={targetPct}
                onChangeText={setTargetPct}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 320, animated: true });
                  }, 120);
                }}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }}
                className="p-3 rounded-xl border text-sm font-semibold"
              />
            </View>

            <View className="flex-1 mx-1">
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs font-semibold mb-1"
              >
                Attended So Far
              </Text>
              <TextInput
                value={baselinePresent}
                onChangeText={setBaselinePresent}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 320, animated: true });
                  }, 120);
                }}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }}
                className="p-3 rounded-xl border text-sm font-semibold"
              />
            </View>

            <View className="flex-1 ml-1">
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs font-semibold mb-1"
              >
                Absent So Far
              </Text>
              <TextInput
                value={baselineAbsent}
                onChangeText={setBaselineAbsent}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 320, animated: true });
                  }, 120);
                }}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }}
                className="p-3 rounded-xl border text-sm font-semibold"
              />
            </View>
          </View>
        </View>

        {/* Weekly Timetable Schedule Slots Card */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2 rounded-[28px]"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text
              style={{ color: colors.text }}
              className="text-base font-bold"
            >
              Weekly Schedule Slots
            </Text>
            <TouchableOpacity
              onPress={addSlot}
              style={{
                backgroundColor: colors.actionBg,
              }}
              className="flex-row items-center px-3 py-1.5 rounded-full"
            >
              <View className="mr-1">
                <PlusIcon size={12} color={colors.statusSafe} strokeWidth={2.4} />
              </View>
              <Text
                style={{ color: colors.statusSafe }}
                className="text-xs font-bold"
              >
                Add Slot
              </Text>
            </TouchableOpacity>
          </View>

          {hasConflict && (
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(245, 158, 11, 0.12)',
              }}
              className="p-3 mb-3 rounded-xl"
            >
              <Text
                style={{ color: isDark ? '#FFB020' : '#D97706' }}
                className="text-xs font-bold"
              >
                ⚠️ Conflict Detected
              </Text>
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs mt-0.5"
              >
                Two slots on the same day overlap in time.
              </Text>
            </View>
          )}

          {slots.map((slot, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.cardSubtle,
                borderColor: colors.inputBorder,
              }}
              className="p-3.5 mb-2.5 rounded-2xl border"
            >
              {/* Day Chips */}
              <View className="flex-row justify-between mb-2">
                {WEEKDAY_NAMES.map((dName, dIdx) => {
                  const isSelected = slot.weekday === dIdx;
                  return (
                    <TouchableOpacity
                      key={dName}
                      onPress={() => updateSlot(index, 'weekday', dIdx)}
                      style={{
                        backgroundColor: isSelected
                          ? colors.statusSafe
                          : colors.inputBg,
                      }}
                      className="px-2 py-1 rounded-lg"
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? '#06210F'
                            : colors.textMuted,
                        }}
                        className="text-xs font-bold"
                      >
                        {dName.slice(0, 1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Time inputs and remove button */}
              <View className="flex-row items-center justify-between mt-1">
                <View className="flex-row items-center space-x-2">
                  <View>
                    <Text
                      style={{ color: colors.textMuted }}
                      className="text-[10px] font-semibold mb-0.5"
                    >
                      Start
                    </Text>
                    <TextInput
                      value={slot.startTime}
                      onChangeText={(val) =>
                        updateSlot(index, 'startTime', formatTimeInput(val))
                      }
                      onFocus={() => scrollToSlot(index)}
                      placeholder="09:00"
                      placeholderTextColor={colors.placeholderText}
                      keyboardType="numbers-and-punctuation"
                      returnKeyType="next"
                      style={{
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                      className="w-20 p-2 rounded-lg border text-xs font-bold text-center"
                    />
                  </View>
                  <Text
                    style={{ color: colors.textMuted }}
                    className="text-xs px-1 pt-3 font-semibold"
                  >
                    to
                  </Text>
                  <View>
                    <Text
                      style={{ color: colors.textMuted }}
                      className="text-[10px] font-semibold mb-0.5"
                    >
                      End
                    </Text>
                    <TextInput
                      value={slot.endTime}
                      onChangeText={(val) =>
                        updateSlot(index, 'endTime', formatTimeInput(val))
                      }
                      onFocus={() => scrollToSlot(index)}
                      placeholder="10:00"
                      placeholderTextColor={colors.placeholderText}
                      keyboardType="numbers-and-punctuation"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      style={{
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                      className="w-20 p-2 rounded-lg border text-xs font-bold text-center"
                    />
                  </View>
                </View>

                {slots.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeSlot(index)}
                    className="p-2 pt-3"
                  >
                    <Text
                      style={{ color: isDark ? '#FF6B72' : '#DC2626' }}
                      className="text-xs font-bold"
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Quick time preset chips for 1-tap standard scheduling */}
              <View className="flex-row flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.05)]">
                {[
                  { start: '09:00', end: '10:00' },
                  { start: '10:00', end: '11:00' },
                  { start: '11:00', end: '12:00' },
                  { start: '14:00', end: '15:00' },
                  { start: '15:00', end: '16:00' },
                ].map((preset) => {
                  const isActive =
                    slot.startTime === preset.start && slot.endTime === preset.end;
                  return (
                    <TouchableOpacity
                      key={`${preset.start}-${preset.end}`}
                      activeOpacity={0.8}
                      onPress={() => {
                        Haptics.selectionAsync();
                        updateSlot(index, 'startTime', preset.start);
                        updateSlot(index, 'endTime', preset.end);
                      }}
                      style={{
                        backgroundColor: isActive
                          ? colors.statusSafe
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: 8,
                      }}
                      className="px-2 py-1"
                    >
                      <Text
                        style={{
                          color: isActive ? '#06210F' : colors.textSecondary,
                          fontVariant: ['tabular-nums'],
                        }}
                        className="text-[10px] font-semibold"
                      >
                        {preset.start} - {preset.end}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
              style={{
                backgroundColor: colors.actionBg,
              }}
              className="flex-1 py-3.5 rounded-full items-center mr-1.5"
            >
              <Text
                style={{ color: isDark ? '#FFB020' : '#D97706' }}
                className="text-xs font-bold"
              >
                Archive Subject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDelete}
              style={{
                backgroundColor: isDark
                  ? 'rgba(244, 63, 94, 0.10)'
                  : 'rgba(244, 63, 94, 0.08)',
              }}
              className="flex-1 py-3.5 rounded-full items-center ml-1.5"
            >
              <Text
                style={{ color: isDark ? '#FF6B72' : '#DC2626' }}
                className="text-xs font-bold"
              >
                Delete Subject
              </Text>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  sfText: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: undefined,
    }),
  },
  swatchItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
