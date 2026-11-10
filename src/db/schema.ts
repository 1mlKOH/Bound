import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().default(''),
  color: text('color').notNull().default('#1FB45A'),
  targetPct: real('target_pct'), // null uses global target
  baselinePresent: integer('baseline_present').notNull().default(0),
  baselineAbsent: integer('baseline_absent').notNull().default(0),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  archivedAt: text('archived_at'),
  createdAt: text('created_at').notNull(),
});

export const scheduleSlots = sqliteTable('schedule_slots', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  weekday: integer('weekday').notNull(), // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: text('start_time').notNull(), // "09:00"
  endTime: text('end_time').notNull(), // "10:00"
  effectiveFrom: text('effective_from').notNull(), // "YYYY-MM-DD"
  effectiveTo: text('effective_to'), // "YYYY-MM-DD" or null
});

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    subjectId: text('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    slotId: text('slot_id').references(() => scheduleSlots.id, { onDelete: 'set null' }),
    date: text('date').notNull(), // "YYYY-MM-DD"
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    status: text('status'), // 'present' | 'absent' | 'cancelled' | null
    markedAt: text('marked_at'),
  },
  (table) => ({
    slotDateIdx: uniqueIndex('slot_date_idx').on(table.slotId, table.date),
  })
);

export const holidays = sqliteTable('holidays', {
  date: text('date').primaryKey(), // "YYYY-MM-DD"
  label: text('label').notNull(),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey().default(1),
  globalTargetPct: real('global_target_pct').notNull().default(75.0),
  theme: text('theme').notNull().default('system'), // 'system' | 'light' | 'dark'
  primaryCardLabel: text('primary_card_label').notNull().default('name'), // 'name' | 'code'
  dailyReminderEnabled: integer('daily_reminder_enabled').notNull().default(0),
  dailyReminderTime: text('daily_reminder_time').notNull().default('18:00'),
  perClassReminderEnabled: integer('per_class_reminder_enabled').notNull().default(1),
  perClassReminderOffsetMinutes: integer('per_class_reminder_offset_minutes').notNull().default(5),
  sundayDigestEnabled: integer('sunday_digest_enabled').notNull().default(1),
  hapticFeedbackEnabled: integer('haptic_feedback_enabled').notNull().default(1),
  hasSeededDemo: integer('has_seeded_demo').notNull().default(0),
  hasOnboarded: integer('has_onboarded').notNull().default(0),
});
