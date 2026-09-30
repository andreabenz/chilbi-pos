import { ipcMain } from 'electron';
import { printerService } from '../printer/printerService';
import { printOrderReceipts } from '../printer';
import type { PrintableOrder } from '../printer/receiptBuilder';

export function registerPrinterIpc(): void {
  // List all OS printers
  ipcMain.handle('printer:list', async () => {
    return await printerService.getPrinters();
  });

  // Set the active printer in printerService
  ipcMain.handle('printer:set-selected', (_event, printerName: string | null) => {
    printerService.setPrinterName(printerName);
    return { success: true };
  });

  // Print a small diagnostic receipt
  ipcMain.handle('printer:test-print', async () => {
    try {
      const testBuffer = Buffer.concat([
        Buffer.from([0x1b, 0x40]), // ESC @ (Initialize)
        Buffer.from([0x1b, 0x61, 0x01]), // ESC a 1 (Center alignment)
        Buffer.from('=== CHILBI KASSE TEST ===\n\n'),
        Buffer.from('Drucker-Verbindung OK!\n'),
        Buffer.from(new Date().toLocaleString('de-CH') + '\n\n\n\n'),
        Buffer.from([0x1d, 0x56, 0x00]), // GS V 0 (Full Cut)
      ]);

      await printerService.printRaw(testBuffer, 'Testdruck');
      return { success: true };
    } catch (error) {
      console.error('[IPC] Test print failed:', error);
      return { success: false, error: String(error) };
    }
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
