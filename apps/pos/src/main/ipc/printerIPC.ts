import { ipcMain } from 'electron';
import { printerService } from '../printer/printerService';
import { printOrderReceipts } from '../printer';
import type { PrintableOrder } from '../printer/receiptBuilder';

export function registerPrinterIpc(): void {
  ipcMain.handle('printer:list', async () => {
    return await printerService.getPrinters();
  });

  ipcMain.handle('printer:print-order', async (_event, order: PrintableOrder) => {
    try {
      await printOrderReceipts(order);
      return { success: true };
    } catch (error) {
      console.error('[IPC] Failed to print order:', error);
      return { success: false, error: String(error) };
    }
  });
}
