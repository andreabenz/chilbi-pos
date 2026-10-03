import { createTheme } from '@ceviwie/chilbi-shared/ui';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { useErrorStore } from '@/stores/error';

/**
 * Main Vue 3 renderer application entrypoint.
 * Configures Pinia, Vue Router, PrimeVue with Cevi theme, and confirmation service.
 */
const app = createApp(App);
const pinia = createPinia();

// Install the single pinia instance
app.use(pinia);
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

// 1. Vue Global Component Error Handler
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Global Error]:', err, info);
  const errorStore = useErrorStore(pinia);
  errorStore.showError(
    'Anwendungsfehler',
    'In der Benutzeroberfläche ist ein Fehler aufgetreten. Bitte versuche die Aktion erneut.',
    err
  );
};

// 2. Global Unhandled Promise Rejections (e.g. failed async/IPC calls)
window.addEventListener('unhandledrejection', event => {
  console.error('[Unhandled Promise Rejection]:', event.reason);
  const errorStore = useErrorStore(pinia);
  errorStore.showError(
    'Hintergrundfehler',
    event.reason?.message || 'Eine Hintergrundoperation ist fehlgeschlagen.',
    event.reason
  );
  event.preventDefault();
});

// 3. Global Script Runtime Errors
window.addEventListener('error', event => {
  console.error('[Window Error]:', event.error);
  const errorStore = useErrorStore(pinia);
  errorStore.showError(
    'Laufzeitfehler',
    event.message || 'Ein unerwarteter Fehler ist aufgetreten.',
    event.error
  );
});

app.mount('#app');
