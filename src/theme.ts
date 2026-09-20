import { modeColour } from './modeColour';
import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe
} from '@chakra-ui/react';

const actionPalette = {
  border: { value: '{colors.bramble.accent}' },
  contrast: { value: '{colors.bramble.actionContrast}' },
  emphasized: { value: '{colors.bramble.actionHover}' },
  fg: { value: '{colors.bramble.accent}' },
  focusRing: { value: '{colors.bramble.accent}' },
  muted: { value: '{colors.bramble.actionHover}' },
  solid: { value: '{colors.bramble.accent}' },
  subtle: { value: '{colors.bramble.actionBackground}' }
};

const selectionPalette = {
  border: { value: '{colors.bramble.selectionText}' },
  contrast: { value: '{colors.bramble.selectionContrast}' },
  emphasized: { value: '{colors.bramble.border}' },
  fg: { value: '{colors.bramble.selectionText}' },
  focusRing: { value: '{colors.bramble.selectionText}' },
  muted: { value: '{colors.bramble.border}' },
  solid: { value: '{colors.bramble.selectionText}' },
  subtle: { value: '{colors.bramble.selectionBackground}' }
};

const selectionPanelRecipe = defineRecipe({
  base: {
    bg: 'selection.subtle',
    color: 'selection.fg'
  }
});

const linkRecipe = defineRecipe({
  base: {
    alignItems: 'center',
    borderRadius: 'l1',
    color: 'action.fg',
    cursor: 'pointer',
    display: 'inline-flex',
    focusVisibleRing: 'outside',
    gap: '1.5',
    outline: 'none',
    textDecoration: 'underline',
    textDecorationColor: 'currentColor',
    textUnderlineOffset: '3px'
  }
});

const systemFontFallback =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const themeConfig = defineConfig({
  globalCss: {
    body: {
      bg: 'bg.muted',
      color: 'fg',
      minHeight: '100dvh'
    },
    'h1, h2, h3, h4, h5, h6': {
      fontOpticalSizing: 'auto',
      fontVariationSettings: '"SOFT" 50, "WONK" 1'
    },
    html: {
      colorScheme: 'light'
    },
    'html.dark': {
      colorScheme: 'dark'
    }
  },
  theme: {
    recipes: {
      link: linkRecipe,
      selectionPanel: selectionPanelRecipe
    },
    semanticTokens: {
      colors: {
        action: actionPalette,
        bg: {
          DEFAULT: { value: '{colors.bramble.panel}' },
          emphasized: { value: '{colors.bramble.border}' },
          info: modeColour('{colors.blue.50}', '#20344A'),
          inverted: { value: '{colors.bramble.text}' },
          muted: { value: '{colors.bramble.page}' },
          panel: { value: '{colors.bramble.panel}' },
          subtle: { value: '{colors.bramble.page}' }
        },
        blue: {
          fg: modeColour('{colors.blue.700}', '#BEDBFA'),
          subtle: modeColour('{colors.blue.100}', '#20344A')
        },
        border: {
          DEFAULT: { value: '{colors.bramble.border}' },
          emphasized: { value: '{colors.bramble.mutedText}' },
          muted: { value: '{colors.bramble.decorativeBorder}' },
          subtle: { value: '{colors.bramble.decorativeBorder}' }
        },
        bramble: {
          accent: modeColour('{colors.routeGreen}', '#B9D98B'),
          actionBackground: modeColour('#D4E6AF', '#2F432B'),
          actionContrast: modeColour('{colors.white}', '#172314'),
          actionHover: modeColour('#B8D383', '#405834'),
          border: modeColour('#A9B38C', '#667C5E'),
          decorativeBorder: modeColour('#A9B38C', '#4C6048'),
          mutedText: modeColour('#48533B', '#CBD5BF'),
          page: modeColour('#EBEEDA', '#151D17'),
          panel: modeColour('#FFFEF4', '#202B22'),
          selectionBackground: modeColour('#DBEAFE', '#20344A'),
          selectionContrast: modeColour('{colors.white}', '#15283D'),
          selectionText: modeColour('#173DA6', '#BEDBFA'),
          text: modeColour('#18291C', '#EEF3E4')
        },
        fg: {
          DEFAULT: { value: '{colors.bramble.text}' },
          info: modeColour('{colors.blue.600}', '#BEDBFA'),
          inverted: { value: '{colors.bramble.actionContrast}' },
          muted: { value: '{colors.bramble.mutedText}' },
          subtle: { value: '{colors.bramble.mutedText}' }
        },
        gray: {
          border: modeColour('{colors.gray.500}', '{colors.gray.300}'),
          subtle: { value: '{colors.bramble.panel}' }
        },
        selection: selectionPalette
      }
    },
    tokens: {
      colors: {
        routeGreen: { value: '#254E24' }
      },
      fonts: {
        body: {
          value: `var(--font-source-sans-3), ${systemFontFallback}`
        },
        heading: {
          value: `var(--font-fraunces), ${systemFontFallback}`
        }
      }
    }
  }
});

export const createThemeSystem = () => {
  return createSystem(defaultConfig, themeConfig);
};
