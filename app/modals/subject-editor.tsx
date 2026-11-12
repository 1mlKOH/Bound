import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  Modal,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RNDateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import {
  timesOverlap,
  getMondayOfDate,
  getWeekDates,
  formatCardDate,
  getTodayDateString,
} from '../../src/domain/attendance';
import {
  CloseIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  ArrowRightIcon,
  ClockIcon,
} from '../../src/components/icons';
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

const WEEKDAY_PILLS = [
  { day: 0, label: 'Su' },
  { day: 1, label: 'Mo' },
  { day: 2, label: 'Tu' },
  { day: 3, label: 'We' },
  { day: 4, label: 'Th' },
  { day: 5, label: 'Fr' },
  { day: 6, label: 'Sa' },
];

function timeStringToDate(timeStr: string): Date {
  const d = new Date();
  if (!timeStr || !timeStr.includes(':')) {
    d.setHours(9, 0, 0, 0);
    return d;
  }
  const [h, m] = timeStr.split(':').map(Number);
  d.setHours(isNaN(h) ? 9 : h, isNaN(m) ? 0 : m, 0, 0);
  return d;
}

function dateToTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}


interface ScheduleBatchSlot {
  id: string;
  weekdays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

function computeDurationLabel(startTime: string, endTime: string): { label: string; isValid: boolean } {
  if (!startTime || !endTime || startTime.length < 5 || endTime.length < 5) {
    return { label: '—', isValid: true };
  }
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) {
    return { label: '—', isValid: true };
  }
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const diff = endMins - startMins;
  if (diff <= 0) {
    return { label: 'End ≤ Start', isValid: false };
  }
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) {
    return { label: `${hours}h ${mins}m`, isValid: true };
  }
  if (hours > 0) {
    return { label: `${hours}h`, isValid: true };
  }
  return { label: `${mins}m`, isValid: true };
}

function groupExistingSlots(
  rawSlots: Array<{ weekday: number; startTime: string; endTime: string }>,
  defaultDay: number = new Date().getDay()
): ScheduleBatchSlot[] {
  if (!rawSlots || rawSlots.length === 0) {
    return [
      { id: 'slot-init-1', weekdays: [defaultDay], startTime: '09:00', endTime: '10:00' },
    ];
  }

  const map = new Map<string, number[]>();
  const order: string[] = [];

  for (const s of rawSlots) {
    const key = `${s.startTime}-${s.endTime}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    const days = map.get(key)!;
    if (!days.includes(s.weekday)) {
      days.push(s.weekday);
    }
  }

  return order.map((key, idx) => {
    const [startTime, endTime] = key.split('-');
    const days = map.get(key)!.sort((a, b) => a - b);
    return {
      id: `slot-group-${idx}-${startTime}-${endTime}`,
      weekdays: days,
      startTime,
      endTime,
    };
  });
}

function normalizeBatchSlots(slots: ScheduleBatchSlot[]) {
  return slots.map((s) => ({
    weekdays: [...s.weekdays].sort((a, b) => a - b),
    startTime: s.startTime,
    endTime: s.endTime,
  }));
}

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
  const {
    subjects,
    scheduleSlots,
    saveSubject,
    archiveSubject,
    deleteSubject,
    settings,
    selectedDate,
    setSelectedDate,
  } = useAttendanceStore();

  const existingSubject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  const existingSlots = useMemo(
    () =>
      scheduleSlots.filter(
        (slot) =>
          slot.subjectId === subjectId &&
          (slot.effectiveTo === null || slot.effectiveTo >= getTodayDateString())
      ),
    [scheduleSlots, subjectId]
  );

  const initialValues = useRef({
    name: existingSubject?.name || '',
    code: existingSubject?.code || '',
    color: existingSubject?.color || PALETTE[0],
    targetPct: existingSubject?.targetPct ? String(existingSubject.targetPct) : '',
    baselinePresent: String(existingSubject?.baselinePresent ?? 0),
    baselineAbsent: String(existingSubject?.baselineAbsent ?? 0),
  }).current;

  const initialSlotsJson = useMemo(() => {
    return JSON.stringify(normalizeBatchSlots(groupExistingSlots(existingSlots)));
  }, []);

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

  const currentDayOfWeek = useMemo(() => {
    if (selectedDate && selectedDate.includes('-')) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d).getDay();
    }
    return new Date().getDay();
  }, [selectedDate]);

  // Slots state (batch-grouped by time for multi-day schedules)
  const [batchSlots, setBatchSlots] = useState<ScheduleBatchSlot[]>(() =>
    groupExistingSlots(existingSlots, currentDayOfWeek)
  );

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
    const allUsedWeekdays = new Set(batchSlots.flatMap((s) => s.weekdays));
    const nextDay =
      [1, 2, 3, 4, 5, 6, 0].find((d) => !allUsedWeekdays.has(d)) ?? 1;
    setBatchSlots((prev) => [
      ...prev,
      {
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        weekdays: [nextDay],
        startTime: '10:00',
        endTime: '11:00',
      },
    ]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const removeSlot = (index: number) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setBatchSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleWeekday = (slotIndex: number, day: number) => {
    Haptics.selectionAsync();
    setBatchSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== slotIndex) return slot;
        const exists = slot.weekdays.includes(day);
        const nextDays = exists
          ? slot.weekdays.filter((d) => d !== day)
          : [...slot.weekdays, day].sort((a, b) => a - b);
        return { ...slot, weekdays: nextDays };
      })
    );
  };

  const updateSlotTime = (
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setBatchSlots((prev) =>
      prev.map((slot, i) =>
        i === slotIndex ? { ...slot, [field]: value } : slot
      )
    );
  };

  const [iosPicker, setIosPicker] = useState<{
    slotIndex: number;
    field: 'startTime' | 'endTime';
    date: Date;
  } | null>(null);

  const handleStartTimeChange = (slotIndex: number, newStartTime: string) => {
    setBatchSlots((prev) =>
      prev.map((s, i) => {
        if (i !== slotIndex) return s;
        let nextEnd = s.endTime;
        const [oldSh, oldSm] = s.startTime.split(':').map(Number);
        const [oldEh, oldEm] = s.endTime.split(':').map(Number);
        const durationMins = oldEh * 60 + oldEm - (oldSh * 60 + oldSm);
        const validDuration = durationMins > 0 ? durationMins : 60;

        const [newSh, newSm] = newStartTime.split(':').map(Number);
        const newStartMins = newSh * 60 + newSm;
        const [eh, em] = nextEnd.split(':').map(Number);
        const currentEndMins = eh * 60 + em;

        if (newStartMins >= currentEndMins) {
          let updatedEndMins = newStartMins + validDuration;
          if (updatedEndMins >= 24 * 60) {
            updatedEndMins = 23 * 60 + 59;
          }
          const endH = String(Math.floor(updatedEndMins / 60)).padStart(2, '0');
          const endM = String(updatedEndMins % 60).padStart(2, '0');
          nextEnd = `${endH}:${endM}`;
        }
        return { ...s, startTime: newStartTime, endTime: nextEnd };
      })
    );
  };

  const openTimePicker = (slotIndex: number, field: 'startTime' | 'endTime') => {
    const slot = batchSlots[slotIndex];
    if (!slot) return;
    Haptics.selectionAsync();
    const currentTimeStr = field === 'startTime' ? slot.startTime : slot.endTime;
    const currentDate = timeStringToDate(currentTimeStr);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'time',
        is24Hour: false,
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            const timeStr = dateToTimeString(selectedDate);
            Haptics.selectionAsync();
            if (field === 'startTime') {
              handleStartTimeChange(slotIndex, timeStr);
            } else {
              updateSlotTime(slotIndex, 'endTime', timeStr);
            }
          }
        },
      });
    } else {
      setIosPicker({
        slotIndex,
        field,
        date: currentDate,
      });
    }
  };


  // Conflict warning across all unrolled timetable slots
  const hasConflict = useMemo(() => {
    const unrolled: { weekday: number; startTime: string; endTime: string }[] = [];
    for (const b of batchSlots) {
      for (const w of b.weekdays) {
        unrolled.push({
          weekday: w,
          startTime: b.startTime,
          endTime: b.endTime,
        });
      }
    }
    for (let i = 0; i < unrolled.length; i++) {
      for (let j = i + 1; j < unrolled.length; j++) {
        if (
          unrolled[i].weekday === unrolled[j].weekday &&
          timesOverlap(
            unrolled[i].startTime,
            unrolled[i].endTime,
            unrolled[j].startTime,
            unrolled[j].endTime
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }, [batchSlots]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => {
    const isNameDirty = name.trim() !== initialValues.name.trim();
    const isCodeDirty = code.trim() !== initialValues.code.trim();
    const isColorDirty = color !== initialValues.color;
    const isTargetDirty = targetPct.trim() !== initialValues.targetPct.trim();
    const isPresentDirty = baselinePresent.trim() !== initialValues.baselinePresent.trim();
    const isAbsentDirty = baselineAbsent.trim() !== initialValues.baselineAbsent.trim();
    const isSlotsDirty = JSON.stringify(normalizeBatchSlots(batchSlots)) !== initialSlotsJson;

    return (
      isNameDirty ||
      isCodeDirty ||
      isColorDirty ||
      isTargetDirty ||
      isPresentDirty ||
      isAbsentDirty ||
      isSlotsDirty
    );
  }, [
    name,
    code,
    color,
    targetPct,
    baselinePresent,
    baselineAbsent,
    batchSlots,
    initialValues,
    initialSlotsJson,
  ]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Unsaved Changes',
        'Do you want to exit without saving your edits?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Exit Without Saving', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }, [isDirty, router]);

  useEffect(() => {
    const onBackPress = () => {
      if (isDirty) {
        handleClose();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isDirty, handleClose]);

  const handleSave = () => {
    if (isSubmitting) return;

    const cleanName = name.replace(/[\r\n]+/g, ' ').trim();
    const cleanCode = code.replace(/[\r\n]+/g, ' ').trim();

    if (!cleanName) {
      toast.error('Please enter a subject name');
      return;
    }

    if (hasConflict) {
      Alert.alert(
        'Schedule Conflict',
        'Two or more timetable slots on the same day overlap in time. Please adjust the times before saving.'
      );
      return;
    }

    // Validate times & unroll batch slots into database schedule slots
    const unrolledSlots: { weekday: number; startTime: string; endTime: string }[] = [];
    for (const slot of batchSlots) {
      if (slot.weekdays.length === 0) {
        Alert.alert(
          'Incomplete Slot',
          `Please select at least one day for the ${slot.startTime} – ${slot.endTime} slot, or remove it.`
        );
        return;
      }
      if (!slot.startTime || !slot.endTime || slot.startTime.length < 5 || slot.endTime.length < 5) {
        Alert.alert('Invalid Time', 'Please enter valid times in HH:mm format (e.g. 09:00).');
        return;
      }
      if (slot.startTime >= slot.endTime) {
        Alert.alert(
          'Invalid Time',
          `Slot end time (${slot.endTime}) must be later than start time (${slot.startTime}).`
        );
        return;
      }
      for (const day of slot.weekdays) {
        unrolledSlots.push({
          weekday: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
    }

    setIsSubmitting(true);

    const rawTarget = targetPct.trim() ? parseFloat(targetPct) : null;
    const parsedTarget = rawTarget !== null && !isNaN(rawTarget)
      ? Math.min(100, Math.max(1, Math.round(rawTarget * 10) / 10))
      : null;
    const parsedPresent = Math.max(0, parseInt(baselinePresent, 10) || 0);
    const parsedAbsent = Math.max(0, parseInt(baselineAbsent, 10) || 0);

    saveSubject(
      {
        id: existingSubject?.id,
        name: cleanName,
        code: cleanCode,
        color,
        targetPct: parsedTarget,
        baselinePresent: parsedPresent,
        baselineAbsent: parsedAbsent,
        startDate: existingSubject?.startDate || getTodayDateString(),
        endDate: existingSubject?.endDate || null,
      },
      unrolledSlots
    );

    // If first subject created and scheduled on a weekday different from selectedDate, bridge to that weekday
    if (!existingSubject && subjects.length === 0 && unrolledSlots.length > 0) {
      try {
        const targetWeekday = unrolledSlots[0].weekday;
        const weekMonday = getMondayOfDate(selectedDate);
        const weekDates = getWeekDates(weekMonday);
        const targetDate = weekDates[(targetWeekday + 6) % 7];
        if (targetDate) {
          setSelectedDate(targetDate);
        }
      } catch (err) {
        console.warn('Could not auto-bridge first subject date:', err);
      }
    }

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
          <TactileCloseButton onPress={handleClose} />
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
            disabled={isSubmitting || !name.trim()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              opacity: isSubmitting || !name.trim() ? 0.45 : 1,
              minHeight: 36,
              justifyContent: 'center',
              alignItems: 'center',
            }}
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
                Auto-detected • {detectedCategory.label}
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
            Subject Color
          </Text>
          <View className="flex-row flex-wrap justify-between mb-1" style={{ rowGap: 12 }}>
            {PALETTE.map((swatch) => {
              const isSelected = color === swatch;
              return (
                <View
                  key={swatch}
                  style={{
                    width: '22%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TouchableOpacity
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
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
                        transform: [{ scale: isSelected ? 1.12 : 1 }],
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
                </View>
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
            Target & Past History
          </Text>
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs mb-3"
          >
            Enter past classes already attended/missed this semester (optional).
          </Text>

          <View className="flex-row justify-between space-x-2 mb-3">
            <View className="flex-1 mr-1">
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs font-semibold mb-1"
              >
                Target %
              </Text>
              <View className="relative justify-center">
                <TextInput
                  placeholder={String(settings.globalTargetPct)}
                  placeholderTextColor={colors.placeholderText}
                  value={targetPct}
                  maxLength={4}
                  onChangeText={(val) => setTargetPct(val.replace(/[^0-9.]/g, ''))}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 520, animated: true });
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
                  className="p-3 pr-7 rounded-xl border text-sm font-semibold"
                />
                <Text
                  style={{ color: colors.textMuted }}
                  className="absolute right-3 text-xs font-bold pointer-events-none"
                >
                  %
                </Text>
              </View>
            </View>

            <View className="flex-1 mx-1">
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs font-semibold mb-1"
              >
                Attended
              </Text>
              <TextInput
                value={baselinePresent}
                maxLength={5}
                onChangeText={(val) => setBaselinePresent(val.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.placeholderText}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 520, animated: true });
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
                Missed
              </Text>
              <TextInput
                value={baselineAbsent}
                maxLength={5}
                onChangeText={(val) => setBaselineAbsent(val.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.placeholderText}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 520, animated: true });
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
          className="p-4 my-2 rounded-[28px]"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 pr-2">
              <Text
                style={{ color: colors.text }}
                className="text-base font-bold"
              >
                Weekly Schedule
              </Text>
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs mt-0.5"
              >
                Tap days to batch repeat or add separate time blocks.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={addSlot}
              style={{
                backgroundColor: colors.actionBg,
              }}
              className="flex-row items-center px-3.5 py-2 rounded-full"
            >
              <View className="mr-1">
                <PlusIcon size={13} color={colors.statusSafe} strokeWidth={2.4} />
              </View>
              <Text
                style={{ color: colors.statusSafe }}
                className="text-xs font-bold"
              >
                Add Slot
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conflict Warning */}
          {hasConflict && (
            <View
              style={{
                backgroundColor: isDark
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(245, 158, 11, 0.12)',
              }}
              className="p-3 mb-3.5 rounded-xl border border-[rgba(245,158,11,0.25)]"
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

          {/* Batch Slot Cards - Unified Tactile */}
          {batchSlots.map((slot, index) => {
            const duration = computeDurationLabel(slot.startTime, slot.endTime);
            return (
              <View
                key={slot.id}
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.02)'
                    : '#F9FAFB',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : '#E5E7EB',
                  borderRadius: 20,
                }}
                className="p-3 mb-3 border"
              >
                {/* Day Selector Pills & Trash Action */}
                <View className="flex-row items-center justify-between mb-3.5">
                  <View className="flex-row items-center flex-1 justify-between mr-1">
                    {WEEKDAY_PILLS.map((w) => {
                      const isSelected = slot.weekdays.includes(w.day);
                      return (
                        <TouchableOpacity
                          key={w.day}
                          hitSlop={{ top: 8, bottom: 8, left: 3, right: 3 }}
                          activeOpacity={0.75}
                          onPress={() => toggleWeekday(index, w.day)}
                          style={{
                            backgroundColor: isSelected
                              ? isDark
                                ? '#10B981'
                                : '#D1FAE5'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : '#FFFFFF',
                            borderColor: isSelected
                              ? isDark
                                ? '#10B981'
                                : '#6EE7B7'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : '#E5E7EB',
                            flex: 1,
                            maxWidth: 38,
                            height: 32,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginHorizontal: 1,
                            borderWidth: 1,
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected
                                ? isDark
                                  ? '#06210F'
                                  : '#065F46'
                                : isDark
                                ? 'rgba(255, 255, 255, 0.70)'
                                : '#374151',
                              fontWeight: isSelected ? '700' : '600',
                            }}
                            className="text-xs"
                          >
                            {w.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Remove Slot Trash Button */}
                  {batchSlots.length > 1 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => removeSlot(index)}
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(255, 107, 114, 0.12)'
                          : 'rgba(239, 68, 68, 0.10)',
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 4,
                      }}
                    >
                      <TrashIcon size={14} color={isDark ? '#FF6B72' : '#DC2626'} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Time Capsule Native Clock Buttons & Duration Column */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1 mr-1.5">
                    {/* Start Time Native Picker Button */}
                    <View className="flex-1">
                      <Text
                        style={{ color: colors.textMuted }}
                        className="text-[10px] font-semibold mb-1 uppercase tracking-wider"
                      >
                        Start
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => openTimePicker(index, 'startTime')}
                        style={{
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                          height: 40,
                        }}
                        className="px-2 rounded-xl border flex-row items-center justify-center min-w-[72px] max-w-[88px]"
                      >
                        <ClockIcon
                          size={13}
                          color={colors.textSecondary}
                          strokeWidth={2.2}
                        />
                        <Text
                          style={{
                            color: colors.text,
                            fontVariant: ['tabular-nums'],
                          }}
                          className="text-sm font-bold ml-1.5"
                        >
                          {slot.startTime}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Connected Arrow */}
                    <View
                      className="px-1 justify-center items-center"
                      style={{ height: 40, marginTop: 18 }}
                    >
                      <ArrowRightIcon
                        size={13}
                        color={colors.textMuted}
                        strokeWidth={2.4}
                      />
                    </View>

                    {/* End Time Native Picker Button */}
                    <View className="flex-1">
                      <Text
                        style={{ color: colors.textMuted }}
                        className="text-[10px] font-semibold mb-1 uppercase tracking-wider"
                      >
                        End
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => openTimePicker(index, 'endTime')}
                        style={{
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                          height: 40,
                        }}
                        className="px-2 rounded-xl border flex-row items-center justify-center min-w-[72px] max-w-[88px]"
                      >
                        <ClockIcon
                          size={13}
                          color={colors.textSecondary}
                          strokeWidth={2.2}
                        />
                        <Text
                          style={{
                            color: colors.text,
                            fontVariant: ['tabular-nums'],
                          }}
                          className="text-sm font-bold ml-1.5"
                        >
                          {slot.endTime}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Duration & Day Count Column */}
                  <View className="items-end flex-shrink-0">
                    <Text
                      style={{ color: colors.textMuted }}
                      className="text-[10px] font-semibold mb-1 uppercase tracking-wider text-right"
                    >
                      Duration
                    </Text>
                    <View
                      style={{
                        backgroundColor: duration.isValid
                          ? isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.04)'
                          : isDark
                          ? 'rgba(255, 107, 114, 0.15)'
                          : 'rgba(239, 68, 68, 0.12)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: duration.isValid
                          ? isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.05)'
                          : isDark
                          ? 'rgba(255, 107, 114, 0.3)'
                          : 'rgba(239, 68, 68, 0.25)',
                        height: 40,
                      }}
                      className="px-2 justify-center items-end min-w-[68px]"
                    >
                      <Text
                        style={{
                          color: duration.isValid
                            ? colors.text
                            : isDark
                            ? '#FF6B72'
                            : '#DC2626',
                          fontVariant: ['tabular-nums'],
                        }}
                        className="text-xs font-bold"
                      >
                        {duration.label}
                      </Text>
                      <Text
                        style={{ color: colors.textMuted }}
                        className="text-[9px] font-medium"
                      >
                        {slot.weekdays.length === 0
                          ? '0 days'
                          : `${slot.weekdays.length} ${
                              slot.weekdays.length === 1 ? 'day' : 'days'
                            }/wk`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* iOS Native DateTimePicker Modal Sheet */}
        {Platform.OS === 'ios' && iosPicker && (
          <Modal transparent animationType="fade" visible>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  backgroundColor: colors.card,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  padding: 20,
                  paddingBottom: 34,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    style={{ color: colors.text }}
                    className="text-base font-bold"
                  >
                    Select{' '}
                    {iosPicker.field === 'startTime'
                      ? 'Start Time'
                      : 'End Time'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIosPicker(null)}
                    className="px-4 py-1.5 rounded-full bg-[#00BF63]"
                  >
                    <Text className="text-xs font-bold text-[#06210F]">
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <RNDateTimePicker
                  value={iosPicker.date}
                  mode="time"
                  display="spinner"
                  themeVariant={isDark ? 'dark' : 'light'}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setIosPicker((prev) =>
                        prev ? { ...prev, date: selectedDate } : null
                      );
                      const timeStr = dateToTimeString(selectedDate);
                      if (iosPicker.field === 'startTime') {
                        handleStartTimeChange(iosPicker.slotIndex, timeStr);
                      } else {
                        updateSlotTime(iosPicker.slotIndex, 'endTime', timeStr);
                      }
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        )}


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

        {/* Primary Bottom Save Action */}
        <View className="mt-3 mb-6">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isSubmitting || !name.trim()}
            style={{
              backgroundColor: !name.trim()
                ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
                : '#00BF63',
              minHeight: 48,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <Text
              style={[
                styles.sfText,
                {
                  color: !name.trim() ? colors.textMuted : '#06210F',
                  fontSize: 15,
                  fontWeight: '800',
                },
              ]}
            >
              {existingSubject ? 'Save Changes' : 'Save Subject'}
            </Text>
          </TouchableOpacity>
        </View>
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
      android: 'Figtree_600SemiBold',
      default: undefined,
    }),
  },
  swatchItem: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
