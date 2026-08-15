import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import type { StyleFunctionProps } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: false,
};

/**
 * Palette: a deep emerald/jade primary (the traditional Islamic green, but
 * desaturated so large surfaces stay comfortable), with a warm gold accent for
 * highlights and a cool slate neutral ramp.
 */
const colors = {
  brand: {
    50: '#e9f7f1',
    100: '#c7ebdd',
    200: '#9edcc5',
    300: '#6fcaa9',
    400: '#45b78f',
    500: '#219e75',
    600: '#16815f',
    700: '#11674d',
    800: '#0d4d3a',
    900: '#083729',
  },
  gold: {
    50: '#fdf7e7',
    100: '#f9ebc2',
    200: '#f2db95',
    300: '#e9c765',
    400: '#dfb440',
    500: '#c9992a',
    600: '#a67a20',
    700: '#7f5c19',
    800: '#5b4113',
    900: '#3b2a0c',
  },
  lapis: {
    50: '#eaf1fb',
    100: '#c9daf4',
    200: '#a2c0ea',
    300: '#76a3df',
    400: '#4f88d3',
    500: '#316dbd',
    600: '#25559b',
    700: '#1c417a',
    800: '#142e58',
    900: '#0d1e3a',
  },
  plum: {
    50: '#f6eefa',
    100: '#e6d2f0',
    200: '#d1b0e4',
    300: '#b98ad5',
    400: '#a066c5',
    500: '#874cab',
    600: '#6d3b8c',
    700: '#552d6d',
    800: '#3d204f',
    900: '#271433',
  },
};

const semanticTokens = {
  colors: {
    'surface.canvas': { default: 'gray.50', _dark: 'gray.900' },
    'surface.raised': { default: 'white', _dark: 'gray.800' },
    'surface.sunken': { default: 'gray.100', _dark: 'gray.900' },
    'surface.overlay': { default: 'white', _dark: 'gray.800' },
    'surface.subtle': { default: 'brand.50', _dark: 'whiteAlpha.100' },
    'border.default': { default: 'gray.200', _dark: 'whiteAlpha.200' },
    'border.strong': { default: 'gray.300', _dark: 'whiteAlpha.300' },
    'text.primary': { default: 'gray.900', _dark: 'gray.50' },
    'text.secondary': { default: 'gray.600', _dark: 'gray.300' },
    'text.muted': { default: 'gray.500', _dark: 'gray.400' },
    'accent.solid': { default: 'brand.600', _dark: 'brand.300' },
    'accent.emphasis': { default: 'brand.700', _dark: 'brand.200' },
  },
};

const fonts = {
  heading: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  arabic: "'Amiri', 'Noto Naskh Arabic', 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    'html, body': {
      bg: 'surface.canvas',
      color: 'text.primary',
      scrollBehavior: 'smooth',
      WebkitFontSmoothing: 'antialiased',
      textRendering: 'optimizeLegibility',
    },
    '#root': {
      minH: '100dvh',
      display: 'flex',
      flexDirection: 'column',
    },
    // A clear, consistent focus ring for keyboard users only.
    '*:focus-visible': {
      outline: '3px solid',
      outlineColor: mode('brand.500', 'brand.300')(props),
      outlineOffset: '2px',
      borderRadius: '4px',
    },
    '*:focus:not(:focus-visible)': {
      boxShadow: 'none',
    },
    '::selection': {
      bg: mode('brand.100', 'brand.700')(props),
    },
    // Slim, unobtrusive scrollbars.
    '*::-webkit-scrollbar': { width: '10px', height: '10px' },
    '*::-webkit-scrollbar-thumb': {
      background: mode('rgba(0,0,0,0.18)', 'rgba(255,255,255,0.22)')(props),
      borderRadius: '999px',
    },
    '*::-webkit-scrollbar-track': { background: 'transparent' },
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': {
        animationDuration: '0.001ms !important',
        transitionDuration: '0.001ms !important',
        scrollBehavior: 'auto !important',
      },
    },
    '.arabic': {
      fontFamily: fonts.arabic,
      direction: 'rtl',
      lineHeight: 2.1,
      fontSize: 'xl',
    },
  }),
};

const components = {
  Card: {
    baseStyle: {
      container: {
        bg: 'surface.raised',
        borderRadius: '2xl',
        borderWidth: '1px',
        borderColor: 'border.default',
        boxShadow: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      },
    },
    variants: {
      interactive: {
        container: {
          cursor: 'pointer',
          _hover: {
            borderColor: 'accent.solid',
            boxShadow: 'md',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'lg',
      _focusVisible: { boxShadow: 'none' },
    },
    defaultProps: { colorScheme: 'brand' },
  },
  IconButton: {
    baseStyle: { borderRadius: 'lg' },
  },
  Heading: {
    baseStyle: { letterSpacing: '-0.02em', fontWeight: '700' },
  },
  Input: {
    defaultProps: { focusBorderColor: 'brand.500' },
  },
  NumberInput: {
    defaultProps: { focusBorderColor: 'brand.500' },
  },
  Select: {
    defaultProps: { focusBorderColor: 'brand.500' },
  },
  Textarea: {
    defaultProps: { focusBorderColor: 'brand.500' },
  },
  Tabs: {
    defaultProps: { colorScheme: 'brand' },
  },
  Progress: {
    baseStyle: { track: { borderRadius: 'full' }, filledTrack: { borderRadius: 'full' } },
    defaultProps: { colorScheme: 'brand' },
  },
  Tooltip: {
    baseStyle: { borderRadius: 'md', px: 3, py: 2, fontSize: 'sm' },
  },
  Badge: {
    baseStyle: { borderRadius: 'md', textTransform: 'none', fontWeight: '600', px: 2, py: 0.5 },
  },
  Divider: {
    baseStyle: { borderColor: 'border.default' },
  },
};

export const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  fonts,
  styles,
  components,
  radii: { xl: '0.875rem', '2xl': '1.125rem', '3xl': '1.5rem' },
  shadows: {
    soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.06)',
    lifted: '0 8px 30px rgba(16, 24, 40, 0.10)',
  },
});

export default theme;
