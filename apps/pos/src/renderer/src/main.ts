import { createTheme } from '@ceviwie/chilbi-shared/ui';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

/**
 * Main Vue 3 renderer application entrypoint.
 * Configures Pinia, Vue Router, PrimeVue with Cevi theme, and confirmation service.
 */
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ConfirmationService as any);
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
