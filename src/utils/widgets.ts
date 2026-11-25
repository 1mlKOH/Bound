import {
  updateWidgetSnapshot as nativeUpdateSnapshot,
  setWidgetProStatus as nativeSetProStatus,
  getWidgetProStatus as nativeGetProStatus,
  requestWidgetUpdate as nativeRequestUpdate,
  pinSubjectWidget as nativePinSubjectWidget,
} from '../../modules/bound-widgets/index.ts';
import type {
  BoundWidgetSnapshot,
  BoundWidgetSessionItem,
  BoundWidgetSubjectItem,
} from '../../modules/bound-widgets/index.ts';
import type { Subject, Session, Holiday, Settings, SubjectStats } from '../types/index.ts';
import {
  computeSubjectStats,
  computePooledStats,
  getTodayDateString,
  formatTime12h,
} from '../domain/attendance.ts';

/**
 * Builds a pre-computed snapshot payload from Bound's relational state for Android Glance widgets.
 */
export function buildWidgetSnapshot(
  subjects: Subject[],
  sessions: Session[],
  holidays: Holiday[],
  settings: Settings,
  isProUser: boolean = true
): BoundWidgetSnapshot {
  const todayStr = getTodayDateString();
  const holidaysSet = new Set(holidays.map((h) => h.date));
  const todayHoliday = holidays.find((h) => h.date === todayStr);

  const subjectStatsMap = new Map<string, SubjectStats>();
  const activeSubjects = subjects.filter((s) => !s.archivedAt);
  const subjectMap = new Map<string, Subject>();
  const subjectItems: BoundWidgetSubjectItem[] = [];

  for (const sub of activeSubjects) {
    subjectMap.set(sub.id, sub);
    const stats = computeSubjectStats(sub, sessions, holidaysSet, settings.globalTargetPct);
    subjectStatsMap.set(sub.id, stats);

    let tier: BoundWidgetSubjectItem['tier'] = 'safe';
    if (stats.totalHeld === 0) {
      tier = 'neutral';
    } else if (stats.isBelow) {
      tier = 'danger';
    } else if (stats.isClose) {
      tier = 'warning';
    }

    subjectItems.push({
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code || sub.name,
      subjectColor: sub.color || '#3DDC84',
      attended: stats.attended,
      absent: stats.absent,
      totalHeld: stats.totalHeld,
      percentage: stats.percentage,
      effectiveTarget: stats.effectiveTarget,
      tier,
      statusLabel: stats.statusLabel,
    });
  }

  const pooled = computePooledStats(
    Array.from(subjectStatsMap.values()),
    settings.globalTargetPct
  );

  // Filter today's sessions, sorted chronologically by startTime
  const todaySessions = sessions
    .filter((s) => s.date === todayStr)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const unmarkedCount = todaySessions.filter((s) => s.status === null).length;

  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

  const sessionItems: BoundWidgetSessionItem[] = [];

  for (const session of todaySessions) {
    const sub = subjectMap.get(session.subjectId);
    if (!sub) continue;

    const stats = subjectStatsMap.get(session.subjectId);
    const pct = stats?.percentage ?? 0;

    let statusColor = '#3DDC84'; // Safe
    if (stats?.isBelow) {
      statusColor = '#FF6B72'; // Danger
    } else if (stats?.isClose) {
      statusColor = '#FFB020'; // Warning
    }

    sessionItems.push({
      sessionId: session.id,
      subjectId: session.subjectId,
      subjectName: sub.name,
      subjectCode: sub.code || sub.name,
      subjectColor: sub.color || '#3DDC84',
      startTime: formatTime12h(session.startTime),
      endTime: formatTime12h(session.endTime),
      status: session.status,
      percentage: pct,
      statusColor,
      statusLabel: stats?.statusLabel || 'Can miss 0',
    });
  }

  return {
    isPro: isProUser,
    date: todayStr,
    formattedDate,
    unmarkedCount,
    totalSessions: todaySessions.length,
    isHoliday: Boolean(todayHoliday),
    holidayLabel: todayHoliday?.label || null,
    overallPercentage: pooled.pooledPercentage,
    overallStatus:
      pooled.statusTier === 'danger'
        ? 'below'
        : pooled.statusTier === 'warning'
        ? 'close'
        : 'safe',
    targetPercentage: settings.globalTargetPct,
    sessions: sessionItems,
    subjects: subjectItems,
  };
}

/**
 * Synchronizes Bound's relational attendance state to the native Android Glance widgets.
 */
export function syncWidgetSnapshot(
  subjects: Subject[],
  sessions: Session[],
  holidays: Holiday[],
  settings: Settings,
  isProUser: boolean = true
): boolean {
  try {
    const snapshot = buildWidgetSnapshot(subjects, sessions, holidays, settings, isProUser);
    return nativeUpdateSnapshot(snapshot);
  } catch (err) {
    console.warn('[Widgets] Failed to sync snapshot:', err);
    return false;
  }
}

export {
  nativeUpdateSnapshot as updateWidgetSnapshot,
  nativeSetProStatus as setWidgetProStatus,
  nativeGetProStatus as getWidgetProStatus,
  nativeRequestUpdate as requestWidgetUpdate,
  nativePinSubjectWidget as pinSubjectWidget,
};
