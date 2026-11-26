import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Settings, ScheduleSlot, Subject, Session, Holiday, SubjectStats } from '../types';
import { computeSubjectStats, computePooledStats, getTodayDateString, formatTime12h } from '../domain/attendance';
import {
  generateClassReminderCopy,
  generateUnmarkedCatchupCopy,
  getUnmarkedCountForDate,
  getClassReminderCandidates,
  isDateHoliday,
  ClassReminderCandidate,
} from '../domain/notifications';
import { Haptics } from './haptics';
import { toast } from 'sonner-native';

export {
  generateClassReminderCopy,
  generateUnmarkedCatchupCopy,
  getUnmarkedCountForDate,
  getClassReminderCandidates,
  isDateHoliday,
};
export type { ClassReminderCandidate };

// Set up notification display behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // If notification has a date payload and that date is marked as a holiday, suppress alert/sound/banner
    const data = notification?.request?.content?.data as { date?: string } | undefined;
    if (data?.date) {
      try {
        const store = getStore().getState();
        const isHoliday = store.holidays.some((h: Holiday) => h.date === data.date);
        if (isHoliday) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
      } catch {
        // Fallback to normal display
      }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
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
        lightColor: '#1E9BFF',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DAILY_CHECK, {
        name: 'Unmarked Class Reminders',
        description: 'Evening reminders for unlogged classes',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#1E9BFF',
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
        lightColor: '#1E9BFF',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Register interactive quick actions for class alerts (streamlined 2-button row, silent background actions)
    await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.CLASS_REMINDER, [
      {
        identifier: NOTIFICATION_ACTIONS.MARK_PRESENT,
        buttonTitle: 'Present',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: NOTIFICATION_ACTIONS.MARK_ABSENT,
        buttonTitle: 'Absent',
        options: {
          isDestructive: true,
          opensAppToForeground: false,
        },
      },
    ]);
  } catch (error) {
    console.warn('Failed to setup notification channels/categories:', error);
  }
}

/**
 * Silently inspects notification permission status without prompting the user.
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
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
 * and current attendance stats (generating smart contextual copy and conditionally scheduling
 * evening catch-up reminders only when classes are left unmarked).
 */
export async function syncScheduledNotifications(
  settings: Settings,
  subjects: Subject[],
  slots: ScheduleSlot[],
  sessions: Session[] = [],
  holidays: Holiday[] = []
): Promise<void> {
  try {
    // If user has not finished onboarding yet or all reminder toggles are disabled,
    // cancel any existing scheduled notifications and exit without requesting permissions.
    const anyReminderEnabled =
      Boolean(settings.dailyReminderEnabled) ||
      Boolean(settings.perClassReminderEnabled) ||
      Boolean(settings.sundayDigestEnabled);

    if (!settings.hasOnboarded || !anyReminderEnabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    // Silently check if permission was granted. Never trigger OS permission dialog during background sync.
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) return;

    // 0. Ensure channels and categories are initialized
    await setupNotificationCategoriesAndChannels();

    // 1. Cancel all previously scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

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

    // 2. Schedule Unmarked Class Catch-up Reminders if enabled
    // Only schedules if there are active, unlogged classes for that day!
    if (settings.dailyReminderEnabled) {
      const [hourStr, minuteStr] = settings.dailyReminderTime.split(':');
      const hour = parseInt(hourStr, 10) || 18;
      const minute = parseInt(minuteStr, 10) || 0;

      // Check today (day 0) and upcoming active days (up to 6 days ahead)
      for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
        targetDate.setHours(hour, minute, 0, 0);

        // If reminder time has already passed for today, skip
        if (targetDate.getTime() <= Date.now()) {
          continue;
        }

        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const dayOfWeek = targetDate.getDay();

        const unmarked = getUnmarkedCountForDate(
          dateStr,
          dayOfWeek,
          slots,
          activeSubjectsMap,
          sessions,
          holidaysSet
        );

        // Only schedule if there are actually unmarked classes for this day!
        if (unmarked.count > 0) {
          const { title, body } = generateUnmarkedCatchupCopy(
            unmarked.count,
            unmarked.sampleSubjectName
          );

          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              sound: true,
              color: '#1E9BFF',
              categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_REMINDER,
              data: {
                type: 'UNMARKED_CHECK',
                date: dateStr,
                unmarkedCount: unmarked.count,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: targetDate,
              channelId: NOTIFICATION_CHANNELS.DAILY_CHECK,
            },
          });
        }
      }
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
          color: '#1E9BFF',
          data: {
            type: 'SUNDAY_DIGEST',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          channelId: NOTIFICATION_CHANNELS.WEEKLY_DIGEST,
          weekday: 1, // Sunday in standard triggers (1 = Sunday)
          hour: 19,
          minute: 0,
        },
      });
    }

    // 4. Schedule Per-Class Quick-Mark Reminders if enabled (rolling 7-day window with DATE triggers)
    if (settings.perClassReminderEnabled) {
      const offsetMin = settings.perClassReminderOffsetMinutes || 5;
      const now = new Date();

      const candidates = getClassReminderCandidates(
        now,
        7,
        offsetMin,
        slots,
        activeSubjectsMap,
        sessions,
        holidaysSet
      );

      for (const candidate of candidates) {
        const stats =
          statsMap.get(candidate.subject.id) ||
          computeSubjectStats(candidate.subject, sessions, holidaysSet, settings.globalTargetPct);

        const { title, body } = generateClassReminderCopy(
          candidate.subject,
          stats,
          candidate.startTime,
          offsetMin
        );

        const displayTitle = candidate.isExtra ? `Extra Class · ${title}` : title;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: displayTitle,
            body,
            sound: true,
            color: '#1E9BFF',
            categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_REMINDER,
            data: {
              type: 'CLASS_REMINDER',
              isExtra: candidate.isExtra,
              sessionId: candidate.sessionId,
              subjectId: candidate.subject.id,
              subjectName: candidate.subject.name,
              slotId: candidate.slotId,
              startTime: candidate.startTime,
              weekday: candidate.weekday,
              date: candidate.date,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(candidate.triggerTimeMs),
            channelId: NOTIFICATION_CHANNELS.CLASS_REMINDERS,
          },
        });
      }
    }
  } catch (error) {
    console.warn('Failed to schedule notifications:', error);
  }
}

/**
 * Automatically dismisses any delivered notifications in the status bar/tray
 * matching a specific session, slot, or subject (e.g. when marked in-app).
 */
export async function dismissPresentedNotificationForSession(session: {
  id?: string;
  slotId?: string | null;
  subjectId?: string;
}): Promise<void> {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const item of presented) {
      const data = item.request.content.data as {
        sessionId?: string;
        slotId?: string;
        subjectId?: string;
      } | undefined;
      if (!data) continue;

      const matchesSession = Boolean(session.id && data.sessionId === session.id);
      const matchesSlot = Boolean(session.slotId && data.slotId === session.slotId);
      const matchesSubject = Boolean(
        !session.slotId && !session.id && session.subjectId && data.subjectId === session.subjectId
      );

      if (matchesSession || matchesSlot || matchesSubject) {
        await Notifications.dismissNotificationAsync(item.request.identifier).catch(() => {});
      }
    }
  } catch {
    // Graceful fallback if notifications are unsupported in current runtime
  }
}

/**
 * Automatically dismisses any delivered notifications in the status bar/tray
 * matching a specific date (e.g. when that day is marked as a holiday).
 */
export async function dismissPresentedNotificationsForDate(dateStr: string): Promise<void> {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const item of presented) {
      const data = item.request.content.data as { date?: string } | undefined;
      if (data && data.date === dateStr) {
        await Notifications.dismissNotificationAsync(item.request.identifier).catch(() => {});
      }
    }
  } catch {
    // Graceful fallback if notifications are unsupported in current runtime
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

    // Immediately dismiss the notification from the tray so it doesn't linger or allow double entries
    if (notification?.request?.identifier) {
      await Notifications.dismissNotificationAsync(notification.request.identifier).catch(() => {});
    }

    const data = (notification.request.content.data || {}) as {
      type?: string;
      isExtra?: boolean;
      sessionId?: string;
      subjectId?: string;
      subjectName?: string;
      slotId?: string;
      startTime?: string;
      date?: string;
    };

    const store = getStore().getState();
    const targetDate = data.date || getTodayDateString();

    if (
      actionIdentifier === NOTIFICATION_ACTIONS.MARK_PRESENT ||
      actionIdentifier === NOTIFICATION_ACTIONS.MARK_ABSENT
    ) {
      const isPresent = actionIdentifier === NOTIFICATION_ACTIONS.MARK_PRESENT;
      const displaySubject = data.isExtra
        ? `Extra Class (${data.subjectName || 'Class'})`
        : (data.subjectName || 'Class');

      const success = store.recordAttendanceFromNotification({
        actionIdentifier,
        sessionId: data.sessionId,
        slotId: data.slotId,
        subjectId: data.subjectId,
        startTime: data.startTime,
        date: targetDate,
      });

      if (success) {
        if (isPresent) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success(`Marked ${displaySubject} as Present`, {
            description: `Logged for ${data.startTime ? formatTime12h(data.startTime) : 'session'}`,
          });
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          toast.error(`Marked ${displaySubject} as Absent`, {
            description: `Logged for ${data.startTime ? formatTime12h(data.startTime) : 'session'}`,
          });
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        toast.error('Could not log attendance', {
          description: `No matching class found for ${displaySubject}.`,
        });
      }

      store.resetToToday();
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
  if (store.isLoading || store.subjects.length === 0) {
    store.initialize();
  }

  const today = getTodayDateString();
  const todaySessions: Session[] = store.getSessionsForDate(today);

  // Pick an unmarked session from today if one exists, otherwise first session or first subject
  const todaySession = todaySessions.find((s: Session) => s.status === null) || todaySessions[0];
  const sampleSubject =
    (todaySession && store.subjects.find((s: Subject) => s.id === todaySession.subjectId)) ||
    store.subjects[0] || {
      id: 'test-sub',
      name: variant === 'safe' ? 'Physics · PHY101' : 'Calculus · MAT102',
      code: variant === 'safe' ? 'PHY101' : 'MAT102',
    };
  const testTime = todaySession ? todaySession.startTime : '10:00';

  if (variant === 'daily') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Unmarked Classes Remaining',
        body: `You have 1 class left to mark today (${sampleSubject.name}). Tap to log your attendance.`,
        sound: true,
        color: '#1E9BFF',
        categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_REMINDER,
        data: {
          type: 'UNMARKED_CHECK',
          date: today,
        },
      },
      trigger: {
        channelId: NOTIFICATION_CHANNELS.DAILY_CHECK,
      },
    });
    toast.info('Test unmarked class alert sent!');
    return;
  }

  const isSafe = variant === 'safe';
  const title = `${sampleSubject.name} · ${formatTime12h(testTime)}`;
  const body = isSafe
    ? 'Can miss 4 classes · 82% attendance'
    : 'Must attend next 2 classes · Currently 74%';

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      color: '#1E9BFF',
      categoryIdentifier: NOTIFICATION_CATEGORIES.CLASS_REMINDER,
      data: {
        type: 'CLASS_REMINDER',
        sessionId: todaySession ? todaySession.id : undefined,
        subjectId: sampleSubject.id,
        subjectName: sampleSubject.name,
        slotId: todaySession ? todaySession.slotId || undefined : undefined,
        startTime: testTime,
        date: today,
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
