<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { Button, Dialog, Divider } from 'primevue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

const visible = ref(false);
const orderNumber = ref<number | null>(null);
const countdown = ref(3);

let timer: ReturnType<typeof setInterval> | null = null;

function show(num: number) {
  orderNumber.value = num;
  countdown.value = 3;
  visible.value = true;

  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      closeNow();
    }
  }, 1000);
}

function closeNow() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  visible.value = false;
  cartStore.clearCart();
}

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});

defineExpose({ show });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="false"
    :dismissable-mask="false"
    :pt="{ content: { class: '!px-3 !py-3' } }"
    :style="{
      width: '90vw',
      maxWidth: '400px',
    }"
  >
    <div class="flex flex-col items-center gap-3 text-center text-black">
      <img src="/icons/check.png" alt="Erfolgreich" class="h-16 w-16 object-contain" />

      <div class="text-2xl font-bold">Bestellung {{ orderNumber }}</div>

      <div class="text-base">Bestellung erfolgreich erstellt</div>

      <Divider class="!my-1 w-full" />

      <div class="text-sm">Schliesst in {{ countdown }}s...</div>

      <Button label="Nächste Bestellung" class="!rounded-xl" @click="closeNow" />
    </div>
  </Dialog>
</template>
