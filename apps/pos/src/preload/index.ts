import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';
import type { MenuCategoryWithItems } from '../main/db/services/menuService';
import type { CreateOrderInput, OrderResult } from '../main/db/services/orderService';

const api = {
  ping: () => electronAPI.ipcRenderer.send('ping'),
  getFullMenu: (): Promise<MenuCategoryWithItems[]> => ipcRenderer.invoke('menu:get-full'),
  createOrder: (payload: CreateOrderInput): Promise<OrderResult> =>
    ipcRenderer.invoke('order:create', payload),
};

export type PreloadAPI = typeof api;

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
