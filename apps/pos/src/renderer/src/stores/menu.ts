import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
export type MenuCategory = Awaited<ReturnType<typeof window.api.getFullMenu>>[number];

export const useMenuStore = defineStore('menu', () => {
  const isLoading = ref(false);
  const categories = ref<MenuCategory[]>([]);
  const selectedCategoryId = ref<number | null>(null);
  const error = ref<string | null>(null);

  async function loadMenu() {
    isLoading.value = true;
    error.value = null;

    try {
      categories.value = await window.api.getFullMenu();
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      isLoading.value = false;
    }
  }

  function setSelectedCategory(id: number | null) {
    selectedCategoryId.value = id;
  }

  const currentCategory = computed(() =>
    categories.value.find(c => c.id === selectedCategoryId.value)
  );

  const currentCategoryItems = computed(() => currentCategory.value?.menuItems ?? []);

  return {
    currentCategoryItems,
    currentCategory,
    error,
    setSelectedCategory,
    loadMenu,
    categories,
    selectedCategoryId,
    isLoading,
  };
});
