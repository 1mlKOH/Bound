import type { Subject, SubjectStats, ScheduleSlot, Session, Holiday } from '../types/index.ts';
import { isSlotEffectiveOnDate, isSubjectActiveOnDate, formatTime12h } from './attendance.ts';

/**
 * Generates clean, intelligent copy for class reminder notifications (Option 3: zero emojis/symbols).
 */
export function generateClassReminderCopy(
  subject: Subject,
  stats: SubjectStats,
  startTime: string,
  _offsetMin?: number
): { title: string; body: string } {
  const formattedTime = formatTime12h(startTime) || startTime;
  const title = `${subject.name} · ${formattedTime}`;

  if (stats.totalHeld === 0) {
    return {
      title,
      body: `First class today · Target is ${stats.effectiveTarget}%`,
    };
  }

  if (stats.isBelow) {
    const classWord = stats.mustAttend === 1 ? 'class' : 'classes';
    return {
      title,
      body: `Must attend next ${stats.mustAttend} ${classWord} · Currently ${stats.percentage}%`,
    };
  }

  if (stats.isClose || stats.canMiss === 0) {
    return {
      title,
      body: `Cannot miss today · Currently at ${stats.effectiveTarget}% target`,
    };
  }

  // Safe status
  const classWord = stats.canMiss === 1 ? 'class' : 'classes';
  return {
    title,
    body: `Can miss ${stats.canMiss} ${classWord} · ${stats.percentage}% attendance`,
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

/**
 * Checks whether a given YYYY-MM-DD date is registered as a holiday.
 */
export function isDateHoliday(
  dateStr: string,
  holidays: Holiday[] | Set<string>
): boolean {
  if (holidays instanceof Set) {
    return holidays.has(dateStr);
  }
  return holidays.some((h) => h.date === dateStr);
}

export interface ClassReminderCandidate {
  date: string;
  slotId: string | null;
  sessionId?: string;
  isExtra: boolean;
  subject: Subject;
  startTime: string;
  endTime?: string;
  weekday: number;
  triggerTimeMs: number;
}

/**
 * Identifies upcoming scheduled classes and extra classes across a rolling window
 * (e.g. 7 days ahead) that are eligible for reminder notifications.
 *
 * Excludes:
 * - Dates marked as holidays (no notifications on holidays!)
 * - Sessions already marked with an attendance status (present, absent, cancelled)
 * - Inactive / archived subjects or slots outside effective dates
 * - Times that have already elapsed
 */
export function getClassReminderCandidates(
  referenceDate: Date,
  daysAheadCount: number,
  offsetMinutes: number,
  slots: ScheduleSlot[],
  subjectsMap: Map<string, Subject>,
  sessions: Session[],
  holidaysSet: Set<string>
): ClassReminderCandidate[] {
  const candidates: ClassReminderCandidate[] = [];
  const refMs = referenceDate.getTime();

  for (let daysAhead = 0; daysAhead < daysAheadCount; daysAhead++) {
    const targetDate = new Date(refMs);
    targetDate.setDate(targetDate.getDate() + daysAhead);

    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayOfWeek = targetDate.getDay();

    // Crucial: Skip the entire day if it is marked as a holiday
    if (holidaysSet.has(dateStr)) {
      continue;
    }

    // 1. Regular timetable slots for this day of week
    for (const slot of slots) {
      if (slot.weekday !== dayOfWeek) continue;

      const subject = subjectsMap.get(slot.subjectId);
      if (!subject || subject.archivedAt) continue;

      if (!isSlotEffectiveOnDate(slot, dateStr)) continue;
      if (!isSubjectActiveOnDate(subject, dateStr)) continue;

      // If attendance has already been logged for this slot on this date, skip
      const existingSession = sessions.find(
        (s) => s.slotId === slot.id && s.date === dateStr
      );
      if (existingSession && existingSession.status !== null) continue;

      const [startH, startM] = slot.startTime.split(':').map(Number);
      if (isNaN(startH) || isNaN(startM)) continue;

      const classStartTime = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        startH,
        startM,
        0,
        0
      );
      const triggerTimeMs = classStartTime.getTime() - offsetMinutes * 60 * 1000;

      // Skip if the reminder trigger time has already elapsed
      if (triggerTimeMs <= refMs) continue;

      candidates.push({
        date: dateStr,
        slotId: slot.id,
        isExtra: false,
        subject,
        startTime: slot.startTime,
        endTime: slot.endTime,
        weekday: slot.weekday,
        triggerTimeMs,
      });
    }

    // 2. Extra classes (slotId === null) scheduled for this date
    const dayExtraSessions = sessions.filter(
      (s) => s.slotId === null && s.date === dateStr && s.status === null
    );

    for (const extra of dayExtraSessions) {
      const subject = subjectsMap.get(extra.subjectId);
      if (!subject || subject.archivedAt) continue;

      const [startH, startM] = extra.startTime.split(':').map(Number);
      if (isNaN(startH) || isNaN(startM)) continue;

      const classStartTime = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        startH,
        startM,
        0,
        0
      );
      let triggerTimeMs = classStartTime.getTime() - offsetMinutes * 60 * 1000;

      if (triggerTimeMs <= refMs) {
        // If class starts soon (within offsetMinutes) but hasn't started yet
        if (classStartTime.getTime() > refMs) {
          triggerTimeMs = refMs + 2000;
        } else {
          continue; // Already started or in the past
        }
      }

      candidates.push({
        date: dateStr,
        slotId: null,
        sessionId: extra.id,
        isExtra: true,
        subject,
        startTime: extra.startTime,
        endTime: extra.endTime,
        weekday: dayOfWeek,
        triggerTimeMs,
      });
    }
  }

  // Sort candidates chronologically
  candidates.sort((a, b) => a.triggerTimeMs - b.triggerTimeMs);

  return candidates;
}
