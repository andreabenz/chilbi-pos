import { registerMenuIpc } from './menuIpc';
import { registerOrderIpc } from './orderIpc';
import { registerPrinterIpc } from './printerIpc';
import { registerAdminIpc } from './adminIpc';

/**
 * Registers all IPC communication handlers for menu, orders, printer, and administration.
 */
export function registerAllIpc(): void {
  registerMenuIpc();
  registerOrderIpc();
  registerPrinterIpc();
  registerAdminIpc();
}
