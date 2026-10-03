import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { sql } from 'drizzle-orm';
import { db } from '../index';
import * as schema from '../schema';

/**
 * Creates a complete SQLite database backup file in the userData/backups directory using VACUUM INTO.
 *
 * @returns Path to the newly created backup file
 */
async function createBackup(): Promise<string> {
  const basePath = typeof app?.getPath === 'function' ? app.getPath('userData') : process.cwd();
  const backupDir = path.join(basePath, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const backupPath = path.join(backupDir, `pos-backup-${Date.now()}.db`);

  const escaped = backupPath.replace(/'/g, "''");
  await db.run(sql.raw(`VACUUM INTO '${escaped}'`));

  return backupPath;
}

/**
 * Creates a safety backup, deletes all records from all tables, and resets auto-increment sequences.
 *
 * @returns Object containing the created backup file path
 */
export async function wipeAndResetDatabase(): Promise<{ backupPath: string }> {
  const backupPath = await createBackup();

  await db.run(sql`PRAGMA foreign_keys = OFF;`);

  try {
    await db.transaction(async tx => {
      await tx.delete(schema.payments);
      await tx.delete(schema.bills);
      await tx.delete(schema.orderItemExtras);
      await tx.delete(schema.orderItems);
      await tx.delete(schema.menuItemExtras);
      await tx.delete(schema.menuItemVariants);
      await tx.delete(schema.extras);
      await tx.delete(schema.menuItems);
      await tx.delete(schema.categories);
      await tx.delete(schema.orders);
      await tx.delete(schema.users);

      try {
        await tx.run(sql`DELETE FROM sqlite_sequence;`);
      } catch {
        // Ignored if sqlite_sequence table does not exist yet
      }
    });
  } finally {
    await db.run(sql`PRAGMA foreign_keys = ON;`);
  }

  return { backupPath };
}
