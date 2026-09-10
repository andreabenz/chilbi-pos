import { ipcMain } from 'electron';
import { createOrder, CreateOrderInput } from '../db/services/orderService';

export function registerOrderIpc(): void {
  ipcMain.handle('order:create', async (_event, payload: CreateOrderInput) => {
    try {
      return await createOrder(payload);
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  });
}
