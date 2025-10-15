// Enhanced store utilities for NextChat

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { AppState, StoreSlice, StoreMiddleware } from '../types';

// Enhanced store creation with middleware
export function createEnhancedStore<T>(
  name: string,
  initialState: T,
  actions: (set: any, get: any) => Record<string, any>,
  options: {
    persist?: boolean;
    devtools?: boolean;
    immer?: boolean;
    middleware?: StoreMiddleware[];
  } = {}
) {
  const { persist: shouldPersist = true, devtools: shouldDevtools = true, immer: shouldImmer = true, middleware = [] } = options;

  let store = create<T & Record<string, any>>();

  // Apply immer middleware for immutable updates
  if (shouldImmer) {
    store = store(immer((set, get) => ({
      ...initialState,
      ...actions(set, get),
    })));
  } else {
    store = store((set, get) => ({
      ...initialState,
      ...actions(set, get),
    }));
  }

  // Apply persistence middleware
  if (shouldPersist) {
    store = store(persist(
      (set, get) => ({
        ...initialState,
        ...actions(set, get),
      }),
      {
        name: `nextchat-${name}`,
        storage: createJSONStorage(() => localStorage),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle migrations here
          return persistedState;
        },
      }
    ));
  }

  // Apply devtools middleware
  if (shouldDevtools && process.env.NODE_ENV === 'development') {
    store = store(devtools({ name }));
  }

  // Apply custom middleware
  middleware.forEach(middleware => {
    store = store(middleware.handler);
  });

  return store;
}

// Store slice creator
export function createStoreSlice<T>(
  name: string,
  initialState: T,
  actions: (set: any, get: any) => Record<string, any>
): StoreSlice<T> {
  const store = createEnhancedStore(name, initialState, actions);
  
  return {
    state: initialState,
    actions: actions(() => {}, () => ({})),
    selectors: {},
  };
}

// Store composition utility
export function composeStores<T extends Record<string, any>>(stores: T): T {
  return stores;
}

// Store subscription utility
export function subscribeToStore<T>(
  store: any,
  selector: (state: T) => any,
  callback: (value: any) => void
) {
  return store.subscribe(selector, callback);
}

// Store persistence utility
export function createPersistStore<T>(
  initialState: T,
  actions: (set: any, get: any) => Record<string, any>,
  options: {
    name: string;
    version?: number;
    migrate?: (persistedState: any, version: number) => any;
  }
) {
  return createEnhancedStore(
    options.name,
    initialState,
    actions,
    {
      persist: true,
      devtools: true,
      immer: true,
    }
  );
}

// Store middleware for logging
export const loggingMiddleware: StoreMiddleware = {
  name: 'logging',
  handler: (store) => (next) => (action) => {
    console.log(`[Store] ${action.type}:`, action.payload);
    return next(action);
  },
};

// Store middleware for performance monitoring
export const performanceMiddleware: StoreMiddleware = {
  name: 'performance',
  handler: (store) => (next) => (action) => {
    const start = performance.now();
    const result = next(action);
    const end = performance.now();
    
    if (end - start > 10) { // Log slow actions
      console.warn(`[Performance] Slow action ${action.type}: ${end - start}ms`);
    }
    
    return result;
  },
};

// Store middleware for error handling
export const errorMiddleware: StoreMiddleware = {
  name: 'error',
  handler: (store) => (next) => (action) => {
    try {
      return next(action);
    } catch (error) {
      console.error(`[Store Error] ${action.type}:`, error);
      // Dispatch error action
      store.dispatch({ type: 'ERROR', payload: { error, action } });
      throw error;
    }
  },
};

// Store utilities
export const storeUtils = {
  // Create selector
  createSelector: <T>(selector: (state: T) => any) => selector,
  
  // Create action creator
  createAction: <T>(type: string, payload?: T) => ({ type, payload }),
  
  // Create reducer
  createReducer: <T>(initialState: T, handlers: Record<string, (state: T, action: any) => T>) => 
    (state = initialState, action: any) => {
      const handler = handlers[action.type];
      return handler ? handler(state, action) : state;
    },
  
  // Batch actions
  batchActions: (actions: any[]) => ({ type: 'BATCH', payload: actions }),
  
  // Debounced action
  debounceAction: (action: any, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => action(...args), delay);
    };
  },
  
  // Throttled action
  throttleAction: (action: any, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return action(...args);
      }
    };
  },
};

// Store hooks
export function useStoreSelector<T, R>(
  store: any,
  selector: (state: T) => R
): R {
  return store(selector);
}

export function useStoreActions<T>(
  store: any
): Record<string, any> {
  return store((state: T) => state.actions);
}

// Store debugging utilities
export const storeDebug = {
  // Log store state
  logState: (store: any) => {
    console.log('[Store State]', store.getState());
  },
  
  // Log store actions
  logActions: (store: any) => {
    const originalDispatch = store.dispatch;
    store.dispatch = (action: any) => {
      console.log('[Store Action]', action);
      return originalDispatch(action);
    };
  },
  
  // Time travel debugging
  enableTimeTravel: (store: any) => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).__NEXTCHAT_STORE__ = store;
    }
  },
};
