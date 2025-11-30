/**
 * @module schema Defines
 */

import { relations, sql } from 'drizzle-orm';
import { int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Users using the POS/Butler apps, for accountability purposes
 */
export const users = sqliteTable('users', {
  id: int().primaryKey({ autoIncrement: true }),
  ceviName: text().notNull(),
  role: text().$type<'admin' | 'manager' | 'staff'>().default('staff'),
});

/**
 * Menu categories
 */
export const categories = sqliteTable('categories', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

/**
 * Food and drinks items from the menu
 */
export const menuItems = sqliteTable('menu_items', {
  id: int().primaryKey({ autoIncrement: true }),
  categoryId: int()
    .references(() => categories.id)
    .notNull(),
  name: text().notNull(),
  iconUrl: text(),
});

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(categories, { fields: [menuItems.categoryId], references: [categories.id] }),
  variants: many(menuItemVariants),
  itemsToExtras: many(menuItemExtras),
}));

/**
 * Variants of an item, like "Coca Cola Small, Medium or Large". Each item should have its own
 * variants, and they cannot be shared (e.g. same variant for ice tea and Schorle)
 */
export const menuItemVariants = sqliteTable('menu_item_variants', {
  id: int().primaryKey({ autoIncrement: true }),
  itemId: int()
    .references(() => menuItems.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  /**
   * If text is null, assume this to be the only variant and use name of menuItem
   */
  name: text(),
  /**
   * Price in Rappen to avoid floating-point rounding errors
   *
   * Example: price = 4.10, quantity = 3, total = price * quantity == 12.299999999999999
   */
  price: int().notNull(),
});

export const menuItemVariantsRelations = relations(menuItemVariants, ({ one }) => ({
  item: one(menuItems, { fields: [menuItemVariants.itemId], references: [menuItems.id] }),
}));

/**
 * Extras like bacon for pizza or ice for drinks
 */
export const extras = sqliteTable('extras', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  price: int().notNull(), // Price in Rappen
  iconUrl: text(),
});

export const extrasRelations = relations(extras, ({ many }) => ({
  extrasToItems: many(menuItemExtras),
}));

/**
 * Defines which extras can be applied to which items
 */
export const menuItemExtras = sqliteTable(
  'menu_item_extras',
  {
    itemId: int()
      .references(() => menuItems.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),
    extraId: int()
      .references(() => extras.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),
  },
  t => [primaryKey({ columns: [t.itemId, t.extraId] })]
);

export const menuItemExtrasRelations = relations(menuItemExtras, ({ one }) => ({
  menuItem: one(menuItems, { fields: [menuItemExtras.itemId], references: [menuItems.id] }),
  extra: one(extras, { fields: [menuItemExtras.extraId], references: [extras.id] }),
}));

/**
 * An order consisting of order items. It is associated to exactly one bill.
 */
export const orders = sqliteTable('orders', {
  orderNumber: int().primaryKey({ autoIncrement: true }),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  bill: one(bills),
  items: many(orderItems),
}));

/**
 * An order item contains one menu item and the amount ordered by the customer.
 */
export const orderItems = sqliteTable('order_item', {
  orderNumber: int()
    .notNull()
    .references(() => orders.orderNumber),
  menuItemId: int()
    .notNull()
    .references(() => menuItems.id),
  amount: int().notNull().default(1),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderNumber], references: [orders.orderNumber] }),
  menuItem: one(menuItems, { fields: [orderItems.menuItemId], references: [menuItems.id] }),
}));

/**
 * A single customer bill, processed by one user (staff), belonging to one order. Identified by the
 * receipt number (one bill <-> one receipt).
 */
export const bills = sqliteTable('bills', {
  receiptNumber: int().primaryKey({ autoIncrement: true }),
  orderNumber: int()
    .notNull()
    .unique()
    .references(() => orders.orderNumber),
  userId: int().references(() => users.id),
  terminalId: text().notNull().default('Chilbi Kasse #1'),
  openedAt: int({ mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  closedAt: int({ mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const billsRelations = relations(bills, ({ one, many }) => ({
  order: one(orders, { fields: [bills.orderNumber], references: [orders.orderNumber] }),
  payments: many(payments),
}));

/**
 * A payment of a certain type and a certain amount. All amounts in Rappen to avoid floating point
 * rounding errors. Tip amount is kept separately.
 */
export const payments = sqliteTable('payments', {
  id: int().primaryKey({ autoIncrement: true }),
  receiptNumber: int()
    .notNull()
    .references(() => bills.receiptNumber),
  method: text().notNull().$type<'cash' | 'twint' | 'coupon'>().default('cash'),
  amount: int().notNull(),
  tipAmount: int().notNull().default(0),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  bill: one(bills, { fields: [payments.receiptNumber], references: [bills.receiptNumber] }),
}));
