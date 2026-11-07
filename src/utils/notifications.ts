import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Settings, ScheduleSlot, Subject } from '../types';

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
 * Reschedules all local notifications according to user settings and active schedule slots.
 */
export async function syncScheduledNotifications(
  settings: Settings,
  subjects: Subject[],
  slots: ScheduleSlot[]
): Promise<void> {
  try {
    // 1. Cancel all previously scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. Schedule Daily Evening Alert if enabled
    if (settings.dailyReminderEnabled) {
      const [hourStr, minuteStr] = settings.dailyReminderTime.split(':');
      const hour = parseInt(hourStr, 10) || 18;
      const minute = parseInt(minuteStr, 10) || 0;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Attendance Check',
          body: "Don't forget to mark your class attendance for today!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        },
      });
    }

    // 3. Schedule Weekly Sunday Digest if enabled
    if (settings.sundayDigestEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weekly Attendance Digest',
          body: 'Review your attendance targets and plan your upcoming week!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: 1, // Sunday in standard iOS/Android triggers (1 = Sunday)
          hour: 19,
          minute: 0,
          repeats: true,
        },
      });
    }

    // 4. Schedule Per-Class Quick-Mark Reminders if enabled
    if (settings.perClassReminderEnabled) {
      const activeSubjectsMap = new Map(
        subjects.filter((s) => !s.archivedAt).map((s) => [s.id, s])
      );
      const offsetMin = settings.perClassReminderOffsetMinutes || 5;

      for (const slot of slots) {
        const subject = activeSubjectsMap.get(slot.subjectId);
        if (!subject) continue;

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
            title: `${subject.name} starting soon`,
            body: `Class starts at ${slot.startTime}. Tap to log your attendance.`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
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
