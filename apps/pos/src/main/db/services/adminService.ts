import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { sql } from 'drizzle-orm';
import { db } from '../index';
import * as schema from '../schema';

async function createBackup(): Promise<string> {
  const backupDir = path.join(app.getPath('userData'), 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const backupPath = path.join(backupDir, `pos-backup-${Date.now()}.db`);

  const escaped = backupPath.replace(/'/g, "''");
  await db.run(sql.raw(`VACUUM INTO '${escaped}'`));

  return backupPath;
}

export async function wipeAndResetDatabase(): Promise<{ backupPath: string }> {
  const backupPath = await createBackup();

  await db.run(sql`PRAGMA foreign_keys = OFF;`);

  try {
    await db.transaction(async tx => {
      await tx.delete(schema.payments);
      await tx.delete(schema.bills);
      await tx.delete(schema.orderItems);
      await tx.delete(schema.menuItemExtras);
      await tx.delete(schema.menuItemVariants);
      await tx.delete(schema.extras);
      await tx.delete(schema.menuItems);
      await tx.delete(schema.categories);
      await tx.delete(schema.orders);
      await tx.delete(schema.users);

      await tx.run(sql`DELETE FROM sqlite_sequence;`);
    });
  } finally {
    await db.run(sql`PRAGMA foreign_keys = ON;`);
  }

  return { backupPath };
}
