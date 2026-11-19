import type { ReactNode } from 'react';
import styles from './PhoneFrame.module.css';

/**
 * 데스크톱(600px 이상)에서는 390×844 휴대폰 프레임 안에, 모바일에서는 전체 화면으로 앱을 띄운다.
 * `.device`가 transform을 가지므로 안쪽의 position: fixed 요소는 프레임 기준으로 붙는다.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <div className={styles.device}>
        <div className={styles.viewport} id="app-viewport">
          {children}
        </div>
      </div>
    </div>
  );
}
