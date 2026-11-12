import type { Subject, SubjectStats, ScheduleSlot, Session } from '../types/index.ts';
import { isSlotEffectiveOnDate, isSubjectActiveOnDate } from './attendance.ts';

/**
 * Generates clean, intelligent copy for class reminder notifications (Option 3: zero emojis/symbols).
 */
export function generateClassReminderCopy(
  subject: Subject,
  stats: SubjectStats,
  startTime: string,
  offsetMin: number
): { title: string; body: string } {
  const timeLabel = offsetMin > 0 ? `starts in ${offsetMin}m` : `starts at ${startTime}`;

  if (stats.isBelow) {
    const classWord = stats.mustAttend === 1 ? 'class' : 'classes';
    return {
      title: `${subject.name} ${timeLabel} (${stats.percentage}%)`,
      body: `Cutoff is ${stats.effectiveTarget}%. Need next ${stats.mustAttend} ${classWord} to recover. Attendance required today.`,
    };
  }

  if (stats.isClose) {
    return {
      title: `${subject.name} ${timeLabel} (${stats.percentage}%)`,
      body: `Near your ${stats.effectiveTarget}% target cutoff. Missing today will drop you below target.`,
    };
  }

  // Safe status
  if (stats.canMiss > 0) {
    const skipWord = stats.canMiss === 1 ? 'skip' : 'skips';
    return {
      title: `${subject.name} ${timeLabel}`,
      body: `Safe buffer: +${stats.canMiss} ${skipWord} available (${stats.percentage}%). Class starts at ${startTime}.`,
    };
  }

  return {
    title: `${subject.name} ${timeLabel} (${stats.percentage}%)`,
    body: `Currently on target (${stats.effectiveTarget}%). Class starts at ${startTime}.`,
  };
}

/**
 * Generates clean copy for the end-of-day catch-up reminder when classes are left unmarked.
 */
export function generateUnmarkedCatchupCopy(
  unmarkedCount: number,
  sampleSubjectName?: string
): { title: string; body: string } {
  if (unmarkedCount <= 1) {
    const subjectLabel = sampleSubjectName ? ` (${sampleSubjectName})` : '';
    return {
      title: 'Unmarked Class Remaining',
      body: `You have 1 class left to mark today${subjectLabel}. Tap to log your attendance.`,
    };
  }

  return {
    title: 'Unmarked Classes Remaining',
    body: `You have ${unmarkedCount} classes left to mark today. Tap to log your attendance.`,
  };
}

/**
 * Counts how many scheduled or existing classes are unmarked (status === null) for a specific date.
 * Returns 0 if it is a holiday or if all classes for the date are marked.
 */
export function getUnmarkedCountForDate(
  dateStr: string,
  dayOfWeek: number,
  slots: ScheduleSlot[],
  subjectsMap: Map<string, Subject>,
  sessions: Session[],
  holidaysSet: Set<string>
): { count: number; sampleSubjectName?: string } {
  if (holidaysSet.has(dateStr)) {
    return { count: 0 };
  }

  // 1. Existing sessions recorded for this date
  const daySessions = sessions.filter((s) => s.date === dateStr);
  const recordedSessionMap = new Map<string, Session>();
  for (const s of daySessions) {
    if (s.slotId) {
      recordedSessionMap.set(s.slotId, s);
    }
  }

  // 2. Active slots applicable for this day
  const activeSlots = slots.filter((slot) => {
    const sub = subjectsMap.get(slot.subjectId);
    if (!sub) return false;
    return (
      slot.weekday === dayOfWeek &&
      isSlotEffectiveOnDate(slot, dateStr) &&
      isSubjectActiveOnDate(sub, dateStr)
    );
  });

  if (activeSlots.length === 0 && daySessions.length === 0) {
    return { count: 0 };
  }

  let unmarkedCount = 0;
  let firstUnmarkedSubjectName: string | undefined;

  // Check active slots for this day
  for (const slot of activeSlots) {
    const existing = recordedSessionMap.get(slot.id);
    if (existing) {
      if (existing.status === null) {
        unmarkedCount++;
        if (!firstUnmarkedSubjectName) {
          firstUnmarkedSubjectName = subjectsMap.get(slot.subjectId)?.name;
        }
      }
    } else {
      // Slot exists today but hasn't been marked yet
      unmarkedCount++;
      if (!firstUnmarkedSubjectName) {
        firstUnmarkedSubjectName = subjectsMap.get(slot.subjectId)?.name;
      }
    }
  }

  // Check any extra classes (slotId === null) for this day
  for (const s of daySessions) {
    if (s.slotId === null && s.status === null) {
      unmarkedCount++;
      if (!firstUnmarkedSubjectName) {
        firstUnmarkedSubjectName = subjectsMap.get(s.subjectId)?.name;
      }
    }
  }

  return {
    count: unmarkedCount,
    sampleSubjectName: firstUnmarkedSubjectName,
  };
}
