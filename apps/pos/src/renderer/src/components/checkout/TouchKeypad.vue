<script setup lang="ts">
import { Button } from 'primevue';

defineProps<{
  disabled?: boolean;
  showQuickCash?: boolean;
  exactAmountLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'digit', digit: number): void;
  (e: 'clear'): void;
  (e: 'backspace'): void;
  (e: 'quick-cash', amountInChf: number): void;
  (e: 'exact'): void;
}>();

const digits = [7, 8, 9, 4, 5, 6, 1, 2, 3];
const quickCashAmounts = [10, 20, 50, 100];

function keyClasses(disabled?: boolean, extra = '') {
  return [
    'h-full w-full rounded-xl border-2 border-gray-300 bg-white text-2xl font-semibold text-black',
    extra,
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:bg-gray-100',
  ];
}

function quickClasses(disabled?: boolean) {
  return [
    'h-10 w-full rounded-xl border-2 border-(--p-primary-color) bg-white text-lg font-semibold text-black',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:bg-gray-100',
  ];
}

function exactClasses(disabled?: boolean) {
  return [
    'h-12 w-full rounded-xl border-2 border-gray-300 bg-white text-base font-semibold text-black',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:bg-gray-100',
  ];
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-2">
    <div class="grid grid-cols-4 gap-2" :class="showQuickCash ? '' : 'invisible'">
      <Button
        v-for="amount in quickCashAmounts"
        :key="amount"
        :label="String(amount)"
        unstyled
        :disabled="disabled || !showQuickCash"
        :pt="{ root: { class: quickClasses(disabled || !showQuickCash) } }"
        @click="emit('quick-cash', amount)"
      />
    </div>

    <div class="grid flex-1 grid-cols-3 grid-rows-4 gap-2">
      <Button
        v-for="d in digits"
        :key="d"
        :label="String(d)"
        unstyled
        :disabled="disabled"
        :pt="{ root: { class: keyClasses(disabled) } }"
        @click="emit('digit', d)"
      />

      <Button
        label="C"
        unstyled
        :disabled="disabled"
        :pt="{ root: { class: keyClasses(disabled, '!text-red-600') } }"
        @click="emit('clear')"
      />

      <Button
        label="0"
        unstyled
        :disabled="disabled"
        :pt="{ root: { class: keyClasses(disabled) } }"
        @click="emit('digit', 0)"
      />

      <Button
        label="⌫"
        unstyled
        :disabled="disabled"
        :pt="{ root: { class: keyClasses(disabled) } }"
        @click="emit('backspace')"
      />
    </div>

    <Button
      :label="exactAmountLabel || 'Exakter Betrag'"
      unstyled
      :disabled="disabled || !showQuickCash"
      :pt="{ root: { class: exactClasses(disabled || !showQuickCash) } }"
      @click="emit('exact')"
    />
  </div>
</template>
