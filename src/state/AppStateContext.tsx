import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  COUPONS,
  getClaimableCoupons,
  isCouponId,
  sumCouponAmount,
  type Coupon,
  type CouponId,
} from '../data/coupons';
import { DEFAULT_STORE_ID, getStore, isStoreId, type Store, type StoreId } from '../data/stores';
import { DEFAULT_WISHLIST, isWishId, type WishId } from '../data/wishlist';

/* ------------------------------------------------------------------ */
/* 상태 모양                                                            */
/* ------------------------------------------------------------------ */

/** auth-fail = 로그인 실패(S-1), flyer-fail = 담당자가 올린 전단에서 글자를 읽지 못함(M-1 실패 경로) */
export type Scenario = 'auth-fail' | 'flyer-fail';

function toScenario(value: unknown): Scenario | null {
  return value === 'auth-fail' || value === 'flyer-fail' ? value : null;
}

export type PublishedFlyer = 'items' | 'image';

export interface AppState {
  isLoggedIn: boolean;
  /** 매장 담당자 계정 (MY > 매장 관리가 보인다). 실제 인증은 없다. */
  isManager: boolean;
  favoriteStoreId: StoreId;
  claimedCouponIds: CouponId[];
  /** 찜한 상품 (이번 주 행사 상품 + 행사 정보가 없는 상품). 회원 초기값 2개 */
  wishlistIds: WishId[];
  /** 담당자가 이번 주 전단을 고객에게 게시한 방식 — items: 정리된 상품으로, image: 전단 이미지 그대로 (M-1 최근 올린 전단 목록) */
  publishedFlyer: PublishedFlyer | null;
  /** `?scenario=auth-fail` 처럼 URL로 들어온 테스트 시나리오. 라우트 이동 뒤에도 기억한다. */
  scenario: Scenario | null;
}

const STORAGE_KEY = 'hanaro-proto:v1';

/** `?scenario=after-checkout`으로 바로 여는 화면 */
export const RECEIPT_PATH = '/my/receipt';

function createDefaultState(overrides: Partial<AppState> = {}): AppState {
  return {
    isLoggedIn: false,
    isManager: false,
    favoriteStoreId: DEFAULT_STORE_ID,
    claimedCouponIds: [],
    wishlistIds: [...DEFAULT_WISHLIST],
    publishedFlyer: null,
    scenario: null,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* localStorage                                                         */
/* ------------------------------------------------------------------ */

function loadStoredState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const p = parsed as Record<string, unknown>;
    return createDefaultState({
      isLoggedIn: p.isLoggedIn === true,
      isManager: p.isLoggedIn === true && p.isManager === true,
      favoriteStoreId: isStoreId(p.favoriteStoreId) ? p.favoriteStoreId : DEFAULT_STORE_ID,
      claimedCouponIds: Array.isArray(p.claimedCouponIds) ? p.claimedCouponIds.filter(isCouponId) : [],
      wishlistIds: Array.isArray(p.wishlistIds) ? p.wishlistIds.filter(isWishId) : [...DEFAULT_WISHLIST],
      publishedFlyer: p.publishedFlyer === 'items' || p.publishedFlyer === 'image' ? p.publishedFlyer : null,
      scenario: toScenario(p.scenario),
    });
  } catch {
    return null;
  }
}

function saveState(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 시크릿 모드 등에서 저장이 막혀도 앱은 메모리 상태로 계속 동작한다.
  }
}

function clearStoredState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}

/* ------------------------------------------------------------------ */
/* URL 파라미터로 시작 상태 정하기 (Maze 테스트 지원)                    */
/* ------------------------------------------------------------------ */

/**
 * 앱 시작 시 **한 번만** 호출한다 (main.tsx). StrictMode의 이중 렌더와 무관하게
 * URL 처리와 localStorage 초기화가 한 번만 일어나도록 렌더 바깥에서 실행한다.
 *
 * - `?reset=1`        localStorage를 지우고 기본 상태(비회원 · 신촌점 · 쿠폰 미수령)로 시작
 * - `?start=guest`    T0: 비회원 · 신촌점 단골 · 쿠폰 미수령
 * - `?start=member`   T1–T3: 회원 · 신촌점 단골 · 쿠폰 미수령
 * - `?start=manager`  신촌점 담당자 계정 (MY > 매장 관리 → 전단 올리기 흐름 시연용)
 * - `?scenario=auth-fail`  로그인 시 /auth/recover로 보내는 시나리오를 켠다
 * - `?scenario=flyer-fail` 담당자가 올린 전단에서 글자를 읽지 못하는 실패 경로를 켠다
 * - `?scenario=after-checkout` 방금 계산을 마친 상태(감귤·김장맞이 쿠폰 받음)로 영수증 · 할인 확인 화면에서 시작한다
 *
 * 처리한 `start`, `reset`, `scenario` 파라미터는 주소에서 지워서 새로고침해도 진행 상황이 초기화되지 않게 한다.
 */
export function resolveInitialState(): AppState {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const reset = params.get('reset') === '1';
  const start = params.get('start');
  const scenarioParam = params.get('scenario');
  const scenario = toScenario(scenarioParam);
  // 계산 직후 데모: 상태에 남기지 않고 시작 화면·받은 쿠폰만 정한다
  const afterCheckout = scenarioParam === 'after-checkout';

  if (reset) clearStoredState();

  let state: AppState;
  if (start === 'guest' || start === 'member' || start === 'manager') {
    state = createDefaultState({ isLoggedIn: start !== 'guest', isManager: start === 'manager', scenario });
  } else if (reset) {
    state = createDefaultState({ scenario });
  } else {
    const stored = loadStoredState() ?? createDefaultState();
    state = scenarioParam !== null ? { ...stored, scenario } : stored;
  }

  // scenario도 상태에 저장했으니 주소에서 지운다. 남겨 두면 S-1에서 인증을 끝낸 뒤 새로고침할 때 다시 켜진다.
  if (params.has('start') || params.has('reset') || params.has('scenario')) {
    params.delete('start');
    params.delete('reset');
    params.delete('scenario');
    const search = params.toString();
    const pathname = afterCheckout ? RECEIPT_PATH : url.pathname;
    window.history.replaceState(window.history.state, '', `${pathname}${search ? `?${search}` : ''}${url.hash}`);
  }

  if (afterCheckout) {
    // 영수증의 감귤 상품쿠폰이 적용됐고, 김장맞이 쿠폰은 받았지만 최소 금액이 모자라 적용되지 않은 상태
    state = { ...state, isLoggedIn: true, claimedCouponIds: ['tangerine-2196', 'kimjang-4000'] };
  }

  saveState(state);
  return state;
}

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

export interface AppStateValue extends AppState {
  favoriteStore: Store;
  /** 현재 단골 매장에서 쓸 수 있는데 아직 받지 않은 쿠폰 (동작 규칙 2) */
  claimableCoupons: Coupon[];
  claimableAmount: number;
  /** 받은 쿠폰 (내 쿠폰) */
  myCoupons: Coupon[];
  isCouponClaimed: (id: CouponId) => boolean;
  /** 찜한 상품인지 — 비회원에게는 항상 false (찜은 로그인 후) */
  isWished: (id: WishId) => boolean;

  login: () => void;
  logout: () => void;
  setFavoriteStore: (id: StoreId) => void;
  claimCoupon: (id: CouponId) => void;
  /** 찜을 켜거나 끈다 */
  setWished: (id: WishId, on: boolean) => void;
  /** 인증 실패 시나리오를 끝낸다 (S-1에서 다시 인증하면 성공 처리) */
  clearScenario: () => void;
  /** 저장된 상태를 지우고 기본 상태로 되돌린다 (개발용 메뉴) */
  resetAll: () => void;
  /** 개발용 메뉴: Maze 시작 상태로 (신촌점 단골, 쿠폰 미수령, 시나리오 꺼짐) — `?start=`와 같다 */
  startAs: (kind: 'guest' | 'member' | 'manager') => void;
  /** M-2(정리된 상품) 또는 M-1 실패 경로(이미지 그대로)에서 이번 주 전단을 고객에게 게시 */
  publishFlyer: (how: PublishedFlyer) => void;
  /** 개발용 메뉴: 상태 일부를 바로 바꾼다 */
  patchState: (patch: Partial<AppState>) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ initialState, children }: { initialState: AppState; children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const login = useCallback(() => setState((s) => ({ ...s, isLoggedIn: true })), []);
  // 로그아웃하면 받은 쿠폰도 비운다 — 남겨 두면 다 받은 뒤 로그아웃했을 때 B0-1 카드가 "0원 쿠폰 0장 받기"가 된다.
  // 다시 로그인하면 B0-1이 약속한 "{금액} 쿠폰 {N}장 받기"를 그대로 받을 수 있다.
  const logout = useCallback(
    () => setState((s) => ({ ...s, isLoggedIn: false, isManager: false, claimedCouponIds: [] })),
    [],
  );
  const setFavoriteStore = useCallback((id: StoreId) => setState((s) => ({ ...s, favoriteStoreId: id })), []);
  const claimCoupon = useCallback(
    (id: CouponId) =>
      setState((s) => (s.claimedCouponIds.includes(id) ? s : { ...s, claimedCouponIds: [...s.claimedCouponIds, id] })),
    [],
  );
  const setWished = useCallback(
    (id: WishId, on: boolean) =>
      setState((s) => {
        const has = s.wishlistIds.includes(id);
        if (has === on) return s;
        return { ...s, wishlistIds: on ? [...s.wishlistIds, id] : s.wishlistIds.filter((w) => w !== id) };
      }),
    [],
  );
  const clearScenario = useCallback(() => setState((s) => ({ ...s, scenario: null })), []);
  const resetAll = useCallback(() => {
    clearStoredState();
    setState(createDefaultState());
  }, []);
  const startAs = useCallback(
    (kind: 'guest' | 'member' | 'manager') =>
      setState(createDefaultState({ isLoggedIn: kind !== 'guest', isManager: kind === 'manager' })),
    [],
  );
  const publishFlyer = useCallback((how: PublishedFlyer) => setState((s) => ({ ...s, publishedFlyer: how })), []);
  const patchState = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);

  const value = useMemo<AppStateValue>(() => {
    const claimableCoupons = getClaimableCoupons(state.favoriteStoreId, state.claimedCouponIds);
    return {
      ...state,
      favoriteStore: getStore(state.favoriteStoreId),
      claimableCoupons,
      claimableAmount: sumCouponAmount(claimableCoupons),
      myCoupons: COUPONS.filter((c) => state.claimedCouponIds.includes(c.id)),
      isCouponClaimed: (id) => state.claimedCouponIds.includes(id),
      isWished: (id) => state.isLoggedIn && state.wishlistIds.includes(id),
      login,
      logout,
      setFavoriteStore,
      claimCoupon,
      setWished,
      clearScenario,
      resetAll,
      startAs,
      publishFlyer,
      patchState,
    };
  }, [state, login, logout, setFavoriteStore, claimCoupon, setWished, clearScenario, resetAll, startAs, publishFlyer, patchState]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
