<script setup lang="ts">
import { ref, computed } from 'vue';
import { Dialog, Button } from 'primevue';
import { useCartStore } from '../../stores/cart.ts';
import { useErrorStore } from '../../stores/error';
import PaymentMethodSelector, {
  type DiscountType,
  type PaymentMethod,
} from './PaymentMethodSelector.vue';
import TipSelector from './TipSelector.vue';
import CheckoutSummary from './CheckoutSummary.vue';
import TouchKeypad from './TouchKeypad.vue';

const cartStore = useCartStore();
const errorStore = useErrorStore();

const visible = ref(false);
const isSubmitting = ref(false);

const discountType = ref<DiscountType>('none');
const paymentMethod = ref<PaymentMethod>('cash');
const keypadTarget = ref<'given' | 'tip'>('given');

const givenAmount = ref(0);
const customTipAmount = ref(0);

const isNoChangeTip = ref(false);
const isCustomCardTip = ref(false);

const CARD_SURCHARGE = 50;

const discountAmount = computed(() => {
  if (discountType.value === 'helfer') return cartStore.subTotal;
  if (discountType.value === 'coupon') return cartStore.couponDiscount;
  if (discountType.value === 'voucher') return cartStore.voucherDiscount;
  return 0;
});

const baseDue = computed(() => Math.max(0, cartStore.subTotal - discountAmount.value));

const cardSurcharge = computed(() => {
  return paymentMethod.value === 'card' && baseDue.value > 0 ? CARD_SURCHARGE : 0;
});

const totalDue = computed(() => baseDue.value + cardSurcharge.value);

const tipAmount = computed(() => {
  if (paymentMethod.value === 'cash') {
    return isNoChangeTip.value ? Math.max(0, givenAmount.value - totalDue.value) : 0;
  }
  if (paymentMethod.value === 'card') {
    return isCustomCardTip.value ? customTipAmount.value : 0;
  }
  return 0;
});

const totalDueWithTip = computed(() => totalDue.value + tipAmount.value);

const changeDue = computed(() => {
  if (paymentMethod.value !== 'cash') return 0;
  if (isNoChangeTip.value) return 0;
  return Math.max(0, givenAmount.value - totalDue.value);
});

const isValidCashAmount = computed(() => givenAmount.value >= totalDue.value);
const missingAmount = computed(() => Math.max(0, totalDue.value - givenAmount.value));

const isOrderValid = computed(() => {
  if (totalDue.value === 0) return true;
  if (paymentMethod.value === 'card') return true;
  if (paymentMethod.value === 'cash') return isValidCashAmount.value;
  return false;
});

const isKeypadLocked = computed(() => paymentMethod.value !== 'cash' && !isCustomCardTip.value);

function handleDigit(d: number) {
  if (isSubmitting.value) return;
  if (keypadTarget.value === 'given') {
    if (givenAmount.value > 999_999) return;
    givenAmount.value = givenAmount.value * 10 + d;
  } else if (keypadTarget.value === 'tip') {
    if (customTipAmount.value > 999_999) return;
    customTipAmount.value = customTipAmount.value * 10 + d;
  }
}

function handleClear() {
  if (isSubmitting.value) return;
  if (keypadTarget.value === 'given') givenAmount.value = 0;
  if (keypadTarget.value === 'tip') customTipAmount.value = 0;
}

function handleBackspace() {
  if (isSubmitting.value) return;
  if (keypadTarget.value === 'given') givenAmount.value = Math.floor(givenAmount.value / 10);
  if (keypadTarget.value === 'tip') customTipAmount.value = Math.floor(customTipAmount.value / 10);
}

function handleQuickCash(amountInChf: number) {
  if (isSubmitting.value) return;
  givenAmount.value = amountInChf * 100;
}

function handleExact() {
  if (isSubmitting.value) return;
  givenAmount.value = totalDue.value;
}

function handlePaymentMethodChange(method: PaymentMethod) {
  if (isSubmitting.value) return;
  paymentMethod.value = method;
  if (method === 'cash') {
    keypadTarget.value = 'given';
    isCustomCardTip.value = false;
    customTipAmount.value = 0;
  } else {
    givenAmount.value = 0;
    isNoChangeTip.value = false;
    keypadTarget.value = isCustomCardTip.value ? 'tip' : 'given';
  }
}

function toggleNoChange() {
  if (isSubmitting.value) return;
  isNoChangeTip.value = !isNoChangeTip.value;
}

function toggleCustomCardTip() {
  if (isSubmitting.value) return;
  isCustomCardTip.value = !isCustomCardTip.value;
  if (isCustomCardTip.value) {
    keypadTarget.value = 'tip';
    customTipAmount.value = 0;
  } else {
    customTipAmount.value = 0;
    keypadTarget.value = 'given';
  }
}

function resetState() {
  discountType.value = 'none';
  paymentMethod.value = 'cash';
  keypadTarget.value = 'given';
  givenAmount.value = 0;
  customTipAmount.value = 0;
  isNoChangeTip.value = false;
  isCustomCardTip.value = false;
  isSubmitting.value = false;
}

function open() {
  resetState();
  visible.value = true;
}

function cancel() {
  if (isSubmitting.value) return;
  visible.value = false;
}

const emit = defineEmits<{
  (e: 'order-created', result: { orderNumber: number; receiptNumber: number }): void;
}>();

async function handleSubmit() {
  if (!isOrderValid.value || isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const payments: {
      method: 'cash' | 'card' | 'voucher' | 'helfer' | 'coupon';
      amount: number;
      tipAmount?: number;
    }[] = [];

    if (discountType.value === 'helfer') {
      payments.push({ method: 'helfer', amount: cartStore.subTotal });
      if (tipAmount.value > 0) {
        payments.push({ method: paymentMethod.value, amount: 0, tipAmount: tipAmount.value });
      }
    } else if (discountType.value === 'voucher') {
      const voucherVal = cartStore.voucherDiscount;
      if (voucherVal > 0) {
        payments.push({ method: 'voucher', amount: voucherVal });
      }
      if (totalDue.value > 0 || tipAmount.value > 0) {
        payments.push({
          method: paymentMethod.value,
          amount: totalDue.value,
          tipAmount: tipAmount.value,
        });
      }
    } else if (discountType.value === 'coupon') {
      const couponVal = cartStore.couponDiscount;
      if (couponVal > 0) {
        payments.push({ method: 'coupon', amount: couponVal });
      }
      if (totalDue.value > 0 || tipAmount.value > 0) {
        payments.push({
          method: paymentMethod.value,
          amount: totalDue.value,
          tipAmount: tipAmount.value,
        });
      }
    } else {
      payments.push({
        method: paymentMethod.value,
        amount: totalDue.value,
        tipAmount: tipAmount.value,
      });
    }

    const orderPayload = {
      items: cartStore.items.map(item => ({
        menuItemId: item.menuItemId,
        variantId: item.variant.id,
        amount: item.quantity,
        unitPrice: item.unitPrice,
        extraIds: item.extras.map(extra => extra.id),
      })),
      payments: payments,
    };

    const result = await window.api.createOrder(orderPayload);

    try {
      await window.api.printOrder({
        orderNumber: result.orderNumber,
        receiptNumber: result.receiptNumber,
        items: cartStore.items.map(item => ({
          name: item.name,
          categoryName: item.categoryName,
          variantName: item.variant?.name ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          extras: item.extras.map(e => ({ id: e.id, name: e.name, price: e.price })),
        })),
        subtotal: cartStore.subTotal,
        discount: discountAmount.value,
        finalTotal: totalDueWithTip.value,
        paymentMethod: discountType.value === 'helfer' ? 'helfer' : paymentMethod.value,
      });
    } catch (printErr) {
      console.warn('[CheckoutDialog] Printing receipt failed non-fatally:', printErr);
    }

    visible.value = false;
    emit('order-created', result);
  } catch (error) {
    console.error('Failed to create order:', error);
    errorStore.showError(
      'Bestellung fehlgeschlagen',
      'Die Bestellung konnte nicht in der Datenbank gespeichert werden. Bitte überprüfe die Eingabe oder wende dich an den Admin.',
      error
    );
  } finally {
    isSubmitting.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Bezahlen"
    :closable="!isSubmitting"
    :dismissable-mask="!isSubmitting"
    :pt="{
      header: { class: '!py-2 !px-3' },
      title: { class: '!text-lg !font-semibold' },
      content: { class: '!px-3 !pt-1 !pb-3' },
    }"
    :style="{ width: '90vw', maxWidth: '720px' }"
  >
    <div class="flex flex-col gap-2 text-black">
      <div class="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
        <div class="flex min-w-0 flex-col gap-2">
          <PaymentMethodSelector
            v-model:discount-type="discountType"
            :payment-method="paymentMethod"
            :disabled="isSubmitting"
            @update:payment-method="handlePaymentMethodChange"
          />

          <TipSelector
            :payment-method="paymentMethod"
            :is-no-change-tip="isNoChangeTip"
            :is-custom-card-tip="isCustomCardTip"
            :tip-amount="tipAmount"
            :disabled="isSubmitting"
            @toggle-no-change="toggleNoChange"
            @toggle-custom-card="toggleCustomCardTip"
          />

          <CheckoutSummary
            :discount-amount="discountAmount"
            :card-surcharge="cardSurcharge"
            :tip-amount="tipAmount"
            :total-due-with-tip="totalDueWithTip"
          />
        </div>

        <div
          class="flex h-full flex-col gap-2 rounded-2xl border-2 border-gray-300 p-2"
          :class="isKeypadLocked ? 'opacity-40 pointer-events-none' : ''"
        >
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold">
              {{ keypadTarget === 'tip' ? 'Trinkgeld' : 'Erhalten' }}
            </span>
            <span class="text-xl font-bold">
              CHF {{ ((keypadTarget === 'tip' ? customTipAmount : givenAmount) / 100).toFixed(2) }}
            </span>
          </div>

          <TouchKeypad
            :disabled="isSubmitting || isKeypadLocked"
            :show-quick-cash="paymentMethod === 'cash'"
            :exact-amount-label="`Exakt CHF ${(totalDue / 100).toFixed(2)}`"
            @digit="handleDigit"
            @clear="handleClear"
            @backspace="handleBackspace"
            @quick-cash="handleQuickCash"
            @exact="handleExact"
          />

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Rückgeld</span>
            <span class="text-xl font-bold" :class="changeDue > 0 ? 'text-emerald-700' : ''">
              CHF {{ (changeDue / 100).toFixed(2) }}
            </span>
          </div>

          <p class="min-h-5 text-sm text-red-600">
            <template v-if="paymentMethod === 'cash' && givenAmount > 0 && !isValidCashAmount">
              Es fehlen noch CHF {{ (missingAmount / 100).toFixed(2) }}
            </template>
          </p>
        </div>
      </div>

      <div class="flex gap-2 border-t border-gray-200 pt-2">
        <Button
          label="Abbrechen"
          severity="danger"
          variant="outlined"
          size="large"
          class="flex-1 !rounded-xl"
          :disabled="isSubmitting"
          @click="cancel"
        />

        <Button
          label="Bestellung abschliessen"
          severity="primary"
          size="large"
          class="flex-1 !rounded-xl"
          :loading="isSubmitting"
          :disabled="isSubmitting || !isOrderValid"
          @click="handleSubmit"
        />
      </div>
    </div>
  </Dialog>
</template>
