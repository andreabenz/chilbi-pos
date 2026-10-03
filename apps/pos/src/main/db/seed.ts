/**
 * @package
 *
 * Seeds the database with initial values.
 */

import { zip } from '@ceviwie/chilbi-shared/utils';
import { env } from '@root/env';
import { DrizzleQueryError, sql } from 'drizzle-orm';
import { db } from '.';
import * as schema from './schema';

////////////////
// TYPES      //
////////////////

type InitialSeedExtrasMap = Record<string, typeof schema.extras.$inferInsert>;

type InitialSeedExtras = Array<keyof typeof extrasMap>;

interface InitialSeedMenuItem {
  item: Omit<typeof schema.menuItems.$inferInsert, 'categoryId'>;
  variants: Array<Omit<typeof schema.menuItemVariants.$inferInsert, 'itemId'>>;
  extras?: InitialSeedExtras;
}

interface InitialSeedCategory {
  category: typeof schema.categories.$inferInsert;
  menuItems: Array<InitialSeedMenuItem>;
}

type InitialSeedData = Array<InitialSeedCategory>;

////////////////
// DATA       //
////////////////

// Categories and menu items with variants
const drinksVariants: NonNullable<InitialSeedMenuItem['variants']> = [
  { name: 'Klein (3 dL)', price: 300 },
  { name: 'Gross (5 dL)', price: 400 },
  { name: 'Flasche (1.5 L)', price: 1000 },
];

/**
 * Defines extras with a key. The key is only used at seeding time to match the extras between
 * various items. The actual ID is auto-generated when inserting into the database.
 */
const extrasMap = Object.freeze({
  pilze: { name: 'Pilze', price: 50, iconUrl: '/icons/pilze.png' },
  schinken: { name: 'Schinken', price: 100, iconUrl: '/icons/schinken.png' },
  salami: { name: 'Salami', price: 100, iconUrl: '/icons/salami.png' },
  oliven: { name: 'Oliven', price: 50, iconUrl: '/icons/oliven.png' },
  peperoni: { name: 'Peperoni', price: 50, iconUrl: '/icons/peperoni.png' },
  creme_fraiche: { name: 'Crème Fraîche', price: 50, iconUrl: '/icons/creme_fraiche.png' },
  speck: { name: 'Speck', price: 100, iconUrl: '/icons/speck.png' },
  zwiebeln: { name: 'Zwiebeln', price: 50, iconUrl: '/icons/zwiebeln.png' },
  zimt_und_zucker: { name: 'Zimt und Zucker', price: 50, iconUrl: '/icons/zimt_und_zucker.png' },
  nutella: { name: 'Nutella', price: 100, iconUrl: '/icons/nutella.png' },
  apfelmus: { name: 'Apfelmus', price: 100, iconUrl: '/icons/apfelmus.png' },
  banane: { name: 'Banane', price: 50, iconUrl: '/icons/banane.png' },
  kaese: { name: 'Käse', price: 100, iconUrl: '/icons/kaese.png' },
  rahm: { name: 'Rahm', price: 0, iconUrl: '/icons/rahm.png' },
  zucker: { name: 'Zucker', price: 0, iconUrl: '/icons/zucker.png' },
}) satisfies InitialSeedExtrasMap;

// Factory methods
/**
 * Creates a drinks initial seed object with default drinks variants
 *
 * @param name Name of the drink
 * @param options Overrides options
 * @returns Drink initial seed object
 */
const drink = (
  name: string,
  options?: {
    variants?: InitialSeedMenuItem['variants'];
    extras?: InitialSeedExtras;
    icon?: string;
  }
) =>
  ({
    item: { name, iconUrl: options?.icon },
    variants: options?.variants ?? drinksVariants,
    extras: options?.extras,
  }) satisfies InitialSeedMenuItem;

/**
 * Creates a pizza-like initial seed object with default extras.
 *
 * @param name Name of the pizza
 * @param options Additional options. Price is required.
 * @returns Pizza initial seed object
 */
const pizza = (
  name: string,
  options: {
    price: number;
    extras?: InitialSeedExtras;
    item?: Partial<InitialSeedMenuItem['item']>;
  }
) =>
  ({
    item: { name, iconUrl: '/icons/pizza.png', ...options.item },
    variants: [{ price: options.price }], // Single variant without name => Uses menuItem.name
    extras:
      options.extras ??
      ([
        'pilze',
        'schinken',
        'salami',
        'oliven',
        'peperoni',
        'creme_fraiche',
        'speck',
        'zwiebeln',
      ] satisfies InitialSeedExtras),
  }) satisfies InitialSeedMenuItem;

/**
 * Creates a pizza-like initial seed object with crepe extras.
 *
 * @param name Name of the crepe
 * @param options Additional options. Price is required.
 * @returns Crepe initial seed object
 */
const crepe = (name: string, options: { price: number; extras?: InitialSeedExtras }) =>
  pizza(name, {
    item: { iconUrl: '/icons/crepe.png' },
    extras: ['zimt_und_zucker', 'nutella', 'apfelmus', 'banane', 'schinken', 'kaese'],
    ...options,
  });

const initialSeedData: InitialSeedData = [
  {
    category: { name: 'Getränke' },
    menuItems: [
      drink('Mineral ohne', { icon: '/icons/water_still.png' }),
      drink('Mineral mit', { icon: '/icons/water_sparkling.png' }),
      drink('Eistee Zitrone', { icon: '/icons/ice_tea.png' }),
      drink('Eistee Pfirsich', { icon: '/icons/ice_tea.png' }),
      drink('Rivella rot', { icon: '/icons/rivella_red.png' }),
      drink('Coca-Cola', { icon: '/icons/coca_cola.png' }),
      drink('Coca-Cola Zero', { icon: '/icons/coca_cola_zero.png' }),
      drink('Apfelschorle', { icon: '/icons/schorle.png' }),
      drink('Citro', { icon: '/icons/citro.png' }),
      drink('Holunder-Melisse', { icon: '/icons/holunder_melisse.png' }),
      // drink('Orangina', { icon: '/icons/orangina.png' }),
      //drink('Sirup', { icon: '/icons/sirup.png' }),
      drink('Kaffee', {
        variants: [{ price: 300 }],
        extras: ['rahm', 'zucker'],
        icon: '/icons/coffee.png',
      }),
    ],
  },

  {
    category: { name: 'Pizza' },
    menuItems: [
      pizza('Pizza Simpel', { price: 1000 }),
      pizza('Pizza Waldboden', { price: 1200 }),
      pizza('Pizza Vegiboden', { price: 1150 }),
      pizza('Pizza Salami', { price: 1100 }),
      pizza('Pizza Brännt Bianca', { price: 1000 }),
      pizza('Pizza Brännt', { price: 1150 }),
      pizza('Pizza Vegibrännt', { price: 1050 }),
    ],
  },

  {
    category: { name: 'Crêpes' },
    menuItems: [
      crepe('Crêpe Natur', { price: 550 }),
      crepe('Crêpe Schinken und Käse', { price: 750 }),
      crepe('Crêpe Zimt und Zucker', { price: 600 }),
      crepe('Crêpe Nutella', { price: 650 }),
      crepe('Crêpe Nutella und Banane', { price: 700 }),
      crepe('Crêpe Apfelmus', { price: 650 }),
    ],
  },
];

////////////////
// MIGRATIONS //
////////////////

export async function seedInitial() {
  await db.run(sql`PRAGMA foreign_keys = OFF`);

  try {
    await db.transaction(async tx => {
      // 1. Truncate existing tables safely
      await tx.delete(schema.orderItemExtras);
      await tx.delete(schema.orderItems);
      await tx.delete(schema.payments);
      await tx.delete(schema.bills);
      await tx.delete(schema.orders);
      await tx.delete(schema.menuItemExtras);
      await tx.delete(schema.menuItemVariants);
      await tx.delete(schema.menuItems);
      await tx.delete(schema.categories);
      await tx.delete(schema.extras);

      try {
        await tx.run(sql`DELETE FROM sqlite_sequence;`);
      } catch {
        // Ignored if sqlite_sequence does not exist
      }

      // 2. Insert Extras
      const insertedExtras = await tx
        .insert(schema.extras)
        .values(Object.values(extrasMap))
        .returning({ id: schema.extras.id });

      const extraKeyToId = Object.fromEntries(
        zip(
          Object.keys(extrasMap),
          insertedExtras.map(x => x.id)
        )
      );

      // 3. Insert Categories and Items sequentially
      for (const { category, menuItems } of initialSeedData) {
        const [{ id: categoryId }] = await tx
          .insert(schema.categories)
          .values(category)
          .returning({ id: schema.categories.id });

        for (const { item, variants, extras } of menuItems) {
          const [{ id: itemId }] = await tx
            .insert(schema.menuItems)
            .values({ ...item, categoryId })
            .returning({ id: schema.menuItems.id });

          await tx
            .insert(schema.menuItemVariants)
            .values(variants.map(variant => ({ ...variant, itemId })));

          if (extras && extras.length > 0) {
            await tx
              .insert(schema.menuItemExtras)
              .values(extras.map(extraKey => ({ extraId: extraKeyToId[extraKey], itemId })));
          }
        }
      }
    });
  } finally {
    await db.run(sql`PRAGMA foreign_keys = ON`);
  }
}

export async function seedDev() {
  // Nothing for now
}

export async function seedAll() {
  const seedPromises = [
    async () => {
      console.info('Seeding database...');
      await seedInitial();
      console.info('Initial seed done.');
    },
  ];

  if (env.NODE_ENV === 'development') {
    seedPromises.push(async () => {
      console.info('Seeding development entities');
      await seedDev();
      console.info('Development seed done.');
    });
  }

  await Promise.all(seedPromises.map(fn => fn())).catch(err => {
    if (err instanceof DrizzleQueryError) {
      console.error('Failed to run SQL:', err.name, err.message);
      console.table({ Cause: err.cause, Query: err.query, Params: err.params });
    } else {
      console.error('Error running seed script:', err);
    }
  });
}
