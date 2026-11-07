import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import { ThemePreference, CardLabelPreference } from '../src/types';
import {
  CloseIcon,
  ExportIcon,
  ImportIcon,
  RefreshIcon,
  TrashIcon,
} from '../src/components/icons';

export default function SettingsScreen() {
  const router = useRouter();
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
        Alert.alert(
          'Invalid Backup',
          'The selected file is not a compatible Bound schema version 1 backup.'
        );
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
                Alert.alert('Success', 'Attendance backup restored successfully.');
              } else {
                Alert.alert('Error', 'Failed to restore database from backup file.');
              }
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Import Failed', err.message);
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
        Alert.alert('Export Successful', `Saved to ${file.uri}`);
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
      const file = new File(Paths.cache, 'bound_sessions.csv');
      await file.write(csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Bound Attendance CSV',
        });
      } else {
        Alert.alert('Export Successful', `Saved to ${file.uri}`);
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
      <View className="flex-row items-center justify-between px-5 pt-3 pb-3 border-b border-white/[0.06]">
        <Text
          style={[styles.sfText, { letterSpacing: -0.6 }]}
          className="text-[26px] font-bold text-white"
        >
          Settings
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.closeButton}
          className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.14] items-center justify-center"
        >
          <CloseIcon size={16} color="rgba(255, 255, 255, 0.85)" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Appearance */}
        <View
          style={[styles.cardContainer, { borderRadius: 24, borderCurve: 'continuous' }]}
          className="p-5 my-2 bg-[#1B1C22]"
        >
          <Text
            style={[styles.sfText, { letterSpacing: -0.3 }]}
            className="text-[17px] font-semibold text-white mb-3"
          >
            Appearance
          </Text>
          <View className="flex-row justify-between space-x-2">
            {(['system', 'light', 'dark'] as ThemePreference[]).map((mode) => {
              const isSelected = settings.theme === mode;
              const label = mode.charAt(0).toUpperCase() + mode.slice(1);
              return (
                <TouchableOpacity
                  key={mode}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateSettings({ theme: mode });
                  }}
                  style={{ borderRadius: 16, borderCurve: 'continuous' }}
                  className={`flex-1 py-2.5 items-center justify-center border ${
                    isSelected
                      ? 'border-[#3DDC84] bg-emerald-500/15'
                      : 'border-white/[0.08] bg-white/[0.06]'
                  }`}
                >
                  <Text
                    style={styles.sfText}
                    className={`text-xs font-semibold ${
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
        <View
          style={[styles.cardContainer, { borderRadius: 24, borderCurve: 'continuous' }]}
          className="p-5 my-2 bg-[#1B1C22]"
        >
          <Text
            style={[styles.sfText, { letterSpacing: -0.3 }]}
            className="text-[17px] font-semibold text-white mb-1"
          >
            Attendance Target
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-1 pr-3">
              <Text style={styles.sfText} className="text-sm font-semibold text-white">
                Global Target %
              </Text>
              <Text style={styles.sfText} className="text-xs text-white/50 mt-0.5">
                Used as default threshold when calculating safe attendance
              </Text>
            </View>
            <View
              style={{ borderRadius: 14, borderCurve: 'continuous' }}
              className="w-16 h-11 bg-white/[0.08] border border-white/[0.14] items-center justify-center"
            >
              <TextInput
                value={targetInput}
                onChangeText={handleTargetChange}
                keyboardType="numeric"
                maxLength={3}
                style={styles.sfText}
                className="text-base font-bold text-white text-center p-0"
              />
            </View>
          </View>
        </View>

        {/* Card 3: Class Card Labels */}
        <View
          style={[styles.cardContainer, { borderRadius: 24, borderCurve: 'continuous' }]}
          className="p-5 my-2 bg-[#1B1C22]"
        >
          <Text
            style={[styles.sfText, { letterSpacing: -0.3 }]}
            className="text-[17px] font-semibold text-white mb-0.5"
          >
            Class Card Labels
          </Text>
          <Text style={styles.sfText} className="text-xs text-white/50 mb-3">
            Choose what primary text to show on class cards
          </Text>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                updateSettings({ primaryCardLabel: 'name' });
              }}
              style={{ borderRadius: 16, borderCurve: 'continuous' }}
              className={`flex-1 py-2.5 items-center justify-center border mr-1.5 ${
                settings.primaryCardLabel === 'name'
                  ? 'border-[#3DDC84] bg-emerald-500/15'
                  : 'border-white/[0.08] bg-white/[0.06]'
              }`}
            >
              <Text
                style={styles.sfText}
                className={`text-xs font-semibold ${
                  settings.primaryCardLabel === 'name'
                    ? 'text-[#3DDC84]'
                    : 'text-zinc-300'
                }`}
              >
                Subject Name
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                updateSettings({ primaryCardLabel: 'code' });
              }}
              style={{ borderRadius: 16, borderCurve: 'continuous' }}
              className={`flex-1 py-2.5 items-center justify-center border ml-1.5 ${
                settings.primaryCardLabel === 'code'
                  ? 'border-[#3DDC84] bg-emerald-500/15'
                  : 'border-white/[0.08] bg-white/[0.06]'
              }`}
            >
              <Text
                style={styles.sfText}
                className={`text-xs font-semibold ${
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
        <View
          style={[styles.cardContainer, { borderRadius: 24, borderCurve: 'continuous' }]}
          className="p-5 my-2 bg-[#1B1C22]"
        >
          <Text
            style={[styles.sfText, { letterSpacing: -0.3 }]}
            className="text-[17px] font-semibold text-white mb-3"
          >
            Notifications & Reminders
          </Text>

          {/* Daily Evening Alert */}
          <View className="flex-row items-center justify-between py-2 border-b border-white/[0.06]">
            <View className="flex-1 pr-3">
              <Text style={styles.sfText} className="text-sm font-semibold text-white">
                Daily Evening Alert
              </Text>
              <Text style={styles.sfText} className="text-xs text-white/50 mt-0.5">
                Reminds you to log classes on active weekdays
              </Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                updateSettings({ dailyReminderEnabled: val });
              }}
              trackColor={{ false: '#3A3B45', true: '#3DDC84' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Per-class Quick-Mark Alert */}
          <View className="py-2.5 border-b border-white/[0.06]">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text style={styles.sfText} className="text-sm font-semibold text-white">
                  Per-class Quick-Mark Alert
                </Text>
                <Text style={styles.sfText} className="text-xs text-white/50 mt-0.5">
                  Heads-up reminder before class starts or ends
                </Text>
              </View>
              <Switch
                value={settings.perClassReminderEnabled}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  updateSettings({ perClassReminderEnabled: val });
                }}
                trackColor={{ false: '#3A3B45', true: '#3DDC84' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Notify Timing Sub-options */}
            {settings.perClassReminderEnabled && (
              <View className="mt-3 pt-2">
                <Text style={styles.sfText} className="text-xs font-medium text-white/50 mb-2">
                  Notify Timing
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateSettings({ perClassReminderOffsetMinutes: 5 });
                    }}
                    style={{ borderRadius: 16, borderCurve: 'continuous' }}
                    className={`flex-1 py-2 items-center justify-center border mr-1.5 ${
                      settings.perClassReminderOffsetMinutes === 5
                        ? 'border-[#3DDC84] bg-emerald-500/15'
                        : 'border-white/[0.08] bg-white/[0.06]'
                    }`}
                  >
                    <Text
                      style={styles.sfText}
                      className={`text-xs font-semibold ${
                        settings.perClassReminderOffsetMinutes === 5
                          ? 'text-[#3DDC84]'
                          : 'text-zinc-300'
                      }`}
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
                    style={{ borderRadius: 16, borderCurve: 'continuous' }}
                    className={`flex-1 py-2 items-center justify-center border ml-1.5 ${
                      settings.perClassReminderOffsetMinutes === 15
                        ? 'border-[#3DDC84] bg-emerald-500/15'
                        : 'border-white/[0.08] bg-white/[0.06]'
                    }`}
                  >
                    <Text
                      style={styles.sfText}
                      className={`text-xs font-semibold ${
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
              <Text style={styles.sfText} className="text-sm font-semibold text-white">
                Weekly Sunday Digest
              </Text>
              <Text style={styles.sfText} className="text-xs text-white/50 mt-0.5">
                Highlights low-attendance subjects every Sunday at 19:00
              </Text>
            </View>
            <Switch
              value={settings.sundayDigestEnabled}
              onValueChange={(val) => {
                Haptics.selectionAsync();
                updateSettings({ sundayDigestEnabled: val });
              }}
              trackColor={{ false: '#3A3B45', true: '#3DDC84' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Card 5: Data & Backup */}
        <View
          style={[styles.cardContainer, { borderRadius: 24, borderCurve: 'continuous' }]}
          className="p-5 my-2 bg-[#1B1C22]"
        >
          <Text
            style={[styles.sfText, { letterSpacing: -0.3 }]}
            className="text-[17px] font-semibold text-white mb-3"
          >
            Data & Backup
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportJSON}
            style={{ borderRadius: 14, borderCurve: 'continuous' }}
            className="py-3 px-4 bg-white/[0.06] border border-white/[0.08] flex-row items-center justify-between my-1"
          >
            <Text style={styles.sfText} className="text-xs font-semibold text-white">
              Export Backup (JSON)
            </Text>
            <ExportIcon size={15} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleImportJSON}
            style={{ borderRadius: 14, borderCurve: 'continuous' }}
            className="py-3 px-4 bg-white/[0.06] border border-white/[0.08] flex-row items-center justify-between my-1"
          >
            <Text style={styles.sfText} className="text-xs font-semibold text-white">
              Import Backup (JSON)
            </Text>
            <ImportIcon size={15} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            style={{ borderRadius: 14, borderCurve: 'continuous' }}
            className="py-3 px-4 bg-white/[0.06] border border-white/[0.08] flex-row items-center justify-between my-1"
          >
            <Text style={styles.sfText} className="text-xs font-semibold text-white">
              Export Attendance Log (CSV)
            </Text>
            <ExportIcon size={15} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmResetDemo}
            style={{ borderRadius: 14, borderCurve: 'continuous' }}
            className="py-3 px-4 bg-white/[0.06] border border-white/[0.08] flex-row items-center justify-between my-1"
          >
            <Text style={styles.sfText} className="text-xs font-semibold text-amber-400">
              Reset to Sample Demo Data
            </Text>
            <RefreshIcon size={15} color="#FFB020" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmClearAll}
            style={{ borderRadius: 14, borderCurve: 'continuous' }}
            className="py-3 px-4 bg-rose-500/10 border border-rose-500/30 flex-row items-center justify-between my-1"
          >
            <Text style={styles.sfText} className="text-xs font-semibold text-[#FF6B72]">
              Clear All Attendance Records
            </Text>
            <TrashIcon size={15} color="#FF6B72" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  closeButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
