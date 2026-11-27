import { Link, Navigate } from 'react-router-dom';
import chevRightGreen from '../assets/icons/chev-right-14-green.svg';
import barcodeImage from '../assets/icons/barcode.svg';
import coinIcon from '../assets/icons/coin-18-green.svg';
import pinIcon from '../assets/icons/pin-14-green.svg';
import sunIcon from '../assets/icons/sun-14.svg';
import ticketIcon from '../assets/icons/ticket-18-green.svg';
import { CouponHelp } from '../components/CouponHelp';
import { StatusBar } from '../components/StatusBar';
import { useToast } from '../components/Toast';
import { TabBar } from '../components/TabBar';
import { isCouponUsableAt, type Coupon } from '../data/coupons';
import { MEMBER } from '../data/member';
import { getProduct } from '../data/products';
import { getStore } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import { formatManWon, formatWon } from '../utils/format';
import styles from './Barcode.module.css';

/** 쿠폰 행 설명: B3-4 "6만 원 이상 구매하면 자동 적용" 형식 */
function couponCondition(c: Coupon): string {
  if (c.productId) return `${getProduct(c.productId)?.name} 살 때 자동 적용`; /* COPY_TODO.md */
  if (c.minSpend !== undefined) return `${formatManWon(c.minSpend)} 이상 구매하면 자동 적용`;
  return '계산할 때 자동 적용'; // 지금 목업 쿠폰에는 해당 없음 (모두 상품 또는 최소 금액 조건)
}

/** 아직 안 받은 쿠폰 줄 설명: "제주 감귤 3kg 살 때 사용" / "6만 원 이상 사면 사용" */
function claimCondition(c: Coupon): string {
  if (c.productId) return `${getProduct(c.productId)?.name} 살 때 사용`;
  if (c.minSpend !== undefined) return `${formatManWon(c.minSpend)} 이상 사면 사용`;
  return '계산할 때 사용';
}

/**
 * B3-4 멤버십 바코드 (동작 규칙 5) — 받은 쿠폰과 포인트 적립을 바코드 아래에 나열한다.
 * 실제 화면 밝기 조절은 웹에서 할 수 없어 안내 문구만 보여 준다.
 */
export default function Barcode() {
  const { isLoggedIn, favoriteStore, myCoupons, isCouponClaimed, claimableCoupons, claimCoupon } = useAppState();
  const showToast = useToast();

  // 탭바에서는 로그인 안내를 거쳐 들어온다. 주소로 바로 들어온 비회원은 홈으로.
  if (!isLoggedIn) return <Navigate to="/" replace />;

  return (
    // Maze T3 성공: 김장맞이 쿠폰을 받고 바코드 화면 진입
    <div className={styles.screen} data-maze-success={isCouponClaimed('kimjang-4000') ? 'T3' : undefined}>
      <StatusBar />

      <header className={styles.header}>
        <h1 className={styles.title}>바코드</h1>
        <p className={styles.storePill}>
          <img src={pinIcon} width={14} height={14} alt="" />
          {favoriteStore.name}에서 사용
        </p>
      </header>

      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <img src={barcodeImage} width={300} height={96} alt={`멤버십 바코드 ${MEMBER.barcodeNumber}`} />
          <p className={styles.number}>{MEMBER.barcodeNumber}</p>
          <p className={styles.brightness}>
            <img src={sunIcon} width={14} height={14} alt="" />
            화면 밝기를 최대로 높였어요
          </p>
        </div>
      </div>

      <section className={styles.applied} aria-labelledby="barcode-applied">
        <h2 id="barcode-applied" className={styles.appliedTitle}>
          이 바코드로 함께 적용돼요
        </h2>
        <ul className={styles.list}>
          {myCoupons.map((c) => {
            const usable = isCouponUsableAt(c, favoriteStore.id);
            return (
              <li key={c.id} className={styles.row}>
                <span className={styles.rowIcon}>
                  <img src={ticketIcon} width={18} height={18} alt="" />
                </span>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>
                    {formatWon(c.amount)} 할인 · {c.title}
                  </span>
                  <span className={styles.rowSub}>{couponCondition(c)}</span>
                </span>
                {usable ? (
                  <span className={styles.badge}>자동 적용</span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeMuted}`}>
                    {c.scope.type === 'store' && getStore(c.scope.storeId).name} 전용{/* COPY_TODO.md */}
                  </span>
                )}
              </li>
            );
          })}
          <li className={styles.row}>
            <span className={styles.rowIcon}>
              <img src={coinIcon} width={18} height={18} alt="" />
            </span>
            <span className={styles.rowText}>
              <span className={styles.rowTitle}>NH포인트 적립</span>
              <span className={styles.rowSub}>보유 {MEMBER.nhPoint}P · 결제하면 자동 적립</span>
            </span>
          </li>
        </ul>
      </section>

      {/* 단골 매장에서 받을 수 있는데 아직 안 받은 쿠폰 (다른 매장 전용 제외). 받으면 위 목록으로 옮겨진다. */}
      {claimableCoupons.length > 0 && (
        <section className={styles.applied} aria-labelledby="barcode-claimable">
          <h2 id="barcode-claimable" className={styles.appliedTitle}>
            지금 받으면 함께 할인돼요
          </h2>
          <ul className={styles.list}>
            {claimableCoupons.map((c) => (
              <li key={c.id} className={`${styles.row} ${styles.claimRow}`}>
                <span className={styles.rowIcon}>
                  <img src={ticketIcon} width={18} height={18} alt="" />
                </span>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>
                    {formatWon(c.amount)} 할인 · {c.shortTitle ?? c.title}
                  </span>
                  <span className={styles.rowSub}>{claimCondition(c)}</span>
                </span>
                <button
                  type="button"
                  className={styles.claimButton}
                  aria-label={`${c.title} 받기`}
                  onClick={() => {
                    claimCoupon(c.id);
                    showToast('받은 쿠폰은 바코드에 자동으로 담겼어요');
                  }}
                >
                  받기
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.help}>
        <CouponHelp />
      </div>

      <p className={styles.footnote}>계산대에서 이 화면만 보여주세요</p>

      <div className={styles.links}>

      {/* 계산을 마친 뒤 받은 할인이 영수증에 반영됐는지 확인 */}
      <Link to="/my/receipt" className={styles.receiptLink}>
        방금 장보기 결과 보기
        <img src={chevRightGreen} width={14} height={14} alt="" />
      </Link>
      </div>

      <TabBar />
    </div>
  );
}
