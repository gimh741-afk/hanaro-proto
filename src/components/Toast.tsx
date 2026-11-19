import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import checkIcon from '../assets/icons/toast-check.svg';
import styles from './Toast.module.css';

export function Toast({ message, className }: { message: string; className?: string }) {
  return (
    <div className={[styles.toast, className].filter(Boolean).join(' ')}>
      <img className={styles.icon} src={checkIcon} width={16} height={16} alt="" />
      <span>{message}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const TOAST_DURATION_MS = 2500;

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

/**
 * 화면 하단(탭바 위)에 토스트를 하나씩 띄운다.
 * PhoneFrame 안쪽에 두어야 position: fixed가 프레임 기준으로 붙는다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<ShowToast>((message) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toast && <Toast key={toast.id} message={toast.message} className={styles.enter} />}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
