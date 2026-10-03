<script setup lang="ts">
import { ToggleButton } from 'primevue';

export type DiscountType = 'none' | 'coupon' | 'voucher' | 'helfer';
export type PaymentMethod = 'cash' | 'card';

defineProps<{
  discountType: DiscountType;
  paymentMethod: PaymentMethod;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:discountType', type: DiscountType): void;
  (e: 'update:paymentMethod', method: PaymentMethod): void;
}>();

function toggleDiscount(type: DiscountType, current: DiscountType) {
  emit('update:discountType', current === type ? 'none' : type);
}

function tileClasses(selected: boolean, disabled: boolean | undefined, sizeClass: string) {
  return [
    'relative flex-1 min-w-0 rounded-2xl bg-white border-3 border-(--p-primary-color) p-1.5 cursor-pointer transition-all select-none',
    sizeClass,
    selected ? 'ring-3 ring-(--p-primary-color) ring-inset' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  ];
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <ToggleButton
        :model-value="discountType === 'coupon'"
        :disabled="disabled"
        unstyled
        :pt="{
          root: { class: tileClasses(discountType === 'coupon', disabled, 'aspect-square') },
          content: { class: 'flex h-full w-full flex-col items-center justify-center gap-0' },
        }"
        @click="toggleDiscount('coupon', discountType)"
      >
        <img
          src="/icons/coupons.png"
          alt="Gutschein Blau"
          class="h-[4rem] w-[4rem] object-contain"
        />

        <span class="text-base font-bold text-center text-black leading-tight">
          Gutschein Blau
        </span>

        <div
          v-if="discountType === 'coupon'"
          class="absolute top-2 left-2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
        >
          <i class="pi pi-check text-white text-xs" />
        </div>
      </ToggleButton>

      <ToggleButton
        :model-value="discountType === 'voucher'"
        :disabled="disabled"
        unstyled
        :pt="{
          root: { class: tileClasses(discountType === 'voucher', disabled, 'aspect-square') },
          content: { class: 'flex h-full w-full flex-col items-center justify-center gap-0' },
        }"
        @click="toggleDiscount('voucher', discountType)"
      >
        <img
          src="/icons/coupons.png"
          alt="Gutschein Gelb"
          class="h-[4rem] w-[4rem] object-contain"
        />

        <span class="text-base font-bold text-center text-black leading-tight">
          Gutschein Gelb
        </span>

        <div
          v-if="discountType === 'voucher'"
          class="absolute top-2 left-2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
        >
          <i class="pi pi-check text-white text-xs" />
        </div>
      </ToggleButton>

      <ToggleButton
        :model-value="discountType === 'helfer'"
        :disabled="disabled"
        unstyled
        :pt="{
          root: { class: tileClasses(discountType === 'helfer', disabled, 'aspect-square') },
          content: { class: 'flex h-full w-full flex-col items-center justify-center gap-0' },
        }"
        @click="toggleDiscount('helfer', discountType)"
      >
        <img src="/icons/gift.png" alt="Helfer" class="h-[4rem] w-[4rem] object-contain" />

        <span class="text-base font-bold text-center text-black leading-tight">Helfer</span>

        <div
          v-if="discountType === 'helfer'"
          class="absolute top-2 left-2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
        >
          <i class="pi pi-check text-white text-xs" />
        </div>
      </ToggleButton>
    </div>

    <div class="flex gap-2">
      <ToggleButton
        :model-value="paymentMethod === 'cash'"
        :disabled="disabled"
        unstyled
        :pt="{
          root: { class: tileClasses(paymentMethod === 'cash', disabled, 'h-40') },
          content: { class: 'flex h-full w-full flex-col items-center justify-center gap-1' },
        }"
        @click="emit('update:paymentMethod', 'cash')"
      >
        <img src="/icons/money.png" alt="Bargeld" class="h-24 w-24 object-contain" />

        <span class="text-lg font-bold text-center text-black">Bargeld</span>

        <div
          v-if="paymentMethod === 'cash'"
          class="absolute top-2 left-2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
        >
          <i class="pi pi-check text-white text-xs" />
        </div>
      </ToggleButton>

      <ToggleButton
        :model-value="paymentMethod === 'card'"
        :disabled="disabled"
        unstyled
        :pt="{
          root: { class: tileClasses(paymentMethod === 'card', disabled, 'h-40') },
          content: { class: 'flex h-full w-full flex-col items-center justify-center gap-1' },
        }"
        @click="emit('update:paymentMethod', 'card')"
      >
        <img src="/icons/debit-card.png" alt="Karte" class="h-24 w-24 object-contain" />

        <span class="text-lg font-bold text-center text-black">Karte (+0.50)</span>

        <div
          v-if="paymentMethod === 'card'"
          class="absolute top-2 left-2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
        >
          <i class="pi pi-check text-white text-xs" />
        </div>
      </ToggleButton>
    </div>
  </div>
</template>
