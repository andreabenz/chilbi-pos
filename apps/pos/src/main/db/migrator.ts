import { app } from 'electron';
import path from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index';

/**
 * Runs pending Drizzle SQL migrations against the SQLite database.
 * Resolves the migrations folder correctly in both development and packaged production mode.
 */
export async function runMigrations(): Promise<void> {
  const migrationsFolder = app.isPackaged
    ? path.join(process.resourcesPath, 'drizzle')
    : path.join(__dirname, '../../drizzle');

  console.info(`[Database] Applying migrations from: ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.info('[Database] Migrations applied successfully.');
}
