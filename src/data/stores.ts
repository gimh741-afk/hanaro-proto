export type StoreId = 'sinchon' | 'yangjae' | 'seocho' | 'umyeon' | 'naegok';

/** active = 행사 중, preparing = 행사 준비 중(행사 목록 빈 상태, S-2) */
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
  /** 홈 "11.27 새 행사가 올라왔어요" */
  startShort: '11.27',
  /** 행사 목록 "신촌점이 11.27(목) 오전 9시에 올린 행사예요" */
  postedLabel: '11.27(목) 오전 9시',
} as const;

export const STORES: Store[] = [
  { id: 'sinchon', name: '신촌점', district: '서대문구', distanceKm: 6.8, eventStatus: 'active' },
  { id: 'yangjae', name: '양재점', district: '서초구', distanceKm: 1.2, eventStatus: 'active' },
  { id: 'seocho', name: '서초점', district: '서초구', distanceKm: 2.0, eventStatus: 'active' },
  { id: 'umyeon', name: '우면점', district: '서초구', distanceKm: 2.8, eventStatus: 'preparing' },
  { id: 'naegok', name: '내곡점', district: '서초구', distanceKm: 4.1, eventStatus: 'preparing' },
];

export const DEFAULT_STORE_ID: StoreId = 'sinchon';

export const STORE_EVENT_STATUS_LABEL: Record<StoreEventStatus, string> = {
  active: '행사 중',
  preparing: '행사 준비 중',
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
