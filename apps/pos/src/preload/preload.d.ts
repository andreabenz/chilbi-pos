import type { ElectronAPI } from '@electron-toolkit/preload';
import type { PreloadAPI } from './index';

/**
 * Global Window interface extension exposing Electron preload bridge APIs.
 */
declare global {
  interface Window {
    electron: ElectronAPI;
    api: PreloadAPI;
  }
}
