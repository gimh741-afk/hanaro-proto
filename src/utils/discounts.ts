import { getCoupon, isCouponUsableAt } from '../data/coupons';
import type { Product } from '../data/products';
import type { StoreId } from '../data/stores';
import { formatWon } from './format';

/**
 * 이번 주 행사 목록(B0-2 · B2-2) 상품 카드에 보여 줄 할인 조건 — 할인 하나에 한 줄.
 * 할인 종류는 색이 아니라 글자로 구분한다: "쿠폰 쓰면 2,196원 할인", "NH카드 쓰면 1,000원 할인".
 * - 쿠폰을 먼저, 카드 할인을 다음에 둔다.
 * - 지금 단골 매장에서 쓸 수 없는 쿠폰(다른 매장 전용)은 넣지 않는다.
 * - 프로토타입 데이터에 있는 할인만 쓴다. 할인 정보가 없는 상품은 빈 배열.
 */
export function getDiscountLines(product: Product, storeId: StoreId): string[] {
  const discounts = product.discounts ?? [];
  const coupons = discounts
    .filter((d) => d.kind === 'coupon' && d.couponId)
    .filter((d) => {
      const coupon = getCoupon(d.couponId!);
      return coupon ? isCouponUsableAt(coupon, storeId) : false;
    })
    .map((d) => `쿠폰 쓰면 ${formatWon(d.amount)} 할인`);
  const cards = discounts.filter((d) => d.kind === 'card').map((d) => `${d.label} 쓰면 ${formatWon(d.amount)} 할인`);
  return [...coupons, ...cards];
}
