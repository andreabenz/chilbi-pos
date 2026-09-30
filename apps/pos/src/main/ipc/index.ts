import { registerMenuIpc } from './menuIpc';
import { registerOrderIpc } from './orderIpc';
import { registerPrinterIpc } from './printerIPC';
import { registerAdminIpc } from '@main/ipc/adminIpc';

export function registerAllIpc(): void {
  registerMenuIpc();
  registerOrderIpc();
  registerPrinterIpc();
  registerAdminIpc();
}
