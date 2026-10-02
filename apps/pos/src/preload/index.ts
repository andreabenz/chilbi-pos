import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';
import type { MenuCategoryWithItems } from '../main/db/services/menuService';
import type { CreateOrderInput, OrderResult } from '../main/db/services/orderService';
import type { PrinterDevice } from '../main/printer/printerService';

const api = {
  ping: () => electronAPI.ipcRenderer.send('ping'),

  //Orders and Menu
  getFullMenu: (): Promise<MenuCategoryWithItems[]> => ipcRenderer.invoke('menu:get-full'),
  createOrder: (payload: CreateOrderInput): Promise<OrderResult> =>
    ipcRenderer.invoke('order:create', payload),
  getLatestOrderNumber: (): Promise<number> => ipcRenderer.invoke('order:get-latest-number'),
  deleteLatestOrder: (): Promise<
    | { success: true; deletedOrderNumber: number; nextOrderNumber: number }
    | { success: false; message: string }
  > => ipcRenderer.invoke('order:delete-latest'),

  //Printer
  printOrder: (order: any) => ipcRenderer.invoke('printer:print-order', order),
  listPrinters: (): Promise<PrinterDevice[]> => ipcRenderer.invoke('printer:list'),
  setSelectedPrinter: (name: string | null): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('printer:set-selected', name),
  testPrint: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('printer:test-print'),

  //Admin
  exportDatabase: (): Promise<{
    success: boolean;
    path?: string;
    message?: string;
    error?: string;
  }> => ipcRenderer.invoke('admin:export-db'),
  getRecentData: (): Promise<any[]> => ipcRenderer.invoke('admin:get-recent-data'),
  wipeDatabase: (): Promise<{ success: boolean; backupPath?: string; error?: string }> =>
    ipcRenderer.invoke('admin:wipe-db'),
  relaunchApp: (): Promise<void> => ipcRenderer.invoke('app:relaunch'),
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
