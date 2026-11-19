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

/* ------------------------------------------------------------------ */
/* 상태 모양                                                            */
/* ------------------------------------------------------------------ */

export type Scenario = 'auth-fail';

export interface AppState {
  isLoggedIn: boolean;
  favoriteStoreId: StoreId;
  claimedCouponIds: CouponId[];
  /** `?scenario=auth-fail` 처럼 URL로 들어온 테스트 시나리오. 라우트 이동 뒤에도 기억한다. */
  scenario: Scenario | null;
}

const STORAGE_KEY = 'hanaro-proto:v1';

function createDefaultState(overrides: Partial<AppState> = {}): AppState {
  return {
    isLoggedIn: false,
    favoriteStoreId: DEFAULT_STORE_ID,
    claimedCouponIds: [],
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
      favoriteStoreId: isStoreId(p.favoriteStoreId) ? p.favoriteStoreId : DEFAULT_STORE_ID,
      claimedCouponIds: Array.isArray(p.claimedCouponIds) ? p.claimedCouponIds.filter(isCouponId) : [],
      scenario: p.scenario === 'auth-fail' ? 'auth-fail' : null,
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
 * - `?scenario=auth-fail`  로그인 시 /auth/recover로 보내는 시나리오를 켠다
 *
 * 처리한 `start`, `reset`, `scenario` 파라미터는 주소에서 지워서 새로고침해도 진행 상황이 초기화되지 않게 한다.
 */
export function resolveInitialState(): AppState {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const reset = params.get('reset') === '1';
  const start = params.get('start');
  const scenarioParam = params.get('scenario');
  const scenario: Scenario | null = scenarioParam === 'auth-fail' ? 'auth-fail' : null;

  if (reset) clearStoredState();

  let state: AppState;
  if (start === 'guest' || start === 'member') {
    state = createDefaultState({ isLoggedIn: start === 'member', scenario });
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
    window.history.replaceState(window.history.state, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`);
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

  login: () => void;
  logout: () => void;
  setFavoriteStore: (id: StoreId) => void;
  claimCoupon: (id: CouponId) => void;
  /** 인증 실패 시나리오를 끝낸다 (S-1에서 다시 인증하면 성공 처리) */
  clearScenario: () => void;
  /** 저장된 상태를 지우고 기본 상태로 되돌린다 (개발용 메뉴) */
  resetAll: () => void;
  /** 개발용 메뉴: Maze 시작 상태로 (신촌점 단골, 쿠폰 미수령, 시나리오 꺼짐) — `?start=`와 같다 */
  startAs: (kind: 'guest' | 'member') => void;
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
  const logout = useCallback(() => setState((s) => ({ ...s, isLoggedIn: false })), []);
  const setFavoriteStore = useCallback((id: StoreId) => setState((s) => ({ ...s, favoriteStoreId: id })), []);
  const claimCoupon = useCallback(
    (id: CouponId) =>
      setState((s) => (s.claimedCouponIds.includes(id) ? s : { ...s, claimedCouponIds: [...s.claimedCouponIds, id] })),
    [],
  );
  const clearScenario = useCallback(() => setState((s) => ({ ...s, scenario: null })), []);
  const resetAll = useCallback(() => {
    clearStoredState();
    setState(createDefaultState());
  }, []);
  const startAs = useCallback(
    (kind: 'guest' | 'member') => setState(createDefaultState({ isLoggedIn: kind === 'member' })),
    [],
  );
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
      login,
      logout,
      setFavoriteStore,
      claimCoupon,
      clearScenario,
      resetAll,
      startAs,
      patchState,
    };
  }, [state, login, logout, setFavoriteStore, claimCoupon, clearScenario, resetAll, startAs, patchState]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
