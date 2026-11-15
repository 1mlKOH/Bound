export const TARGET_SCHEMA_VERSION = 3;

export interface MigrationDb {
  getFirstSync<T>(sql: string): T | null;
  getAllSync<T>(sql: string): T[];
  execSync(sql: string): void;
  withTransactionSync(cb: () => void): void;
}

export function getDatabaseVersion(db: MigrationDb): number {
  const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  return result?.user_version ?? 0;
}

export function setDatabaseVersion(version: number, db: MigrationDb): void {
  db.execSync(`PRAGMA user_version = ${version};`);
}

/**
 * Runs pending schema migrations sequentially in transactions.
 */
export function runMigrations(db: MigrationDb): void {
  const currentVersion = getDatabaseVersion(db);

  if (currentVersion >= TARGET_SCHEMA_VERSION) {
    return;
  }

  // Migration 1: Initial schema & tables
  if (currentVersion < 1) {
    db.withTransactionSync(() => {
      db.execSync(`
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
          per_class_reminder_enabled INTEGER NOT NULL DEFAULT 0,
          per_class_reminder_offset_minutes INTEGER NOT NULL DEFAULT 5,
          sunday_digest_enabled INTEGER NOT NULL DEFAULT 0,
          haptic_feedback_enabled INTEGER NOT NULL DEFAULT 1,
          has_seeded_demo INTEGER NOT NULL DEFAULT 0,
          has_onboarded INTEGER NOT NULL DEFAULT 0,
          last_backup_at TEXT
        );

        INSERT OR IGNORE INTO settings (
          id, global_target_pct, theme, primary_card_label,
          daily_reminder_enabled, daily_reminder_time,
          per_class_reminder_enabled, per_class_reminder_offset_minutes,
          sunday_digest_enabled, haptic_feedback_enabled,
          has_seeded_demo, has_onboarded, last_backup_at
        ) VALUES (1, 75.0, 'system', 'name', 0, '18:00', 0, 5, 0, 1, 0, 0, NULL);
      `);
      setDatabaseVersion(1, db);
    });
  }

  // Migration 2: Ensure haptic_feedback_enabled and has_onboarded exist for pre-v1 databases
  if (getDatabaseVersion(db) < 2) {
    db.withTransactionSync(() => {
      const tableInfo = db.getAllSync<any>('PRAGMA table_info(settings)');
      const columnNames = new Set(tableInfo.map((col) => col.name));
      if (!columnNames.has('haptic_feedback_enabled')) {
        db.execSync('ALTER TABLE settings ADD COLUMN haptic_feedback_enabled INTEGER NOT NULL DEFAULT 1;');
      }
      if (!columnNames.has('has_onboarded')) {
        const subjectCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM subjects')?.count ?? 0;
        const initialValue = subjectCount > 0 ? 1 : 0;
        db.execSync(`ALTER TABLE settings ADD COLUMN has_onboarded INTEGER NOT NULL DEFAULT ${initialValue};`);
      }
      setDatabaseVersion(2, db);
    });
  }

  // Migration 3: Add last_backup_at column to settings
  if (getDatabaseVersion(db) < 3) {
    db.withTransactionSync(() => {
      const tableInfo = db.getAllSync<any>('PRAGMA table_info(settings)');
      const columnNames = new Set(tableInfo.map((col) => col.name));
      if (!columnNames.has('last_backup_at')) {
        db.execSync('ALTER TABLE settings ADD COLUMN last_backup_at TEXT;');
      }
      setDatabaseVersion(3, db);
    });
  }
}
