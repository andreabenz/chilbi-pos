<script setup lang="ts">
import { Splitter, SplitterPanel, ConfirmDialog } from 'primevue';
import CategoryBar from '../components/itemSelection/CategoryBar.vue';
import ItemGrid from '../components/itemSelection/ItemGrid.vue';
import { onMounted } from 'vue';
import { useMenuStore } from '../stores/menu';
import { ref } from 'vue';
import VariantSelectionDialog from '../components/itemSelection/VariantSelectionDialog.vue';
import type { MenuCategory } from '../stores/menu';
import CartPanel from '../components/cart/CartPanel.vue';
import ItemExtrasDialog from '../components/itemSelection/ItemExtrasDialog.vue';
import type { CartItem } from '@/stores/cart.ts';
type MenuItem = MenuCategory['menuItems'][number];
import CheckoutDialog from '../components/checkout/CheckoutDialog.vue';
import OrderSuccessDialog from '@/components/OrderSuccessDialog.vue';
import { useCounterStore } from '@/stores/counter';

const menuStore = useMenuStore();
const counterStore = useCounterStore();

const variantDialogRef = ref<InstanceType<typeof VariantSelectionDialog> | null>(null);
const extrasDialogRef = ref<InstanceType<typeof ItemExtrasDialog> | null>(null);
const checkoutDialogRef = ref<InstanceType<typeof CheckoutDialog> | null>(null);
const successDialogRef = ref<InstanceType<typeof OrderSuccessDialog> | null>(null);

function handleSelectVariant(item: MenuItem) {
  variantDialogRef.value?.open(item, menuStore.currentCategory?.name);
}

function handleEditExtras(item: CartItem) {
  extrasDialogRef.value?.open(item);
}

function handleCheckout() {
  checkoutDialogRef.value?.open();
}

function handleOrderCreated(result: { orderNumber: number; receiptNumber: number }) {
  successDialogRef.value?.show(result.orderNumber);
  counterStore.setCount(result.orderNumber + 1);
}

onMounted(async () => {
  await Promise.all([menuStore.loadMenu(), counterStore.initFromDb()]);
  console.log('Categories in store:', menuStore.categories);
  const firstCategory = menuStore.categories[0];
  if (firstCategory && !menuStore.selectedCategoryId) {
    menuStore.setSelectedCategory(firstCategory.id);
  }
});
</script>

<template>
  <Splitter class="h-full border-none">
    <SplitterPanel class="flex flex-col h-full overflow-hidden">
      <CategoryBar />
      <ItemGrid @select-variant="handleSelectVariant" />
    </SplitterPanel>

    <SplitterPanel
      :size="30"
      :min-size="25"
      class="flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden"
    >
      <CartPanel @edit-extras="handleEditExtras" @checkout="handleCheckout" />
    </SplitterPanel>
  </Splitter>

  <VariantSelectionDialog ref="variantDialogRef" />
  <ItemExtrasDialog ref="extrasDialogRef" />
  <CheckoutDialog ref="checkoutDialogRef" @order-created="handleOrderCreated" />
  <OrderSuccessDialog ref="successDialogRef" @order-created="handleOrderCreated" />
  <ConfirmDialog />
</template>
