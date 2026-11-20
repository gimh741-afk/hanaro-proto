import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext';
import { Button } from './Button';
import styles from './LoginSheet.module.css';

interface GateRequest {
  /** 시트 제목 — 지금 하려던 일을 금액·이름으로 구체적으로 */
  title: string;
  /** 로그인 직후 이어서 할 동작 */
  onLoggedIn: () => void;
}

type RequireLogin = (req: GateRequest) => void;

const LoginGateContext = createContext<RequireLogin | null>(null);

/**
 * 로그인이 필요한 동작(쿠폰 받기, 바코드, MY)을 감싼다.
 * 회원이면 바로 실행, 비회원이면 로그인 안내 바텀시트 → 로그인 후 원래 동작을 이어서 실행한다.
 * PhoneFrame 안쪽에 두어야 시트가 프레임 기준으로 붙는다.
 */
export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, login, scenario } = useAppState();
  const navigate = useNavigate();
  const [request, setRequest] = useState<GateRequest | null>(null);
  const firstButton = useRef<HTMLButtonElement>(null);

  const requireLogin = useCallback<RequireLogin>(
    (req) => {
      if (isLoggedIn) req.onLoggedIn();
      else setRequest(req);
    },
    [isLoggedIn],
  );

  const close = () => setRequest(null);

  const handleLogin = () => {
    const pending = request;
    setRequest(null);
    // 동작 규칙 7: ?scenario=auth-fail이면 로그인 대신 인증 실패 복구 화면으로
    if (scenario === 'auth-fail') {
      navigate('/auth/recover');
      return;
    }
    login();
    pending?.onLoggedIn();
  };

  useEffect(() => {
    if (!request) return;
    firstButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setRequest(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [request]);

  return (
    <LoginGateContext.Provider value={requireLogin}>
      {children}
      {request && (
        <div className={styles.backdrop} onClick={close}>
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-sheet-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="login-sheet-title" className={styles.title}>
              {request.title}
            </h2>
            <p className={styles.sub}>행사는 로그인 없이 둘러볼 수 있어요</p>
            <div className={styles.actions}>
              <Button ref={firstButton} onClick={handleLogin}>
                간편 로그인
              </Button>
              <Button variant="secondary" onClick={close}>
                계속 둘러볼게요
              </Button>
            </div>
          </div>
        </div>
      )}
    </LoginGateContext.Provider>
  );
}

export function useLoginGate(): RequireLogin {
  const ctx = useContext(LoginGateContext);
  if (!ctx) throw new Error('useLoginGate must be used inside <LoginGateProvider>');
  return ctx;
}
