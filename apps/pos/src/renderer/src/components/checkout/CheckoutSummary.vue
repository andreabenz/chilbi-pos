<script setup lang="ts">
import { Divider } from 'primevue';

defineProps<{
  discountAmount: number;
  cardSurcharge: number;
  tipAmount: number;
  totalDueWithTip: number;
}>();

function chf(value: number) {
  return (value / 100).toFixed(2);
}
</script>

<template>
  <div class="flex flex-col">
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="rounded-xl border border-gray-200 bg-gray-50 py-1">
        <div class="text-xs text-gray-600">Abzug</div>
        <div
          class="text-sm font-semibold"
          :class="discountAmount > 0 ? 'text-emerald-700' : 'text-gray-500'"
        >
          − CHF {{ chf(discountAmount) }}
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-gray-50 py-1">
        <div class="text-xs text-gray-600">Kartenzuschlag</div>
        <div
          class="text-sm font-semibold"
          :class="cardSurcharge > 0 ? 'text-black' : 'text-gray-500'"
        >
          + CHF {{ chf(cardSurcharge) }}
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-gray-50 py-1">
        <div class="text-xs text-gray-600">Trinkgeld</div>
        <div
          class="text-sm font-semibold"
          :class="tipAmount > 0 ? 'text-emerald-700' : 'text-gray-500'"
        >
          + CHF {{ chf(tipAmount) }}
        </div>
      </div>
    </div>

    <Divider class="!my-1" />

    <div class="flex items-center justify-between">
      <span class="text-lg font-semibold">Zu bezahlen</span>
      <span class="text-3xl font-bold">CHF {{ chf(totalDueWithTip) }}</span>
    </div>
  </div>
</template>
