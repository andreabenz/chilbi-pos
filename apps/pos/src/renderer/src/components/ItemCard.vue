<script setup lang="ts">
import { Card } from 'primevue';
import { computed } from 'vue';
import { useCartStore } from '../stores/cart';
import type { MenuCategory } from '../stores/menu';

type MenuItem = MenuCategory['menuItems'][number];

const props = defineProps<{
  item: MenuItem;
  categoryName?: string;
}>();

const cartStore = useCartStore();

const isMultiVariant = computed(() => props.item.variants.length > 1);

const minPrice = computed(() => {
  if (!props.item.variants || props.item.variants.length === 0) return 0;
  return Math.min(...props.item.variants.map(variant => variant.price));
});

const displayPrice = computed(() => {
  return (minPrice.value / 100).toFixed(2);
});

function handleCardClick() {
  if (!isMultiVariant.value && props.item.variants[0]) {
    cartStore.addItem(
      { id: props.item.id, name: props.item.name, categoryName: props.categoryName },
      props.item.variants[0],
      []
    );
  } else {
    // variant selection dialog
  }
}
</script>

<template>
  <Card
    class="cursor-pointer transition-all active:scale-[0.98] border-(--p-primary-color)! border-3 rounded-2xl! shadow-none! overflow-hidden"
    @click="handleCardClick"
  >
    <template #content>
      <div class="flex justify-center items-center">
        <img
          v-if="item.iconUrl"
          :src="item.iconUrl"
          :alt="item.name"
          class="w-20 h-20 object-contain"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-center text-center pt-0! pb-2!">
        <span class="text-base font-bold text-gray-800 leading-snug">
          {{ item.name.replace(/^(Crêpe|Pizza)\s/, '').replace(/ und /g, '/') }}
        </span>
      </div>
    </template>
  </Card>
</template>
