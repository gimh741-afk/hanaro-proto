import { LoginGateProvider } from '../components/LoginSheet';
import { PhoneFrame } from '../components/PhoneFrame';
import { ToastProvider } from '../components/Toast';
import type { AppState } from '../state/AppStateContext';
import { AppProviders } from './providers';
import { AppRoutes } from './router';

export default function App({ initialState }: { initialState: AppState }) {
  return (
    <AppProviders initialState={initialState}>
      <PhoneFrame>
        {/* 토스트·바텀시트가 프레임 기준으로 붙도록 PhoneFrame 안쪽에 둔다 */}
        <ToastProvider>
          <LoginGateProvider>
            <AppRoutes />
          </LoginGateProvider>
        </ToastProvider>
      </PhoneFrame>
    </AppProviders>
  );
}
