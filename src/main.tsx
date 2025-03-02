import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Extended theme with Islamic colours and fonts
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#4caf50', // Primary green
      600: '#43a047',
      700: '#388e3c',
      800: '#2e7d32',
      900: '#1b5e20',
    },
    secondary: {
      50: '#fffde7',
      100: '#fff9c4',
      200: '#fff59d',
      300: '#fff176',
      400: '#ffee58',
      500: '#ffeb3b',  // Accent yellow
      600: '#fdd835',
      700: '#fbc02d',
      800: '#f9a825',
      900: '#f57f17',
    },
    accent: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',  // Accent blue
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  fonts: {
    heading: "'Noto Sans', 'Noto Sans Arabic', sans-serif",
    body: "'Open Sans', 'Noto Sans Arabic', sans-serif",
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
    Heading: {
      baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      }),
    },
    Text: {
      baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
        color: props.colorMode === 'dark' ? 'gray.200' : 'gray.700',
      }),
    },
    // Customise form elements
    FormLabel: {
      baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
        fontWeight: 'medium',
        color: props.colorMode === 'dark' ? 'gray.200' : 'gray.700',
      }),
    },
    // Customise cards
    Card: {
      baseStyle: {
        container: {
          boxShadow: 'sm',
          borderRadius: 'md',
        },
      },
    },
    Stat: {
      baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        },
        label: {
          color: props.colorMode === 'dark' ? 'gray.200' : 'gray.700',
        },
        number: {
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        },
        helpText: {
          color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
        },
      }),
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
); 