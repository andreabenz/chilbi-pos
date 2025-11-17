import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/Kitchensink.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
  ],
});

export default router;
