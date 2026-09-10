import { db } from '../index';
import * as schema from '../schema';

export interface CreateOrderItemInput {
  menuItemId: number;
  amount: number;
}

export interface CreatePaymentInput {
  method: 'cash' | 'twint' | 'coupon' | 'voucher' | 'helfer';
  amount: number;
  tipAmount?: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  payments: CreatePaymentInput[];
  userId?: number;
  terminalId?: string;
}

export interface OrderResult {
  orderNumber: number;
  receiptNumber: number;
}

/**
 * Creates an order, bill, order items, and payment entries in a single transaction
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  return db.transaction(async tx => {
    // 1. Insert Order
    const [order] = await tx
      .insert(schema.orders)
      .values({})
      .returning({ orderNumber: schema.orders.orderNumber });

    if (!order) {
      throw new Error('Failed to create order');
    }

    // 2. Insert Order Items
    if (input.items.length > 0) {
      await tx.insert(schema.orderItems).values(
        input.items.map(item => ({
          orderNumber: order.orderNumber,
          menuItemId: item.menuItemId,
          amount: item.amount,
        }))
      );
    }

    // 3. Insert Bill
    const [bill] = await tx
      .insert(schema.bills)
      .values({
        orderNumber: order.orderNumber,
        userId: input.userId,
        terminalId: input.terminalId ?? 'Chilbi Kasse #1',
      })
      .returning({ receiptNumber: schema.bills.receiptNumber });

    if (!bill) {
      throw new Error('Failed to create bill');
    }

    // 4. Insert Payments
    if (input.payments.length > 0) {
      await tx.insert(schema.payments).values(
        input.payments.map(p => ({
          receiptNumber: bill.receiptNumber,
          method: p.method,
          amount: p.amount,
          tipAmount: p.tipAmount ?? 0,
        }))
      );
    }

    return {
      orderNumber: order.orderNumber,
      receiptNumber: bill.receiptNumber,
    };
  });
}
