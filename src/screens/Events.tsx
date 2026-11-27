import chevRightGreen from '../assets/icons/chev-right-14-green.svg';
import image14 from '../assets/icons/image-14.svg';
import image30 from '../assets/icons/image-30.svg';
import pinIcon from '../assets/icons/pin-16-green.svg';
import search24 from '../assets/icons/search-24.svg';
import sortIcon from '../assets/icons/sort-14.svg';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { HeartIcon } from '../components/Heart';
import { useLoginGate } from '../components/LoginSheet';
import { FlyerItemCard, ProductCard, WatchCard } from '../components/ProductCard';
import { StatusBar } from '../components/StatusBar';
import { StoreRow } from '../components/StoreRow';
import { TabBar } from '../components/TabBar';
import { useToast } from '../components/Toast';
import { getProduct, PRODUCTS, TOTAL_EVENT_PRODUCT_COUNT } from '../data/products';
import { EVENT_PERIOD, getNearbyEventStores, type Store } from '../data/stores';
import { FREQUENT_PURCHASES, getWishEntry, WATCH_ITEMS, type WatchItem, type WishEntry } from '../data/wishlist';
import { useAppState } from '../state/AppStateContext';
import { getDiscountLines } from '../utils/discounts';
import { formatWon } from '../utils/format';
import styles from './Events.module.css';

/** '찜한 상품'은 전체 바로 뒤 (하트 아이콘). 신선식품·가공식품·생활용품은 아직 "준비 중이에요" */
const CATEGORIES = ['신선식품', '가공식품', '생활용품'] as const;

/** B0-2(비회원) · B2-2(회원) 이번 주 행사 — 두 화면은 같다. 전단 미등록 매장이면 S-2 빈 상태. */
export default function Events() {
  const { isLoggedIn, favoriteStore, publishedWishItems } = useAppState();
  const showToast = useToast();
  const requireLogin = useLoginGate();
  const soon = () => showToast('준비 중이에요');
  const isPreparing = favoriteStore.eventStatus === 'preparing';

  // 필터는 주소(?filter=wish)에 둔다 — 상품 상세에서 뒤로 와도, MY > 관심상품으로 들어와도 같은 필터
  const [params, setParams] = useSearchParams();
  const wishFilter = isLoggedIn && params.get('filter') === 'wish';
  const showAll = () => setParams({}, { replace: true });
  const showWish = () =>
    requireLogin({
      title: '로그인하면 찜한 상품을 한눈에 볼 수 있어요' /* COPY_TODO.md */,
      onLoggedIn: () => setParams({ filter: 'wish' }, { replace: true }),
    });

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
          {favoriteStore.name}
          {/* 전단 미등록 매장은 이번 주 행사 기간·전단 이미지가 없어서 숨긴다 */}
          {!isPreparing && ` · ${EVENT_PERIOD.label}`}
        </p>
        {!isPreparing && (
          <button type="button" className={styles.flyer} onClick={soon}>
            <img src={image14} width={14} height={14} alt="" />
            전단 이미지
          </button>
        )}
      </div>

      {isPreparing ? (
        <PreparingState />
      ) : (
        <>
          <div className={styles.chips} role="group" aria-label="상품 분류">
            <Chip selected={!wishFilter} onClick={showAll}>
              전체
            </Chip>
            <Chip selected={wishFilter} className={styles.wishChip} onClick={showWish}>
              <HeartIcon size={16} px={14} filled={false} color={wishFilter ? 'var(--white)' : 'var(--gray-700)'} />
              찜한 상품
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c} onClick={soon}>
                {c}
              </Chip>
            ))}
          </div>

          {wishFilter ? (
            <WishlistView />
          ) : (
            <>
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
                    <ProductCard product={p} conditions={getDiscountLines(p, favoriteStore.id)} />
                  </li>
                ))}
                {/* 담당자가 정리된 상품으로 게시한 전단에만 있는 상품 (깐마늘 1kg) */}
                {publishedWishItems.map(({ id, info }) => (
                  <li key={id}>
                    <FlyerItemCard id={id} info={info} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <TabBar />
    </div>
  );
}

/**
 * '찜한 상품' 필터 — ① 찜한 상품(이번 주 행사면 기존 카드 + "이번 주 행사", 아니면 회색 카드)
 * ② 자주 산 상품 추천(최근 영수증 기준, 이번 주 행사 상품만). 추천의 하트를 누르면 ①로 올라간다.
 */
function WishlistView() {
  const { wishlistIds, favoriteStore, getPublishedFlyerItem } = useAppState();
  const entries = wishlistIds.map(getWishEntry).filter((e): e is WishEntry => e !== undefined);
  const recommendations = FREQUENT_PURCHASES.filter((r) => !wishlistIds.includes(r.productId));

  return (
    <>
      <section className={styles.wishSection} aria-labelledby="wish-title">
        <div className={styles.wishHead}>
          <h2 id="wish-title" className={styles.wishTitle}>
            찜한 상품
          </h2>
          <p className={styles.wishMeta}>{entries.length}개</p>
        </div>
        {entries.length === 0 ? (
          <p className={styles.wishEmpty}>하트를 누른 상품이 여기에 모여요{/* COPY_TODO.md */}</p>
        ) : (
          <ul className={styles.grid}>
            {entries.map((e) =>
              e.kind === 'event' ? (
                <li key={e.product.id}>
                  <ProductCard
                    product={e.product}
                    conditions={getDiscountLines(e.product, favoriteStore.id)}
                    tag="이번 주 행사"
                  />
                </li>
              ) : (
                <li key={e.item.id}>
                  {renderWatch(e.item.id)}
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      {recommendations.length > 0 && (
        <section className={styles.wishSection} aria-labelledby="frequent-title">
          <div className={styles.wishHead}>
            <h2 id="frequent-title" className={styles.wishTitle}>
              자주 산 상품 추천
            </h2>
            <p className={styles.wishMeta}>최근 영수증 기준</p>
          </div>
          <ul className={styles.grid}>
            {recommendations.map((r) => {
              const product = getProduct(r.productId);
              if (!product) return null;
              return (
                <li key={r.productId}>
                  <ProductCard
                    product={product}
                    conditions={getDiscountLines(product, favoriteStore.id)}
                    tag={r.cheaperThanLastBy ? `지난 구매보다 ${formatWon(r.cheaperThanLastBy)} 저렴` : undefined}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className={styles.wishNote}>계산하면 받은 할인을 영수증과 맞춰서 알려드려요</p>
    </>
  );

  /** 행사 정보가 없던 찜 상품 — 담당자가 전단을 게시했으면 행사 상품 카드, 아니면 회색 카드 */
  function renderWatch(id: WatchItem['id']) {
    const info = getPublishedFlyerItem(id);
    if (info) return <FlyerItemCard id={id} info={info} tag="이번 주 행사" />;
    const item = WATCH_ITEMS.find((w) => w.id === id)!;
    return <WatchCard item={item} storeName={favoriteStore.name} />;
  }
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
          {favoriteStore.name}은 아직 이번 주 행사를
          <br />
          올리지 않았어요
        </h2>
        <p className={styles.emptySub}>행사가 올라오면 바로 알려드릴게요</p>
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
          {nearby.map((store) => (
            <li key={store.id}>
              <StoreRow store={store} onSelect={switchStore} />
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
