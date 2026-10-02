import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import { beforeEach, describe, expect, it } from 'vitest';
import Main from '@/views/Main.vue';

describe('Main View', () => {
  beforeEach(() => {
    window.api = {
      getFullMenu: async () => [],
      getLatestOrderNumber: async () => 0,
      listPrinters: async () => [],
      setSelectedPrinter: async () => ({ success: true }),
    } as any;
  });

  it('mounts successfully', () => {
    const wrapper = mount(Main, {
      global: {
        plugins: [createPinia(), PrimeVue, ConfirmationService],
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
