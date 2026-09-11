<script setup lang="ts">
import { Button } from 'primevue';
import { useMenuStore } from '../stores/menu';

const menuStore = useMenuStore();
</script>

<template>
  <div class="flex items-center gap-2 p-2 overflow-x-auto bg-white border-b border-gray-200">
    <Button
      v-for="category in menuStore.categories"
      :key="category.id"
      :label="category.name"
      :severity="menuStore.selectedCategoryId === category.id ? 'primary' : 'secondary'"
      :variant="menuStore.selectedCategoryId === category.id ? undefined : 'outlined'"
      class="rounded-xl! px-5! py-3! font-semibold text-sm shrink-0"
      @click="menuStore.setSelectedCategory(category.id)"
    />
  </div>
</template>
