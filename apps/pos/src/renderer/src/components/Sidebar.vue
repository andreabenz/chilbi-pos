<!-- apps/pos/src/renderer/src/components/Sidebar.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button, Dialog, Select, Divider, Drawer } from 'primevue';
import { useConfirm } from 'primevue/useconfirm';
import { useCounterStore } from '../stores/counter';

interface PrinterOption {
  name: string;
  isDefault?: boolean;
}

const confirm = useConfirm();
const counterStore = useCounterStore();

const isDeletingOrder = ref(false);
const isWipingDb = ref(false);

const isDrawerOpen = ref(false);

const printers = ref<PrinterOption[]>([]);
const selectedPrinter = ref<PrinterOption | null>(null);

const isPrintingTest = ref(false);
const isExportingDb = ref(false);
const isLoadingData = ref(false);

const jsonDialogVisible = ref(false);
const rawJsonData = ref<string>('');

async function loadPrinters() {
  try {
    const list = await window.api.listPrinters();
    printers.value = list;
    const defaultPrinter = list.find(p => p.isDefault) || list[0] || null;
    selectedPrinter.value = defaultPrinter;
    if (defaultPrinter) {
      await window.api.setSelectedPrinter(defaultPrinter.name);
    }
  } catch (err) {
    console.error('Failed to load printers:', err);
  }
}

async function handlePrinterChange(option: PrinterOption | null) {
  selectedPrinter.value = option;
  await window.api.setSelectedPrinter(option ? option.name : null);
}

async function handleTestPrint() {
  isPrintingTest.value = true;
  try {
    await window.api.testPrint();
  } catch (err) {
    console.error('Test print failed:', err);
  } finally {
    isPrintingTest.value = false;
  }
}

async function handleExportDb() {
  isExportingDb.value = true;
  try {
    await window.api.exportDatabase();
  } catch (err) {
    console.error('DB Export failed:', err);
  } finally {
    isExportingDb.value = false;
  }
}

async function handleShowRecentData() {
  isLoadingData.value = true;
  try {
    const data = await window.api.getRecentData();
    rawJsonData.value = JSON.stringify(data, null, 2);
    jsonDialogVisible.value = true;
  } catch (err) {
    console.error('Failed to fetch recent entries:', err);
  } finally {
    isLoadingData.value = false;
  }
}

async function handleDeleteLatestOrder() {
  confirm.require({
    header: 'Letzte Bestellung stornieren',
    message: 'Möchtest du die letzte Bestellung wirklich unwiderruflich löschen?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Bestätigen',
    rejectLabel: 'Abbrechen',
    acceptClass: '!bg-red-600 !border-red-600 !text-white !rounded-xl',
    rejectClass: '!rounded-xl',
    accept: async () => {
      isDeletingOrder.value = true;
      try {
        const result = await window.api.deleteLatestOrder();
        if (result.success) {
          counterStore.setCount(result.nextOrderNumber);
        } else {
          alert(result.message || 'Fehler beim Stornieren der Bestellung.');
        }
      } catch (err) {
        console.error('Delete order failed:', err);
      } finally {
        isDeletingOrder.value = false;
      }
    },
  });
}

async function handleWipeDatabase() {
  confirm.require({
    header: 'Datenbank komplett zurücksetzen',
    message: 'Möchtest du wirklich alle Daten unwiderruflich löschen?',
    icon: 'pi pi-trash',
    acceptLabel: 'Bestätigen',
    rejectLabel: 'Abbrechen',
    acceptClass: '!bg-red-600 !border-red-600 !text-white !rounded-xl',
    rejectClass: '!rounded-xl',
    accept: async () => {
      isWipingDb.value = true;
      try {
        const result = await window.api.wipeDatabase();
        if (result.success) {
          await window.api.relaunchApp();
        } else {
          alert(`Fehler beim Zurücksetzen: ${result.error}`);
        }
      } catch (err) {
        console.error('Wipe DB failed:', err);
      } finally {
        isWipingDb.value = false;
      }
    },
  });
}
onMounted(() => {
  loadPrinters();
});
</script>

<template>
  <aside class="w-16 h-full flex flex-col items-center bg-white py-3">
    <button
      type="button"
      class="w-14 py-2 flex flex-col items-center justify-center gap-1 rounded-xl text-(--p-primary-color) hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
      title="Admin-Bereich öffnen"
      @click="isDrawerOpen = !isDrawerOpen"
    >
      <i class="pi pi-cog !text-[2.5rem]" />
      <span class="text-[11px] font-bold uppercase tracking-wide"> Admin </span>
    </button>
  </aside>
  <Drawer
    v-model:visible="isDrawerOpen"
    header="Administration"
    position="left"
    :style="{ width: '320px' }"
  >
    <div class="flex flex-col justify-between h-full">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Drucker
          </label>
          <Select
            :model-value="selectedPrinter"
            :options="printers"
            option-label="name"
            placeholder="Drucker wählen..."
            class="w-full !rounded-xl"
            @update:model-value="handlePrinterChange"
          />
          <Button
            label="Testdruck"
            icon="pi pi-print"
            severity="secondary"
            variant="outlined"
            class="!rounded-xl"
            :loading="isPrintingTest"
            @click="handleTestPrint"
          />
        </div>

        <Divider class="!my-1" />
        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Datenbank
          </label>
          <Button
            label="DB Exportieren"
            icon="pi pi-download"
            severity="secondary"
            variant="outlined"
            class="!rounded-xl"
            :loading="isExportingDb"
            @click="handleExportDb"
          />
          <Button
            label="Letzte Einträge"
            icon="pi pi-database"
            severity="secondary"
            variant="outlined"
            class="!rounded-xl"
            :loading="isLoadingData"
            @click="handleShowRecentData"
          />
          <Button
            label="Letzte Bestellung stornieren"
            icon="pi pi-undo"
            severity="warn"
            variant="outlined"
            class="!rounded-xl"
            :loading="isDeletingOrder"
            @click="handleDeleteLatestOrder"
          />
          <Button
            label="Datenbank zurücksetzen"
            icon="pi pi-trash"
            severity="danger"
            variant="outlined"
            class="!rounded-xl"
            :loading="isWipingDb"
            @click="handleWipeDatabase"
          />
        </div>
      </div>
      <div class="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
        Chilbi POS v1.0 • Cevi WIE
      </div>
    </div>
  </Drawer>
  <Dialog
    v-model:visible="jsonDialogVisible"
    modal
    header="Letzte Datenbank-Einträge (JSON)"
    :dismissable-mask="true"
    :style="{ width: '85vw', maxWidth: '800px' }"
    :pt="{ content: { class: '!p-4' } }"
  >
    <div class="flex flex-col gap-3">
      <pre
        class="bg-gray-900 text-emerald-400 p-4 rounded-xl overflow-auto text-xs font-mono max-h-[60vh] leading-relaxed"
        >{{ rawJsonData }}</pre
      >
      <div class="flex justify-end">
        <Button label="Schliessen" class="!rounded-xl" @click="jsonDialogVisible = false" />
      </div>
    </div>
  </Dialog>
</template>
