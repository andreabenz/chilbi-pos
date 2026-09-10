import { registerMenuIpc } from './menuIpc';
import { registerOrderIpc } from './orderIpc';

export function registerAllIpc(): void {
  registerMenuIpc();
  registerOrderIpc();
}
