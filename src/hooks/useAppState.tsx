import React, { useRef } from 'react';
import { createStore, type Store } from '../lib/store';
import { StoreContext } from './appState';

interface AppStateProviderProps {
  children: React.ReactNode;
  /** Injectable for tests; defaults to a localStorage-backed store. */
  store?: Store;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children, store }) => {
  const fallback = useRef<Store>();
  if (!store && !fallback.current) fallback.current = createStore();
  const value = store ?? (fallback.current as Store);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export default AppStateProvider;
