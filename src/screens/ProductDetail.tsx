import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import chevLeft from '../assets/icons/chev-left.svg';
import clockIcon from '../assets/icons/clock-20-green.svg';
import heart22 from '../assets/icons/heart-22.svg';
import heart24 from '../assets/icons/heart-24.svg';
import { heroCrop, PRODUCT_IMAGES } from '../assets/products';
import { Button } from '../components/Button';
import { useLoginGate } from '../components/LoginSheet';
import { StatusBar } from '../components/StatusBar';
import { useToast } from '../components/Toast';
import { getCoupon, isCouponUsableAt } from '../data/coupons';
import { getProduct, type Product } from '../data/products';
import { EVENT_PERIOD } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import { daysUntil } from '../utils/date';
import { formatWon } from '../utils/format';
import styles from './ProductDetail.module.css';

/** B2-3 상품 상세 — 가격 계산표, 행사 기간·남은 일수, 하단 쿠폰 CTA (동작 규칙 6) */
export default function ProductDetail() {
  const { productId } = useParams();
  const product = getProduct(productId);
  if (!product) return <Navigate to="/events" replace />;
  return <ProductDetailView product={product} />;
}

function ProductDetailView({ product }: { product: Product }) {
  const { favoriteStore } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const image = PRODUCT_IMAGES[product.id];

  const goBack = () => (location.key === 'default' ? navigate('/events') : navigate(-1));
  const soon = () => showToast('준비 중이에요');

  const periodEnd = product.endsLabel?.replace(/까지$/, '') ?? EVENT_PERIOD.label.split(' – ')[1];
  const daysLeft = daysUntil(product.endsAt ?? EVENT_PERIOD.end);

  return (
    // Maze T2 성공: 감귤 상세 진입
    <div className={styles.screen} data-maze-success={product.id === 'jeju-tangerine' ? 'T2' : undefined}>
      <StatusBar />

      <div className={styles.nav}>
        <button type="button" className={styles.navButton} aria-label="뒤로 가기" onClick={goBack}>
          <img src={chevLeft} width={26} height={26} alt="" />
        </button>
        <button type="button" className={`${styles.navButton} ${styles.like}`} aria-label={`${product.name} 찜하기`} onClick={soon}>
          <img src={heart24} width={24} height={24} alt="" />
        </button>
      </div>

      <div className={styles.hero}>{image && <img src={image.src} style={heroCrop(image)} alt="" />}</div>

      <div className={styles.content}>
        <p className={styles.meta}>
          <span className={styles.badge}>{product.badge}</span>
          {favoriteStore.name} 행사 상품
        </p>
        <h1 className={styles.name}>{product.name}</h1>

        <div className={styles.price}>
          <p className={styles.priceMain}>
            <span className={styles.rate}>{product.discountRate}%</span>
            <span className={styles.amount}>{formatWon(product.finalPrice)}</span>
          </p>
          {product.discounts && <p className={styles.priceNote}>카드와 쿠폰을 쓰면 이 가격이에요</p>}
        </div>

        {product.originalPrice !== undefined && product.discounts && (
          <dl className={styles.breakdown} aria-label="가격 계산">
            <div className={styles.row}>
              <dt>정가</dt>
              <dd>{formatWon(product.originalPrice)}</dd>
            </div>
            {product.discounts.map((d) => (
              <div key={d.label} className={styles.row}>
                <dt>{d.label} 할인</dt>
                <dd>−{formatWon(d.amount)}</dd>
              </div>
            ))}
            <div className={styles.rule} role="presentation" />
            <div className={`${styles.row} ${styles.total}`}>
              <dt>내가 내는 가격</dt>
              <dd>{formatWon(product.finalPrice)}</dd>
            </div>
          </dl>
        )}

        <div className={styles.period}>
          <img src={clockIcon} width={20} height={20} alt="" />
          <div className={styles.periodText}>
            <p className={styles.periodLabel}>행사 기간</p>
            <p className={styles.periodValue}>
              {EVENT_PERIOD.startLabel} – {periodEnd}
            </p>
          </div>
          {daysLeft >= 0 && <span className={styles.daysLeft}>{daysLeft}일 남음</span>}
        </div>
      </div>

      <div className={styles.cta}>
        <button type="button" className={styles.likeButton} aria-label={`${product.name} 찜하기`} onClick={soon}>
          <img src={heart22} width={22} height={22} alt="" />
        </button>
        <CouponCta product={product} />
      </div>
    </div>
  );
}

/**
 * 하단 CTA
 * - 상품 쿠폰이 있고 단골 매장에서 쓸 수 있음 → "2,196원 쿠폰 받기" (비회원이면 로그인 안내 → 로그인 후 바로 받기)
 * - 이미 받음 → "받았어요 · 계산할 때 자동 할인"
 * - 다른 매장 전용 → "단골 매장 바꾸기" (동작 규칙 4와 같은 처리)
 * - 상품 쿠폰 없음 → 행사 목록으로 (Figma에 없는 경우, COPY_TODO.md)
 */
function CouponCta({ product }: { product: Product }) {
  const { favoriteStore, isCouponClaimed, claimCoupon } = useAppState();
  const requireLogin = useLoginGate();
  const showToast = useToast();
  const navigate = useNavigate();

  const couponId = product.discounts?.find((d) => d.couponId)?.couponId;
  const coupon = couponId ? getCoupon(couponId) : undefined;

  if (!coupon) {
    return (
      <Button className={styles.ctaMain} onClick={() => navigate('/events')}>
        행사 상품 더 보기
      </Button>
    );
  }

  if (isCouponClaimed(coupon.id)) {
    return (
      <Button variant="tint" className={styles.ctaMain} disabled style={{ opacity: 1 }}>
        받았어요 · 계산할 때 자동 할인
      </Button>
    );
  }

  if (!isCouponUsableAt(coupon, favoriteStore.id)) {
    return (
      <Button variant="secondary" className={styles.ctaMain} onClick={() => navigate('/stores')}>
        단골 매장 바꾸기
      </Button>
    );
  }

  const claim = () => {
    claimCoupon(coupon.id);
    showToast('받은 쿠폰은 바코드에 자동으로 담겼어요');
  };

  return (
    <Button
      className={styles.ctaMain}
      onClick={() => requireLogin({ title: `로그인하고 ${formatWon(coupon.amount)} 쿠폰 받기`, onLoggedIn: claim })}
    >
      {formatWon(coupon.amount)} 쿠폰 받기
    </Button>
  );
}
