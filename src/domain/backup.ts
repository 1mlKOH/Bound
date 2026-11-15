export interface BackupPayload {
  version: number;
  exportedAt?: string;
  subjects: Array<{
    id: string;
    name: string;
    code?: string;
    color?: string;
    targetPct?: number | null;
    baselinePresent?: number;
    baselineAbsent?: number;
    startDate: string;
    endDate?: string | null;
    archivedAt?: string | null;
    createdAt?: string;
  }>;
  scheduleSlots?: Array<{
    id: string;
    subjectId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
  }>;
  sessions?: Array<{
    id: string;
    subjectId: string;
    slotId?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    status?: string | null;
    markedAt?: string | null;
  }>;
  holidays?: Array<{
    date: string;
    label?: string;
  }>;
  settings?: Record<string, any>;
}

/**
 * Validates a backup JSON payload prior to executing any database writes or deletes.
 * Returns true if the payload has valid schema structure; false otherwise.
 */
export function validateBackupPayload(payload: unknown): payload is BackupPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const p = payload as Record<string, any>;

  // Check version
  if (typeof p.version !== 'number' || p.version < 1) {
    return false;
  }

  // Check subjects array
  if (!Array.isArray(p.subjects)) {
    return false;
  }

  for (const sub of p.subjects) {
    if (
      !sub ||
      typeof sub !== 'object' ||
      typeof sub.id !== 'string' ||
      !sub.id.trim() ||
      typeof sub.name !== 'string' ||
      !sub.name.trim() ||
      typeof sub.startDate !== 'string' ||
      !sub.startDate.trim()
    ) {
      return false;
    }
  }

  // Validate optional scheduleSlots
  if (p.scheduleSlots !== undefined) {
    if (!Array.isArray(p.scheduleSlots)) return false;
    for (const slot of p.scheduleSlots) {
      if (
        !slot ||
        typeof slot !== 'object' ||
        typeof slot.id !== 'string' ||
        typeof slot.subjectId !== 'string' ||
        typeof slot.weekday !== 'number' ||
        typeof slot.startTime !== 'string' ||
        typeof slot.endTime !== 'string'
      ) {
        return false;
      }
    }
  }

  // Validate optional sessions
  if (p.sessions !== undefined) {
    if (!Array.isArray(p.sessions)) return false;
    for (const ses of p.sessions) {
      if (
        !ses ||
        typeof ses !== 'object' ||
        typeof ses.id !== 'string' ||
        typeof ses.subjectId !== 'string' ||
        typeof ses.date !== 'string' ||
        typeof ses.startTime !== 'string' ||
        typeof ses.endTime !== 'string'
      ) {
        return false;
      }
    }
  }

  // Validate optional holidays
  if (p.holidays !== undefined) {
    if (!Array.isArray(p.holidays)) return false;
    for (const h of p.holidays) {
      if (!h || typeof h !== 'object' || typeof h.date !== 'string') {
        return false;
      }
    }
  }

  // Validate optional settings
  if (p.settings !== undefined && (typeof p.settings !== 'object' || p.settings === null)) {
    return false;
  }

  return true;
}
