import chevRightGreen from '../assets/icons/chev-right-14-green.svg';
import dotIcon from '../assets/icons/dot-green.svg';
import image14 from '../assets/icons/image-14.svg';
import image30 from '../assets/icons/image-30.svg';
import pinIcon from '../assets/icons/pin-16-green.svg';
import search24 from '../assets/icons/search-24.svg';
import sortIcon from '../assets/icons/sort-14.svg';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ProductCard } from '../components/ProductCard';
import { StatusBar } from '../components/StatusBar';
import { StoreRow } from '../components/StoreRow';
import { TabBar } from '../components/TabBar';
import { useToast } from '../components/Toast';
import { PRODUCTS, TOTAL_EVENT_PRODUCT_COUNT } from '../data/products';
import { EVENT_PERIOD, getNearbyEventStores, type Store } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import { formatHour, formatMonthDay } from '../utils/date';
import styles from './Events.module.css';

const CATEGORIES = ['전체', '신선식품', '가공식품', '생활용품'] as const;

/** B0-2(비회원) · B2-2(회원) 이번 주 행사 — 두 화면은 같다. 전단 미등록 매장이면 S-2 빈 상태. */
export default function Events() {
  const { isLoggedIn, favoriteStore } = useAppState();
  const showToast = useToast();
  const soon = () => showToast('준비 중이에요');
  const isPreparing = favoriteStore.eventStatus === 'preparing';

  return (
    // Maze T0 성공: 비회원으로 행사 목록 진입
    <div className={styles.screen} data-maze-success={!isLoggedIn && !isPreparing ? 'T0' : undefined}>
      <StatusBar />

      <header className={styles.header}>
        <h1 className={styles.title}>이번 주 행사</h1>
        <button type="button" className={styles.iconButton} aria-label="행사 상품 검색" onClick={soon}>
          <img src={search24} width={24} height={24} alt="" />
        </button>
      </header>

      <div className={styles.info}>
        <p className={styles.storePeriod}>
          <img src={pinIcon} width={16} height={16} alt="" />
          {favoriteStore.name} · {EVENT_PERIOD.label}
        </p>
        <button type="button" className={styles.flyer} onClick={soon}>
          <img src={image14} width={14} height={14} alt="" />
          전단 이미지
        </button>
      </div>

      {isPreparing ? (
        <PreparingState />
      ) : (
        <>
          {/* 갱신일: 매장 데이터 updatedAt에서 읽는다. 기존 안내 바 한 줄 안에 넣어 아래 버튼 위치는 그대로 */}
          <p className={styles.updatedBar}>
            <img src={dotIcon} width={6} height={6} alt="" />
            {formatMonthDay(favoriteStore.updatedAt)} 갱신 · {favoriteStore.name}이{' '}
            {formatHour(favoriteStore.updatedAt)}에 올린 행사예요
          </p>

          <div className={styles.chips} role="group" aria-label="상품 분류">
            {CATEGORIES.map((c) => (
              <Chip key={c} selected={c === '전체'} onClick={c === '전체' ? undefined : soon}>
                {c}
              </Chip>
            ))}
          </div>

          <div className={styles.sort}>
            <p>총 {TOTAL_EVENT_PRODUCT_COUNT}개</p>
            <button type="button" className={styles.sortButton} onClick={soon}>
              <img src={sortIcon} width={14} height={14} alt="" />
              혜택 큰 순
            </button>
          </div>

          <ul className={styles.grid}>
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </>
      )}

      <TabBar />
    </div>
  );
}

/** S-2: 행사 준비 중 매장. 막다른 화면이 되지 않게 근처 행사 매장으로 이어 준다 (동작 규칙 8). */
function PreparingState() {
  const { favoriteStore, setFavoriteStore } = useAppState();
  const showToast = useToast();
  const nearby = getNearbyEventStores(favoriteStore.id);

  const switchStore = (store: Store) => {
    setFavoriteStore(store.id);
    showToast(`${store.name} 행사를 먼저 보여드릴게요`);
  };

  return (
    <>
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <img src={image30} width={30} height={30} alt="" />
        </span>
        <h2 className={styles.emptyTitle}>
          {favoriteStore.name}은 이번 주 행사를
          <br />
          준비하고 있어요
        </h2>
        <div className={styles.emptyText}>
          <p className={styles.emptySub}>행사가 올라오면 바로 알려드릴게요</p>
          {/* 마지막 갱신일 (매장 데이터 updatedAt). 한 줄에 들어가도록 문구를 줄였다 — COPY_TODO.md */}
          <p className={styles.lastUpdated}>
            아직 이번 주 전단이 없어요 · 마지막 갱신 {formatMonthDay(favoriteStore.updatedAt)}
          </p>
        </div>
        <Button
          variant="tint"
          block={false}
          className={styles.notifyButton}
          onClick={() => showToast(`${favoriteStore.name} 행사 알림을 켰어요` /* COPY_TODO.md */)}
        >
          행사 알림 받기
        </Button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <section className={styles.nearby} aria-labelledby="events-nearby">
        <h2 id="events-nearby" className={styles.nearbyTitle}>
          근처 매장은 지금 행사 중이에요
        </h2>
        <ul className={styles.nearbyList}>
          {nearby.map(({ store, distanceKm }) => (
            <li key={store.id}>
              <StoreRow store={store} distanceKm={distanceKm} onSelect={switchStore} />
            </li>
          ))}
        </ul>
        <button type="button" className={styles.nationwide} onClick={() => showToast('준비 중이에요')}>
          전국 공통 행사 보기
          <img src={chevRightGreen} width={14} height={14} alt="" />
        </button>
      </section>
    </>
  );
}
