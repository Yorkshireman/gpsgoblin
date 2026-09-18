import { defineConfig, defineRecipe } from '@chakra-ui/react';

const systemFontFallback =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const brambleActionPalette = {
  contrast: {
    value: {
      _light: '{colors.brambleLight.950}',
      _dark: '{colors.brambleDark.950}'
    }
  },
  fg: {
    value: {
      _light: '{colors.brambleLight.600}',
      _dark: '{colors.brambleDark.200}'
    }
  },
  subtle: {
    value: {
      _light: '{colors.brambleLight.200}',
      _dark: '{colors.brambleDark.600}'
    }
  },
  muted: {
    value: {
      _light: '{colors.brambleLight.300}',
      _dark: '{colors.brambleDark.500}'
    }
  },
  emphasized: {
    value: {
      _light: '{colors.brambleLight.300}',
      _dark: '{colors.brambleDark.500}'
    }
  },
  solid: {
    value: {
      _light: '{colors.brambleLight.600}',
      _dark: '{colors.brambleDark.200}'
    }
  },
  focusRing: {
    value: {
      _light: '{colors.brambleLight.600}',
      _dark: '{colors.brambleDark.200}'
    }
  },
  border: {
    value: {
      _light: '{colors.brambleLight.600}',
      _dark: '{colors.brambleDark.200}'
    }
  }
};

const selectionPalette = {
  contrast: {
    value: {
      _light: '{colors.brambleBerry.950}',
      _dark: '{colors.brambleBlue.950}'
    }
  },
  fg: {
    value: {
      _light: '{colors.brambleBerry.700}',
      _dark: '{colors.brambleBlue.50}'
    }
  },
  subtle: {
    value: {
      _light: '{colors.brambleBerry.50}',
      _dark: '{colors.brambleBlue.500}'
    }
  },
  muted: {
    value: {
      _light: '{colors.brambleLight.400}',
      _dark: '{colors.brambleDark.300}'
    }
  },
  emphasized: {
    value: {
      _light: '{colors.brambleLight.400}',
      _dark: '{colors.brambleDark.300}'
    }
  },
  solid: {
    value: {
      _light: '{colors.brambleBerry.700}',
      _dark: '{colors.brambleBlue.50}'
    }
  },
  focusRing: {
    value: {
      _light: '{colors.brambleBerry.700}',
      _dark: '{colors.brambleBlue.50}'
    }
  },
  border: {
    value: {
      _light: '{colors.brambleBerry.700}',
      _dark: '{colors.brambleBlue.50}'
    }
  }
};

const selectionPanelRecipe = defineRecipe({
  base: {
    bg: 'selection.subtle',
    color: 'selection.fg'
  }
});

export const themeConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brambleLight: {
          50: { value: '#FFFEF4' },
          100: { value: '#EBEEDA' },
          200: { value: '#D4E6AF' },
          300: { value: '#B8D383' },
          400: { value: '#A9B38C' },
          500: { value: '#48533B' },
          600: { value: '#254E24' },
          700: { value: '#18291C' },
          950: { value: '#FFFFFF' }
        },
        brambleDark: {
          50: { value: '#EEF3E4' },
          100: { value: '#CBD5BF' },
          200: { value: '#B9D98B' },
          300: { value: '#667C5E' },
          400: { value: '#4C6048' },
          500: { value: '#405834' },
          600: { value: '#2F432B' },
          800: { value: '#202B22' },
          900: { value: '#151D17' },
          950: { value: '#172314' }
        },
        brambleBerry: {
          50: { value: '#F0DCE8' },
          700: { value: '#742445' },
          950: { value: '#FFFFFF' }
        },
        brambleBlue: {
          50: { value: '#BEDBFA' },
          500: { value: '#20344A' },
          950: { value: '#15283D' }
        },
        brambleRoute: { 500: { value: '#254E24' } }
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
        bg: {
          DEFAULT: {
            value: {
              _light: '{colors.brambleLight.50}',
              _dark: '{colors.brambleDark.800}'
            }
          },
          panel: {
            value: {
              _light: '{colors.brambleLight.50}',
              _dark: '{colors.brambleDark.800}'
            }
          },
          subtle: {
            value: {
              _light: '{colors.brambleLight.100}',
              _dark: '{colors.brambleDark.900}'
            }
          },
          muted: {
            value: {
              _light: '{colors.brambleLight.100}',
              _dark: '{colors.brambleDark.900}'
            }
          },
          emphasized: {
            value: {
              _light: '{colors.brambleLight.400}',
              _dark: '{colors.brambleDark.300}'
            }
          },
          inverted: {
            value: {
              _light: '{colors.brambleLight.700}',
              _dark: '{colors.brambleDark.50}'
            }
          }
        },
        fg: {
          DEFAULT: {
            value: {
              _light: '{colors.brambleLight.700}',
              _dark: '{colors.brambleDark.50}'
            }
          },
          muted: {
            value: {
              _light: '{colors.brambleLight.500}',
              _dark: '{colors.brambleDark.100}'
            }
          },
          subtle: {
            value: {
              _light: '{colors.brambleLight.500}',
              _dark: '{colors.brambleDark.100}'
            }
          },
          inverted: {
            value: {
              _light: '{colors.brambleLight.950}',
              _dark: '{colors.brambleDark.950}'
            }
          }
        },
        border: {
          DEFAULT: {
            value: {
              _light: '{colors.brambleLight.400}',
              _dark: '{colors.brambleDark.300}'
            }
          },
          muted: {
            value: {
              _light: '{colors.brambleLight.400}',
              _dark: '{colors.brambleDark.400}'
            }
          },
          subtle: {
            value: {
              _light: '{colors.brambleLight.400}',
              _dark: '{colors.brambleDark.400}'
            }
          },
          emphasized: {
            value: {
              _light: '{colors.brambleLight.500}',
              _dark: '{colors.brambleDark.100}'
            }
          }
        },
        green: brambleActionPalette,
        teal: brambleActionPalette,
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
