import type { Subject, SubjectStats } from '../types/index.ts';

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
