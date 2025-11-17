import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import type { Preset } from '@primeuix/themes/types';

const CeviTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#004d99', // Main Cevi blue
      600: '#003d7a',
      700: '#002e5c',
      800: '#001f3d',
      900: '#00101f',
      950: '#000810',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
      },
    },
  },
});

export function createTheme(...overrides: Preset[]) {
  // For now, just use default theme. Can be overridden later.
  return definePreset(CeviTheme, ...overrides);
}
