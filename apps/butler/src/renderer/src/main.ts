import { createTheme } from '@ceviwie/chilbi-shared/ui';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/main.css';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  // Add customizations to theme here
  theme: {
    preset: createTheme(),
    options: {
      darkModeSelector: false,
    },
  },
});

app.mount('#app');
