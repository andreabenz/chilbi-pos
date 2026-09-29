import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(1);
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }
  function setCount(num: number) {
    count.value = num;
  }

  return { count, doubleCount, increment, setCount };
});
