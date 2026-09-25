<script setup lang="ts">
import { Dialog, Button, ToggleButton } from 'primevue';
import { ref } from 'vue';
import { useCartStore } from '../stores/cart';
import { useMenuStore } from '../stores/menu';
import type { CartItem, SelectedExtra } from '../stores/cart';

const cartStore = useCartStore();
const menuStore = useMenuStore();

const visible = ref(false);

const editingCartItem = ref<CartItem | null>(null);

const availableExtras = ref<SelectedExtra[]>([]);

const selectedExtraIds = ref<number[]>([]);

function open(cartItem: CartItem) {
  selectedExtraIds.value = cartItem.extras.map(e => e.id);

  const selectedItem = menuStore.categories
    .flatMap(category => category.menuItems)
    .find(item => item.id === cartItem.menuItemId);

  availableExtras.value = selectedItem?.itemsToExtras.map(x => x.extra) ?? [];
  editingCartItem.value = cartItem;

  visible.value = true;
}

function saveChanges() {
  if (!editingCartItem.value) return;

  const selectedExtras = availableExtras.value.filter(e => selectedExtraIds.value.includes(e.id));
  cartStore.updateItemExtras(editingCartItem.value.id, selectedExtras);

  visible.value = false;
}

function toggleExtra(extraId: number) {
  if (selectedExtraIds.value.includes(extraId)) {
    selectedExtraIds.value = selectedExtraIds.value.filter(id => id !== extraId);
  } else {
    selectedExtraIds.value.push(extraId);
  }
}

function isSelected(extraId: number) {
  return selectedExtraIds.value.includes(extraId);
}

defineExpose({ open });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :dismissable-mask="true"
    modal
    header="Extras wählen"
    :style="{ width: '90vw', maxWidth: '600px' }"
    class="text-black!"
  >
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <ToggleButton
        v-for="extra in availableExtras"
        :key="extra.id"
        :model-value="isSelected(extra.id)"
        unstyled
        :pt="{
          root: {
            class: [
              'relative aspect-square rounded-2xl bg-white border-(--p-primary-color) p-1.5 cursor-pointer transition-all',
              isSelected(extra.id) ? 'border-6' : 'border-3',
            ],
          },
          content: {
            class: 'flex h-full w-full flex-col items-center justify-center gap-1',
          },
        }"
        @update:model-value="toggleExtra(extra.id)"
      >
        <img
          v-if="extra.iconUrl"
          :src="extra.iconUrl"
          :alt="extra.name"
          class="h-12 w-12 object-contain"
        />
        <span class="text-sm font-bold text-center text-black">
          {{ extra.name }}
        </span>
        <div
          v-if="isSelected(extra.id)"
          class="absolute top-1 left-1 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
        >
          <i class="pi pi-check text-white text-xs" />
        </div>
      </ToggleButton>
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <Button
        label="Abbrechen"
        variant="outlined"
        class="border-(--p-primary-color)! text-black!"
        @click="visible = false"
      />
      <Button label="Speichern" @click="saveChanges" />
    </div>
  </Dialog>
</template>
