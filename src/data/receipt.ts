import { getCoupon, type CouponId } from './coupons';
import type { StoreId } from './stores';

/**
 * 영수증 (방금 계산한 장보기 + 지난 결제) 예시 데이터.
 * 받은 할인은 실제로 적용된 것만 보여 준다: 받은 감귤 상품쿠폰 2,196원 · NH카드 1,000원 · NH포인트 적립.
 * 받지 않은 쿠폰이나 조건이 안 맞은 쿠폰(김장맞이 6만 원 미만)은 영수증에 보여 주지 않는다 (2026-11-27).
 */
export interface AppliedDiscount {
  title: string;
  /** 할인 금액. 포인트 적립처럼 금액이 없는 항목은 비운다. */
  amount?: number;
  kind: 'coupon' | 'card' | 'point';
}

export interface Receipt {
  dateLabel: string;
  storeId: StoreId;
  applied: AppliedDiscount[];
}

export function buildLatestReceipt(claimed: readonly CouponId[]): Receipt {
  const applied: AppliedDiscount[] = [];
  const tangerine = getCoupon('tangerine-2196')!;
  if (claimed.includes(tangerine.id)) {
    applied.push({ title: '제주 감귤 3kg · 상품쿠폰', amount: tangerine.amount, kind: 'coupon' });
  }
  applied.push({ title: '제주 감귤 3kg · NH카드 할인', amount: 1000, kind: 'card' });
  applied.push({ title: 'NH포인트 적립', kind: 'point' });
  return { dateLabel: '11.27', storeId: 'sinchon', applied };
}

export function sumApplied(receipt: Receipt): number {
  return receipt.applied.reduce((sum, d) => sum + (d.amount ?? 0), 0);
}

/** 지난 결제 (최근 3개월) — 2026-11-27 요청서 예시 데이터 그대로 */
export interface PastPayment {
  dateLabel: string;
  storeId: StoreId;
  paidAmount: number;
  /** 할인 금액. 0이면 '할인 없음' */
  discountAmount: number;
}

export const PAST_PAYMENTS: PastPayment[] = [
  { dateLabel: '11.20', storeId: 'sinchon', paidAmount: 38400, discountAmount: 2100 },
  { dateLabel: '11.13', storeId: 'sinchon', paidAmount: 24900, discountAmount: 0 },
  { dateLabel: '11.06', storeId: 'sinchon', paidAmount: 61200, discountAmount: 4000 },
  { dateLabel: '10.30', storeId: 'sinchon', paidAmount: 17800, discountAmount: 1000 },
];
