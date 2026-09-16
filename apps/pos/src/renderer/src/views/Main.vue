<script setup lang="ts">
import { Splitter, SplitterPanel } from 'primevue';
import CategoryBar from '../components/CategoryBar.vue';
import ItemGrid from '../components/ItemGrid.vue';
import { onMounted } from 'vue';
import { useMenuStore } from '../stores/menu';
import { ref } from 'vue';
import VariantSelectionDialog from '@/components/VariantSelectionDialog.vue';
import type { MenuCategory } from '../stores/menu';

type MenuItem = MenuCategory['menuItems'][number];

const menuStore = useMenuStore();
const variantDialogRef = ref();

function handleSelectVariant(item: MenuItem) {
  variantDialogRef.value.open(item);
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
      <VariantSelectionDialog ref="variantDialogRef" />
    </SplitterPanel>

    <SplitterPanel
      :size="30"
      :min-size="25"
      class="flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden"
    >
      <div class="p-4 text-gray-500 font-medium">Warenkorb &amp; Kasse</div>
    </SplitterPanel>
  </Splitter>
</template>
