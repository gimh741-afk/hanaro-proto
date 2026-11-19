import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './app/App';
import { resolveInitialState } from './state/AppStateContext';

// ?start / ?reset / ?scenario 처리는 렌더 전에 한 번만 한다.
const initialState = resolveInitialState();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App initialState={initialState} />
  </StrictMode>,
);
