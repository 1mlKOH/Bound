import { create } from 'zustand';
import { Haptics } from '../utils/haptics';
import {
  Subject,
  ScheduleSlot,
  Session,
  Holiday,
  Settings,
  AttendanceStatus,
  SubjectStats,
  PooledStats,
} from '../types';
import { expoDb, initDatabase } from '../db/client';
import { seedDemoData } from '../db/seed';
import {
  computeSubjectStats,
  computePooledStats,
  generateUUID,
  isSlotEffectiveOnDate,
  isSubjectActiveOnDate,
  getTodayDateString,
} from '../domain/attendance';
import { syncScheduledNotifications } from '../utils/notifications';

let notificationSyncTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSyncNotifications = (
  settings: Settings,
  subjects: Subject[],
  scheduleSlots: ScheduleSlot[],
  sessions: Session[],
  holidays: Holiday[]
) => {
  if (notificationSyncTimer) {
    clearTimeout(notificationSyncTimer);
  }
  notificationSyncTimer = setTimeout(() => {
    syncScheduledNotifications(settings, subjects, scheduleSlots, sessions, holidays);
    notificationSyncTimer = null;
  }, 400);
};

interface AttendanceStoreState {
  subjects: Subject[];
  scheduleSlots: ScheduleSlot[];
  sessions: Session[];
  holidays: Holiday[];
  settings: Settings;
  selectedDate: string;
  statsFilter: 'month' | 'week';
  isLoading: boolean;

  // Actions
  initialize: () => void;
  resetToToday: () => void;
  setSelectedDate: (date: string) => void;
  setStatsFilter: (filter: 'month' | 'week') => void;
  markSession: (sessionId: string, status: AttendanceStatus) => void;
  batchMarkDay: (dateStr: string) => number;
  toggleHoliday: (dateStr: string, label?: string) => void;
  addExtraClass: (
    subjectId: string,
    dateStr: string,
    startTime: string,
    endTime: string
  ) => void;
  saveSubject: (
    subjectData: {
      id?: string;
      name: string;
      code: string;
      color: string;
      targetPct: number | null;
      baselinePresent: number;
      baselineAbsent: number;
      startDate: string;
      endDate: string | null;
    },
    slots: {
      weekday: number;
      startTime: string;
      endTime: string;
    }[]
  ) => void;
  archiveSubject: (id: string) => void;
  deleteSubject: (id: string) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  completeOnboarding: (options: {
    targetPct: number;
    loadSampleData: boolean;
    enableReminders: boolean;
    sundayDigestEnabled?: boolean;
  }) => Promise<void>;
  resetOnboarding: () => void;
  restoreFromBackup: (payload: any) => boolean;
  resetToDemo: () => void;
  clearAllData: () => void;

  // Getters
  getAllSubjectStats: () => SubjectStats[];
  getPooledStats: () => PooledStats;
  getSessionsForDate: (dateStr: string) => Session[];
  isDateHoliday: (dateStr: string) => boolean;
}

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  globalTargetPct: 75,
  theme: 'system',
  primaryCardLabel: 'name',
  dailyReminderEnabled: false,
  dailyReminderTime: '18:00',
  perClassReminderEnabled: true,
  perClassReminderOffsetMinutes: 5,
  sundayDigestEnabled: true,
  hapticFeedbackEnabled: true,
  hasSeededDemo: false,
  hasOnboarded: false,
};

// Default reference date is dynamic real-time today
const DEFAULT_DATE = getTodayDateString();

export const useAttendanceStore = create<AttendanceStoreState>((set, get) => ({
  subjects: [],
  scheduleSlots: [],
  sessions: [],
  holidays: [],
  settings: DEFAULT_SETTINGS,
  selectedDate: DEFAULT_DATE,
  statsFilter: 'week',
  isLoading: true,

  initialize: () => {
    try {
      initDatabase();

      // Read settings
      const settingsRows = expoDb.getAllSync<any>('SELECT * FROM settings WHERE id = 1');
      let currentSettings = DEFAULT_SETTINGS;
      if (settingsRows.length > 0) {
        const s = settingsRows[0];
        currentSettings = {
          id: s.id,
          globalTargetPct: s.global_target_pct,
          theme: s.theme,
          primaryCardLabel: s.primary_card_label,
          dailyReminderEnabled: Boolean(s.daily_reminder_enabled),
          dailyReminderTime: s.daily_reminder_time,
          perClassReminderEnabled: Boolean(s.per_class_reminder_enabled),
          perClassReminderOffsetMinutes: s.per_class_reminder_offset_minutes,
          sundayDigestEnabled: Boolean(s.sunday_digest_enabled),
          hapticFeedbackEnabled: s.haptic_feedback_enabled !== undefined ? Boolean(s.haptic_feedback_enabled) : true,
          hasSeededDemo: Boolean(s.has_seeded_demo),
          hasOnboarded: Boolean(s.has_onboarded),
        };
      }

      // Load all tables into memory
      const subjectsRaw = expoDb.getAllSync<any>(
        'SELECT * FROM subjects ORDER BY created_at ASC'
      );
      const subjects: Subject[] = subjectsRaw.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        color: r.color,
        targetPct: r.target_pct,
        baselinePresent: r.baseline_present,
        baselineAbsent: r.baseline_absent,
        startDate: r.start_date,
        endDate: r.end_date,
        archivedAt: r.archived_at,
        createdAt: r.created_at,
      }));

      const slotsRaw = expoDb.getAllSync<any>('SELECT * FROM schedule_slots');
      const scheduleSlots: ScheduleSlot[] = slotsRaw.map((r) => ({
        id: r.id,
        subjectId: r.subject_id,
        weekday: r.weekday,
        startTime: r.start_time,
        endTime: r.end_time,
        effectiveFrom: r.effective_from,
        effectiveTo: r.effective_to,
      }));

      const sessionsRaw = expoDb.getAllSync<any>(
        'SELECT * FROM sessions ORDER BY start_time ASC'
      );
      const sessions: Session[] = sessionsRaw.map((r) => ({
        id: r.id,
        subjectId: r.subject_id,
        slotId: r.slot_id,
        date: r.date,
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status as AttendanceStatus,
        markedAt: r.marked_at,
      }));

      const holidaysRaw = expoDb.getAllSync<any>('SELECT * FROM holidays');
      const holidays: Holiday[] = holidaysRaw.map((r) => ({
        date: r.date,
        label: r.label,
      }));

      const today = getTodayDateString();
      set({
        subjects,
        scheduleSlots,
        sessions,
        holidays,
        settings: currentSettings,
        selectedDate: today,
        isLoading: false,
      });

      // Ensure sessions for today are generated
      get().getSessionsForDate(today);

      // Reschedule reminders
      syncScheduledNotifications(currentSettings, subjects, scheduleSlots, sessions, holidays);
    } catch (e) {
      console.error('Failed to initialize database:', e);
      set({ isLoading: false });
    }
  },

  resetToToday: () => {
    const today = getTodayDateString();
    set({ selectedDate: today });
    get().getSessionsForDate(today);
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    // Trigger session generation if needed
    get().getSessionsForDate(date);
  },

  setStatsFilter: (filter: 'month' | 'week') => {
    set({ statsFilter: filter });
  },

  markSession: (sessionId: string, newStatus: AttendanceStatus) => {
    const { sessions } = get();
    const existing = sessions.find((s) => s.id === sessionId);
    if (!existing) return;

    // Toggle back to null if tapped again
    const finalStatus: AttendanceStatus =
      existing.status === newStatus ? null : newStatus;
    const markedAt = finalStatus ? new Date().toISOString() : null;

    // Optimistic update
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, status: finalStatus, markedAt } : s
    );
    set({ sessions: updatedSessions });

    // Haptics feedback
    try {
      if (finalStatus === 'present') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (finalStatus === 'absent') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.selectionAsync();
      }
    } catch {
      // Haptics safe fallback
    }

    // Persist to SQLite
    expoDb.runSync(
      'UPDATE sessions SET status = ?, marked_at = ? WHERE id = ?',
      [finalStatus, markedAt, sessionId]
    );

    // Reschedule notifications to reflect updated attendance calculations
    debouncedSyncNotifications(
      get().settings,
      get().subjects,
      get().scheduleSlots,
      updatedSessions,
      get().holidays
    );
  },

  batchMarkDay: (dateStr: string): number => {
    const daySessions = get().getSessionsForDate(dateStr);
    const now = new Date().toISOString();
    const { sessions } = get();

    const idsToUpdate: string[] = [];
    const updatedSessions = sessions.map((s) => {
      if (s.date === dateStr && s.status === null) {
        idsToUpdate.push(s.id);
        return { ...s, status: 'present' as AttendanceStatus, markedAt: now };
      }
      return s;
    });

    if (idsToUpdate.length === 0) return 0;

    set({ sessions: updatedSessions });
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Persist
    for (const id of idsToUpdate) {
      expoDb.runSync(
        'UPDATE sessions SET status = "present", marked_at = ? WHERE id = ?',
        [now, id]
      );
    }

    // Reschedule notifications to reflect updated attendance calculations
    debouncedSyncNotifications(
      get().settings,
      get().subjects,
      get().scheduleSlots,
      updatedSessions,
      get().holidays
    );

    return idsToUpdate.length;
  },

  toggleHoliday: (dateStr: string, label: string = 'Holiday') => {
    const { holidays } = get();
    const exists = holidays.some((h) => h.date === dateStr);

    let updatedHolidays: Holiday[];
    if (exists) {
      updatedHolidays = holidays.filter((h) => h.date !== dateStr);
      set({ holidays: updatedHolidays });
      expoDb.runSync('DELETE FROM holidays WHERE date = ?', [dateStr]);
    } else {
      const newHoliday: Holiday = { date: dateStr, label };
      updatedHolidays = [...holidays, newHoliday];
      set({ holidays: updatedHolidays });
      expoDb.runSync('INSERT INTO holidays (date, label) VALUES (?, ?)', [
        dateStr,
        label,
      ]);
    }

    debouncedSyncNotifications(
      get().settings,
      get().subjects,
      get().scheduleSlots,
      get().sessions,
      updatedHolidays
    );
  },

  addExtraClass: (
    subjectId: string,
    dateStr: string,
    startTime: string,
    endTime: string
  ) => {
    const subjectExists = get().subjects.some(
      (s) => s.id === subjectId && !s.archivedAt
    );
    if (!subjectExists) {
      console.warn('Cannot add extra class: Subject does not exist or is archived:', subjectId);
      return;
    }

    const newSession: Session = {
      id: generateUUID(),
      subjectId,
      slotId: null,
      date: dateStr,
      startTime,
      endTime,
      status: null,
      markedAt: null,
    };

    const updatedSessions = [...get().sessions, newSession];
    set({ sessions: updatedSessions });

    try {
      expoDb.runSync(
        `INSERT INTO sessions (id, subject_id, slot_id, date, start_time, end_time, status, marked_at)
         VALUES (?, ?, NULL, ?, ?, ?, NULL, NULL)`,
        [newSession.id, subjectId, dateStr, startTime, endTime]
      );
    } catch (err) {
      console.error('Failed to insert extra class session into database:', err);
    }

    debouncedSyncNotifications(
      get().settings,
      get().subjects,
      get().scheduleSlots,
      updatedSessions,
      get().holidays
    );
  },

  saveSubject: (subjectData, slots) => {
    const isEdit = Boolean(subjectData.id);
    const subjectId = subjectData.id || generateUUID();
    const now = new Date().toISOString();
    const todayStr = get().selectedDate;

    if (isEdit) {
      // 1. Update Subject
      expoDb.runSync(
        `UPDATE subjects SET 
          name = ?, code = ?, color = ?, target_pct = ?, 
          baseline_present = ?, baseline_absent = ?, start_date = ?, end_date = ?
         WHERE id = ?`,
        [
          subjectData.name,
          subjectData.code,
          subjectData.color,
          subjectData.targetPct,
          subjectData.baselinePresent,
          subjectData.baselineAbsent,
          subjectData.startDate,
          subjectData.endDate,
          subjectId,
        ]
      );

      // 2. Non-destructive timetable versioning
      // Close all currently active slots for this subject effective yesterday
      const yesterday = new Date(todayStr);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      expoDb.runSync(
        `UPDATE schedule_slots 
         SET effective_to = ? 
         WHERE subject_id = ? AND (effective_to IS NULL OR effective_to >= ?)`,
        [yesterdayStr, subjectId, todayStr]
      );

      // Insert new slots with effectiveFrom = today
      for (const slot of slots) {
        const newSlotId = generateUUID();
        expoDb.runSync(
          `INSERT INTO schedule_slots (id, subject_id, weekday, start_time, end_time, effective_from, effective_to)
           VALUES (?, ?, ?, ?, ?, ?, NULL)`,
          [newSlotId, subjectId, slot.weekday, slot.startTime, slot.endTime, todayStr]
        );
      }
    } else {
      // Insert new Subject
      expoDb.runSync(
        `INSERT INTO subjects (id, name, code, color, target_pct, baseline_present, baseline_absent, start_date, end_date, archived_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
        [
          subjectId,
          subjectData.name,
          subjectData.code,
          subjectData.color,
          subjectData.targetPct,
          subjectData.baselinePresent,
          subjectData.baselineAbsent,
          subjectData.startDate,
          subjectData.endDate,
          now,
        ]
      );

      // Insert slots
      for (const slot of slots) {
        const slotId = generateUUID();
        expoDb.runSync(
          `INSERT INTO schedule_slots (id, subject_id, weekday, start_time, end_time, effective_from, effective_to)
           VALUES (?, ?, ?, ?, ?, ?, NULL)`,
          [slotId, subjectId, slot.weekday, slot.startTime, slot.endTime, subjectData.startDate]
        );
      }
    }

    // Refresh state
    get().initialize();
  },

  archiveSubject: (id: string) => {
    const now = new Date().toISOString();
    expoDb.runSync('UPDATE subjects SET archived_at = ? WHERE id = ?', [now, id]);
    const updatedSubjects = get().subjects.map((s) =>
      s.id === id ? { ...s, archivedAt: now } : s
    );
    set({ subjects: updatedSubjects });
    debouncedSyncNotifications(
      get().settings,
      updatedSubjects,
      get().scheduleSlots,
      get().sessions,
      get().holidays
    );
  },

  deleteSubject: (id: string) => {
    expoDb.runSync('DELETE FROM subjects WHERE id = ?', [id]);
    const updatedSubjects = get().subjects.filter((s) => s.id !== id);
    const updatedSlots = get().scheduleSlots.filter((slot) => slot.subjectId !== id);
    const updatedSessions = get().sessions.filter((ses) => ses.subjectId !== id);
    set({
      subjects: updatedSubjects,
      scheduleSlots: updatedSlots,
      sessions: updatedSessions,
    });
    debouncedSyncNotifications(
      get().settings,
      updatedSubjects,
      updatedSlots,
      updatedSessions,
      get().holidays
    );
  },

  updateSettings: (partial: Partial<Settings>) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    set({ settings: updated });

    expoDb.runSync(
      `UPDATE settings SET 
        global_target_pct = ?, theme = ?, primary_card_label = ?,
        daily_reminder_enabled = ?, daily_reminder_time = ?,
        per_class_reminder_enabled = ?, per_class_reminder_offset_minutes = ?,
        sunday_digest_enabled = ?, haptic_feedback_enabled = ?,
        has_seeded_demo = ?, has_onboarded = ?
       WHERE id = 1`,
      [
        updated.globalTargetPct,
        updated.theme,
        updated.primaryCardLabel,
        updated.dailyReminderEnabled ? 1 : 0,
        updated.dailyReminderTime,
        updated.perClassReminderEnabled ? 1 : 0,
        updated.perClassReminderOffsetMinutes,
        updated.sundayDigestEnabled ? 1 : 0,
        updated.hapticFeedbackEnabled ? 1 : 0,
        updated.hasSeededDemo ? 1 : 0,
        updated.hasOnboarded ? 1 : 0,
      ]
    );

    // Sync notification schedules
    debouncedSyncNotifications(
      updated,
      get().subjects,
      get().scheduleSlots,
      get().sessions,
      get().holidays
    );
  },

  completeOnboarding: async (options: {
    targetPct: number;
    loadSampleData: boolean;
    enableReminders: boolean;
    sundayDigestEnabled?: boolean;
  }) => {
    if (options.loadSampleData) {
      seedDemoData(getTodayDateString(), options.targetPct);
    } else {
      expoDb.execSync(`
        DELETE FROM sessions;
        DELETE FROM schedule_slots;
        DELETE FROM subjects;
        DELETE FROM holidays;
      `);
    }

    const sundayDigest = options.sundayDigestEnabled !== undefined
      ? (options.sundayDigestEnabled ? 1 : 0)
      : (options.enableReminders ? 1 : 0);

    expoDb.runSync(
      `UPDATE settings SET 
        global_target_pct = ?, 
        has_seeded_demo = ?, 
        has_onboarded = 1,
        per_class_reminder_enabled = ?,
        sunday_digest_enabled = ?,
        daily_reminder_enabled = ?
       WHERE id = 1`,
      [
        options.targetPct,
        options.loadSampleData ? 1 : 0,
        options.enableReminders ? 1 : 0,
        sundayDigest,
        options.enableReminders ? 1 : 0,
      ]
    );

    get().initialize();
    syncScheduledNotifications(
      get().settings,
      get().subjects,
      get().scheduleSlots,
      get().sessions,
      get().holidays
    );
  },

  resetOnboarding: () => {
    expoDb.runSync('UPDATE settings SET has_onboarded = 0 WHERE id = 1');
    set((state) => ({
      settings: {
        ...state.settings,
        hasOnboarded: false,
      },
    }));
  },

  restoreFromBackup: (payload: any): boolean => {
    try {
      if (!payload || payload.version !== 1) {
        return false;
      }

      expoDb.execSync(`
        DELETE FROM sessions;
        DELETE FROM schedule_slots;
        DELETE FROM subjects;
        DELETE FROM holidays;
      `);

      // Restore subjects
      if (Array.isArray(payload.subjects)) {
        for (const sub of payload.subjects) {
          expoDb.runSync(
            `INSERT INTO subjects (id, name, code, color, target_pct, baseline_present, baseline_absent, start_date, end_date, archived_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sub.id,
              sub.name,
              sub.code,
              sub.color,
              sub.targetPct,
              sub.baselinePresent,
              sub.baselineAbsent,
              sub.startDate,
              sub.endDate,
              sub.archivedAt,
              sub.createdAt,
            ]
          );
        }
      }

      // Restore slots
      if (Array.isArray(payload.scheduleSlots)) {
        for (const slot of payload.scheduleSlots) {
          expoDb.runSync(
            `INSERT INTO schedule_slots (id, subject_id, weekday, start_time, end_time, effective_from, effective_to)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              slot.id,
              slot.subjectId,
              slot.weekday,
              slot.startTime,
              slot.endTime,
              slot.effectiveFrom,
              slot.effectiveTo,
            ]
          );
        }
      }

      // Restore sessions
      if (Array.isArray(payload.sessions)) {
        for (const ses of payload.sessions) {
          expoDb.runSync(
            `INSERT INTO sessions (id, subject_id, slot_id, date, start_time, end_time, status, marked_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ses.id,
              ses.subjectId,
              ses.slotId,
              ses.date,
              ses.startTime,
              ses.endTime,
              ses.status,
              ses.markedAt,
            ]
          );
        }
      }

      // Restore holidays
      if (Array.isArray(payload.holidays)) {
        for (const h of payload.holidays) {
          expoDb.runSync(
            'INSERT OR REPLACE INTO holidays (date, label) VALUES (?, ?)',
            [h.date, h.label]
          );
        }
      }

      // Restore settings if present
      if (payload.settings) {
        get().updateSettings(payload.settings);
      }

      get().initialize();
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  },

  resetToDemo: () => {
    seedDemoData(DEFAULT_DATE);
    get().initialize();
  },

  clearAllData: () => {
    expoDb.execSync(`
      DELETE FROM sessions;
      DELETE FROM schedule_slots;
      DELETE FROM subjects;
      DELETE FROM holidays;
    `);
    get().initialize();
  },

  getAllSubjectStats: () => {
    const { subjects, sessions, holidays, settings } = get();
    const holidaysSet = new Set(holidays.map((h) => h.date));
    return subjects
      .filter((s) => !s.archivedAt)
      .map((s) =>
        computeSubjectStats(s, sessions, holidaysSet, settings.globalTargetPct)
      );
  },

  getPooledStats: () => {
    const statsList = get().getAllSubjectStats();
    return computePooledStats(statsList, get().settings.globalTargetPct);
  },

  getSessionsForDate: (dateStr: string) => {
    const { sessions, scheduleSlots, subjects } = get();
    const activeSubjectsMap = new Map(
      subjects.filter((s) => !s.archivedAt).map((s) => [s.id, s])
    );

    // Existing sessions for date
    let daySessions = sessions.filter((s) => s.date === dateStr);

    // Parse weekday (0 = Sun, 1 = Mon ... 6 = Sat)
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();

    // Find slots that apply for this date
    const slotsForDay = scheduleSlots.filter((slot) => {
      const subject = activeSubjectsMap.get(slot.subjectId);
      if (!subject) return false;
      return (
        slot.weekday === dayOfWeek &&
        isSlotEffectiveOnDate(slot, dateStr) &&
        isSubjectActiveOnDate(subject, dateStr)
      );
    });

    const newSessionsToInsert: Session[] = [];

    for (const slot of slotsForDay) {
      const exists = daySessions.some(
        (s) => s.slotId === slot.id && s.date === dateStr
      );
      if (!exists) {
        const newSession: Session = {
          id: generateUUID(),
          subjectId: slot.subjectId,
          slotId: slot.id,
          date: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: null,
          markedAt: null,
        };
        newSessionsToInsert.push(newSession);
      }
    }

    if (newSessionsToInsert.length > 0) {
      // Idempotently persist newly generated sessions to SQLite
      for (const ses of newSessionsToInsert) {
        try {
          expoDb.runSync(
            `INSERT OR IGNORE INTO sessions (id, subject_id, slot_id, date, start_time, end_time, status, marked_at)
             VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)`,
            [
              ses.id,
              ses.subjectId,
              ses.slotId,
              ses.date,
              ses.startTime,
              ses.endTime,
            ]
          );
        } catch {}
      }

      const allUpdatedSessions = [...sessions, ...newSessionsToInsert];
      set({ sessions: allUpdatedSessions });
      daySessions = allUpdatedSessions.filter((s) => s.date === dateStr);
    }

    return daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  isDateHoliday: (dateStr: string) => {
    return get().holidays.some((h) => h.date === dateStr);
  },
}));
