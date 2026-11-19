import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppStateProvider, type AppState } from '../state/AppStateContext';

export function AppProviders({ initialState, children }: { initialState: AppState; children: ReactNode }) {
  return (
    <AppStateProvider initialState={initialState}>
      <BrowserRouter>{children}</BrowserRouter>
    </AppStateProvider>
  );
}
