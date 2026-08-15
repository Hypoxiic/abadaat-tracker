import { createContext, useContext, useMemo, useRef, useSyncExternalStore } from 'react';
import type { Actions, Store } from '../lib/store';
import type { AppState } from '../lib/types';

/** Shared store context. The provider lives in `useAppState.tsx`. */
export const StoreContext = createContext<Store | null>(null);

const useStore = (): Store => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('App state hooks must be used within an <AppStateProvider>');
  }
  return store;
};

/** The whole application state. Re-renders on any change. */
export const useAppState = (): AppState => {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
};

/** Stable action creators — safe to use in dependency arrays. */
export const useActions = (): Actions => useStore().actions;

/** Select a slice of state; recomputes only when the state object changes. */
export const useAppSelector = <T,>(selector: (state: AppState) => T): T => {
  const store = useStore();
  const cache = useRef<{ state: AppState; value: T }>();

  const getSnapshot = () => {
    const state = store.getState();
    if (!cache.current || cache.current.state !== state) {
      cache.current = { state, value: selector(state) };
    }
    return cache.current.value;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

/** Current settings. */
export const useSettings = () => useAppSelector((state) => state.settings);

/** Memoised derived value over the whole state. */
export const useDerived = <T,>(compute: (state: AppState) => T, deps: unknown[] = []): T => {
  const state = useAppState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => compute(state), [state, ...deps]);
};
