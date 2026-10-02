import { db } from '../index';
import * as schema from '../schema';
import { desc, eq, sql } from 'drizzle-orm';

export interface CreateOrderItemInput {
  menuItemId: number;
  amount: number;
}

export interface CreatePaymentInput {
  method: 'cash' | 'twint' | 'coupon' | 'voucher' | 'helfer' | 'card';
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

/**
 * Returns the highest orderNumber in the database, or 0 if no orders exist yet.
 */
export async function getLatestOrderNumber(): Promise<number> {
  const latestOrder = await db.query.orders.findFirst({
    orderBy: [desc(schema.orders.orderNumber)],
  });
  return latestOrder ? latestOrder.orderNumber : 0;
}

/**
 * Deletes the latest order and returns the deleted order number and the next order number.
 */
export async function deleteLatestOrder(): Promise<
  | { success: true; deletedOrderNumber: number; nextOrderNumber: number }
  | { success: false; message: string }
> {
  return db.transaction(async tx => {
    const latestOrder = await tx.query.orders.findFirst({
      orderBy: [desc(schema.orders.orderNumber)],
      with: { bill: true },
    });

    if (!latestOrder) {
      return { success: false as const, message: 'Keine Bestellungen vorhanden' };
    }

    if (latestOrder.bill) {
      const { receiptNumber } = latestOrder.bill;
      await tx.delete(schema.payments).where(eq(schema.payments.receiptNumber, receiptNumber));
      await tx.delete(schema.bills).where(eq(schema.bills.receiptNumber, receiptNumber));
    }

    await tx
      .delete(schema.orderItems)
      .where(eq(schema.orderItems.orderNumber, latestOrder.orderNumber));

    await tx.delete(schema.orders).where(eq(schema.orders.orderNumber, latestOrder.orderNumber));

    await tx.run(
      sql`UPDATE sqlite_sequence
          SET seq = (SELECT COALESCE(MAX(${schema.orders.orderNumber}), 0) FROM ${schema.orders})
          WHERE name = 'orders'`
    );
    await tx.run(
      sql`UPDATE sqlite_sequence
          SET seq = (SELECT COALESCE(MAX(${schema.bills.receiptNumber}), 0) FROM ${schema.bills})
          WHERE name = 'bills'`
    );

    const [row] = await tx
      .select({
        max: sql<number>`COALESCE(MAX(
        ${schema.orders.orderNumber}
        ),
        0
        )`,
      })
      .from(schema.orders);

    return {
      success: true as const,
      deletedOrderNumber: latestOrder.orderNumber,
      nextOrderNumber: (row?.max ?? 0) + 1,
    };
  });
}
