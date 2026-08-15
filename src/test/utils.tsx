import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../theme';
import { AppStateProvider } from '../hooks/useAppState';
import { createStore, type Store } from '../lib/store';

/** A Storage implementation isolated per test. */
export const createMemoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  } as Storage;
};

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  store?: Store;
  route?: string;
}

export interface RenderWithProvidersResult extends RenderResult {
  store: Store;
  user: ReturnType<typeof userEvent.setup>;
}

/** Render a component inside the app's providers, with a throwaway store. */
export const renderWithProviders = (
  ui: React.ReactElement,
  { store = createStore(createMemoryStorage()), route = '/', ...options }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult => {
  const user = userEvent.setup();

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ChakraProvider theme={theme}>
      <AppStateProvider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AppStateProvider>
    </ChakraProvider>
  );

  return { ...render(ui, { wrapper: Wrapper, ...options }), store, user };
};
