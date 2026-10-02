import Main from '@/views/Main.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

/**
 * Vue Router configuration using hash history for Electron renderer navigation.
 */
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Main,
    },
  ],
});

export default router;
