export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | null;

export type ThemePreference = 'system' | 'light' | 'dark';

export type CardLabelPreference = 'name' | 'code';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  targetPct: number | null; // null uses global target
  baselinePresent: number;
  baselineAbsent: number;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  archivedAt: string | null;
  createdAt: string;
}

export interface ScheduleSlot {
  id: string;
  subjectId: string;
  weekday: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo: string | null; // YYYY-MM-DD
}

export interface Session {
  id: string;
  subjectId: string;
  slotId: string | null; // null for extra classes
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AttendanceStatus;
  markedAt: string | null;
}

export interface Holiday {
  date: string; // YYYY-MM-DD (PK)
  label: string;
}

export interface Settings {
  id: number;
  globalTargetPct: number;
  theme: ThemePreference;
  primaryCardLabel: CardLabelPreference;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:mm
  perClassReminderEnabled: boolean;
  perClassReminderOffsetMinutes: number; // 5 or 15
  sundayDigestEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  hasSeededDemo: boolean;
  hasOnboarded: boolean;
}

export interface SubjectStats {
  subject: Subject;
  attended: number;
  absent: number;
  totalHeld: number;
  percentage: number; // 0 to 100
  effectiveTarget: number;
  isSafe: boolean;
  isClose: boolean; // target <= pct < target + 5
  isBelow: boolean; // pct < target
  canMiss: number; // buffer when percentage >= target
  mustAttend: number; // recovery required when percentage < target
  statusLabel: string; // "Can miss N" | "Can miss 0" | "Attend next N"
}

export interface PooledStats {
  totalAttended: number;
  totalAbsent: number;
  totalHeld: number;
  pooledPercentage: number;
  globalTarget: number;
  subjectsBelowTarget: number;
  statusTier: 'safe' | 'warning' | 'danger' | 'neutral'; // safe (>= target + 5), warning (target..target+5), danger (< target), neutral (no classes held)
}
