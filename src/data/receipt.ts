import { getCoupon, type CouponId } from './coupons';
import type { StoreId } from './stores';
import { formatManWon, formatWon } from '../utils/format';

/**
 * 영수증 · 할인 확인 (방금 계산한 장보기) 예시 데이터.
 * 할인은 프로토타입에 이미 있는 것만 쓴다: 감귤 상품쿠폰 2,196원 · NH카드 1,000원 · NH포인트 적립.
 * 쿠폰은 실제로 받은 것만 적용된다 — 받지 않은 감귤 쿠폰은 '적용되지 않은 할인'으로, 김장맞이는 받았을 때만 보여 준다.
 */
export interface AppliedDiscount {
  title: string;
  /** 할인 금액. 포인트 적립처럼 금액이 없는 항목은 비운다. */
  amount?: number;
  kind: 'coupon' | 'card' | 'point';
}

export interface MissedDiscount {
  id: string;
  title: string;
  /** 적용되지 않은 이유 */
  reason: string;
}

export interface Receipt {
  dateLabel: string;
  storeId: StoreId;
  applied: AppliedDiscount[];
  missed: MissedDiscount[];
}

/** 이번 결제 금액 — 김장맞이 쿠폰 최소 금액(6만 원)에 못 미친 이유를 보여 준다 */
const PAID_AMOUNT = 52300;

export function buildLatestReceipt(claimed: readonly CouponId[]): Receipt {
  const applied: AppliedDiscount[] = [];
  const missed: MissedDiscount[] = [];

  const tangerine = getCoupon('tangerine-2196')!;
  if (claimed.includes(tangerine.id)) {
    applied.push({ title: '제주 감귤 3kg · 상품쿠폰', amount: tangerine.amount, kind: 'coupon' });
  } else {
    missed.push({
      id: tangerine.id,
      title: `${tangerine.title} ${formatWon(tangerine.amount)}`,
      reason: '쿠폰을 받지 않아 적용되지 않았어요',
    });
  }
  applied.push({ title: '제주 감귤 3kg · NH카드 할인', amount: 1000, kind: 'card' });
  applied.push({ title: 'NH포인트 적립', kind: 'point' });

  const kimjang = getCoupon('kimjang-4000')!;
  if (claimed.includes(kimjang.id)) {
    missed.push({
      id: kimjang.id,
      title: `${kimjang.title} ${formatWon(kimjang.amount)}`,
      reason: `${formatManWon(kimjang.minSpend!)} 이상 사면 쓸 수 있어요. 이번 결제는 ${formatWon(PAID_AMOUNT)}이라 적용되지 않았어요.`,
    });
  }

  return { dateLabel: '11.27', storeId: 'sinchon', applied, missed };
}

export function sumApplied(receipt: Receipt): number {
  return receipt.applied.reduce((sum, d) => sum + (d.amount ?? 0), 0);
}
