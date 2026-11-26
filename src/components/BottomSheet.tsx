import { useEffect, useRef, type ReactNode } from 'react';
import styles from './BottomSheet.module.css';

type BottomSheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * 화면 아래에서 올라오는 시트. 바깥을 누르거나 Esc를 누르면 닫힌다.
 * PhoneFrame 안쪽에서 렌더해야 프레임 기준으로 붙는다.
 */
export function BottomSheet({ title, onClose, children }: BottomSheetProps) {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sheet.current?.querySelector<HTMLElement>('input, button')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={sheet}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="bottom-sheet-title" className={styles.title}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
