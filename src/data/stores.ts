export type StoreId = 'sinchon' | 'yangjae' | 'seocho' | 'umyeon' | 'naegok';

/** active = 이번 주 전단 있음, preparing = 이번 주 전단 미등록(행사 목록 빈 상태, S-2) */
export type StoreEventStatus = 'active' | 'preparing';

export interface Store {
  id: StoreId;
  name: string;
  district: string;
  distanceKm: number;
  eventStatus: StoreEventStatus;
}

/** 이번 주 행사 기간. 요일이 맞는 연도(2025)로 ISO 날짜를 적어 둔다. */
export const EVENT_PERIOD = {
  start: '2025-11-27',
  end: '2025-12-03',
  label: '11.27 – 12.03',
  startLabel: '11.27',
} as const;

// prettier-ignore
export const STORES: Store[] = [
  { id: 'sinchon', name: '신촌점', district: '서대문구', distanceKm: 6.8, eventStatus: 'active' },
  { id: 'yangjae', name: '양재점', district: '서초구', distanceKm: 1.2, eventStatus: 'active' },
  { id: 'seocho', name: '서초점', district: '서초구', distanceKm: 2.0, eventStatus: 'active' },
  { id: 'umyeon', name: '우면점', district: '서초구', distanceKm: 2.8, eventStatus: 'preparing' },
  { id: 'naegok', name: '내곡점', district: '서초구', distanceKm: 4.1, eventStatus: 'preparing' },
];

export const DEFAULT_STORE_ID: StoreId = 'sinchon';

/** 매장 행 배지 (B1-2 내 주변 매장, S-2 근처 매장) */
export const STORE_EVENT_STATUS_LABEL: Record<StoreEventStatus, string> = {
  active: '행사 있음',
  preparing: '전단 미등록',
};

export function getStore(id: StoreId): Store {
  const store = STORES.find((s) => s.id === id);
  if (!store) throw new Error(`Unknown store: ${id}`);
  return store;
}

/**
 * 매장 검색 — 매장 이름·구 이름으로 거른다 ('양재' → 양재점, '서초' → 서초구 매장들).
 * 안내 예시 '양재동', '서초농협'처럼 붙여 쓰는 말(하나로마트·농협·점·동)과 띄어쓰기는 떼고 찾는다.
 */
export function searchStores(query: string): Store[] {
  const raw = query.replace(/\s+/g, '');
  if (!raw) return [];
  // '서초점'처럼 매장 이름을 그대로 쓰면 그 매장만
  if (raw.endsWith('점')) {
    const exact = STORES.filter((s) => `하나로마트${s.name}`.endsWith(raw));
    if (exact.length > 0) return exact;
  }
  const core = raw.replace(/^하나로마트/, '').replace(/(농협|점|동)$/, '') || raw;
  return STORES.filter((s) => s.name.includes(core) || s.district.includes(core));
}

/** 가까운 순 (현재 위치 기준 distanceKm) — 단골 매장 고르기·첫 실행 매장 선택 */
export function sortByDistance(stores: readonly Store[]): Store[] {
  return [...stores].sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * 행사 준비 중 매장의 빈 상태(S-2) "근처 매장은 지금 행사 중이에요" 목록 — 행사 중 매장 중 가까운 2곳.
 * 거리는 단골 매장 고르기와 같은 '현재 위치 기준' 값을 쓴다 (2026-11-27, 화면마다 거리가 달라 보이던 문제).
 */
export function getNearbyEventStores(_id: StoreId): Store[] {
  return sortByDistance(STORES.filter((s) => s.eventStatus === 'active')).slice(0, 2);
}

export function isStoreId(value: unknown): value is StoreId {
  return typeof value === 'string' && STORES.some((s) => s.id === value);
}
