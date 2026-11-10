import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  LayoutAnimation,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAttendanceStore } from '../../src/store/useAttendanceStore';
import { CloseIcon, CalendarPlusIcon } from '../../src/components/icons';
import { useTheme } from '../../src/utils/theme';
import { Haptics } from '../../src/utils/haptics';
import { SubjectDuotoneIcon } from '../../src/components/icons/SubjectDuotoneIcon';
import { toast } from 'sonner-native';

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

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!selectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const sub = activeSubjects.find((s) => s.id === selectedSubjectId);
    addExtraClass(selectedSubjectId, date, startTime, endTime);
    toast.success('Extra class added', {
      description: `${sub?.name || 'Class'} (${startTime} - ${endTime})`,
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
          <TactileCloseButton onPress={() => router.back()} />
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
            className="text-base font-bold mb-3"
          >
            Time & Date
          </Text>

          <Text
            style={{ color: colors.textMuted }}
            className="text-xs font-semibold mb-1"
          >
            Date (YYYY-MM-DD)
          </Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2026-11-07"
            placeholderTextColor={colors.placeholderText}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            }}
            className="p-3.5 rounded-xl border text-sm font-semibold mb-3"
          />

          <View className="flex-row justify-between space-x-2">
            <View className="flex-1 mr-1.5">
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs font-semibold mb-1"
              >
                Start Time
              </Text>
              <TextInput
                value={startTime}
                onChangeText={(val) => setStartTime(formatTimeInput(val))}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 120);
                }}
                placeholder="15:00"
                placeholderTextColor={colors.placeholderText}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }}
                className="p-3 rounded-xl border text-sm font-semibold text-center"
              />
            </View>

            <View className="flex-1 ml-1.5">
              <Text
                style={{ color: colors.textMuted }}
                className="text-xs font-semibold mb-1"
              >
                End Time
              </Text>
              <TextInput
                value={endTime}
                onChangeText={(val) => setEndTime(formatTimeInput(val))}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 120);
                }}
                placeholder="16:00"
                placeholderTextColor={colors.placeholderText}
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }}
                className="p-3 rounded-xl border text-sm font-semibold text-center"
              />
            </View>
          </View>

          {/* Quick extra-class presets */}
          <View className="flex-row flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.05)]">
            {[
              { start: '09:00', end: '10:00' },
              { start: '11:00', end: '12:00' },
              { start: '14:00', end: '15:00' },
              { start: '15:00', end: '16:00' },
              { start: '16:00', end: '17:00' },
            ].map((preset) => {
              const isActive =
                startTime === preset.start && endTime === preset.end;
              return (
                <TouchableOpacity
                  key={`${preset.start}-${preset.end}`}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setStartTime(preset.start);
                    setEndTime(preset.end);
                  }}
                  style={{
                    backgroundColor: isActive
                      ? colors.statusSafe
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 8,
                  }}
                  className="px-2.5 py-1"
                >
                  <Text
                    style={{
                      color: isActive ? '#06210F' : colors.textSecondary,
                      fontVariant: ['tabular-nums'],
                    }}
                    className="text-[11px] font-semibold"
                  >
                    {preset.start} - {preset.end}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
