import type { Subject, ScheduleSlot, Session, SubjectStats, PooledStats } from '../types/index.ts';

/**
 * Calculates attendance statistics for a single subject.
 */
export function computeSubjectStats(
  subject: Subject,
  sessions: Session[],
  holidaysSet: Set<string>,
  globalTarget: number
): SubjectStats {
  const effectiveTarget = subject.targetPct ?? globalTarget;

  // Filter sessions for this subject, excluding holidays
  const subjectSessions = sessions.filter(
    (s) => s.subjectId === subject.id && !holidaysSet.has(s.date)
  );

  let presentCount = 0;
  let absentCount = 0;

  for (const s of subjectSessions) {
    if (s.status === 'present') {
      presentCount++;
    } else if (s.status === 'absent') {
      absentCount++;
    }
    // 'cancelled' and null are intentionally ignored in held counts
  }

  const attended = Math.max(0, (subject.baselinePresent || 0) + presentCount);
  const absent = Math.max(0, (subject.baselineAbsent || 0) + absentCount);
  const totalHeld = attended + absent;

  const percentage = totalHeld === 0 ? 100 : (attended / totalHeld) * 100;
  const roundedPct = Math.round(percentage * 10) / 10;

  const targetFraction = effectiveTarget / 100;
  let canMiss = 0;
  let mustAttend = 0;
  let statusLabel = 'Can miss 0';

  if (roundedPct >= effectiveTarget) {
    if (targetFraction <= 0) {
      canMiss = 999;
    } else {
      canMiss = Math.max(0, Math.floor(attended / targetFraction) - totalHeld);
    }
    statusLabel = canMiss > 0 ? `Can miss ${canMiss}` : 'Can miss 0';
  } else {
    if (targetFraction >= 1) {
      mustAttend = 999;
    } else {
      const needed = (targetFraction * totalHeld - attended) / (1 - targetFraction);
      mustAttend = Math.max(1, Math.ceil(needed));
    }
    statusLabel = `Attend next ${mustAttend}`;
  }

  const isBelow = roundedPct < effectiveTarget;
  const isClose = roundedPct >= effectiveTarget && roundedPct < effectiveTarget + 5;
  const isSafe = roundedPct >= effectiveTarget + 5;

  return {
    subject,
    attended,
    absent,
    totalHeld,
    percentage: roundedPct,
    effectiveTarget,
    isSafe,
    isClose,
    isBelow,
    canMiss,
    mustAttend,
    statusLabel,
  };
}

/**
 * Calculates pooled attendance across all active subjects.
 */
export function computePooledStats(
  subjectStatsList: SubjectStats[],
  globalTarget: number
): PooledStats {
  let totalAttended = 0;
  let totalAbsent = 0;
  let subjectsBelowTarget = 0;

  for (const stats of subjectStatsList) {
    if (!stats.subject.archivedAt) {
      totalAttended += stats.attended;
      totalAbsent += stats.absent;
      if (stats.isBelow) {
        subjectsBelowTarget++;
      }
    }
  }

  const totalHeld = totalAttended + totalAbsent;
  const rawPercentage = totalHeld === 0 ? 0 : (totalAttended / totalHeld) * 100;
  const pooledPercentage = Math.round(rawPercentage * 10) / 10;

  let statusTier: 'safe' | 'warning' | 'danger' | 'neutral' = 'safe';
  if (totalHeld === 0) {
    statusTier = 'neutral';
  } else if (pooledPercentage < globalTarget) {
    statusTier = 'danger';
  } else if (pooledPercentage < globalTarget + 5) {
    statusTier = 'warning';
  }

  return {
    totalAttended,
    totalAbsent,
    totalHeld,
    pooledPercentage,
    globalTarget,
    subjectsBelowTarget,
    statusTier,
  };
}

/**
 * Checks if a slot was effective on a given date.
 */
export function isSlotEffectiveOnDate(slot: ScheduleSlot, dateStr: string): boolean {
  if (slot.effectiveFrom > dateStr) return false;
  if (slot.effectiveTo && slot.effectiveTo < dateStr) return false;
  return true;
}

/**
 * Checks if a subject was active on a given date.
 */
export function isSubjectActiveOnDate(subject: Subject, dateStr: string): boolean {
  if (subject.startDate > dateStr) return false;
  if (subject.endDate && subject.endDate < dateStr) return false;
  if (subject.archivedAt && subject.archivedAt.slice(0, 10) <= dateStr) return false;
  return true;
}

/**
 * Detects time overlaps between two time ranges (HH:mm)
 */
export function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Simple deterministic UUID v4 generator for React Native / offline
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns Monday (YYYY-MM-DD) of the week containing dateStr (ISO-8601 Monday-start)
 */
export function getMondayOfDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(y, m - 1, d + diff));
  return monday.toISOString().slice(0, 10);
}

/**
 * Returns array of 7 consecutive dates (YYYY-MM-DD) from Monday to Sunday
 */
export function getWeekDates(mondayStr: string): string[] {
  const [y, m, d] = mondayStr.split('-').map(Number);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    dates.push(dt.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * Formats YYYY-MM-DD as "Tue, Nov 3, 2026"
 */
export function formatCardDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${days[date.getUTCDay()]}, ${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

