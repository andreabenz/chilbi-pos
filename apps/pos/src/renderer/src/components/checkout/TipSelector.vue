<script setup lang="ts">
import { computed } from 'vue';
import { ToggleButton } from 'primevue';

const props = defineProps<{
  paymentMethod: 'cash' | 'card' | 'voucher' | 'coupon' | 'helfer';
  isNoChangeTip: boolean;
  isCustomCardTip: boolean;
  tipAmount: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-no-change'): void;
  (e: 'toggle-custom-card'): void;
}>();

const isCash = computed(() => props.paymentMethod === 'cash');
const isCard = computed(() => props.paymentMethod === 'card');

const isActive = computed(() => (isCash.value ? props.isNoChangeTip : props.isCustomCardTip));

const label = computed(() => {
  const amount = `CHF ${(props.tipAmount / 100).toFixed(2)}`;

  if (isCash.value) {
    return props.isNoChangeTip && props.tipAmount > 0
      ? `Stimmt so: ${amount}`
      : 'Stimmt so (kein Rückgeld)';
  }

  return props.isCustomCardTip && props.tipAmount > 0
    ? `Trinkgeld: ${amount}`
    : 'Trinkgeld eingeben';
});

const icon = computed(() => (isCash.value ? 'pi pi-heart' : 'pi pi-plus'));

function onClick() {
  if (isCash.value) emit('toggle-no-change');
  else emit('toggle-custom-card');
}
</script>

<template>
  <ToggleButton
    v-if="isCash || isCard"
    :model-value="isActive"
    :disabled="disabled"
    unstyled
    :pt="{
      root: {
        class: [
          'relative flex h-11 w-full items-center justify-center rounded-2xl bg-white border-3 border-(--p-primary-color) px-3 cursor-pointer transition-all select-none',
          isActive ? 'ring-3 ring-(--p-primary-color) ring-inset' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ],
      },
      content: { class: 'flex items-center justify-center gap-2' },
    }"
    @click="onClick"
  >
    <i :class="icon" class="text-lg text-(--p-primary-color)" />
    <span class="text-base font-bold text-black leading-tight">{{ label }}</span>

    <div
      v-if="isActive"
      class="absolute top-1/2 left-2 -translate-y-1/2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
    >
      <i class="pi pi-check text-white text-xs" />
    </div>
  </ToggleButton>
</template>
