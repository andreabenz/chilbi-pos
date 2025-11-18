<script setup lang="ts">
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Rating from 'primevue/rating';
import Tag from 'primevue/tag';
import { ref } from 'vue';

const visible = ref(false);
const date = ref();
const rating = ref(4);
const checked = ref(false);
const inputValue = ref('');
const selectedCity = ref();

const cities = ref([
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Paris', code: 'PRS' },
]);

const products = ref([
  { code: 'P001', name: 'Laptop', category: 'Electronics', quantity: 50, price: 999 },
  { code: 'P002', name: 'Phone', category: 'Electronics', quantity: 120, price: 699 },
  { code: 'P003', name: 'Desk', category: 'Furniture', quantity: 30, price: 299 },
  { code: 'P004', name: 'Chair', category: 'Furniture', quantity: 75, price: 149 },
]);
</script>

<template>
  <div class="w-screen h-screen bg-gray-50 overflow-auto p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-6">PrimeVue Kitchen Sink</h1>

      <!-- Buttons Section -->
      <Card>
        <template #title>Buttons</template>
        <template #content>
          <div class="flex flex-wrap gap-3">
            <Button label="Primary" />
            <Button label="Secondary" severity="secondary" />
            <Button label="Success" severity="success" />
            <Button label="Info" severity="info" />
            <Button label="Warn" severity="warn" />
            <Button label="Danger" severity="danger" />
            <Button icon="pi pi-check" rounded />
            <Button label="Outlined" outlined />
          </div>
        </template>
      </Card>

      <!-- Form Inputs Section -->
      <Card>
        <template #title>Form Inputs</template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label for="input">Input Text</label>
              <InputText id="input" v-model="inputValue" placeholder="Enter text" />
            </div>

            <div class="flex flex-col gap-2">
              <label for="dropdown">Dropdown</label>
              <Dropdown
                id="dropdown"
                v-model="selectedCity"
                :options="cities"
                option-label="name"
                placeholder="Select a city"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label for="calendar">Calendar</label>
              <Calendar id="calendar" v-model="date" show-icon />
            </div>

            <div class="flex flex-col gap-2">
              <label>Rating</label>
              <Rating v-model="rating" />
            </div>

            <div class="flex items-center gap-2">
              <Checkbox v-model="checked" input-id="check" binary />
              <label for="check">Accept terms</label>
            </div>
          </div>
        </template>
      </Card>

      <!-- DataTable Section -->
      <Card>
        <template #title>Data Table</template>
        <template #content>
          <DataTable :value="products" table-style="min-width: 50rem">
            <Column field="code" header="Code" sortable />
            <Column field="name" header="Name" sortable />
            <Column field="category" header="Category" sortable />
            <Column field="quantity" header="Quantity" sortable />
            <Column field="price" header="Price" sortable>
              <template #body="{ data }"> ${{ data.price }} </template>
            </Column>
            <Column header="Status">
              <template #body>
                <Tag value="In Stock" severity="success" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Dialog Section -->
      <Card>
        <template #title>Dialog</template>
        <template #content>
          <Button label="Show Dialog" @click="visible = true" />
          <Dialog v-model:visible="visible" header="Sample Dialog" :style="{ width: '30rem' }">
            <p class="mb-4">This is a sample dialog demonstrating PrimeVue's Dialog component.</p>
            <div class="flex justify-end gap-2">
              <Button label="Cancel" severity="secondary" @click="visible = false" />
              <Button label="Confirm" @click="visible = false" />
            </div>
          </Dialog>
        </template>
      </Card>
    </div>
  </div>
</template>
