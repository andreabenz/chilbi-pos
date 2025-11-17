import { createRouter, createWebHashHistory } from 'vue-router';
import ElectronVite from '@/views/Home.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ElectronVite,
    },
    {
      path: '/example',
      name: 'example',
      component: () => import('../views/Example.vue'),
    },
  ],
});

export default router;
