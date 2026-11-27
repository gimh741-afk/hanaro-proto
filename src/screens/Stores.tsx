import { useLocation, useNavigate } from 'react-router-dom';
import chevLeft from '../assets/icons/chev-left.svg';
import locationIcon from '../assets/icons/location.svg';
import searchIcon from '../assets/icons/search.svg';
import { StatusBar } from '../components/StatusBar';
import { StoreRow } from '../components/StoreRow';
import { useToast } from '../components/Toast';
import { sortByDistance, STORES, type Store } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import styles from './Stores.module.css';

/**
 * B1-2 단골 매장 고르기 (동작 규칙 1)
 * - 행사 있음 매장 → 단골 변경 후 홈으로 + 토스트 (B1-3, Maze 성공 경로 그대로)
 * - 전단 미등록 매장 → 단골 설정은 막지 않고, 바로 이번 주 행사 탭의 빈 상태(S-2)로 이어 준다
 *
 * onboarding: 첫 실행 ② 단골 매장 선택 (/welcome/store) — 같은 목록을 가까운 순으로 모두 보여 주고,
 * 고르면 그 매장으로 홈에 들어간다. 아직 단골이 없어서 '현재 단골 매장' 칸은 없다.
 */
export default function Stores({ onboarding = false }: { onboarding?: boolean }) {
  const { favoriteStore, setFavoriteStore, finishOnboarding } = useAppState();
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
        <button type="button" className={styles.search} onClick={() => showToast('준비 중이에요')}>
          <img src={searchIcon} width={20} height={20} alt="" />
          매장 이름이나 동네로 찾아보세요
        </button>
      </div>
      <p className={styles.hint}>예) 양재동, 서초농협</p>

      {!onboarding && (
        <section className={styles.current} aria-labelledby="stores-current">
          <h2 id="stores-current" className={styles.sectionTitle}>
            현재 단골 매장
          </h2>
          <StoreRow store={favoriteStore} isCurrent onSelect={handleSelect} />
        </section>
      )}

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

      <p className={styles.footnote}>‘전단 미등록’ 매장도 단골로 정하면 전단이 올라올 때 알려드려요</p>
    </div>
  );
}
