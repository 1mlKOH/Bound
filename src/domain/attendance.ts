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

  const attended = subject.baselinePresent + presentCount;
  const absent = subject.baselineAbsent + absentCount;
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
  const rawPercentage = totalHeld === 0 ? 100 : (totalAttended / totalHeld) * 100;
  const pooledPercentage = Math.round(rawPercentage * 10) / 10;

  let statusTier: 'safe' | 'warning' | 'danger' = 'safe';
  if (pooledPercentage < globalTarget) {
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
