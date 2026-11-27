import type { CouponId } from './coupons';
import type { StoreId } from './stores';

/**
 * 영수증 · 할인 확인 (방금 계산한 장보기) 예시 데이터.
 * 할인은 프로토타입에 이미 있는 것만 쓴다: 감귤 상품쿠폰 2,196원 · NH카드 1,000원 · NH포인트 적립.
 */
export interface AppliedDiscount {
  title: string;
  /** 할인 금액. 포인트 적립처럼 금액이 없는 항목은 비운다. */
  amount?: number;
  kind: 'coupon' | 'card' | 'point';
}

export interface MissedDiscount {
  couponId: CouponId;
  /** 이번 결제 금액 — 쿠폰 최소 금액에 못 미친 이유를 보여 준다 */
  paidAmount: number;
}

export interface Receipt {
  dateLabel: string;
  storeId: StoreId;
  applied: AppliedDiscount[];
  missed: MissedDiscount[];
}

export const LATEST_RECEIPT: Receipt = {
  dateLabel: '11.27(목)',
  storeId: 'sinchon',
  applied: [
    { title: '제주 감귤 3kg · 상품쿠폰', amount: 2196, kind: 'coupon' },
    { title: '제주 감귤 3kg · NH카드 할인', amount: 1000, kind: 'card' },
    { title: 'NH포인트 적립', kind: 'point' },
  ],
  missed: [{ couponId: 'kimjang-4000', paidAmount: 52300 }],
};

export function sumApplied(receipt: Receipt): number {
  return receipt.applied.reduce((sum, d) => sum + (d.amount ?? 0), 0);
}
