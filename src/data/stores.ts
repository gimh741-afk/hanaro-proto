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
  label: '11.27(목) – 12.03(수)',
  startLabel: '11.27(목)',
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
 * 행사 준비 중 매장의 빈 상태(S-2) "근처 매장은 지금 행사 중이에요" 목록.
 * 거리는 사용자 위치가 아니라 그 매장에서 잰 거리다 (Figma S-2: 양재점 1.9km, 서초점 2.6km).
 * 내곡점은 Figma에 없어서 사용자 기준 거리로 가까운 행사 중 매장 2곳을 보여 준다.
 */
export function getNearbyEventStores(id: StoreId): { store: Store; distanceKm: number }[] {
  if (id === 'umyeon') {
    return [
      { store: getStore('yangjae'), distanceKm: 1.9 },
      { store: getStore('seocho'), distanceKm: 2.6 },
    ];
  }
  return STORES.filter((s) => s.eventStatus === 'active')
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 2)
    .map((store) => ({ store, distanceKm: store.distanceKm }));
}

export function isStoreId(value: unknown): value is StoreId {
  return typeof value === 'string' && STORES.some((s) => s.id === value);
}
