import { getProduct, TOTAL_EVENT_PRODUCT_COUNT, type ProductId } from './products';
import { EVENT_PERIOD, type StoreId } from './stores';

/**
 * 매장 담당자 화면(M-1 · M-2) 목업 데이터.
 * 숫자·상품은 포트폴리오 Figma(ux포트폴리오_20261122, 13 · UI Design · Trust)의 M-1 · M-2 초안 그대로다.
 * 새 수치를 만들지 않는다.
 */

/** 담당자 계정이 관리하는 매장 — "하나로마트 신촌점 · 담당자 계정" */
export const MANAGER_STORE_ID: StoreId = 'sinchon';

/** M-1 "최근 올린 전단" (Figma M-1) */
export const FLYER_HISTORY = [
  { period: '11.20(목) – 11.26(수)', productCount: 198 },
  { period: '11.13(목) – 11.19(수)', productCount: 186 },
] as const;

/** 이번 주 전단 = 고객 앱 '이번 주 행사'와 같은 기간·개수 */
export const THIS_WEEK_FLYER = { period: EVENT_PERIOD.label, productCount: TOTAL_EVENT_PRODUCT_COUNT };

export type ReviewIssue = 'price' | 'period';

export interface ReviewRow {
  id: string;
  name: string;
  /** 자동 정리된 가격·할인율. 가격을 읽지 못한 행도 수정 칸에 채울 원래 값을 둔다. */
  price?: number;
  rate?: number;
  /** 자동 정리가 안 된 항목 (주황 행) */
  issue?: ReviewIssue;
}

function fromProduct(id: ProductId, issue?: ReviewIssue): ReviewRow {
  const p = getProduct(id)!;
  return { id, name: p.name, price: p.finalPrice, rate: p.discountRate, issue };
}

/** M-2 정리된 상품 목록 — Figma M-2 초안의 6개 행 순서 그대로 */
export const REVIEW_ROWS: ReviewRow[] = [
  fromProduct('jeju-tangerine'),
  fromProduct('hanwoo-sirloin'),
  fromProduct('kimjang-set', 'price'),
  fromProduct('haenam-cabbage'),
  // 아래 두 상품은 고객 앱 상품 목록에는 없고, Figma M-2 초안에만 있다
  { id: 'garlic', name: '깐마늘 1kg', issue: 'period' },
  { id: 'pork-belly', name: '프로포크 돈육 삼겹살 100g', price: 1990, rate: 23 },
];

export const ISSUE_MESSAGE: Record<ReviewIssue, string> = {
  price: '가격을 확인해 주세요',
  period: '행사기간을 확인해 주세요',
};
