<script setup lang="ts">
import { Dialog, Button } from 'primevue';
import { ref } from 'vue';
import { useCartStore } from '../stores/cart';
import type { MenuCategory } from '../stores/menu';

type MenuItem = MenuCategory['menuItems'][number];

const cartStore = useCartStore();

const visible = ref(false);
const selectedItem = ref<MenuItem | null>(null);

function open(item: MenuItem) {
  selectedItem.value = item;
  visible.value = true;
}

function selectVariant(variant: MenuItem['variants'][number]) {
  if (!selectedItem.value) return;

  cartStore.addItem(selectedItem.value, variant, []);
  visible.value = false;
}

defineExpose({ open });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :dismissable-mask="true"
    modal
    header="Grösse wählen"
    :style="{ width: '90vw', maxWidth: '600px' }"
  >
    <div class="flex flex-row gap-3">
      <Button
        v-for="variant in selectedItem?.variants"
        :key="variant.id"
        class="flex-1 aspect-video"
        @click="selectVariant(variant)"
      >
        <div class="flex flex-col">
          <span>{{ variant.name }}</span>
          <span>CHF {{ (variant.price / 100).toFixed(2) }}</span>
        </div>
      </Button>
    </div>
  </Dialog>
</template>
