export type ProductId = 'jeju-tangerine' | 'hanwoo-sirloin' | 'kimjang-set' | 'haenam-cabbage';

export type ProductBadge = '농할' | '회원가' | '기획전';

/** 할인 종류 — 목록 카드에서 색이 아니라 글자로 구분한다 ("쿠폰", "카드") */
export type DiscountKind = 'coupon' | 'card';

export interface PriceDiscount {
  kind: DiscountKind;
  label: string;
  amount: number;
  /** 이 할인이 상품 쿠폰이면 해당 쿠폰 id */
  couponId?: string;
}

export interface Product {
  id: ProductId;
  name: string;
  badge: ProductBadge;
  discountRate: number;
  finalPrice: number;
  /** 정가. 목업 데이터에 있는 상품만 채운다. */
  originalPrice?: number;
  /** 가격 계산표(정가 → 할인 → 내가 내는 가격)에 쓰는 할인 내역 */
  discounts?: PriceDiscount[];
  /** 행사 마감 표기, 예: '12.03까지' */
  endsLabel?: string;
  /** 행사 마감일(ISO). 남은 일수 계산용 */
  endsAt?: string;
}

/** 행사 매장 공통 행사상품 총 개수. 실제 구현은 아래 4개뿐이다. */
export const TOTAL_EVENT_PRODUCT_COUNT = 203;

export const PRODUCTS: Product[] = [
  {
    id: 'jeju-tangerine',
    name: '제주 감귤 3kg',
    badge: '농할',
    discountRate: 29,
    finalPrice: 7784,
    originalPrice: 10980,
    discounts: [
      { kind: 'card', label: 'NH카드', amount: 1000 },
      { kind: 'coupon', label: '상품 쿠폰', amount: 2196, couponId: 'tangerine-2196' },
    ],
    endsLabel: '12.03까지',
    endsAt: '2025-12-03',
  },
  {
    id: 'hanwoo-sirloin',
    name: '한우 1등급 등심 100g',
    badge: '회원가',
    discountRate: 10,
    finalPrice: 8980,
    endsLabel: '11.30까지',
    endsAt: '2025-11-30',
  },
  {
    id: 'kimjang-set',
    name: '김장 재료 기획 세트',
    badge: '기획전',
    discountRate: 15,
    finalPrice: 33915,
    // B0-1 홈 상품 카드 기준
    endsLabel: '12.03까지',
    endsAt: '2025-12-03',
  },
  {
    id: 'haenam-cabbage',
    name: '해남 절임배추 20kg',
    badge: '회원가',
    discountRate: 12,
    finalPrice: 35100,
    // B0-2 행사 목록 상품 카드 기준
    endsLabel: '12.03까지',
    endsAt: '2025-12-03',
  },
];

export function getProduct(id: string | undefined): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
