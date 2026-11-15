import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import {
  TARGET_SCHEMA_VERSION,
  getDatabaseVersion,
  setDatabaseVersion,
  runMigrations,
} from './migrations';
import type { MigrationDb } from './migrations';

export const DB_NAME = 'bound.db';

export const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });

export {
  TARGET_SCHEMA_VERSION,
  getDatabaseVersion,
  setDatabaseVersion,
  runMigrations,
};
export type { MigrationDb };

/**
 * Initializes database tables, pragmas, and versioned migrations.
 */
export function initDatabase() {
  expoDb.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  runMigrations(expoDb);
}
