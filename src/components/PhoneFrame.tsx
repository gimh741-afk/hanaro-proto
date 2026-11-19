import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './PhoneFrame.module.css';

const FRAME_HEIGHT = 844;
/** .stage 위아래 padding(24px 여백 + 테두리 10px) — PhoneFrame.module.css와 맞춘다 */
const STAGE_PADDING = 34;
const DESKTOP_QUERY = '(min-width: 600px)';
/** 너무 작아져 누르기 어려워지지 않게 */
const MIN_SCALE = 0.5;

function computeScale(): number {
  if (typeof window === 'undefined' || !window.matchMedia(DESKTOP_QUERY).matches) return 1;
  const available = window.innerHeight - STAGE_PADDING * 2;
  return Math.max(MIN_SCALE, Math.min(1, available / FRAME_HEIGHT));
}

/**
 * 데스크톱(600px 이상)에서는 390×844 휴대폰 프레임 안에, 모바일에서는 전체 화면으로 앱을 띄운다.
 * 데스크톱 창 높이가 912px보다 낮으면 프레임을 비율 그대로 줄여서 페이지 스크롤 없이 한 화면에 보이게 한다
 * (Maze 데스크톱 테스트에서 탭바·하단 버튼이 잘리지 않도록).
 * `.device`가 transform을 가지므로 안쪽의 position: fixed 요소는 프레임 기준으로 붙고, 함께 줄어든다.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(computeScale);

  useLayoutEffect(() => {
    const update = () => setScale(computeScale());
    const mq = window.matchMedia(DESKTOP_QUERY);
    window.addEventListener('resize', update);
    mq.addEventListener('change', update);
    update();
    return () => {
      window.removeEventListener('resize', update);
      mq.removeEventListener('change', update);
    };
  }, []);

  return (
    <div className={styles.stage} style={{ '--frame-scale': scale } as CSSProperties}>
      <div className={styles.slot}>
        <div className={styles.device}>
          <div className={styles.viewport} id="app-viewport">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
