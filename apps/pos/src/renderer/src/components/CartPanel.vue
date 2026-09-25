<script setup lang="ts">
import { Button } from 'primevue';
import { useConfirm } from 'primevue/useconfirm';
import { useCartStore } from '../stores/cart';
import type { CartItem } from '../stores/cart';
import CartItemRow from '@/components/CartItemRow.vue';

const cartStore = useCartStore();
const confirm = useConfirm();

const emit = defineEmits<{
  (e: 'edit-extras', item: CartItem): void;
  (e: 'checkout'): void;
}>();

function handleClearCart() {
  confirm.require({
    message: 'Möchtest du den Warenkorb wirklich leeren?',
    header: 'Warenkorb leeren',
    rejectProps: {
      label: 'Abbrechen',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Leeren',
      severity: 'danger',
    },
    accept: () => {
      cartStore.clearCart();
    },
  });
}
</script>

<template>
  <div class="flex h-full flex-col bg-white">
    <div class="border-b border-gray-200 px-4 py-3">
      <h2 class="text-lg font-bold text-black">Warenkorb</h2>
    </div>
    <div class="flex-1 overflow-y-auto p-3">
      <div
        v-if="cartStore.isEmpty"
        class="flex h-full min-h-[200px] items-center justify-center text-sm font-medium text-gray-500"
      >
        Warenkorb ist leer
      </div>
      <div v-else class="flex flex-col gap-3">
        <CartItemRow
          v-for="item in cartStore.items"
          :key="item.id"
          :item="item"
          @edit-extras="item => emit('edit-extras', item)"
        />
      </div>
    </div>
    <div class="border-t border-gray-200 p-3">
      <div class="mb-3 flex items-center justify-between px-1">
        <span class="text-sm font-medium text-gray-600"> Zwischentotal </span>

        <span class="text-lg font-bold text-black">
          CHF {{ (cartStore.subTotal / 100).toFixed(2) }}
        </span>
      </div>
      <div class="flex gap-2">
        <Button
          label="Leeren"
          severity="danger"
          variant="outlined"
          class="rounded-xl!"
          :disabled="cartStore.isEmpty"
          @click="handleClearCart"
        />
        <Button
          label="Zur Kasse"
          severity="primary"
          size="large"
          class="flex-1 rounded-xl!"
          :disabled="cartStore.isEmpty"
        />
      </div>
    </div>
  </div>
</template>
