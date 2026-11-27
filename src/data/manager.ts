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
  { period: '11.20 – 11.26', productCount: 198 },
  { period: '11.13 – 11.19', productCount: 186 },
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
  /** 담당자가 고친 행사기간 (없으면 이번 주 전단 기간) */
  period?: string;
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

/** 담당자가 M-2에서 고친 값. 게시할 때 저장해서 고객 화면에 그대로 쓴다. */
export interface FlyerEdit {
  price?: number;
  period?: string;
}
export type FlyerEdits = Record<string, FlyerEdit>;

/**
 * 고객 앱에는 행사 정보가 없던 찜 상품이 담당자 전단에 있는 경우 — 고객 찜 id → M-2 행 id.
 * 깐마늘 1kg: 게시 전에는 "아직 신촌점 행사 정보가 없어요", 게시 후에는 행사 상품 카드.
 */
export const FLYER_ROW_FOR_WISH: Record<string, string> = { 'peeled-garlic': 'garlic' };

export interface FlyerItemInfo {
  name: string;
  /** 전단 정리 데이터에 있는 값만. 깐마늘은 M-2 초안에 가격·할인율이 없어 비어 있다. */
  price?: number;
  rate?: number;
  period: string;
}

/** 게시된 전단의 한 상품 (전단 정리 데이터 + 담당자가 고친 값) */
export function getFlyerItemInfo(rowId: string, edits: FlyerEdits): FlyerItemInfo | undefined {
  const row = REVIEW_ROWS.find((r) => r.id === rowId);
  if (!row) return undefined;
  const edit = edits[rowId] ?? {};
  return {
    name: row.name,
    price: edit.price ?? row.price,
    rate: row.rate,
    period: edit.period ?? THIS_WEEK_FLYER.period,
  };
}

/** '11.27 – 12.03' → '~12.03까지' (상품 카드 마감 표기와 같은 형식). 형식이 다르면 '행사기간 …' */
export function periodCaption(period: string): string {
  const end = period.split(/[–~-]/).pop()?.trim();
  return end && /^\d{1,2}\.\d{1,2}$/.test(end) ? `~${end}까지` : `행사기간 ${period}`;
}

export const ISSUE_MESSAGE: Record<ReviewIssue, string> = {
  price: '가격을 확인해 주세요',
  period: '행사기간을 확인해 주세요',
};
