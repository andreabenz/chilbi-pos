import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(1);

  function increment() {
    count.value++;
  }
  function setCount(num: number) {
    count.value = num;
  }

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
