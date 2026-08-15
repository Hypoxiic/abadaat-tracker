import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import theme from './theme';
import { AppStateProvider } from './hooks/useAppState';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <AppStateProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppStateProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
