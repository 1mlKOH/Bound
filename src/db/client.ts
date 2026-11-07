import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const DB_NAME = 'bound.db';

export const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });

/**
 * Initializes database tables and indices idempotently.
 */
export function initDatabase() {
  expoDb.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#1FB45A',
      target_pct REAL,
      baseline_present INTEGER NOT NULL DEFAULT 0,
      baseline_absent INTEGER NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedule_slots (
      id TEXT PRIMARY KEY NOT NULL,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      weekday INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      effective_from TEXT NOT NULL,
      effective_to TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      slot_id TEXT REFERENCES schedule_slots(id) ON DELETE SET NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT,
      marked_at TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS slot_date_idx ON sessions(slot_id, date) WHERE slot_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS session_date_idx ON sessions(date);
    CREATE INDEX IF NOT EXISTS session_subject_idx ON sessions(subject_id);

    CREATE TABLE IF NOT EXISTS holidays (
      date TEXT PRIMARY KEY NOT NULL,
      label TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
      global_target_pct REAL NOT NULL DEFAULT 75.0,
      theme TEXT NOT NULL DEFAULT 'system',
      primary_card_label TEXT NOT NULL DEFAULT 'name',
      daily_reminder_enabled INTEGER NOT NULL DEFAULT 0,
      daily_reminder_time TEXT NOT NULL DEFAULT '18:00',
      per_class_reminder_enabled INTEGER NOT NULL DEFAULT 1,
      per_class_reminder_offset_minutes INTEGER NOT NULL DEFAULT 5,
      sunday_digest_enabled INTEGER NOT NULL DEFAULT 1,
      has_seeded_demo INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO settings (id, global_target_pct, theme, primary_card_label, daily_reminder_enabled, daily_reminder_time, per_class_reminder_enabled, per_class_reminder_offset_minutes, sunday_digest_enabled, has_seeded_demo)
    VALUES (1, 75.0, 'system', 'name', 0, '18:00', 1, 5, 1, 0);
  `);
}
