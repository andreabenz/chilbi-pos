import { mount, RouterLinkStub } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import Home from '@/views/Home.vue';

describe('Home', () => {
  beforeEach(() => {
    // Mock window.electron
    window.electron = {
      process: { platform: '', versions: {}, env: {} },
    } as any;
  });

  it('renders', () => {
    const wrapper = mount(Home, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
