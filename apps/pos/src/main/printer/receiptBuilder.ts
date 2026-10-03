import { EscPos, LF } from './commands';
import { encodeText, formatRow, formatSeparator } from './encoder';

export interface PrintableOrderItem {
  name: string;
  categoryName?: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number; // in Rappen
  extras: { id: number; name: string; price: number }[];
}

export interface PrintableOrder {
  orderNumber: number;
  receiptNumber: number;
  items: PrintableOrderItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  paymentMethod: 'cash' | 'card' | 'voucher' | 'coupon' | 'helfer';
  timestamp?: Date;
}

const CARD_SURCHARGE_AMOUNT = 50; // CHF 0.50

/**
 * Baut den Haupt-Kundenbeleg
 */
export function buildCustomerReceipt(order: PrintableOrder, logoBuffer?: Buffer | null): Buffer {
  const chunks: Buffer[] = [];
  const appendText = (text: string) => chunks.push(encodeText(text), Buffer.from([LF]));

  // 1. Initialisierung & Code Page PC858
  chunks.push(EscPos.init(), EscPos.setCodeTable(19));

  // 2. Logo ganz oben (volle Breite)
  if (logoBuffer) {
    chunks.push(EscPos.align('center'), logoBuffer, EscPos.feed(1));
  }

  // 3. Titel
  chunks.push(EscPos.align('center'), EscPos.bold(true));
  appendText('Dorfchilbi Wiesendangen 2026');
  chunks.push(EscPos.bold(false), EscPos.feed(1));

  // 4. Standalone Order Number (Maximal gross, zentriert, fett)
  chunks.push(EscPos.align('center'), EscPos.bold(true), EscPos.textSize(4, 4));
  appendText(`${order.orderNumber}`);
  chunks.push(EscPos.textSize(1, 1), EscPos.bold(false), EscPos.feed(1));

  // 5. Artikel-Tabelle
  chunks.push(EscPos.align('left'));
  appendText(formatSeparator('-'));

  for (const item of order.items) {
    const itemTitle = `${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''}`;
    const itemTotal = `CHF ${((item.unitPrice * item.quantity) / 100).toFixed(2)}`;
    appendText(formatRow(itemTitle, itemTotal));

    // Extras eingerückt
    for (const extra of item.extras) {
      const extraTitle = `   + ${extra.name}`;
      const extraPrice = extra.price > 0 ? `+ CHF ${(extra.price / 100).toFixed(2)}` : '';
      appendText(formatRow(extraTitle, extraPrice));
    }
  }

  appendText(formatSeparator('-'));

  // 6. Totals & Abzüge
  const subtotalStr = `CHF ${(order.subtotal / 100).toFixed(2)}`;
  appendText(formatRow('Zwischentotal', subtotalStr));

  if (order.discount > 0) {
    const discountStr = `- CHF ${(order.discount / 100).toFixed(2)}`;
    appendText(formatRow('Abzug (Gutschein/Bon)', discountStr));
  }

  if (order.paymentMethod === 'card') {
    appendText(formatRow('Kartengebühren', `CHF ${(CARD_SURCHARGE_AMOUNT / 100).toFixed(2)}`));
  }

  chunks.push(EscPos.bold(true));
  const totalStr = `CHF ${(order.finalTotal / 100).toFixed(2)}`;
  appendText(formatRow('TOTAL', totalStr));
  chunks.push(EscPos.bold(false));

  appendText(formatSeparator('='));
  chunks.push(EscPos.feed(1));

  // 7. Footer
  chunks.push(EscPos.align('center'), EscPos.bold(true));
  appendText('Danke für deinen Besuch und än Guete!');
  chunks.push(EscPos.bold(false), EscPos.feed(1));

  const dateStr = (order.timestamp || new Date()).toLocaleString('de-CH');
  appendText(dateStr);
  appendText(`Beleg-Nr: #${order.receiptNumber}`);

  // 8. Vorschub & Schnitt
  chunks.push(EscPos.feed(4), EscPos.cut('partial'));

  return Buffer.concat(chunks);
}

/**
 * Baut die Produktionsbelege für Pizza oder Crêpes
 */
export function buildKitchenSlip(
  order: PrintableOrder,
  categoryFilter: 'Pizza' | 'Crêpes',
  logoBuffer?: Buffer | null
): Buffer | null {
  const stationItems = order.items.filter(item =>
    item.categoryName?.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  if (stationItems.length === 0) {
    return null;
  }

  const chunks: Buffer[] = [];
  const appendText = (text: string) => chunks.push(encodeText(text), Buffer.from([LF]));

  chunks.push(EscPos.init(), EscPos.setCodeTable(19));

  // 1. Logo auf dem Produktionsbeleg
  if (logoBuffer) {
    chunks.push(EscPos.align('center'), logoBuffer, EscPos.feed(1));
  }

  // 2. Stations-Header
  chunks.push(EscPos.align('center'), EscPos.bold(true), EscPos.textSize(2, 2));
  appendText(`*** ${categoryFilter.toUpperCase()} ***`);
  chunks.push(EscPos.feed(1));

  // 3. Standalone Order Number (Maximal gross)
  chunks.push(EscPos.textSize(4, 4));
  appendText(`${order.orderNumber}`);
  chunks.push(EscPos.textSize(1, 1), EscPos.bold(false), EscPos.feed(1));

  // 4. Artikel & Toppings
  chunks.push(EscPos.align('left'));
  appendText(formatSeparator('-'));

  for (const item of stationItems) {
    chunks.push(EscPos.bold(true), EscPos.textSize(2, 2));
    appendText(`${item.quantity}x ${item.name}`);
    chunks.push(EscPos.textSize(1, 1), EscPos.bold(false));

    if (item.extras.length > 0) {
      chunks.push(EscPos.bold(true));
      for (const extra of item.extras) {
        appendText(`   >>> ${extra.name}`);
      }
      chunks.push(EscPos.bold(false));
    }
    chunks.push(EscPos.feed(1));
  }

  appendText(formatSeparator('-'));

  // 5. Zeit
  const dateStr = (order.timestamp || new Date()).toLocaleString('de-CH');
  appendText(dateStr);

  // 6. Vorschub & Schnitt
  chunks.push(EscPos.feed(4), EscPos.cut('partial'));

  return Buffer.concat(chunks);
}
