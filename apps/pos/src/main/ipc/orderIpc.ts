import { ipcMain } from 'electron';
import {
  createOrder,
  CreateOrderInput,
  deleteLatestOrder,
  getLatestOrderNumber,
} from '../db/services/orderService';

export function registerOrderIpc(): void {
  ipcMain.handle('order:create', async (_event, payload: CreateOrderInput) => {
    try {
      return await createOrder(payload);
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  });
  ipcMain.handle('order:get-latest-number', async () => {
    try {
      return await getLatestOrderNumber();
    } catch (error) {
      console.error('Failed to get latest order number:', error);
      return 0;
    }
  });
  ipcMain.handle('order:delete-latest', async () => {
    try {
      return await deleteLatestOrder();
    } catch (error) {
      console.error('[OrderIPC] deleteLatestOrder failed:', error);
      return { success: false, message: String(error) };
    }
  });
}
