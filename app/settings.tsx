import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDownIcon,
  SunIcon,
} from '../src/components/icons';
import { useTheme } from '../src/utils/theme';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { toast } from 'sonner-native';
import { sendTestNotification } from '../src/utils/notifications';
import { fontFamilyNames } from '../src/utils/typography';

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

interface FoldableSectionCardProps {
  title: string;
  subtitle?: string;
  summaryBadge?: string;
  badgeColor?: string;
  badgeBg?: string;
  icon?: React.ReactNode;
  isDanger?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const FoldableSectionCard: React.FC<FoldableSectionCardProps> = ({
  title,
  subtitle,
  summaryBadge,
  badgeColor,
  badgeBg,
  icon,
  isDanger = false,
  defaultExpanded = true,
  children,
}) => {
  const { colors, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const headerScale = useRef(new Animated.Value(1)).current;
  const chevronRotation = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(chevronRotation, {
      toValue: isExpanded ? 1 : 0,
      damping: 18,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const chevronAngle = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const onPressIn = () => {
    Animated.timing(headerScale, {
      toValue: 0.985,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(headerScale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const handleToggle = () => {
    Haptics.selectionAsync();
    setIsExpanded((prev) => !prev);
  };

  const resolvedBorder = isDanger
    ? isDark ? 'rgba(255, 107, 114, 0.25)' : 'rgba(220, 38, 38, 0.20)'
    : colors.cardBorder;

  const resolvedBg = isDanger
    ? isDark ? 'rgba(255, 107, 114, 0.04)' : 'rgba(254, 242, 242, 0.6)'
    : colors.card;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderRadius: 24,
          borderCurve: 'continuous',
          backgroundColor: resolvedBg,
          borderColor: resolvedBorder,
          borderWidth: isDanger ? 1 : 0,
          shadowColor: colors.cardShadow,
        },
      ]}
      className="my-2 overflow-hidden"
    >
      <Animated.View style={{ transform: [{ scale: headerScale }] }}>
        <TouchableOpacity
          activeOpacity={0.88}
          delayPressIn={0}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handleToggle}
          className="p-5 flex-row items-center justify-between"
        >
          {/* Left: Icon + Title + Subtitle */}
          <View className="flex-row items-center flex-1 pr-2">
            {icon && (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isDanger
                    ? isDark ? 'rgba(255, 107, 114, 0.15)' : 'rgba(220, 38, 38, 0.10)'
                    : colors.actionBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                {icon}
              </View>
            )}
            <View className="flex-1">
              <Text
                style={[
                  styles.sfText,
                  {
                    fontFamily: fontFamilyNames.bold,
                    letterSpacing: -0.3,
                    color: isDanger
                      ? isDark ? '#FF6B72' : '#DC2626'
                      : colors.text,
                    lineHeight: 22,
                  },
                ]}
                className="text-[17px] font-bold"
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.sfText,
                    {
                      fontFamily: fontFamilyNames.regular,
                      color: colors.textMuted,
                      letterSpacing: -0.1,
                    },
                  ]}
                  className="text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Right: Summary Badge + Rotating Chevron */}
          <View className="flex-row items-center">
            {summaryBadge && (
              <View
                style={{
                  borderRadius: 999,
                  backgroundColor: badgeBg || colors.actionBg,
                }}
                className="px-2.5 py-1 mr-2"
              >
                <Text
                  style={[
                    styles.sfText,
                    {
                      fontFamily: fontFamilyNames.semiBold,
                      color: badgeColor || colors.textSecondary,
                    },
                  ]}
                  className="text-[11px] font-semibold"
                >
                  {summaryBadge}
                </Text>
              </View>
            )}
            <Animated.View style={{ transform: [{ rotate: chevronAngle }] }}>
              <ChevronDownIcon
                size={16}
                color={isDanger ? (isDark ? '#FF6B72' : '#DC2626') : colors.textMuted}
                strokeWidth={2.4}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Expanded Content Body */}
      {isExpanded && (
        <View
          style={{
            borderTopColor: colors.divider,
            borderTopWidth: 1,
          }}
          className="px-5 pt-4 pb-5"
        >
          {children}
        </View>
      )}
    </View>
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

  const activeNotificationCount = [
    settings.dailyReminderEnabled,
    settings.perClassReminderEnabled,
    settings.sundayDigestEnabled,
  ].filter(Boolean).length;

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
        {/* Category 1: Appearance & Display */}
        <FoldableSectionCard
          title="Appearance & Display"
          subtitle="Theme, class card labels, and haptics"
          summaryBadge={`${settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)} · ${settings.primaryCardLabel === 'name' ? 'Name' : 'Code'}`}
          icon={<SunIcon size={16} color={colors.textSecondary} />}
          defaultExpanded={true}
        >
          {/* Theme selector */}
          <View className="mb-4">
            <Text
              style={[
                styles.sfText,
                { fontFamily: fontFamilyNames.semiBold, color: colors.text },
              ]}
              className="text-sm font-semibold mb-2"
            >
              Theme
            </Text>
            <SegmentedControl
              options={[
                { label: 'System', value: 'system' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              selectedValue={settings.theme}
              onSelect={(mode) => updateSettings({ theme: mode })}
              containerClass="relative flex-row p-1"
            />
          </View>

          {/* Class Card Label */}
          <View
            style={{ borderTopColor: colors.divider }}
            className="pt-4 border-t mb-4"
          >
            <Text
              style={[
                styles.sfText,
                { fontFamily: fontFamilyNames.semiBold, color: colors.text },
              ]}
              className="text-sm font-semibold mb-0.5"
            >
              Class Card Labels
            </Text>
            <Text
              style={[
                styles.sfText,
                { fontFamily: fontFamilyNames.regular, color: colors.textMuted },
              ]}
              className="text-xs mb-2.5"
            >
              Choose what primary text to display on class cards
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

          {/* Haptic Feedback Toggle */}
          <View
            style={{ borderTopColor: colors.divider }}
            className="flex-row items-center justify-between pt-4 border-t"
          >
            <View className="flex-1 pr-3">
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.semiBold, color: colors.text },
                ]}
                className="text-sm font-semibold"
              >
                Haptic Feedback
              </Text>
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.regular, color: colors.textMuted },
                ]}
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
        </FoldableSectionCard>

        {/* Category 2: Attendance Rules */}
        <FoldableSectionCard
          title="Attendance Rules"
          subtitle="Default cutoff threshold and margin calculation"
          summaryBadge={`${settings.globalTargetPct}%`}
          icon={<GaugeIcon size={16} color={colors.textSecondary} />}
          defaultExpanded={true}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.semiBold, color: colors.text },
                ]}
                className="text-sm font-semibold"
              >
                Global Target Cutoff
              </Text>
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.regular, color: colors.textMuted },
                ]}
                className="text-xs mt-0.5"
              >
                Default threshold used to compute safe skips and recovery classes
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
                  { fontFamily: fontFamilyNames.bold, color: colors.text },
                ]}
                className="text-base font-bold text-center p-0"
              />
            </View>
          </View>
        </FoldableSectionCard>

        {/* Category 3: Notifications & Reminders */}
        <FoldableSectionCard
          title="Notifications & Reminders"
          subtitle="Schedule alerts, evening catch-ups & digests"
          summaryBadge={activeNotificationCount > 0 ? `${activeNotificationCount} active` : 'Off'}
          icon={<BellIcon size={16} color={colors.textSecondary} strokeWidth={2} />}
          defaultExpanded={true}
        >
          {/* Unmarked Class Reminder */}
          <View
            style={{ borderBottomColor: colors.divider }}
            className="flex-row items-center justify-between pb-3 border-b"
          >
            <View className="flex-1 pr-3">
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.semiBold, color: colors.text },
                ]}
                className="text-sm font-semibold"
              >
                Unmarked Class Reminder
              </Text>
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.regular, color: colors.textMuted },
                ]}
                className="text-xs mt-0.5"
              >
                Reminds you in the evening only if any classes are left unmarked for the day
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
            className="py-3 border-b"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text
                  style={[
                    styles.sfText,
                    { fontFamily: fontFamilyNames.semiBold, color: colors.text },
                  ]}
                  className="text-sm font-semibold"
                >
                  Per-class Quick-Mark Alert
                </Text>
                <Text
                  style={[
                    styles.sfText,
                    { fontFamily: fontFamilyNames.regular, color: colors.textMuted },
                  ]}
                  className="text-xs mt-0.5"
                >
                  Heads-up reminder before class starts
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
                  style={[
                    styles.sfText,
                    { fontFamily: fontFamilyNames.medium, color: colors.textMuted },
                  ]}
                  className="text-xs font-medium mb-2"
                >
                  Alert Offset
                </Text>
                <View className="flex-row">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateSettings({ perClassReminderOffsetMinutes: 5 });
                    }}
                    style={{
                      borderRadius: 14,
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
                          fontFamily: fontFamilyNames.semiBold,
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
                      borderRadius: 14,
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
                          fontFamily: fontFamilyNames.semiBold,
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
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-1 pr-3">
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.semiBold, color: colors.text },
                ]}
                className="text-sm font-semibold"
              >
                Weekly Sunday Digest
              </Text>
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.regular, color: colors.textMuted },
                ]}
                className="text-xs mt-0.5"
              >
                Highlights low-attendance subjects every Sunday evening at 19:00
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
            className="pt-3.5 mt-1 border-t"
          >
            <View className="mb-2">
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.semiBold, color: colors.text },
                ]}
                className="text-xs font-semibold"
              >
                Test Live Notifications
              </Text>
              <Text
                style={[
                  styles.sfText,
                  { fontFamily: fontFamilyNames.regular, color: colors.textMuted },
                ]}
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
                    { fontFamily: fontFamilyNames.semiBold, color: colors.presentBadgeText },
                  ]}
                  className="text-xs font-semibold"
                >
                  Safe Alert
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
                    { fontFamily: fontFamilyNames.semiBold, color: colors.absentBadgeText },
                  ]}
                  className="text-xs font-semibold"
                >
                  Risk Alert
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.selectionAsync();
                  sendTestNotification('daily');
                }}
                style={{
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: colors.actionBg,
                }}
                className="flex-1 py-2 items-center justify-center"
              >
                <Text
                  style={[
                    styles.sfText,
                    { fontFamily: fontFamilyNames.semiBold, color: colors.textSecondary },
                  ]}
                  className="text-xs font-semibold"
                >
                  Catch-up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </FoldableSectionCard>

        {/* Category 4: Backup & Data */}
        <FoldableSectionCard
          title="Backup & Data"
          subtitle="Export, import, and tour review"
          icon={<ExportIcon size={16} color={colors.textSecondary} />}
          defaultExpanded={false}
        >
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
              style={[
                styles.sfText,
                { fontFamily: fontFamilyNames.semiBold, color: colors.text },
              ]}
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
              style={[
                styles.sfText,
                { fontFamily: fontFamilyNames.semiBold, color: colors.text },
              ]}
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
              style={[
                styles.sfText,
                { fontFamily: fontFamilyNames.semiBold, color: colors.text },
              ]}
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
                {
                  fontFamily: fontFamilyNames.semiBold,
                  color: isDark ? '#3DDC84' : '#0D8A33',
                },
              ]}
              className="text-xs font-semibold"
            >
              Review Welcome Tour & Cutoffs
            </Text>
            <ChevronRightIcon size={15} color={isDark ? '#3DDC84' : '#0D8A33'} />
          </TouchableOpacity>
        </FoldableSectionCard>

        {/* Category 5: Danger Zone */}
        <FoldableSectionCard
          title="Danger Zone"
          subtitle="Reset demo timetable or erase attendance records"
          summaryBadge="Destructive"
          badgeColor={isDark ? '#FF6B72' : '#DC2626'}
          badgeBg={isDark ? 'rgba(255, 107, 114, 0.15)' : 'rgba(220, 38, 38, 0.10)'}
          icon={<TrashIcon size={16} color={isDark ? '#FF6B72' : '#DC2626'} />}
          isDanger={true}
          defaultExpanded={false}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmResetDemo}
            style={{
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: isDark
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(245, 158, 11, 0.08)',
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[
                styles.sfText,
                {
                  fontFamily: fontFamilyNames.semiBold,
                  color: isDark ? '#FFB020' : '#D97706',
                },
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
                ? 'rgba(244, 63, 94, 0.12)'
                : 'rgba(244, 63, 94, 0.08)',
            }}
            className="py-3 px-4 flex-row items-center justify-between my-1"
          >
            <Text
              style={[
                styles.sfText,
                {
                  fontFamily: fontFamilyNames.semiBold,
                  color: isDark ? '#FF6B72' : '#DC2626',
                },
              ]}
              className="text-xs font-semibold"
            >
              Clear All Attendance Records
            </Text>
            <TrashIcon size={15} color={isDark ? '#FF6B72' : '#DC2626'} />
          </TouchableOpacity>
        </FoldableSectionCard>
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
    fontFamily: fontFamilyNames.medium,
    includeFontPadding: false,
  },
});
