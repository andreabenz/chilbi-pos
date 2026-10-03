import { printerService } from './printerService';
import { getCachedLogo, initializeLogo } from './logoRasterizer';
import { buildCustomerReceipt, buildKitchenSlip, PrintableOrder } from './receiptBuilder';
import logoPath from '../assets/Logo_Cevi-WIE_2019_web.svg?asset';

/**
 * Initialisiert das Logo beim App-Start
 */
export async function initPrinterLogo(): Promise<void> {
  try {
    await initializeLogo(logoPath);
    console.log('[Printer] Logo initialized from:', logoPath);
  } catch (err) {
    console.warn('[Printer] Failed to rasterize logo:', err);
  }
}

/**
 * Druckt Customer Receipt und Kitchen Slips
 */
export async function printOrderReceipts(order: PrintableOrder): Promise<void> {
  const isHelfer = order.paymentMethod === 'helfer';
  const logoBuffer = getCachedLogo();

  // 1. Customer Receipt (Wird bei Helfer nicht gedruckt)
  if (!isHelfer) {
    const customerBuffer = buildCustomerReceipt(order, logoBuffer);
    await printerService.printRaw(customerBuffer, `Customer Receipt #${order.orderNumber}`);
  }

  // 2. Pizza Kitchen Slip (Nur wenn Pizza bestellt wurde)
  const pizzaBuffer = buildKitchenSlip(order, 'Pizza', logoBuffer);
  if (pizzaBuffer) {
    await printerService.printRaw(pizzaBuffer, `Pizza Slip #${order.orderNumber}`);
  }

  // 3. Crêpes Kitchen Slip (Nur wenn Crêpe bestellt wurde)
  const crepeBuffer = buildKitchenSlip(order, 'Crêpes', logoBuffer);
  if (crepeBuffer) {
    await printerService.printRaw(crepeBuffer, `Crepes Slip #${order.orderNumber}`);
  }
}
