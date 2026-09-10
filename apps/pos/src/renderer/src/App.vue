<script setup lang="ts">
import { Divider } from 'primevue';
import NavBar from './components/NavBar.vue';
import Sidebar from './components/Sidebar.vue';
import { useMenuStore } from './stores/menu';
import { onMounted } from 'vue';

const menuStore = useMenuStore();

onMounted(async () => {
  await menuStore.loadMenu();
  console.log('Categories in store:', menuStore.categories);
});
</script>

<template>
  <div class="grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] fixed inset-0">
    <div class="col-span-2">
      <NavBar />
      <Divider class="layout-separator" />
    </div>
    <div class="flex">
      <Sidebar />
      <Divider layout="vertical" class="layout-separator" />
    </div>
    <div class="bg-gray-200 overflow-hidden">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.layout-separator {
  margin: 0 !important;
}

.layout-separator::before {
  border-color: var(--color-gray-300);
  border-width: 1px;
}
</style>
