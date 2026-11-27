import { getProduct, type Product, type ProductId } from './products';

/**
 * 찜(관심상품) 목업 데이터.
 * 찜은 이번 주 행사 상품뿐 아니라 행사 정보가 없는 상품도 담을 수 있다 (예: 깐마늘 1kg).
 */

/** 이번 주 행사 상품이 아닌 찜 상품 — 행사 정보가 없는 상태를 보여 주기 위한 예시 */
export interface WatchItem {
  id: 'peeled-garlic';
  name: string;
}

export const WATCH_ITEMS: WatchItem[] = [{ id: 'peeled-garlic', name: '깐마늘 1kg' }];

export type WishId = ProductId | WatchItem['id'];

/** 회원 초기 찜 2개 (CLAUDE.md 회원 "찜한 행사상품 2개") */
export const DEFAULT_WISHLIST: WishId[] = ['hanwoo-sirloin', 'peeled-garlic'];

export function isWishId(value: unknown): value is WishId {
  return typeof value === 'string' && (getProduct(value) !== undefined || WATCH_ITEMS.some((w) => w.id === value));
}

export type WishEntry = { kind: 'event'; product: Product } | { kind: 'watch'; item: WatchItem };

export function getWishEntry(id: WishId): WishEntry | undefined {
  const product = getProduct(id);
  if (product) return { kind: 'event', product };
  const item = WATCH_ITEMS.find((w) => w.id === id);
  return item ? { kind: 'watch', item } : undefined;
}

export function getWishName(id: WishId): string {
  const entry = getWishEntry(id);
  if (!entry) return '';
  return entry.kind === 'event' ? entry.product.name : entry.item.name;
}

/**
 * 자주 산 상품 추천 — 최근 영수증에서 자주 산 상품 중 이번 주 행사 상품 (예시 데이터).
 * cheaperThanLastBy: 지난 구매가보다 얼마나 싼지. 지난 구매가가 있는 상품만 채운다.
 */
export interface FrequentPurchase {
  productId: ProductId;
  cheaperThanLastBy?: number;
}

export const FREQUENT_PURCHASES: FrequentPurchase[] = [
  { productId: 'jeju-tangerine', cheaperThanLastBy: 1000 },
  { productId: 'haenam-cabbage' },
];
