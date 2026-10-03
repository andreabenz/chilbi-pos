import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface AppError {
  title: string;
  message: string;
  technicalDetails?: string;
  timestamp: Date;
}

export const useErrorStore = defineStore('error', () => {
  const currentError = ref<AppError | null>(null);
  const isVisible = ref(false);

  function showError(title: string, message: string, technicalDetails?: unknown) {
    let details: string | undefined;

    if (technicalDetails instanceof Error) {
      details = `${technicalDetails.name}: ${technicalDetails.message}\n${technicalDetails.stack || ''}`;
    } else if (typeof technicalDetails === 'object' && technicalDetails !== null) {
      const obj = technicalDetails as Record<string, unknown>;
      details = obj.stack
        ? `${obj.name || 'Error'}: ${obj.message}\n${obj.stack}`
        : JSON.stringify(technicalDetails, null, 2);
    } else if (technicalDetails) {
      details = String(technicalDetails);
    }

    currentError.value = {
      title,
      message,
      technicalDetails: details,
      timestamp: new Date(),
    };
    isVisible.value = true;
  }

  function dismiss() {
    isVisible.value = false;
    currentError.value = null;
  }

  return { currentError, isVisible, showError, dismiss };
});
