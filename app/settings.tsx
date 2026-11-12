import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Haptics } from '../src/utils/haptics';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import {
  CloseIcon,
  ExportIcon,
  ImportIcon,
  RefreshIcon,
  TrashIcon,
  GaugeIcon,
  BellIcon,
  ChevronRightIcon,
} from '../src/components/icons';
import { useTheme } from '../src/utils/theme';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { toast } from 'sonner-native';
import { sendTestNotification } from '../src/utils/notifications';

interface TactileCloseButtonProps {
  onPress: () => void;
}

const TactileCloseButton: React.FC<TactileCloseButtonProps> = ({ onPress }) => {
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
        style={[
          styles.closeButton,
          {
            backgroundColor: colors.glassBg,
            shadowColor: colors.cardShadow,
          },
        ]}
        className="w-9 h-9 rounded-full items-center justify-center"
      >
        <CloseIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    settings,
    updateSettings,
    restoreFromBackup,
    resetToDemo,
    clearAllData,
    subjects,
    scheduleSlots,
    sessions,
    holidays,
  } = useAttendanceStore();

  const [targetInput, setTargetInput] = useState(String(settings.globalTargetPct));

  const handleImportJSON = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        return;
      }

      const fileUri = res.assets[0].uri;
      const file = new File(fileUri);
      const fileContent = await file.text();
      const parsed = JSON.parse(fileContent);

      if (!parsed || parsed.version !== 1) {
        toast.error('Invalid Backup', {
          description: 'Selected file is not a compatible Bound backup.',
        });
        return;
      }

      Alert.alert(
        'Confirm Restore',
        `Restore data exported on ${new Date(
          parsed.exportedAt
        ).toLocaleString()}? This will replace your current attendance records.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: () => {
              const success = restoreFromBackup(parsed);
              if (success) {
                toast.success('Backup restored successfully');
              } else {
                toast.error('Failed to restore database from backup file');
              }
            },
          },
        ]
      );
    } catch (err: any) {
      toast.error('Import Failed', { description: err.message });
    }
  };

  const handleTargetChange = (text: string) => {
    setTargetInput(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0 && num <= 100) {
      updateSettings({ globalTargetPct: num });
    }
  };

  const handleExportJSON = async () => {
    try {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        subjects,
        scheduleSlots,
        sessions,
        holidays,
      };

      const file = new File(Paths.cache, 'bound_backup.json');
      await file.write(JSON.stringify(payload, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Bound Attendance Backup',
        });
      } else {
        toast.success('Backup exported', { description: file.name });
      }
    } catch (err: any) {
      toast.error('Export Failed', { description: err.message });
    }
  };

  const handleExportCSV = async () => {
    try {
      const header = 'Date,Subject,Code,Start,End,Status,MarkedAt\n';
      const subjectMap = new Map(subjects.map((s) => [s.id, s]));
      const rows = sessions.map((s) => {
        const sub = subjectMap.get(s.subjectId);
        return `"${s.date}","${sub?.name || ''}","${sub?.code || ''}","${s.startTime}","${s.endTime}","${s.status || 'unmarked'}","${s.markedAt || ''}"`;
      });

      const csvContent = header + rows.join('\n');
      const file = new File(Paths.cache, 'bound_sessions.csv');
      await file.write(csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Bound Attendance CSV',
        });
      } else {
        toast.success('CSV exported', { description: file.name });
      }
    } catch (err: any) {
      toast.error('Export Failed', { description: err.message });
    }
  };

  const confirmResetDemo = () => {
    Alert.alert(
      'Reset to Demo Data',
      'This will replace your current data with the sample college timetable (Physics, Data Structures, Economics, Chemistry). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToDemo();
            toast.success('Demo data loaded successfully');
          },
        },
      ]
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to erase all subjects, timetables, and logs? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            toast.info('All attendance data has been erased');
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
      {/* Header */}
      <View
        style={{ borderBottomColor: colors.divider }}
        className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b"
      >
        <Text
          style={[
            styles.sfText,
            { letterSpacing: -0.6, color: colors.text },
          ]}
          className="text-[26px] font-bold"
        >
          Settings
        </Text>
        <TactileCloseButton onPress={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Appearance */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          <Text
            style={[
              styles.sfText,
              { letterSpacing: -0.3, color: colors.text, lineHeight: 22 },
            ]}
            className="text-[17px] font-semibold mb-3"
          >
            Appearance
          </Text>
          <SegmentedControl
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
            selectedValue={settings.theme}
            onSelect={(mode) => updateSettings({ theme: mode })}
            containerClass="relative flex-row p-1 mb-1"
          />

          {/* Haptic Feedback Toggle */}
          <View
            style={{ borderTopColor: colors.divider }}
            className="flex-row items-center justify-between pt-4 mt-4 border-t"
          >
            <View className="flex-1 pr-3">
              <Text
                style={[styles.sfText, { color: colors.text }]}
                className="text-sm font-semibold"
              >
                Haptic Feedback
              </Text>
              <Text
                style={[styles.sfText, { color: colors.textMuted }]}
                className="text-xs mt-0.5"
              >
                Tactile vibrations on button taps, date changes, and actions
              </Text>
            </View>
            <Switch
              value={settings.hapticFeedbackEnabled}
              onValueChange={(val) => {
                updateSettings({ hapticFeedbackEnabled: val });
                if (val) {
                  Haptics.selectionAsync();
                }
              }}
              trackColor={{
                false: isDark ? '#3A3B45' : '#D1D5DB',
                true: '#3DDC84',
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Card 2: Attendance Target */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          <View className="flex-row items-center mb-1">
            <View
              style={{
                width: 20,
                height: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: Platform.OS === 'android' ? 1 : 0,
              }}
            >
              <GaugeIcon size={17} color={colors.textSecondary} />
            </View>
            <Text
              style={[
                styles.sfText,
                { letterSpacing: -0.3, color: colors.text, lineHeight: 22 },
              ]}
              className="text-[17px] font-semibold ml-2"
            >
              Attendance Target
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-1 pr-3">
              <Text
                style={[styles.sfText, { color: colors.text }]}
                className="text-sm font-semibold"
              >
                Global Target %
              </Text>
              <Text
                style={[styles.sfText, { color: colors.textMuted }]}
                className="text-xs mt-0.5"
              >
                Used as default threshold when calculating safe attendance
              </Text>
            </View>
            <View
              style={{
                borderRadius: 14,
                borderCurve: 'continuous',
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              }}
              className="w-16 h-11 border items-center justify-center"
            >
              <TextInput
                value={targetInput}
                onChangeText={handleTargetChange}
                keyboardType="numeric"
                maxLength={3}
                style={[
                  styles.sfText,
                  { color: colors.text },
                ]}
                className="text-base font-bold text-center p-0"
              />
            </View>
          </View>
        </View>

        {/* Card 3: Class Card Labels */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          <Text
            style={[
              styles.sfText,
              { letterSpacing: -0.3, color: colors.text, lineHeight: 22 },
            ]}
            className="text-[17px] font-semibold mb-0.5"
          >
            Class Card Labels
          </Text>
          <Text
            style={[styles.sfText, { color: colors.textMuted }]}
            className="text-xs mb-3"
          >
            Choose what primary text to show on class cards
          </Text>

          <SegmentedControl
            options={[
              { label: 'Subject Name', value: 'name' },
              { label: 'Course Code', value: 'code' },
            ]}
            selectedValue={settings.primaryCardLabel}
            onSelect={(val) => updateSettings({ primaryCardLabel: val })}
            containerClass="relative flex-row p-1"
          />
        </View>

        {/* Card 4: Notifications & Reminders */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          <View className="flex-row items-center mb-3">
            <View
              style={{
                width: 20,
                height: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: Platform.OS === 'android' ? 1 : 0,
              }}
            >
              <BellIcon size={17} color={colors.textSecondary} strokeWidth={2} />
            </View>
            <Text
              style={[
                styles.sfText,
                { letterSpacing: -0.3, color: colors.text, lineHeight: 22 },
              ]}
              className="text-[17px] font-semibold ml-2"
            >
              Notifications & Reminders
            </Text>
          </View>

          {/* Daily Evening Alert */}
          <View
            style={{ borderBottomColor: colors.divider }}
            className="flex-row items-center justify-between py-2 border-b"
          >
            <View className="flex-1 pr-3">
              <Text
                style={[styles.sfText, { color: colors.text }]}
                className="text-sm font-semibold"
              >
                Daily Evening Alert
              </Text>
              <Text
                style={[styles.sfText, { color: colors.textMuted }]}
                className="text-xs mt-0.5"
              >
                Reminds you to log classes on active weekdays
              </Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                updateSettings({ dailyReminderEnabled: val });
              }}
              trackColor={{
                false: isDark ? '#3A3B45' : '#D1D5DB',
                true: '#3DDC84',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Per-class Quick-Mark Alert */}
          <View
            style={{ borderBottomColor: colors.divider }}
            className="py-2.5 border-b"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text
                  style={[styles.sfText, { color: colors.text }]}
                  className="text-sm font-semibold"
                >
                  Per-class Quick-Mark Alert
                </Text>
                <Text
                  style={[styles.sfText, { color: colors.textMuted }]}
                  className="text-xs mt-0.5"
                >
                  Heads-up reminder before class starts or ends
                </Text>
              </View>
              <Switch
                value={settings.perClassReminderEnabled}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  updateSettings({ perClassReminderEnabled: val });
                }}
                trackColor={{
                  false: isDark ? '#3A3B45' : '#D1D5DB',
                  true: '#3DDC84',
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Notify Timing Sub-options */}
            {settings.perClassReminderEnabled && (
              <View className="mt-3 pt-2">
                <Text
                  style={[styles.sfText, { color: colors.textMuted }]}
                  className="text-xs font-medium mb-2"
                >
                  Notify Timing
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateSettings({ perClassReminderOffsetMinutes: 5 });
                    }}
                    style={{
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      backgroundColor:
                        settings.perClassReminderOffsetMinutes === 5
                          ? colors.presentBadgeBg
                          : colors.actionBg,
                    }}
                    className="flex-1 py-2 items-center justify-center mr-1.5"
                  >
                    <Text
                      style={[
                        styles.sfText,
                        {
                          color:
                            settings.perClassReminderOffsetMinutes === 5
                              ? colors.presentBadgeText
                              : colors.textSecondary,
                        },
                      ]}
                      className="text-xs font-semibold"
                    >
                      5 min prior
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateSettings({ perClassReminderOffsetMinutes: 15 });
                    }}
                    style={{
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      backgroundColor:
                        settings.perClassReminderOffsetMinutes === 15
                          ? colors.presentBadgeBg
                          : colors.actionBg,
                    }}
                    className="flex-1 py-2 items-center justify-center ml-1.5"
                  >
                    <Text
                      style={[
                        styles.sfText,
                        {
                          color:
                            settings.perClassReminderOffsetMinutes === 15
                              ? colors.presentBadgeText
                              : colors.textSecondary,
                        },
                      ]}
                      className="text-xs font-semibold"
                    >
                      15 min prior
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Weekly Sunday Digest */}
          <View className="flex-row items-center justify-between py-2 mt-1">
            <View className="flex-1 pr-3">
              <Text
                style={[styles.sfText, { color: colors.text }]}
                className="text-sm font-semibold"
              >
                Weekly Sunday Digest
              </Text>
              <Text
                style={[styles.sfText, { color: colors.textMuted }]}
                className="text-xs mt-0.5"
              >
                Highlights low-attendance subjects every Sunday at 19:00
              </Text>
            </View>
            <Switch
              value={settings.sundayDigestEnabled}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                updateSettings({ sundayDigestEnabled: val });
              }}
              trackColor={{
                false: isDark ? '#3A3B45' : '#D1D5DB',
                true: '#3DDC84',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Test Notification Row */}
          <View
            style={{ borderTopColor: colors.divider }}
            className="pt-3 mt-2 border-t"
          >
            <View className="mb-2">
              <Text
                style={[styles.sfText, { color: colors.text }]}
                className="text-xs font-semibold"
              >
                Test Live Notifications
              </Text>
              <Text
                style={[styles.sfText, { color: colors.textMuted }]}
                className="text-[11px] mt-0.5"
              >
                Inspect lockscreen action buttons, sounds, and math copy
              </Text>
            </View>

            <View className="flex-row gap-2 mt-1">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync();
                  sendTestNotification('safe');
                }}
                style={{
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: colors.presentBadgeBg,
                }}
                className="flex-1 py-2 items-center justify-center"
              >
                <Text
                  style={[
                    styles.sfText,
                    { color: colors.presentBadgeText },
                  ]}
                  className="text-xs font-semibold"
                >
                  Safe Alert (+Skips)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync();
                  sendTestNotification('risk');
                }}
                style={{
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: colors.absentBadgeBg,
                }}
                className="flex-1 py-2 items-center justify-center"
              >
                <Text
                  style={[
                    styles.sfText,
                    { color: colors.absentBadgeText },
                  ]}
                  className="text-xs font-semibold"
                >
                  Risk Alert (Cutoff)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card 5: Data & Backup */}
        <View
          style={[
            styles.cardContainer,
            {
              borderRadius: 24,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="p-5 my-2"
        >
          <Text
            style={[
              styles.sfText,
              { letterSpacing: -0.3, color: colors.text, lineHeight: 22 },
            ]}
            className="text-[17px] font-semibold mb-3"
          >
            Data & Backup
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportJSON}
            style={{
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: colors.actionBg,
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[styles.sfText, { color: colors.text }]}
              className="text-xs font-semibold"
            >
              Export Backup (JSON)
            </Text>
            <ExportIcon size={15} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleImportJSON}
            style={{
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: colors.actionBg,
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[styles.sfText, { color: colors.text }]}
              className="text-xs font-semibold"
            >
              Import Backup (JSON)
            </Text>
            <ImportIcon size={15} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            style={{
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: colors.actionBg,
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[styles.sfText, { color: colors.text }]}
              className="text-xs font-semibold"
            >
              Export Attendance Log (CSV)
            </Text>
            <ExportIcon size={15} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/onboarding');
            }}
            style={{
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: isDark
                ? 'rgba(61, 220, 132, 0.12)'
                : 'rgba(13, 138, 51, 0.08)',
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[
                styles.sfText,
                { color: isDark ? '#3DDC84' : '#0D8A33' },
              ]}
              className="text-xs font-semibold"
            >
              Review Welcome Tour & Cutoffs
            </Text>
            <ChevronRightIcon size={15} color={isDark ? '#3DDC84' : '#0D8A33'} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmResetDemo}
            style={{
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: isDark
                ? 'rgba(245, 158, 11, 0.10)'
                : 'rgba(245, 158, 11, 0.08)',
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[
                styles.sfText,
                { color: isDark ? '#FFB020' : '#D97706' },
              ]}
              className="text-xs font-semibold"
            >
              Reset to Sample Demo Data
            </Text>
            <RefreshIcon size={15} color={isDark ? '#FFB020' : '#D97706'} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmClearAll}
            style={{
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: isDark
                ? 'rgba(244, 63, 94, 0.10)'
                : 'rgba(244, 63, 94, 0.08)',
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[
                styles.sfText,
                { color: isDark ? '#FF6B72' : '#DC2626' },
              ]}
              className="text-xs font-semibold"
            >
              Clear All Attendance Records
            </Text>
            <TrashIcon size={15} color={isDark ? '#FF6B72' : '#DC2626'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  closeButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    includeFontPadding: false,
  },
});
