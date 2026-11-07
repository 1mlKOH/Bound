import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import { ThemePreference, CardLabelPreference } from '../src/types';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    updateSettings,
    resetToDemo,
    clearAllData,
    subjects,
    scheduleSlots,
    sessions,
    holidays,
  } = useAttendanceStore();

  const [targetInput, setTargetInput] = useState(String(settings.globalTargetPct));

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

      const fileUri = `${FileSystem.documentDirectory}bound_backup.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Bound Attendance Backup',
        });
      } else {
        Alert.alert('Export Successful', `Saved to ${fileUri}`);
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err.message);
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
      const fileUri = `${FileSystem.documentDirectory}bound_sessions.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Bound Attendance CSV',
        });
      } else {
        Alert.alert('Export Successful', `Saved to ${fileUri}`);
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err.message);
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
            Alert.alert('Done', 'Demo data loaded successfully.');
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
            Alert.alert('Cleared', 'All attendance data has been erased.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F1015]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-zinc-900">
        <Text className="text-2xl font-black text-white tracking-tight">
          Settings
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center"
        >
          <Text className="text-zinc-300 font-bold text-sm">✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Appearance */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-3">Appearance</Text>
          <View className="flex-row justify-between space-x-2">
            {(['system', 'light', 'dark'] as ThemePreference[]).map((mode) => {
              const isSelected = settings.theme === mode;
              const label = mode.charAt(0).toUpperCase() + mode.slice(1);
              return (
                <TouchableOpacity
                  key={mode}
                  activeOpacity={0.8}
                  onPress={() => updateSettings({ theme: mode })}
                  className={`flex-1 py-2.5 rounded-full items-center justify-center border ${
                    isSelected
                      ? 'border-[#3DDC84] bg-[#223328]'
                      : 'border-[#282932] bg-[#22232B]'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#3DDC84]' : 'text-zinc-300'
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Card 2: Attendance Target */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-1">
            Attendance Target
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-white">
                Global Target %
              </Text>
              <Text className="text-xs text-zinc-400 mt-0.5">
                Used as default threshold when calculating safe attendance
              </Text>
            </View>
            <View className="w-16 h-11 rounded-xl bg-[#282932] border border-zinc-700 items-center justify-center">
              <TextInput
                value={targetInput}
                onChangeText={handleTargetChange}
                keyboardType="numeric"
                maxLength={3}
                className="text-base font-bold text-white text-center p-0"
              />
            </View>
          </View>
        </View>

        {/* Card 3: Class Card Labels */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-0.5">
            Class Card Labels
          </Text>
          <Text className="text-xs text-zinc-400 mb-3">
            Choose what primary text to show on class cards
          </Text>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => updateSettings({ primaryCardLabel: 'name' })}
              className={`flex-1 py-2.5 rounded-full items-center justify-center border mr-1.5 ${
                settings.primaryCardLabel === 'name'
                  ? 'border-[#3DDC84] bg-[#223328]'
                  : 'border-[#282932] bg-[#22232B]'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  settings.primaryCardLabel === 'name'
                    ? 'text-[#3DDC84]'
                    : 'text-zinc-300'
                }`}
              >
                Subject Name
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => updateSettings({ primaryCardLabel: 'code' })}
              className={`flex-1 py-2.5 rounded-full items-center justify-center border ml-1.5 ${
                settings.primaryCardLabel === 'code'
                  ? 'border-[#3DDC84] bg-[#223328]'
                  : 'border-[#282932] bg-[#22232B]'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  settings.primaryCardLabel === 'code'
                    ? 'text-[#3DDC84]'
                    : 'text-zinc-300'
                }`}
              >
                Course Code
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 4: Notifications & Reminders */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-3">
            Notifications & Reminders
          </Text>

          {/* Daily Evening Alert */}
          <View className="flex-row items-center justify-between py-2 border-b border-zinc-800/60">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-white">
                Daily Evening Alert
              </Text>
              <Text className="text-xs text-zinc-400 mt-0.5">
                Reminds you to log classes on active weekdays
              </Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(val) =>
                updateSettings({ dailyReminderEnabled: val })
              }
              trackColor={{ false: '#3A3B45', true: '#3DDC84' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Per-class Quick-Mark Alert */}
          <View className="py-2.5 border-b border-zinc-800/60">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-semibold text-white">
                  Per-class Quick-Mark Alert
                </Text>
                <Text className="text-xs text-zinc-400 mt-0.5">
                  Heads-up reminder before class starts or ends
                </Text>
              </View>
              <Switch
                value={settings.perClassReminderEnabled}
                onValueChange={(val) =>
                  updateSettings({ perClassReminderEnabled: val })
                }
                trackColor={{ false: '#3A3B45', true: '#3DDC84' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Notify Timing Sub-options */}
            {settings.perClassReminderEnabled && (
              <View className="mt-3 pt-2">
                <Text className="text-xs font-medium text-zinc-400 mb-2">
                  Notify Timing
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      updateSettings({ perClassReminderOffsetMinutes: 5 })
                    }
                    className={`flex-1 py-2 rounded-full items-center justify-center border mr-1.5 ${
                      settings.perClassReminderOffsetMinutes === 5
                        ? 'border-[#3DDC84] bg-[#223328]'
                        : 'border-[#282932] bg-[#22232B]'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        settings.perClassReminderOffsetMinutes === 5
                          ? 'text-[#3DDC84]'
                          : 'text-zinc-300'
                      }`}
                    >
                      5 min prior
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      updateSettings({ perClassReminderOffsetMinutes: 15 })
                    }
                    className={`flex-1 py-2 rounded-full items-center justify-center border ml-1.5 ${
                      settings.perClassReminderOffsetMinutes === 15
                        ? 'border-[#3DDC84] bg-[#223328]'
                        : 'border-[#282932] bg-[#22232B]'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        settings.perClassReminderOffsetMinutes === 15
                          ? 'text-[#3DDC84]'
                          : 'text-zinc-300'
                      }`}
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
              <Text className="text-sm font-semibold text-white">
                Weekly Sunday Digest
              </Text>
              <Text className="text-xs text-zinc-400 mt-0.5">
                Highlights low-attendance subjects every Sunday at 19:00
              </Text>
            </View>
            <Switch
              value={settings.sundayDigestEnabled}
              onValueChange={(val) =>
                updateSettings({ sundayDigestEnabled: val })
              }
              trackColor={{ false: '#3A3B45', true: '#3DDC84' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Card 5: Data & Backup */}
        <View className="p-5 my-2 rounded-[28px] bg-[#1B1C22] border border-[#282932]">
          <Text className="text-base font-bold text-white mb-3">
            Data & Backup
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportJSON}
            className="py-3 px-4 rounded-xl bg-[#22232B] border border-[#282932] flex-row items-center justify-between my-1"
          >
            <Text className="text-xs font-bold text-white">
              Export Backup (JSON)
            </Text>
            <Text className="text-zinc-400 text-xs">↗</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            className="py-3 px-4 rounded-xl bg-[#22232B] border border-[#282932] flex-row items-center justify-between my-1"
          >
            <Text className="text-xs font-bold text-white">
              Export Attendance Log (CSV)
            </Text>
            <Text className="text-zinc-400 text-xs">↗</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmResetDemo}
            className="py-3 px-4 rounded-xl bg-[#22232B] border border-[#282932] flex-row items-center justify-between my-1"
          >
            <Text className="text-xs font-bold text-amber-400">
              Reset to Sample Demo Data
            </Text>
            <Text className="text-amber-400 text-xs">↻</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmClearAll}
            className="py-3 px-4 rounded-xl bg-rose-950/20 border border-rose-900/30 flex-row items-center justify-between my-1"
          >
            <Text className="text-xs font-bold text-[#FF6B72]">
              Clear All Attendance Records
            </Text>
            <Text className="text-[#FF6B72] text-xs">🗑</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
