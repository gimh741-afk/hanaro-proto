import type { ProductId } from './products';
import type { StoreId } from './stores';

export type CouponId = 'kimjang-4000' | 'tangerine-2196' | 'yangjae-open-1000';

export type CouponScope = { type: 'nationwide' } | { type: 'store'; storeId: StoreId };

export interface Coupon {
  id: CouponId;
  amount: number;
  title: string;
  /** 최소 구매 금액 (없으면 조건 없음) */
  minSpend?: number;
  scope: CouponScope;
  /** 상품 쿠폰이면 대상 상품 */
  productId?: ProductId;
  expiresLabel: string;
  expiresAt: string;
}

export const COUPONS: Coupon[] = [
  {
    id: 'kimjang-4000',
    amount: 4000,
    title: '김장맞이 할인쿠폰',
    minSpend: 60000,
    scope: { type: 'nationwide' },
    expiresLabel: '12.03까지',
    expiresAt: '2025-12-03',
  },
  {
    id: 'tangerine-2196',
    amount: 2196,
    title: '제주 감귤 3kg 상품쿠폰',
    scope: { type: 'store', storeId: 'sinchon' },
    productId: 'jeju-tangerine',
    expiresLabel: '12.03까지',
    expiresAt: '2025-12-03',
  },
  {
    id: 'yangjae-open-1000',
    amount: 1000,
    title: '양재점 오픈 기념 쿠폰',
    minSpend: 10000,
    scope: { type: 'store', storeId: 'yangjae' },
    expiresLabel: '11.30까지',
    expiresAt: '2025-11-30',
  },
];

export function getCoupon(id: string): Coupon | undefined {
  return COUPONS.find((c) => c.id === id);
}

export function isCouponId(value: unknown): value is CouponId {
  return typeof value === 'string' && COUPONS.some((c) => c.id === value);
}

export function isCouponUsableAt(coupon: Coupon, storeId: StoreId): boolean {
  return coupon.scope.type === 'nationwide' || coupon.scope.storeId === storeId;
}

/**
 * 받을 수 있는 쿠폰 = 현재 단골 매장에서 쓸 수 있는데 아직 받지 않은 쿠폰 (CLAUDE.md 동작 규칙 2).
 * 신촌점 기준 4,000 + 2,196 = 6,196원 2장.
 */
export function getClaimableCoupons(storeId: StoreId, claimedIds: readonly CouponId[]): Coupon[] {
  return COUPONS.filter((c) => isCouponUsableAt(c, storeId) && !claimedIds.includes(c.id));
}

export function sumCouponAmount(coupons: readonly Coupon[]): number {
  return coupons.reduce((sum, c) => sum + c.amount, 0);
}
