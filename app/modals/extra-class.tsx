import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  LayoutAnimation,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import RNDateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import {
  CloseIcon,
  CalendarPlusIcon,
  ClockIcon,
  ArrowRightIcon,
  CalendarIcon,
} from '../../src/components/icons';
import { useTheme } from '../../src/utils/theme';
import { Haptics } from '../../src/utils/haptics';
import { SubjectDuotoneIcon } from '../../src/components/icons/SubjectDuotoneIcon';
import { toast } from 'sonner-native';

function parseDateString(dateStr: string): Date {
  if (!dateStr || !dateStr.includes('-')) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function timeStringToDate(timeStr: string): Date {
  const d = new Date();
  if (!timeStr || !timeStr.includes(':')) {
    d.setHours(15, 0, 0, 0);
    return d;
  }
  const [h, m] = timeStr.split(':').map(Number);
  d.setHours(isNaN(h) ? 15 : h, isNaN(m) ? 0 : m, 0, 0);
  return d;
}

function dateToTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
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
  if (hours > 0 && mins > 0) return { label: `${hours}h ${mins}m`, isValid: true };
  if (hours > 0) return { label: `${hours}h`, isValid: true };
  return { label: `${mins}m`, isValid: true };
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
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

export default function ExtraClassModal() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { subjects, selectedDate, addExtraClass } = useAttendanceStore();

  const activeSubjects = subjects.filter((s) => !s.archivedAt);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeSubjects[0]?.id || ''
  );
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');

  const [iosPicker, setIosPicker] = useState<{
    type: 'time' | 'date';
    field?: 'startTime' | 'endTime';
    date: Date;
  } | null>(null);

  const duration = useMemo(
    () => computeDurationLabel(startTime, endTime),
    [startTime, endTime]
  );

  const handleStartTimeChange = (newStartTime: string) => {
    const [oldSh, oldSm] = startTime.split(':').map(Number);
    const [oldEh, oldEm] = endTime.split(':').map(Number);
    const durationMins = oldEh * 60 + oldEm - (oldSh * 60 + oldSm);
    const validDuration = durationMins > 0 ? durationMins : 60;

    const [newSh, newSm] = newStartTime.split(':').map(Number);
    const newStartMins = newSh * 60 + newSm;

    let updatedEndMins = newStartMins + validDuration;
    if (updatedEndMins >= 24 * 60) {
      updatedEndMins = 23 * 60 + 59;
    }
    const endH = String(Math.floor(updatedEndMins / 60)).padStart(2, '0');
    const endM = String(updatedEndMins % 60).padStart(2, '0');
    const nextEnd = `${endH}:${endM}`;

    setStartTime(newStartTime);
    setEndTime(nextEnd);
  };

  const applyDurationPreset = (durationMinutes: number) => {
    Haptics.selectionAsync();
    const [sh, sm] = startTime.split(':').map(Number);
    const startMins = (isNaN(sh) ? 15 : sh) * 60 + (isNaN(sm) ? 0 : sm);
    let endMins = startMins + durationMinutes;
    if (endMins >= 24 * 60) {
      endMins = 23 * 60 + 59;
    }
    const endH = String(Math.floor(endMins / 60)).padStart(2, '0');
    const endM = String(endMins % 60).padStart(2, '0');
    setEndTime(`${endH}:${endM}`);
  };

  const openTimePicker = (field: 'startTime' | 'endTime') => {
    Haptics.selectionAsync();
    const currentTimeStr = field === 'startTime' ? startTime : endTime;
    const currentDate = timeStringToDate(currentTimeStr);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'time',
        is24Hour: false,
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) {
            const timeStr = dateToTimeString(selected);
            Haptics.selectionAsync();
            if (field === 'startTime') {
              handleStartTimeChange(timeStr);
            } else {
              setEndTime(timeStr);
            }
          }
        },
      });
    } else {
      setIosPicker({
        type: 'time',
        field,
        date: currentDate,
      });
    }
  };

  const openDatePicker = () => {
    Haptics.selectionAsync();
    const currentDate = parseDateString(date);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: 'date',
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) {
            Haptics.selectionAsync();
            setDate(formatDateString(selected));
          }
        },
      });
    } else {
      setIosPicker({
        type: 'date',
        date: currentDate,
      });
    }
  };

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = activeSubjects.length > 0 && (
    selectedSubjectId !== (activeSubjects[0]?.id || '') ||
    date !== selectedDate ||
    startTime !== '15:00' ||
    endTime !== '16:00'
  );

  const handleClose = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Discard Extra Class?',
        'Are you sure you want to discard this class?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
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
    if (!selectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const sub = activeSubjects.find((s) => s.id === selectedSubjectId);
    if (!sub) {
      setIsSubmitting(false);
      toast.error('Selected subject no longer exists');
      return;
    }

    addExtraClass(selectedSubjectId, date, startTime, endTime);
    toast.success('Extra class added', {
      description: `${sub.name} (${startTime} - ${endTime})`,
    });
    router.back();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={{ borderBottomColor: colors.divider }}
        className="flex-row items-center justify-between px-4 pt-3 pb-3 border-b"
      >
        <View className="w-16 items-start">
          <TactileCloseButton onPress={handleClose} />
        </View>

        <View className="flex-1 flex-row items-center justify-center mx-1">
          <CalendarPlusIcon
            size={18}
            color={colors.text}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.sfText,
              { color: colors.text, letterSpacing: -0.3 },
            ]}
            numberOfLines={1}
            className="text-[17px] font-bold tracking-tight ml-2"
          >
            Add Extra Class
          </Text>
        </View>

        <View className="w-16 items-end">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isSubmitting || activeSubjects.length === 0}
            style={{ opacity: isSubmitting || activeSubjects.length === 0 ? 0.45 : 1 }}
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
        {/* Subject Selection */}
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
            className="text-base font-bold mb-2"
          >
            Select Subject
          </Text>
          {activeSubjects.length === 0 ? (
            <View className="items-center py-4">
              <Text
                style={[styles.sfText, { color: colors.textSecondary }]}
                className="text-xs text-center mb-3 leading-4"
              >
                No subjects registered yet. You need at least one subject to log an extra class.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  router.replace('/modals/subject-editor');
                }}
                style={{
                  backgroundColor: '#00BF63',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                }}
                className="flex-row items-center gap-1.5"
              >
                <Text
                  style={[
                    styles.sfText,
                    { color: '#06210F', fontWeight: '800', fontSize: 13 },
                  ]}
                >
                  + Create Subject First
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
          <View className="flex-row flex-wrap gap-2">
            {activeSubjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync();
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    setSelectedSubjectId(sub.id);
                  }}
                  style={{
                    backgroundColor: isSelected ? sub.color : colors.inputBg,
                    transform: [{ scale: isSelected ? 1.03 : 1 }],
                  }}
                  className="flex-row items-center px-3.5 py-2.5 rounded-full mb-2 mr-1.5"
                >
                  <View
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.22)'
                        : sub.color,
                    }}
                    className="w-5 h-5 rounded-full items-center justify-center mr-2"
                  >
                    <SubjectDuotoneIcon
                      name={sub.name}
                      code={sub.code}
                      size={12}
                    />
                  </View>
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.text,
                    }}
                    className="text-xs font-bold"
                  >
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        </View>

        {/* Date & Time Settings */}
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
            Time & Date
          </Text>
          <Text
            style={{ color: colors.textMuted }}
            className="text-xs mb-3.5"
          >
            Choose the session date and schedule hours using native selectors.
          </Text>

          {/* Date Selector Capsule */}
          <View className="mb-4">
            <Text
              style={{ color: colors.textMuted }}
              className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider"
            >
              Date
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={openDatePicker}
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                height: 44,
              }}
              className="px-3 rounded-xl border flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <CalendarIcon
                  size={15}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-semibold ml-2.5"
                >
                  {formatDisplayDate(date)}
                </Text>
              </View>
              <Text
                style={{ color: colors.textMuted, fontVariant: ['tabular-nums'] }}
                className="text-xs font-medium"
              >
                {date}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time & Duration Row (Unified Tactile) */}
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-start">
              {/* Start Time Native Clock Picker */}
              <View>
                <Text
                  style={{ color: colors.textMuted }}
                  className="text-[10px] font-semibold mb-1 uppercase tracking-wider"
                >
                  Start
                </Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => openTimePicker('startTime')}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    height: 40,
                  }}
                  className="px-2.5 rounded-xl border flex-row items-center justify-center min-w-[84px]"
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
                    {startTime}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Arrow centered with 40px buttons */}
              <View
                className="px-1.5 justify-center items-center"
                style={{ height: 40, marginTop: 18 }}
              >
                <ArrowRightIcon
                  size={14}
                  color={colors.textMuted}
                  strokeWidth={2.4}
                />
              </View>

              {/* End Time Native Clock Picker */}
              <View>
                <Text
                  style={{ color: colors.textMuted }}
                  className="text-[10px] font-semibold mb-1 uppercase tracking-wider"
                >
                  End
                </Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => openTimePicker('endTime')}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    height: 40,
                  }}
                  className="px-2.5 rounded-xl border flex-row items-center justify-center min-w-[84px]"
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
                    {endTime}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration Column */}
            <View className="items-end ml-2">
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
                className="px-3 justify-center items-end min-w-[80px]"
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
                  Single class
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Duration Presets */}
          <View className="flex-row items-center gap-1.5 mt-3 pt-2.5 border-t border-black/5 dark:border-white/5">
            <Text
              style={{ color: colors.textMuted }}
              className="text-[10px] font-semibold mr-1"
            >
              Quick duration:
            </Text>
            {[
              { label: '50m', mins: 50 },
              { label: '1h', mins: 60 },
              { label: '1h 30m', mins: 90 },
              { label: '2h', mins: 120 },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.mins}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                activeOpacity={0.7}
                onPress={() => applyDurationPreset(preset.mins)}
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.06)',
                  borderWidth: 1,
                  borderRadius: 8,
                }}
                className="px-2 py-0.5"
              >
                <Text
                  style={[styles.sfText, { color: colors.textSecondary }]}
                  className="text-[10px] font-bold"
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
                    {iosPicker.type === 'date'
                      ? 'Select Date'
                      : `Select ${
                          iosPicker.field === 'startTime'
                            ? 'Start Time'
                            : 'End Time'
                        }`}
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
                  mode={iosPicker.type}
                  display={iosPicker.type === 'date' ? 'inline' : 'spinner'}
                  themeVariant={isDark ? 'dark' : 'light'}
                  onChange={(_, selected) => {
                    if (selected) {
                      setIosPicker((prev) =>
                        prev ? { ...prev, date: selected } : null
                      );
                      if (iosPicker.type === 'date') {
                        setDate(formatDateString(selected));
                      } else if (iosPicker.field === 'startTime') {
                        handleStartTimeChange(dateToTimeString(selected));
                      } else {
                        setEndTime(dateToTimeString(selected));
                      }
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
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
      android: 'Figtree_600SemiBold',
      default: undefined,
    }),
  },
});
