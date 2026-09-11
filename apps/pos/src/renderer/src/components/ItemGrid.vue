<script setup lang="ts">
import { ProgressSpinner } from 'primevue';
import { useMenuStore } from '../stores/menu';
import ItemCard from './ItemCard.vue';

const menuStore = useMenuStore();
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div
      v-if="menuStore.isLoading"
      class="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center"
    >
      <ProgressSpinner />
      <span class="mt-4 text-gray-500 font-medium text-sm">Menü wird geladen...</span>
    </div>

    <div v-else class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 p-4">
      <ItemCard
        v-for="item in menuStore.currentCategoryItems"
        :key="item.id"
        :item="item"
        :category-name="menuStore.currentCategory?.name"
      />
    </div>
  </div>
</template>
