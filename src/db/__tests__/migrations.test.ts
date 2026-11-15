import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import {
  runMigrations,
  getDatabaseVersion,
  setDatabaseVersion,
  TARGET_SCHEMA_VERSION,
} from '../migrations.ts';
import type { MigrationDb } from '../migrations.ts';

class TestSqliteDb implements MigrationDb {
  private db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(':memory:');
  }

  getFirstSync<T>(sql: string): T | null {
    const stmt = this.db.prepare(sql);
    const row = stmt.get();
    return (row as T) ?? null;
  }

  getAllSync<T>(sql: string): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all() as T[];
  }

  execSync(sql: string): void {
    this.db.exec(sql);
  }

  withTransactionSync(cb: () => void): void {
    this.db.exec('BEGIN;');
    try {
      cb();
      this.db.exec('COMMIT;');
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }
}

describe('Database Versioned Migrations', () => {
  it('initializes fresh database from version 0 to target version', () => {
    const db = new TestSqliteDb();
    assert.equal(getDatabaseVersion(db), 0);

    runMigrations(db);

    assert.equal(getDatabaseVersion(db), TARGET_SCHEMA_VERSION);

    // Verify all primary tables were created
    const tables = db
      .getAllSync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
      )
      .map((t) => t.name);

    assert.ok(tables.includes('subjects'));
    assert.ok(tables.includes('schedule_slots'));
    assert.ok(tables.includes('sessions'));
    assert.ok(tables.includes('holidays'));
    assert.ok(tables.includes('settings'));

    // Verify settings columns
    const columns = db
      .getAllSync<{ name: string }>('PRAGMA table_info(settings)')
      .map((c) => c.name);

    assert.ok(columns.includes('haptic_feedback_enabled'));
    assert.ok(columns.includes('has_onboarded'));
    assert.ok(columns.includes('last_backup_at'));

    // Verify initial settings row was inserted
    const settings = db.getFirstSync<any>('SELECT * FROM settings WHERE id = 1');
    assert.ok(settings);
    assert.equal(settings.global_target_pct, 75.0);
    assert.equal(settings.haptic_feedback_enabled, 1);
  });

  it('is idempotent when called repeatedly on up-to-date database', () => {
    const db = new TestSqliteDb();
    runMigrations(db);
    assert.equal(getDatabaseVersion(db), TARGET_SCHEMA_VERSION);

    // Run again
    assert.doesNotThrow(() => {
      runMigrations(db);
    });
    assert.equal(getDatabaseVersion(db), TARGET_SCHEMA_VERSION);
  });

  it('upgrades a legacy v1 seeded database to v3 preserving existing records', () => {
    const db = new TestSqliteDb();

    // Create legacy v1 schema without haptic_feedback_enabled, has_onboarded, or last_backup_at
    db.execSync(`
      CREATE TABLE subjects (
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

      CREATE TABLE settings (
        id INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
        global_target_pct REAL NOT NULL DEFAULT 75.0,
        theme TEXT NOT NULL DEFAULT 'system',
        primary_card_label TEXT NOT NULL DEFAULT 'name',
        daily_reminder_enabled INTEGER NOT NULL DEFAULT 0,
        daily_reminder_time TEXT NOT NULL DEFAULT '18:00',
        per_class_reminder_enabled INTEGER NOT NULL DEFAULT 0,
        per_class_reminder_offset_minutes INTEGER NOT NULL DEFAULT 5,
        sunday_digest_enabled INTEGER NOT NULL DEFAULT 0,
        has_seeded_demo INTEGER NOT NULL DEFAULT 0
      );

      INSERT INTO settings (id, global_target_pct) VALUES (1, 80.0);
      INSERT INTO subjects (id, name, start_date, created_at)
      VALUES ('sub-legacy-1', 'Legacy Course', '2026-01-01', '2026-01-01T00:00:00Z');

      PRAGMA user_version = 1;
    `);

    assert.equal(getDatabaseVersion(db), 1);

    // Run migrations to upgrade to v3
    runMigrations(db);

    assert.equal(getDatabaseVersion(db), TARGET_SCHEMA_VERSION);

    // Verify existing settings data was preserved
    const settings = db.getFirstSync<any>('SELECT * FROM settings WHERE id = 1');
    assert.equal(settings.global_target_pct, 80.0);

    // Verify new columns were added and populated
    assert.equal(settings.haptic_feedback_enabled, 1);
    // Since there was an existing subject, has_onboarded should default to 1
    assert.equal(settings.has_onboarded, 1);
    assert.equal(settings.last_backup_at, null);

    // Verify legacy subject still exists
    const subject = db.getFirstSync<any>("SELECT * FROM subjects WHERE id = 'sub-legacy-1'");
    assert.equal(subject.name, 'Legacy Course');
  });
});
