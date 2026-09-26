import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface SelectedExtra {
  id: number;
  name: string;
  price: number;
  iconUrl: string | null;
}

export interface CartItem {
  id: string;
  menuItemId: number;
  name: string;
  categoryName?: string;
  variant: {
    id: number;
    name: string | null;
    price: number;
  };
  extras: SelectedExtra[];
  quantity: number;
  unitPrice: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  function generateCartItemId(menuItemId: number, variantId: number, extraIds: number[]): string {
    const sortedExtraIds = [...extraIds].sort((a, b) => a - b);

    return `${menuItemId}-${variantId}-${sortedExtraIds.join('-')}`;
  }

  function addItem(
    menuItem: { id: number; name: string; categoryName?: string },
    variant: { id: number; name: string | null; price: number },
    extras: SelectedExtra[] = []
  ) {
    const extrasPrice = extras.reduce((sum, extra) => sum + extra.price, 0);

    const unitPrice = variant.price + extrasPrice;

    const extraIds = extras.map(extra => extra.id);
    const lineId = generateCartItemId(menuItem.id, variant.id, extraIds);

    const existingItem = items.value.find(item => item.id === lineId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({
        id: lineId,
        menuItemId: menuItem.id,
        name: menuItem.name,
        categoryName: menuItem.categoryName,
        variant: {
          id: variant.id,
          name: variant.name,
          price: variant.price,
        },
        extras: extras,
        quantity: 1,
        unitPrice: unitPrice,
      });
    }
  }

  function updateQuantity(cartItemId: string, delta: number) {
    const index = items.value.findIndex(item => item.id === cartItemId);

    const item = items.value[index];
    if (!item) return;

    if (item.quantity + delta < 1) {
      items.value.splice(index, 1);
    } else {
      item.quantity += delta;
    }
  }

  function removeItem(cartItemId: string) {
    items.value = items.value.filter(item => item.id !== cartItemId);
  }

  function clearCart() {
    items.value = [];
  }

  const subTotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  );

  const totalItemsCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));

  const isEmpty = computed(() => items.value.length === 0);

  const couponDiscount = computed(() => {
    const drinkPrices = items.value
      .filter(item => item.categoryName === 'Getränke')
      .map(item => item.unitPrice);

    const foodPrices = items.value
      .filter(item => item.categoryName !== 'Getränke')
      .map(item => item.unitPrice);

    const maxDrink = drinkPrices.length > 0 ? Math.max(...drinkPrices) : 0;
    const maxFood = foodPrices.length > 0 ? Math.max(...foodPrices) : 0;

    return maxDrink + maxFood;
  });

  const voucherDiscount = computed(() => {
    const pizzaPrices = items.value
      .filter(item => item.categoryName === 'Pizza')
      .map(item => item.unitPrice);

    return pizzaPrices.length > 0 ? Math.max(...pizzaPrices) : 0;
  });

  function updateItemExtras(cartItemId: string, newExtras: SelectedExtra[]) {
    const index = items.value.findIndex(item => item.id === cartItemId);
    if (index === -1) return;

    const currentItem = items.value[index];
    if (!currentItem) return;

    const newExtraIds = newExtras.map(e => e.id);
    const newId = generateCartItemId(currentItem.menuItemId, currentItem.variant.id, newExtraIds);
    const newUnitPrice = currentItem.variant.price + newExtras.reduce((sum, e) => sum + e.price, 0);

    const existingOtherIndex = items.value.findIndex(item => item.id === newId);

    if (existingOtherIndex !== -1 && existingOtherIndex !== index) {
      const existingItem = items.value[existingOtherIndex];

      if (!existingItem) return;

      existingItem.quantity += currentItem.quantity;
      items.value.splice(index, 1);
    } else {
      currentItem.id = newId;
      currentItem.extras = [...newExtras];
      currentItem.unitPrice = newUnitPrice;
    }
  }

  return {
    items,
    subTotal,
    totalItemsCount,
    isEmpty,
    couponDiscount,
    voucherDiscount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    updateItemExtras,
  };
});
