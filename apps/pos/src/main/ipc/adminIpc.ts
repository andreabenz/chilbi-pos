import { app, dialog, ipcMain } from 'electron';
import { desc, sql } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';
import { wipeAndResetDatabase } from '@main/db/services/adminService';

export function registerAdminIpc(): void {
  /**
   * Export SQLite database file to a user-chosen destination
   */
  ipcMain.handle('admin:export-db', async () => {
    try {
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

      const escapedPath = filePath.replace(/'/g, "''");
      await db.run(sql.raw(`VACUUM INTO '${escapedPath}'`));

      return { success: true, path: filePath };
    } catch (error) {
      console.error('[AdminIPC] DB Export failed:', error);
      return { success: false, error: String(error) };
    }
  });
  /**
   * Fetch the latest 20 database entries with all joined relations
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
              variant: true,
              extras: {
                with: {
                  extra: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('[AdminIPC] Failed to fetch recent data:', error);
      throw error;
    }
  });
  /**
   * Wipes database, creates backup, and returns result
   */
  ipcMain.handle('admin:wipe-db', async () => {
    try {
      const result = await wipeAndResetDatabase();
      return { success: true, backupPath: result.backupPath };
    } catch (error) {
      console.error('[AdminIPC] DB wipe failed:', error);
      return { success: false, error: String(error) };
    }
  });

  /**
   * Relaunches the Electron application (or closes it)
   */
  ipcMain.handle('app:relaunch', () => {
    app.relaunch();
    app.exit(0);
  });
}
