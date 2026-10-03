import { ipcMain } from 'electron';
import { getFullMenu } from '../db/services/menuService';

export function registerMenuIpc(): void {
  ipcMain.handle('menu:get-full', async () => {
    try {
      return await getFullMenu();
    } catch (error) {
      console.error('Failed to get menu:', error);
      throw error;
    }
  });
}
