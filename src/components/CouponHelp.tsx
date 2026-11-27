import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import styles from './CouponHelp.module.css';

/**
 * "쿠폰은 어떻게 적용되나요?" 링크 + 바텀시트 (쿠폰 · 바코드 화면).
 * 내용은 앱에 이미 있는 안내만: 바코드 자동 할인 / 쿠폰 카드 조건(최소 금액·사용 매장·기간) / 영수증 · 할인 확인.
 */
const STEPS = [
  '받은 쿠폰은 계산할 때 바코드로 자동 할인돼요',
  '최소 금액·사용 매장·기간 조건을 맞춰야 적용돼요',
  '적용 결과는 영수증에서 확인할 수 있어요',
];

export function CouponHelp({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={[styles.link, className].filter(Boolean).join(' ')} onClick={() => setOpen(true)}>
        쿠폰은 어떻게 적용되나요?
      </button>
      {open && (
        <BottomSheet title="쿠폰은 어떻게 적용되나요?" onClose={() => setOpen(false)}>
          <ol className={styles.steps}>
            {STEPS.map((text, i) => (
              <li key={text} className={styles.step}>
                <span className={styles.num} aria-hidden="true">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            계속 둘러볼게요
          </Button>
        </BottomSheet>
      )}
    </>
  );
}
