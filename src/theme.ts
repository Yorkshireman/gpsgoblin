import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe
} from '@chakra-ui/react';

const systemFontFallback =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const modeColor = (light: string, dark: string) => {
  return { value: { _light: light, _dark: dark } };
};

const actionPalette = {
  contrast: { value: '{colors.bramble.actionContrast}' },
  fg: { value: '{colors.bramble.accent}' },
  subtle: { value: '{colors.bramble.actionBackground}' },
  muted: { value: '{colors.bramble.actionHover}' },
  emphasized: { value: '{colors.bramble.actionHover}' },
  solid: { value: '{colors.bramble.accent}' },
  focusRing: { value: '{colors.bramble.accent}' },
  border: { value: '{colors.bramble.accent}' }
};

const selectionPalette = {
  contrast: { value: '{colors.bramble.selectionContrast}' },
  fg: { value: '{colors.bramble.selectionText}' },
  subtle: { value: '{colors.bramble.selectionBackground}' },
  muted: { value: '{colors.bramble.border}' },
  emphasized: { value: '{colors.bramble.border}' },
  solid: { value: '{colors.bramble.selectionText}' },
  focusRing: { value: '{colors.bramble.selectionText}' },
  border: { value: '{colors.bramble.selectionText}' }
};

const selectionPanelRecipe = defineRecipe({
  base: {
    bg: 'selection.subtle',
    color: 'selection.fg'
  }
});

const themeConfig = defineConfig({
  theme: {
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
    },
    semanticTokens: {
      colors: {
        // The approved colours are roles, not a numbered shade scale.
        bramble: {
          page: modeColor('#EBEEDA', '#151D17'),
          panel: modeColor('#FFFEF4', '#202B22'),
          text: modeColor('#18291C', '#EEF3E4'),
          mutedText: modeColor('#48533B', '#CBD5BF'),
          border: modeColor('#A9B38C', '#667C5E'),
          decorativeBorder: modeColor('#A9B38C', '#4C6048'),
          accent: modeColor('{colors.routeGreen}', '#B9D98B'),
          actionBackground: modeColor('#D4E6AF', '#2F432B'),
          actionHover: modeColor('#B8D383', '#405834'),
          actionContrast: modeColor('{colors.white}', '#172314'),
          selectionBackground: modeColor('#DBEAFE', '#20344A'),
          selectionText: modeColor('#173DA6', '#BEDBFA'),
          selectionContrast: modeColor('{colors.white}', '#15283D')
        },
        bg: {
          DEFAULT: { value: '{colors.bramble.panel}' },
          panel: { value: '{colors.bramble.panel}' },
          subtle: { value: '{colors.bramble.page}' },
          muted: { value: '{colors.bramble.page}' },
          emphasized: { value: '{colors.bramble.border}' },
          inverted: { value: '{colors.bramble.text}' },
          info: modeColor('{colors.blue.50}', '#20344A')
        },
        fg: {
          DEFAULT: { value: '{colors.bramble.text}' },
          muted: { value: '{colors.bramble.mutedText}' },
          subtle: { value: '{colors.bramble.mutedText}' },
          inverted: { value: '{colors.bramble.actionContrast}' },
          info: modeColor('{colors.blue.600}', '#BEDBFA')
        },
        border: {
          DEFAULT: { value: '{colors.bramble.border}' },
          muted: { value: '{colors.bramble.decorativeBorder}' },
          subtle: { value: '{colors.bramble.decorativeBorder}' },
          emphasized: { value: '{colors.bramble.mutedText}' }
        },
        action: actionPalette,
        // Information and selection remain separate roles even where the
        // approved dark-mode colours coincide.
        blue: {
          fg: modeColor('{colors.blue.700}', '#BEDBFA'),
          subtle: modeColor('{colors.blue.100}', '#20344A')
        },
        selection: selectionPalette
      }
    },
    recipes: {
      selectionPanel: selectionPanelRecipe
    }
  },
  globalCss: {
    html: {
      colorScheme: 'light'
    },
    'html.dark': {
      colorScheme: 'dark'
    },
    body: {
      minHeight: '100dvh',
      bg: 'bg.muted',
      color: 'fg'
    },
    'h1, h2, h3, h4, h5, h6': {
      fontOpticalSizing: 'auto',
      fontVariationSettings: '"SOFT" 50, "WONK" 1'
    }
  }
});

export const createThemeSystem = () => {
  return createSystem(defaultConfig, themeConfig);
};
