import { registerMenuIpc } from './menuIpc';
import { registerOrderIpc } from './orderIpc';
import { registerPrinterIpc } from './printerIpc';
import { registerAdminIpc } from './adminIpc';

export function registerAllIpc(): void {
  registerMenuIpc();
  registerOrderIpc();
  registerPrinterIpc();
  registerAdminIpc();
}
