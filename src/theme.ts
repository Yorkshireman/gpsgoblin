import { defineConfig } from '@chakra-ui/react';

const systemFontFallback =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

export const themeConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: {
          value: `var(--font-source-sans-3), ${systemFontFallback}`
        },
        heading: {
          value: `var(--font-fraunces), ${systemFontFallback}`
        }
      }
    }
  },
  globalCss: {
    'h1, h2, h3, h4, h5, h6': {
      fontOpticalSizing: 'auto',
      fontVariationSettings: '"SOFT" 50, "WONK" 1'
    }
  }
});
