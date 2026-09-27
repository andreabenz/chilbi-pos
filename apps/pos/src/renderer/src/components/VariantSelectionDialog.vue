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
    :style="{ width: 'auto', maxWidth: '90vw' }"
    class="text-black!"
  >
    <div class="flex flex-row gap-3">
      <Button
        v-for="variant in selectedItem?.variants"
        :key="variant.id"
        unstyled
        :pt="{
          root: {
            class: [
              'relative w-32 aspect-square rounded-2xl bg-white border-(--p-primary-color) p-1 cursor-pointer transition-all border-3',
            ],
          },
          content: { class: 'flex h-full w-full flex-col items-center justify-center gap-0' },
        }"
        @click="selectVariant(variant)"
      >
        <span class="text-base font-bold text-center text-black"> {{ variant.name }} </span>
        <span class="text-base text-center text-black">
          CHF {{ (variant.price / 100).toFixed(2) }}
        </span>
      </Button>
    </div>
  </Dialog>
</template>
