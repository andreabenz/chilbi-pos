import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * Pinia store managing the active order sequence number displayed on the POS interface.
 */
export const useCounterStore = defineStore('counter', () => {
  const count = ref(1);

  function increment() {
    count.value++;
  }
  function setCount(num: number) {
    count.value = num;
  }

  /** Loads the highest existing order number from the SQLite database and sets the counter to next. */
  async function initFromDb() {
    try {
      const latestOrderNumber = await window.api.getLatestOrderNumber();
      count.value = latestOrderNumber + 1;
    } catch (error) {
      console.error('Failed to initialize counter from DB:', error);
      count.value = 1;
    }
  }

  return { count, increment, setCount, initFromDb };
});
