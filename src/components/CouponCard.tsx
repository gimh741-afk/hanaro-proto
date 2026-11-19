import claimedCheck from '../assets/icons/coupon-claimed-check.svg';
import condCheck from '../assets/icons/coupon-cond-check.svg';
import condX from '../assets/icons/coupon-cond-x.svg';
import ticketDisabled from '../assets/icons/coupon-ticket-disabled.svg';
import ticketIcon from '../assets/icons/coupon-ticket.svg';
import type { Coupon } from '../data/coupons';
import { getProduct } from '../data/products';
import { getStore } from '../data/stores';
import { formatManWon, formatWon } from '../utils/format';
import styles from './CouponCard.module.css';

/** claimable = 받기, claimed = 받음, unavailable = 불가(다른 매장 전용) */
export type CouponCardState = 'claimable' | 'claimed' | 'unavailable';

type CouponCardProps = {
  coupon: Coupon;
  state: CouponCardState;
  onClaim?: (coupon: Coupon) => void;
  /** 불가 상태의 "단골 매장 바꾸기" (동작 규칙 4: /stores로 이동) */
  onChangeStore?: (coupon: Coupon) => void;
};

/** 조건 1: 상품 쿠폰이면 "제주 감귤 3kg 살 때 사용", 아니면 최소 구매 금액 (B3-2 문구) */
function usageText(coupon: Coupon): string | undefined {
  if (coupon.productId) return `${getProduct(coupon.productId)?.name} 살 때 사용`;
  if (coupon.minSpend !== undefined) return `${formatManWon(coupon.minSpend)} 이상 사면 쓸 수 있어요`;
  return undefined;
}

/** 조건 2: 쓸 수 있는 매장 (B3-2: 쓸 수 있으면 ✓, 다른 매장 전용이면 ✕ — 문구는 같다) */
function scopeText(coupon: Coupon): string {
  if (coupon.scope.type === 'nationwide') return '전국 하나로마트에서 사용';
  return `${getStore(coupon.scope.storeId).name}에서 쓸 수 있어요`;
}

export function CouponCard({ coupon, state, onClaim, onChangeStore }: CouponCardProps) {
  const unavailable = state === 'unavailable';
  const usage = usageText(coupon);

  return (
    <article className={[styles.card, unavailable && styles.unavailable].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <span className={styles.iconBox}>
          <img src={unavailable ? ticketDisabled : ticketIcon} width={22} height={22} alt="" />
        </span>
        <div className={styles.titles}>
          <h3 className={styles.amount}>{formatWon(coupon.amount)} 할인</h3>
          <p className={styles.title}>{coupon.title}</p>
        </div>
      </div>

      <ul className={styles.conditions}>
        {usage && (
          <li className={styles.condition}>
            <img src={condCheck} width={14} height={14} alt="" />
            {usage}
          </li>
        )}
        <li className={styles.condition}>
          <img src={unavailable ? condX : condCheck} width={14} height={14} alt={unavailable ? '사용 불가:' : ''} />
          {scopeText(coupon)}
        </li>
        <li className={styles.condition}>
          <img src={condCheck} width={14} height={14} alt="" />
          {coupon.expiresLabel}
        </li>
      </ul>

      {state === 'claimable' && (
        <button
          type="button"
          className={`${styles.cta} ${styles.ctaClaim}`}
          aria-label={`${coupon.title} 받기`}
          onClick={() => onClaim?.(coupon)}
        >
          쿠폰 받기
        </button>
      )}
      {state === 'claimed' && (
        <p className={`${styles.cta} ${styles.ctaClaimed}`}>
          <img src={claimedCheck} width={16} height={16} alt="" />
          받았어요 · 계산할 때 자동 할인
        </p>
      )}
      {unavailable && (
        <button
          type="button"
          className={`${styles.cta} ${styles.ctaChangeStore}`}
          onClick={() => onChangeStore?.(coupon)}
        >
          단골 매장 바꾸기
        </button>
      )}
    </article>
  );
}
