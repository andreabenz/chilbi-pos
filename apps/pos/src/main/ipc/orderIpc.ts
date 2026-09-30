import { ipcMain } from 'electron';
import { createOrder, CreateOrderInput, getLatestOrderNumber } from '../db/services/orderService';

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
}
