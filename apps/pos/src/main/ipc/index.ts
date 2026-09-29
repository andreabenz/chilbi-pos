import { registerMenuIpc } from './menuIpc';
import { registerOrderIpc } from './orderIpc';
import { registerPrinterIpc } from './printerIPC';

export function registerAllIpc(): void {
  registerMenuIpc();
  registerOrderIpc();
  registerPrinterIpc();
}
