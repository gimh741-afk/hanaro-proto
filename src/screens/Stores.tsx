import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import chevLeft from '../assets/icons/chev-left.svg';
import locationIcon from '../assets/icons/location.svg';
import searchIcon from '../assets/icons/search.svg';
import { StatusBar } from '../components/StatusBar';
import { StoreRow } from '../components/StoreRow';
import { useToast } from '../components/Toast';
import { searchStores, sortByDistance, STORES, type Store } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import styles from './Stores.module.css';

/**
 * B1-2 단골 매장 고르기 (동작 규칙 1)
 * - 행사 있음 매장 → 단골 변경 후 홈으로 + 토스트 (B1-3, Maze 성공 경로 그대로)
 * - 전단 미등록 매장 → 단골 설정은 막지 않고, 바로 이번 주 행사 탭의 빈 상태(S-2)로 이어 준다
 *
 * onboarding: 첫 실행 ② 단골 매장 선택 (/welcome/store) — 같은 목록을 가까운 순으로 모두 보여 주고,
 * 고르면 그 매장으로 홈에 들어간다. 아직 단골이 없어서 '현재 단골 매장' 칸은 없다.
 *
 * 검색: 매장 이름·구 이름으로 거른다. 위치를 허용하지 않았으면 '내 주변 매장'과 거리를 숨기고
 * 검색칸에 바로 커서를 둔다.
 */
export default function Stores({ onboarding = false }: { onboarding?: boolean }) {
  const { favoriteStore, setFavoriteStore, finishOnboarding, locationAllowed } = useAppState();
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const results = sortByDistance(searchStores(query));
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();

  // 현재 단골을 뺀 나머지를 가까운 순으로 (첫 실행에서는 전부)
  const nearby = sortByDistance(onboarding ? STORES : STORES.filter((s) => s.id !== favoriteStore.id));

  const goBack = () => {
    if (onboarding) navigate('/welcome', { replace: true });
    // 주소로 바로 들어온 경우(이전 기록 없음)에는 홈으로
    else if (location.key === 'default') navigate('/');
    else navigate(-1);
  };

  const handleSelect = (store: Store) => {
    const hasFlyer = store.eventStatus === 'active';
    if (onboarding) {
      finishOnboarding(store.id);
      showToast(
        hasFlyer ? `${store.name} 행사를 먼저 보여드릴게요` : `${store.name}을 단골 매장으로 정했어요` /* COPY_TODO.md */,
      );
      navigate('/', { replace: true });
      return;
    }
    if (store.id !== favoriteStore.id) {
      setFavoriteStore(store.id);
      showToast(
        hasFlyer
          ? `${store.name} 행사를 먼저 보여드릴게요`
          : `${store.name}을 단골 매장으로 정했어요` /* 전단 미등록 매장 — COPY_TODO.md */,
      );
    }
    navigate(hasFlyer ? '/' : '/events');
  };

  return (
    <div className={styles.screen}>
      <StatusBar />

      <div className={styles.nav}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={chevLeft} width={26} height={26} alt="" />
        </button>
        <h1 className={styles.title}>단골 매장 고르기</h1>
      </div>

      <div className={styles.searchWrap}>
        <label className={styles.search}>
          <img src={searchIcon} width={20} height={20} alt="" />
          <span className="sr-only">매장 검색</span>
          <input
            type="search"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locationAllowed ? '매장 이름이나 동네로 찾아보세요' : '예) 양재동, 서초농협'}
            // 위치 없이 들어오면 검색부터 — 바로 입력할 수 있게
            autoFocus={!locationAllowed}
            enterKeyHint="search"
          />
        </label>
      </div>
      <p className={styles.hint}>{locationAllowed ? '예) 양재동, 서초농협' : '매장 이름이나 동네로 찾아보세요'}</p>

      {searching ? (
        <section className={styles.nearby} aria-labelledby="stores-results" aria-live="polite">
          <h2 id="stores-results" className={styles.sectionTitle}>
            검색 결과
          </h2>
          {results.length > 0 ? (
            <ul className={styles.list}>
              {results.map((store) => (
                <li key={store.id}>
                  <StoreRow
                    store={store}
                    isCurrent={!onboarding && store.id === favoriteStore.id}
                    showDistance={locationAllowed}
                    onSelect={handleSelect}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>찾는 매장이 없어요. 동 이름이나 농협 이름으로 다시 찾아보세요</p>
          )}
        </section>
      ) : (
        <>
      {!onboarding && (
        <section className={styles.current} aria-labelledby="stores-current">
          <h2 id="stores-current" className={styles.sectionTitle}>
            현재 단골 매장
          </h2>
          <StoreRow store={favoriteStore} isCurrent showDistance={locationAllowed} onSelect={handleSelect} />
        </section>
      )}

      {/* 위치를 허용하지 않았으면 '내 주변 매장'은 보여 주지 않는다 */}
      {locationAllowed && (
      <section className={styles.nearby} aria-labelledby="stores-nearby">
        <div className={styles.nearbyHead}>
          <h2 id="stores-nearby" className={styles.sectionTitle}>
            내 주변 매장
          </h2>
          <p className={styles.locationNote}>
            <img src={locationIcon} width={14} height={14} alt="" />
            현재 위치 기준
          </p>
        </div>
        <ul className={styles.list}>
          {nearby.map((store) => (
            <li key={store.id}>
              <StoreRow store={store} onSelect={handleSelect} />
            </li>
          ))}
        </ul>
      </section>
      )}
        </>
      )}

      <p className={styles.footnote}>‘전단 미등록’ 매장도 단골로 정하면 전단이 올라올 때 알려드려요</p>
    </div>
  );
}
