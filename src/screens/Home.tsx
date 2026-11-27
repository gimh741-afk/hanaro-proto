import { Link, useNavigate } from 'react-router-dom';
import bellIcon from '../assets/icons/bell.svg';
import checkIcon from '../assets/icons/check-16-green.svg';
import chevDown from '../assets/icons/chev-down.svg';
import chevRightGreen from '../assets/icons/chev-right-green.svg';
import chevRight from '../assets/icons/chev-right.svg';
import pinIcon from '../assets/icons/pin-green.svg';
import searchIcon from '../assets/icons/search.svg';
import { ProductCard } from '../components/ProductCard';
import { StatusBar } from '../components/StatusBar';
import { TabBar } from '../components/TabBar';
import { useToast } from '../components/Toast';
import { MEMBER } from '../data/member';
import { PRODUCTS, TOTAL_EVENT_PRODUCT_COUNT } from '../data/products';
import { EVENT_PERIOD } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import { formatWon } from '../utils/format';
import styles from './Home.module.css';

/** Figma 홈 가로 스크롤에 나오는 3개 */
const HOME_PRODUCTS = PRODUCTS.filter((p) => p.id !== 'haenam-cabbage');

/** B0-1 홈(비회원) · B1-1 홈(회원) — 혜택 카드만 로그인 상태에 따라 다르다 */
export default function Home() {
  const { isLoggedIn, favoriteStore } = useAppState();
  const showToast = useToast();
  // 전단 미등록 매장(우면점·내곡점): 상품·기간·전체 보기 대신 행사 탭 빈 상태(S-2)를 짧게
  const isPreparing = favoriteStore.eventStatus === 'preparing';

  return (
    // Maze T1 성공: 단골 매장 = 양재점 (B1-3)
    <div className={styles.screen} data-maze-success={favoriteStore.id === 'yangjae' ? 'T1' : undefined}>
      <StatusBar />

      <header className={styles.header}>
        <h1 className={styles.brand}>하나로마트</h1>
        <button type="button" className={styles.iconButton} aria-label="알림" onClick={() => showToast('준비 중이에요')}>
          <img src={bellIcon} width={24} height={24} alt="" />
        </button>
      </header>

      <div className={styles.storeRow}>
        <Link to="/stores" className={styles.storeSelector}>
          <img src={pinIcon} width={18} height={18} alt="" />
          <span className="sr-only">단골 매장</span>
          {favoriteStore.name}
          <img src={chevDown} width={18} height={18} alt="" />
          <span className="sr-only">바꾸기</span>
        </Link>
      </div>

      <div className={styles.searchWrap}>
        <button type="button" className={styles.search} onClick={() => showToast('준비 중이에요')}>
          <img src={searchIcon} width={20} height={20} alt="" />
          어떤 상품을 찾으세요? 예) 감귤, 한우
        </button>
      </div>

      <div className={styles.benefitWrap}>{isLoggedIn ? <MemberBenefitCard /> : <GuestBenefitCard />}</div>

      <section aria-labelledby="home-events-title">
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitles}>
            <h2 id="home-events-title" className={styles.sectionTitle}>
              이번 주 행사
            </h2>
            {!isPreparing && (
              <p className={styles.sectionSub}>
                {EVENT_PERIOD.label} · {favoriteStore.name}
              </p>
            )}
          </div>
          {!isPreparing && (
            <Link to="/events" className={styles.moreLink}>
              전체 {TOTAL_EVENT_PRODUCT_COUNT}개 보기
              <img src={chevRight} width={16} height={16} alt="" />
            </Link>
          )}
        </div>
        {isPreparing ? (
          <div className={styles.preparing}>
            <p className={styles.preparingTitle}>{favoriteStore.name}은 아직 이번 주 행사를 올리지 않았어요</p>
            <div className={styles.preparingActions}>
              <button
                type="button"
                className={styles.notifyButton}
                onClick={() => showToast(`${favoriteStore.name} 행사 알림을 켰어요` /* COPY_TODO.md */)}
              >
                행사 알림 받기
              </button>
              <Link to="/events" className={styles.nearbyLink}>
                근처 매장 행사 보기
                <img src={chevRightGreen} width={16} height={16} alt="" />
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.productScroll}>
            {HOME_PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <TabBar />
    </div>
  );
}

/** B0-1 혜택 카드: 받을 수 있는 쿠폰 금액·장수는 동작 규칙 2로 계산 (신촌점 6,196원 2장) */
function GuestBenefitCard() {
  const { claimableCoupons, claimableAmount, scenario, login } = useAppState();
  const navigate = useNavigate();

  const handleLogin = () => {
    // 동작 규칙 7: 실제 인증 없음. ?scenario=auth-fail이면 인증 실패 복구 화면으로
    if (scenario === 'auth-fail') navigate('/auth/recover');
    else login();
  };

  return (
    <div className={styles.benefitCard}>
      <p className={styles.benefitTitle}>
        로그인하고
        <br />
        {formatWon(claimableAmount)} 쿠폰 {claimableCoupons.length}장 받기
      </p>
      <p className={styles.socialProof}>
        <img src={checkIcon} width={16} height={16} alt="" />
        이번 주 12,480명이 받아 갔어요
      </p>
      <button type="button" className={styles.loginButton} onClick={handleLogin}>
        3초 만에 로그인
      </button>
      <p className={styles.benefitNote}>행사는 로그인 없이 둘러볼 수 있어요</p>
    </div>
  );
}

/** B1-1 혜택 카드: 포인트는 목업 회원 데이터, 찜은 지금 행사 중인 찜 상품 개수, 받을 수 있는 쿠폰은 동작 규칙 2로 계산 */
function MemberBenefitCard() {
  const { claimableCoupons, claimableAmount, myCoupons, eventWishCount } = useAppState();
  const claimableCount = claimableCoupons.length;

  return (
    <section className={styles.memberCard} aria-labelledby="home-benefit-title">
      <div className={styles.memberTitle}>
        <h2 id="home-benefit-title" style={{ font: 'inherit' }}>
          내 혜택
        </h2>
        <Link to="/barcode" className={styles.barcodePill}>
          멤버십 바코드
        </Link>
      </div>

      <div className={styles.stats}>
        <Stat value={MEMBER.nhPoint} unit="P" label="NH포인트" />
        <span className={styles.statDivider} aria-hidden="true" />
        <Stat value={claimableCount} unit="장" label="받을 수 있는 쿠폰" />
        <span className={styles.statDivider} aria-hidden="true" />
        <Stat value={eventWishCount} unit="개" label="찜한 행사상품" />
      </div>

      <Link to="/coupons" className={styles.couponButton}>
        {claimableCount > 0
          ? `${formatWon(claimableAmount)} 쿠폰 ${claimableCount}장 받기`
          : `받은 쿠폰 ${myCoupons.length}장 보기` /* Figma에 없는 상태 — COPY_TODO.md */}
        <img src={chevRightGreen} width={16} height={16} alt="" />
      </Link>
    </section>
  );
}

function Stat({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <div className={styles.stat}>
      <p className={styles.statValue}>
        <span className={styles.statNumber}>{value}</span>
        {unit}
      </p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  );
}
