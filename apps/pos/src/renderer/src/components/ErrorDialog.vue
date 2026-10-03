<!-- apps/pos/src/renderer/src/components/GlobalErrorDialog.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, Button } from 'primevue';
import { useErrorStore } from '@/stores/error';

const errorStore = useErrorStore();
const showDetails = ref(false);
</script>

<template>
  <Dialog
    v-model:visible="errorStore.isVisible"
    modal
    :closable="false"
    :dismissable-mask="false"
    :style="{ width: '90vw', maxWidth: '520px' }"
    :pt="{
      header: { class: '!bg-red-50 !border-b !border-red-200 !text-red-700 !rounded-t-2xl !py-3' },
      content: { class: '!p-4' },
      footer: { class: '!p-3 !border-t !border-gray-100 !flex !justify-between !items-center' },
    }"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-exclamation-triangle text-xl text-red-600" />
        <span class="font-bold text-lg text-red-900">
          {{ errorStore.currentError?.title || 'Systemfehler' }}
        </span>
      </div>
    </template>

    <div class="flex flex-col gap-3 text-black">
      <p class="text-base leading-relaxed font-medium">
        {{ errorStore.currentError?.message }}
      </p>

      <div v-if="errorStore.currentError?.technicalDetails" class="mt-2">
        <button
          type="button"
          class="text-xs text-gray-500 hover:text-gray-800 underline flex items-center gap-1 cursor-pointer"
          @click="showDetails = !showDetails"
        >
          <i :class="showDetails ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
          <span>{{ showDetails ? 'Details ausblenden' : 'Technische Details anzeigen' }}</span>
        </button>

        <pre
          v-if="showDetails"
          class="mt-2 bg-gray-900 text-red-400 p-3 rounded-xl text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap leading-tight select-all"
          >{{ errorStore.currentError.technicalDetails }}</pre
        >
      </div>
    </div>

    <template #footer>
      <span class="text-xs text-gray-400 font-mono">
        {{ errorStore.currentError?.timestamp.toLocaleTimeString('de-CH') }}
      </span>
      <Button
        label="Verstanden"
        icon="pi pi-check"
        severity="danger"
        class="!rounded-xl px-5"
        @click="errorStore.dismiss()"
      />
    </template>
  </Dialog>
</template>
