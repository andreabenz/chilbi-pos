export interface PrinterDevice {
  name: string;
  isDefault?: boolean;
}

export class PrinterService {
  private configuredPrinterName: string | null = null;

  public setPrinterName(name: string | null): void {
    this.configuredPrinterName = name;
  }

  /**
   * Ermittelt installierte Windows-Drucker
   */
  public async getPrinters(): Promise<PrinterDevice[]> {
    try {
      const printer = await import('@lastapp/node-printer');
      return printer.getPrinters().map(p => ({
        name: p.name,
        isDefault: p.isDefault,
      }));
    } catch (error) {
      console.warn('[PrinterService] Native module unavailable or in dev simulator:', error);
      return [{ name: 'Simulated ESC/POS Printer (Dev)', isDefault: true }];
    }
  }

  /**
   * Schickt RAW ESC/POS Bytes an den Windows Spooler
   */
  public async printRaw(data: Buffer, docName = 'Chilbi Receipt'): Promise<boolean> {
    try {
      const printer = await import('@lastapp/node-printer');
      const printers = printer.getPrinters();

      const targetPrinter =
        this.configuredPrinterName ||
        printers.find(
          p => p.name.toUpperCase().includes('TM-T20') || p.name.toUpperCase().includes('RECEIPT')
        )?.name ||
        printers.find(
          p => p.name.toUpperCase().includes('EPSON') && !p.name.toUpperCase().includes('ET-')
        )?.name ||
        printer.getDefaultPrinterName();

      if (!targetPrinter) {
        console.warn('[PrinterService] No printer found, previewing in console:');
        this.previewBufferInConsole(data, docName);
        return true;
      }

      return new Promise((resolve, reject) => {
        printer.printDirect({
          data,
          printer: targetPrinter,
          type: 'RAW',
          success: jobId => {
            console.log(`[PrinterService] Print job ${jobId} submitted to ${targetPrinter}`);
            resolve(true);
          },
          error: err => {
            console.error(`[PrinterService] Print error:`, err);
            reject(err);
          },
        });
      });
    } catch (error) {
      console.warn(`[PrinterService] Physical printing failed. Previewing in console:`, error);
      this.previewBufferInConsole(data, docName);
      return true;
    }
  }

  private previewBufferInConsole(data: Buffer, docName: string): void {
    console.log(`\n========== [PRINT PREVIEW: ${docName}] (${data.length} bytes) ==========`);
    let text = '';
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      if (byte === 0x0a) {
        text += '\n';
      } else if (byte >= 0x20 && byte <= 0x7e) {
        text += String.fromCharCode(byte);
      }
    }
    console.log(text);
    console.log(`=================================================================\n`);
  }
}

export const printerService = new PrinterService();
