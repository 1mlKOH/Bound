import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Settings, ScheduleSlot, Subject, Session, Holiday, SubjectStats } from '../types';
import { computeSubjectStats, computePooledStats, getTodayDateString } from '../domain/attendance';
import { generateClassReminderCopy } from '../domain/notifications';
import { Haptics } from './haptics';
import { toast } from 'sonner-native';

export { generateClassReminderCopy };

// Set up notification display behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NOTIFICATION_CHANNELS = {
  CLASS_REMINDERS: 'class-reminders',
  DAILY_CHECK: 'daily-check',
  WEEKLY_DIGEST: 'weekly-digest',
} as const;

export const NOTIFICATION_CATEGORIES = {
  CLASS_REMINDER: 'CLASS_REMINDER',
} as const;

export const NOTIFICATION_ACTIONS = {
  MARK_PRESENT: 'MARK_PRESENT',
  MARK_ABSENT: 'MARK_ABSENT',
  VIEW_TIMETABLE: 'VIEW_TIMETABLE',
} as const;

// Lazy store accessor to avoid circular dependency at module bundle evaluation
function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useAttendanceStore } = require('../store/useAttendanceStore');
  return useAttendanceStore;
}

/**
 * Ensures notification channels (Android) and categories with action buttons (iOS/Android)
 * are registered with the OS.
 */
export async function setupNotificationCategoriesAndChannels(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.CLASS_REMINDERS, {
        name: 'Class Reminders',
        description: 'Heads-up smart alerts before scheduled classes',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3DDC84',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DAILY_CHECK, {
        name: 'Daily Attendance Check',
        description: 'Evening reminders to log attendance for the day',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#3DDC84',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.WEEKLY_DIGEST, {
        name: 'Weekly Attendance Digest',
        description: 'Sunday evening attendance targets summary',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#3DDC84',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Register interactive quick actions for class alerts
    await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.CLASS_REMINDER, [
      {
        identifier: NOTIFICATION_ACTIONS.MARK_PRESENT,
        buttonTitle: 'Attended',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: NOTIFICATION_ACTIONS.MARK_ABSENT,
        buttonTitle: 'Missed',
        options: {
          isDestructive: true,
          opensAppToForeground: true,
        },
      },
      {
        identifier: NOTIFICATION_ACTIONS.VIEW_TIMETABLE,
        buttonTitle: 'View Today',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  } catch (error) {
    console.warn('Failed to setup notification channels/categories:', error);
  }
}

/**
 * Requests notification permissions from the OS.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/**
 * Reschedules all local notifications according to user settings, active schedule slots,
 * and current attendance stats (generating smart contextual copy).
 */
export async function syncScheduledNotifications(
  settings: Settings,
  subjects: Subject[],
  slots: ScheduleSlot[],
  sessions: Session[] = [],
  holidays: Holiday[] = []
): Promise<void> {
  try {
    // 0. Ensure channels and categories are initialized
    await setupNotificationCategoriesAndChannels();

    // 1. Cancel all previously scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // If notifications are totally disabled or permissions not granted, exit early
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const activeSubjects = subjects.filter((s) => !s.archivedAt);
    const activeSubjectsMap = new Map(activeSubjects.map((s) => [s.id, s]));
    const holidaysSet = new Set(holidays.map((h) => h.date));

    // Compute stats for all active subjects
    const statsMap = new Map<string, SubjectStats>();
    const allStats: SubjectStats[] = [];
    for (const sub of activeSubjects) {
      const stats = computeSubjectStats(sub, sessions, holidaysSet, settings.globalTargetPct);
      statsMap.set(sub.id, stats);
      allStats.push(stats);
    }
    const pooled = computePooledStats(allStats, settings.globalTargetPct);

    // 2. Schedule Daily Evening Alert if enabled
    if (settings.dailyReminderEnabled) {
      const [hourStr, minuteStr] = settings.dailyReminderTime.split(':');
      const hour = parseInt(hourStr, 10) || 18;
      const minute = parseInt(minuteStr, 10) || 0;

      const dailyBody =
        pooled.subjectsBelowTarget > 0
          ? `Log today's classes! ${pooled.subjectsBelowTarget} subject${pooled.subjectsBelowTarget > 1 ? 's are' : ' is'} below your ${settings.globalTargetPct}% target.`
          : "Don't forget to mark your class attendance for today!";

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Attendance Check',
          body: dailyBody,
          sound: true,
          data: {
            type: 'DAILY_CHECK',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          channelId: NOTIFICATION_CHANNELS.DAILY_CHECK,
          hour,
          minute,
          repeats: true,
        },
      });
    }

    // 3. Schedule Weekly Sunday Digest if enabled
    if (settings.sundayDigestEnabled) {
      const sundayBody =
        pooled.subjectsBelowTarget > 0
          ? `${pooled.subjectsBelowTarget} subject${pooled.subjectsBelowTarget > 1 ? 's are' : ' is'} below target (${settings.globalTargetPct}%). Review your attendance and plan next week.`
          : `All subjects are on track (${pooled.pooledPercentage}% overall). Have a great week ahead.`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weekly Attendance Digest',
          body: sundayBody,
          sound: true,
          data: {
            type: 'SUNDAY_DIGEST',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          channelId: NOTIFICATION_CHANNELS.WEEKLY_DIGEST,
          weekday: 1, // Sunday in standard triggers (1 = Sunday)
          hour: 19,
          minute: 0,
          repeats: true,
        },
      });
    }

    // 4. Schedule Per-Class Quick-Mark Reminders if enabled
    if (settings.perClassReminderEnabled) {
      const offsetMin = settings.perClassReminderOffsetMinutes || 5;

      for (const slot of slots) {
        const subject = activeSubjectsMap.get(slot.subjectId);
        if (!subject) continue;

        const stats =
          statsMap.get(subject.id) ||
          computeSubjectStats(subject, sessions, holidaysSet, settings.globalTargetPct);
        const { title, body } = generateClassReminderCopy(
          subject,
          stats,
          slot.startTime,
          offsetMin
        );

        const [startH, startM] = slot.startTime.split(':').map(Number);
        let notifyH = startH;
        let notifyM = startM - offsetMin;
        if (notifyM < 0) {
          notifyM += 60;
          notifyH -= 1;
        }
        if (notifyH < 0) continue;

        // Convert weekday (0=Sun..6=Sat) to Notification trigger (1=Sun..7=Sat)
        const triggerWeekday = slot.weekday + 1;

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_REMINDER,
            data: {
              type: 'CLASS_REMINDER',
              subjectId: subject.id,
              subjectName: subject.name,
              slotId: slot.id,
              startTime: slot.startTime,
              weekday: slot.weekday,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            channelId: NOTIFICATION_CHANNELS.CLASS_REMINDERS,
            weekday: triggerWeekday,
            hour: notifyH,
            minute: notifyM,
            repeats: true,
          },
        });
      }
    }
  } catch (error) {
    console.warn('Failed to schedule notifications:', error);
  }
}

let lastHandledResponseId = '';

/**
 * Handles user interactions with notifications (action button taps and notification body taps).
 */
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  router?: any
): Promise<void> {
  try {
    const responseId = `${response.notification.request.identifier}-${response.actionIdentifier}`;
    if (responseId === lastHandledResponseId) return;
    lastHandledResponseId = responseId;

    const { actionIdentifier, notification } = response;
    const data = (notification.request.content.data || {}) as {
      type?: string;
      subjectId?: string;
      subjectName?: string;
      slotId?: string;
      startTime?: string;
    };

    const store = getStore().getState();
    const today = getTodayDateString();

    if (
      actionIdentifier === NOTIFICATION_ACTIONS.MARK_PRESENT ||
      actionIdentifier === NOTIFICATION_ACTIONS.MARK_ABSENT
    ) {
      const isPresent = actionIdentifier === NOTIFICATION_ACTIONS.MARK_PRESENT;
      const targetStatus = isPresent ? 'present' : 'absent';

      // Ensure today's sessions exist
      const daySessions = store.getSessionsForDate(today);
      const session = daySessions.find(
        (s: Session) =>
          (data.slotId && s.slotId === data.slotId) || s.subjectId === data.subjectId
      );

      if (session) {
        store.markSession(session.id, targetStatus);
      }

      if (isPresent) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(`Marked ${data.subjectName || 'Class'} as Present`, {
          description: `Logged for today's ${data.startTime || 'session'}`,
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        toast.error(`Marked ${data.subjectName || 'Class'} as Absent`, {
          description: `Logged for today's ${data.startTime || 'session'}`,
        });
      }

      store.resetToToday();
      if (router) {
        router.push('/(tabs)');
      }
      return;
    }

    // Default action (tap on banner) or View Timetable button
    if (data?.type === 'SUNDAY_DIGEST') {
      if (router) {
        router.push('/(tabs)/stats');
      }
    } else {
      store.resetToToday();
      if (router) {
        router.push('/(tabs)');
      }
    }
  } catch (error) {
    console.warn('Error handling notification response:', error);
  }
}

/**
 * Sends an immediate test notification allowing user to verify layout, channels, and interactive buttons.
 */
export async function sendTestNotification(
  variant: 'safe' | 'risk' | 'daily' = 'safe'
): Promise<void> {
  await setupNotificationCategoriesAndChannels();
  const hasPerm = await requestNotificationPermissions();
  if (!hasPerm) {
    toast.error('Notification permission required', {
      description: 'Please enable notifications in device settings to test.',
    });
    return;
  }

  const store = getStore().getState();
  const subjects = store.subjects;
  const sampleSubject = subjects[0] || {
    id: 'test-sub',
    name: variant === 'safe' ? 'Physics · PHY101' : 'Calculus · MAT102',
    code: variant === 'safe' ? 'PHY101' : 'MAT102',
  };

  if (variant === 'daily') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Attendance Check',
        body: "Don't forget to log your class attendance for today!",
        sound: true,
        data: { type: 'DAILY_CHECK' },
      },
      trigger: {
        channelId: NOTIFICATION_CHANNELS.DAILY_CHECK,
      },
    });
    toast.info('Test daily notification sent!');
    return;
  }

  const isSafe = variant === 'safe';
  const title = isSafe
    ? `${sampleSubject.name} starts in 15m`
    : `${sampleSubject.name} starts in 15m (${isSafe ? '82.0%' : '74.0%'})`;
  const body = isSafe
    ? 'Safe buffer: +4 skips banked. Class starts at 10:00.'
    : 'Cutoff is 75%. Attendance required today. Need next 2 classes to recover.';

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_REMINDER,
      data: {
        type: 'CLASS_REMINDER',
        subjectId: sampleSubject.id,
        subjectName: sampleSubject.name,
        slotId: 'test-slot',
        startTime: '10:00',
      },
    },
    trigger: {
      channelId: NOTIFICATION_CHANNELS.CLASS_REMINDERS,
    },
  });

  toast.success(`Test ${isSafe ? 'Safe' : 'Risk'} alert sent!`, {
    description: 'Check your notification shade to test quick action buttons.',
  });
}
