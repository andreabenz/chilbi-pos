import type { ElectronAPI } from '@electron-toolkit/preload';
import type { PreloadAPI } from './index';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: PreloadAPI;
  }
}
