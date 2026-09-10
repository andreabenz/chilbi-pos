import { db } from '../index';

export interface MenuCategoryWithItems {
  id: number;
  name: string;
  menuItems: {
    id: number;
    name: string;
    iconUrl: string | null;
    variants: {
      id: number;
      name: string | null;
      price: number;
    }[];
    itemsToExtras: {
      extra: {
        id: number;
        name: string;
        price: number;
        iconUrl: string | null;
      };
    }[];
  }[];
}

/**
 * Fetches all categories with their menu items, variants, and extras
 */
export async function getFullMenu(): Promise<MenuCategoryWithItems[]> {
  return db.query.categories.findMany({
    with: {
      menuItems: {
        with: {
          variants: true,
          itemsToExtras: {
            with: {
              extra: true,
            },
          },
        },
      },
    },
  });
}
