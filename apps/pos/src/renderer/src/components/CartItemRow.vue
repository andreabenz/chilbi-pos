<script setup lang="ts">
import { Button } from 'primevue';
import type { CartItem } from '../stores/cart';
import { useCartStore } from '../stores/cart';
import { useMenuStore } from '../stores/menu';

const cartStore = useCartStore();
const menuStore = useMenuStore();

defineProps<{ item: CartItem }>();
const emit = defineEmits<{ (e: 'edit-extras', item: CartItem): void }>();
</script>

<template>
  <div class="py-2 border-b">
    <div class="flex justify-between items-center">
      <div class="min-w-0">
        <span class="font-bold text-sm text-black">
          {{ item.name }}
        </span>
        <span v-if="item.variant?.name" class="text-sm text-gray-500 ml-1">
          {{ item.variant.name }}
        </span>
      </div>
      <span class="font-bold text-sm text-black shrink-0 ml-2">
        CHF {{ ((item.unitPrice * item.quantity) / 100).toFixed(2) }}
      </span>
    </div>
    <div class="flex justify-between items-center mt-0.5">
      <div
        v-if="
          menuStore.categories
            .flatMap(category => category.menuItems)
            .find(menuItem => menuItem.id === item.menuItemId)?.itemsToExtras.length
        "
        class="flex items-center min-w-0"
      >
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          text
          size="small"
          class="w-6! h-6! shrink-0"
          @click="emit('edit-extras', item)"
        />
        <span v-if="item.extras.length > 0" class="text-xs text-gray-800 truncate">
          Extra: {{ item.extras.map(extra => extra.name).join(' · ') }}
        </span>
        <span v-else class="text-xs text-gray-400"> Extras hinzufügen </span>
      </div>
      <div v-else></div>
      <div class="flex items-center shrink-0">
        <Button
          icon="pi pi-minus"
          text
          size="small"
          class="w-7! h-7!"
          @click="cartStore.updateQuantity(item.id, -1)"
        />
        <span class="font-bold text-sm w-6 text-center">
          {{ item.quantity }}
        </span>
        <Button
          icon="pi pi-plus"
          text
          size="small"
          class="w-7! h-7!"
          @click="cartStore.updateQuantity(item.id, 1)"
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          size="small"
          class="w-7! h-7!"
          @click="cartStore.removeItem(item.id)"
        />
      </div>
    </div>
  </div>
</template>
