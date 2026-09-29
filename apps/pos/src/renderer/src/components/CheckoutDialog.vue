<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button, Dialog, Divider, ToggleButton } from 'primevue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

const CARD_SURCHARGE = 50;

const visible = ref(false);

const discountType = ref<'none' | 'coupon' | 'voucher' | 'helfer'>('none');
const paymentMethod = ref<'select' | 'cash' | 'card'>('select');
const givenAmount = ref(0);
const isSubmitting = ref(false);

const discountAmount = computed(() => {
  if (discountType.value === 'helfer') return cartStore.subTotal;
  if (discountType.value === 'voucher') return cartStore.voucherDiscount;
  if (discountType.value === 'coupon') return cartStore.couponDiscount;
  return 0;
});

const baseDue = computed(() => Math.max(0, cartStore.subTotal - discountAmount.value));

const totalDue = computed(() => {
  if (baseDue.value > 0 && paymentMethod.value === 'card') {
    return baseDue.value + CARD_SURCHARGE;
  }
  return baseDue.value;
});

const changeDue = computed(() => Math.max(0, givenAmount.value - totalDue.value));
const isValidCashAmount = computed(() => givenAmount.value >= totalDue.value);
const missingAmount = computed(() => Math.max(0, totalDue.value - givenAmount.value));

const isOrderValid = computed(() => {
  if (totalDue.value === 0) return true;
  if (paymentMethod.value === 'card') return true;
  if (paymentMethod.value === 'cash') return isValidCashAmount.value;
  return false;
});

function open() {
  discountType.value = 'none';
  paymentMethod.value = 'select';
  givenAmount.value = 0;
  isSubmitting.value = false;
  visible.value = true;
}

function cancel() {
  if (isSubmitting.value) return;
  visible.value = false;
}

function setDiscount(type: 'coupon' | 'voucher' | 'helfer') {
  if (isSubmitting.value) return;

  discountType.value = discountType.value === type ? 'none' : type;
}

function selectPaymentMethod(method: 'cash' | 'card') {
  if (isSubmitting.value) return;

  paymentMethod.value = paymentMethod.value === method ? 'select' : method;

  if (paymentMethod.value !== 'cash') {
    givenAmount.value = 0;
  }
}

function pressDigit(digit: number) {
  if (isSubmitting.value || paymentMethod.value !== 'cash') return;
  if (givenAmount.value > 999_999) return;

  givenAmount.value = givenAmount.value * 10 + digit;
}

function pressBackspace() {
  if (isSubmitting.value || paymentMethod.value !== 'cash') return;

  givenAmount.value = Math.floor(givenAmount.value / 10);
}

function pressClear() {
  if (isSubmitting.value || paymentMethod.value !== 'cash') return;

  givenAmount.value = 0;
}

function pressExact() {
  if (isSubmitting.value || paymentMethod.value !== 'cash') return;

  givenAmount.value = totalDue.value;
}

function tileClasses(selected: boolean) {
  return [
    'relative flex-1 min-w-0 aspect-square rounded-2xl bg-white border-3 border-(--p-primary-color) p-1.5 cursor-pointer transition-all',
    selected ? 'ring-3 ring-(--p-primary-color) ring-inset' : '',
    isSubmitting.value ? 'opacity-50 cursor-not-allowed' : '',
  ];
}

function digitClasses() {
  const disabled = isSubmitting.value || paymentMethod.value !== 'cash';

  return [
    'h-full w-full rounded-xl border-2 border-gray-300 bg-white text-2xl font-semibold text-black',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:bg-gray-100',
  ];
}

function exactButtonClasses() {
  const disabled = isSubmitting.value || paymentMethod.value !== 'cash';

  return [
    'h-12 w-full rounded-xl border-2 border-gray-300 bg-white text-base font-semibold text-black',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:bg-gray-100',
  ];
}

async function submitOrder(primaryMethod: 'cash' | 'card' | 'voucher' | 'helfer') {
  if (isSubmitting.value) return;

  if (primaryMethod === 'cash' && !isValidCashAmount.value) {
    return;
  }

  isSubmitting.value = true;

  const payments: {
    method: 'cash' | 'card' | 'voucher' | 'helfer' | 'coupon';
    amount: number;
  }[] = [];

  if (primaryMethod === 'voucher' || primaryMethod === 'helfer') {
    payments.push({
      method: primaryMethod,
      amount: cartStore.subTotal,
    });
  } else if (discountType.value === 'coupon') {
    const couponValue = cartStore.couponDiscount;
    let remainingValue = Math.max(0, cartStore.subTotal - couponValue);

    if (remainingValue > 0 && primaryMethod === 'card') {
      remainingValue += CARD_SURCHARGE;
    }

    if (couponValue > 0) {
      payments.push({
        method: 'coupon',
        amount: couponValue,
      });
    }

    if (remainingValue > 0) {
      payments.push({
        method: primaryMethod,
        amount: remainingValue,
      });
    }
  } else {
    payments.push({
      method: primaryMethod,
      amount: totalDue.value,
    });
  }

  try {
    const result = await window.api.createOrder({
      items: cartStore.items.map(item => ({
        menuItemId: item.menuItemId,
        amount: item.quantity,
      })),
      payments,
    });

    await window.api.printOrder({
      orderNumber: result.orderNumber,
      receiptNumber: result.receiptNumber,
      items: cartStore.items.map(item => ({
        name: item.name,
        categoryName: item.categoryName,
        variantName: item.variant.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        extras: item.extras.map(extra => ({
          id: extra.id,
          name: extra.name,
          price: extra.price,
        })),
      })),
      subtotal: cartStore.subTotal,
      discount: discountAmount.value,
      finalTotal: totalDue.value,
      paymentMethod: primaryMethod,
    });

    visible.value = false;

    emit('order-created', result);
  } catch (error) {
    console.error('Failed to create order:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function handleSubmit() {
  if (!isOrderValid.value) return;

  const method =
    discountType.value === 'voucher'
      ? 'voucher'
      : discountType.value === 'helfer'
        ? 'helfer'
        : paymentMethod.value === 'card'
          ? 'card'
          : 'cash';

  submitOrder(method);
}

const emit = defineEmits<{
  (
    e: 'order-created',
    result: {
      orderNumber: number;
      receiptNumber: number;
    }
  ): void;
}>();

defineExpose({ open });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Bezahlen"
    :closable="!isSubmitting"
    :dismissable-mask="!isSubmitting"
    :pt="{ content: { class: '!px-3 !py-3' } }"
    :style="{
      width: '90vw',
      maxWidth: '720px',
    }"
  >
    <div class="flex flex-col gap-3 text-black">
      <div class="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
        <div class="flex min-w-0 flex-col gap-2">
          <div class="flex gap-2">
            <ToggleButton
              :model-value="discountType === 'coupon'"
              :disabled="isSubmitting"
              unstyled
              :pt="{
                root: {
                  class: tileClasses(discountType === 'coupon'),
                },
                content: {
                  class: 'flex h-full w-full flex-col items-center justify-center gap-0',
                },
              }"
              @update:model-value="setDiscount('coupon')"
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
              :disabled="isSubmitting"
              unstyled
              :pt="{
                root: {
                  class: tileClasses(discountType === 'voucher'),
                },
                content: {
                  class: 'flex h-full w-full flex-col items-center justify-center gap-0',
                },
              }"
              @update:model-value="setDiscount('voucher')"
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
              :disabled="isSubmitting"
              unstyled
              :pt="{
                root: {
                  class: tileClasses(discountType === 'helfer'),
                },
                content: {
                  class: 'flex h-full w-full flex-col items-center justify-center gap-0',
                },
              }"
              @update:model-value="setDiscount('helfer')"
            >
              <img src="/icons/gift.png" alt="Helfer" class="h-[4rem] w-[4rem] object-contain" />

              <span class="text-base font-bold text-center text-black leading-tight"> Helfer </span>

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
              :disabled="isSubmitting"
              unstyled
              :pt="{
                root: {
                  class: tileClasses(paymentMethod === 'cash'),
                },
                content: {
                  class: 'flex h-full w-full flex-col items-center justify-center gap-1',
                },
              }"
              @update:model-value="selectPaymentMethod('cash')"
            >
              <img src="/icons/money.png" alt="Bargeld" class="h-28 w-28 object-contain" />

              <span class="text-lg font-bold text-center text-black"> Bargeld </span>

              <div
                v-if="paymentMethod === 'cash'"
                class="absolute top-2 left-2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
              >
                <i class="pi pi-check text-white text-xs" />
              </div>
            </ToggleButton>

            <ToggleButton
              :model-value="paymentMethod === 'card'"
              :disabled="isSubmitting"
              unstyled
              :pt="{
                root: {
                  class: tileClasses(paymentMethod === 'card'),
                },
                content: {
                  class: 'flex h-full w-full flex-col items-center justify-center gap-1',
                },
              }"
              @update:model-value="selectPaymentMethod('card')"
            >
              <img src="/icons/debit-card.png" alt="Karte" class="h-28 w-28 object-contain" />

              <span class="text-lg font-bold text-center text-black"> Karte </span>

              <div
                v-if="paymentMethod === 'card'"
                class="absolute top-2 left-2 bg-(--p-primary-color) rounded-full w-5 h-5 flex items-center justify-center shadow-md"
              >
                <i class="pi pi-check text-white text-xs" />
              </div>
            </ToggleButton>
          </div>

          <div class="flex items-center justify-between text-base">
            <span>Abzug</span>
            <span>− CHF {{ (discountAmount / 100).toFixed(2) }}</span>
          </div>

          <Divider class="!my-1" />

          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold">Zu bezahlen</span>
            <span class="text-3xl font-bold"> CHF {{ (totalDue / 100).toFixed(2) }} </span>
          </div>
        </div>

        <div
          class="flex h-full flex-col gap-2 rounded-2xl border-2 border-gray-300 p-2"
          :class="paymentMethod !== 'cash' ? 'opacity-40 pointer-events-none' : ''"
        >
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold">Erhalten</span>
            <span class="text-xl font-bold"> CHF {{ (givenAmount / 100).toFixed(2) }} </span>
          </div>

          <div class="grid flex-1 grid-cols-3 grid-rows-4 gap-2">
            <Button
              v-for="d in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
              :key="d"
              :label="String(d)"
              unstyled
              :disabled="isSubmitting || paymentMethod !== 'cash'"
              :pt="{ root: { class: digitClasses() } }"
              @click="pressDigit(d)"
            />

            <Button
              label="C"
              unstyled
              :disabled="isSubmitting || paymentMethod !== 'cash'"
              :pt="{ root: { class: digitClasses() } }"
              @click="pressClear"
            />

            <Button
              label="0"
              unstyled
              :disabled="isSubmitting || paymentMethod !== 'cash'"
              :pt="{ root: { class: digitClasses() } }"
              @click="pressDigit(0)"
            />

            <Button
              label="⌫"
              unstyled
              :disabled="isSubmitting || paymentMethod !== 'cash'"
              :pt="{ root: { class: digitClasses() } }"
              @click="pressBackspace"
            />
          </div>

          <Button
            label="Exakter Betrag"
            unstyled
            :disabled="isSubmitting || paymentMethod !== 'cash'"
            :pt="{ root: { class: exactButtonClasses() } }"
            @click="pressExact"
          />

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Rückgeld</span>
            <span class="text-xl font-bold"> CHF {{ (changeDue / 100).toFixed(2) }} </span>
          </div>

          <p
            v-if="paymentMethod === 'cash' && givenAmount > 0 && !isValidCashAmount"
            class="text-sm text-red-600"
          >
            Es fehlen noch CHF {{ (missingAmount / 100).toFixed(2) }}
          </p>
        </div>
      </div>

      <div class="flex gap-2 border-t border-gray-200 pt-3">
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
