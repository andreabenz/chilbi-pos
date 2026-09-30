import { dialog, ipcMain } from 'electron';
import { desc } from 'drizzle-orm';
import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from '../db';
import * as schema from '../db/schema';

export function registerAdminIpc(): void {
  /**
   * 1. Export SQLite database file to a user-chosen destination
   */
  ipcMain.handle('admin:export-db', async () => {
    try {
      const dbUrl = process.env.DB_FILE_NAME || 'file:chilbi.db';
      const rawFileName = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl;
      const sourceDbPath = path.isAbsolute(rawFileName)
        ? rawFileName
        : path.resolve(process.cwd(), rawFileName);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Datenbank exportieren',
        defaultPath: `chilbi-backup-${timestamp}.db`,
        filters: [
          { name: 'SQLite Datenbank', extensions: ['db', 'sqlite'] },
          { name: 'Alle Dateien', extensions: ['*'] },
        ],
      });

      if (canceled || !filePath) {
        return { success: false, message: 'Abgebrochen' };
      }

      await fs.copyFile(sourceDbPath, filePath);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('[AdminIPC] DB Export failed:', error);
      return { success: false, error: String(error) };
    }
  });

  /**
   * 2. Fetch latest 20 database entries with all joined relations
   */
  ipcMain.handle('admin:get-recent-data', async () => {
    try {
      return await db.query.orders.findMany({
        limit: 20,
        orderBy: [desc(schema.orders.orderNumber)],
        with: {
          bill: {
            with: {
              payments: true,
            },
          },
          items: {
            with: {
              menuItem: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('[AdminIPC] Failed to fetch recent data:', error);
      throw error;
    }
  });
}
