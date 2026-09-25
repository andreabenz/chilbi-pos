<script setup lang="ts">
import { Splitter, SplitterPanel, ConfirmDialog } from 'primevue';
import CategoryBar from '../components/CategoryBar.vue';
import ItemGrid from '../components/ItemGrid.vue';
import { onMounted } from 'vue';
import { useMenuStore } from '../stores/menu';
import { ref } from 'vue';
import VariantSelectionDialog from '@/components/VariantSelectionDialog.vue';
import type { MenuCategory } from '../stores/menu';
import CartPanel from '@/components/CartPanel.vue';
import ItemExtrasDialog from '@/components/ItemExtrasDialog.vue';
import type { CartItem } from '@/stores/cart.ts';
type MenuItem = MenuCategory['menuItems'][number];

const menuStore = useMenuStore();

const variantDialogRef = ref<InstanceType<typeof VariantSelectionDialog> | null>(null);
const extrasDialogRef = ref<InstanceType<typeof ItemExtrasDialog> | null>(null);

function handleSelectVariant(item: MenuItem) {
  variantDialogRef.value?.open(item);
}

function handleEditExtras(item: CartItem) {
  extrasDialogRef.value?.open(item);
}

onMounted(async () => {
  await menuStore.loadMenu();
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
      <CartPanel @edit-extras="handleEditExtras" />
    </SplitterPanel>
  </Splitter>

  <VariantSelectionDialog ref="variantDialogRef" />
  <ItemExtrasDialog ref="extrasDialogRef" />
  <ConfirmDialog />
</template>
