import { Link } from 'react-router-dom';
import { PRODUCT_IMAGES, type ProductImage } from '../assets/products';
import imageIcon from '../assets/icons/image-30.svg';
import type { Product } from '../data/products';
import type { WatchItem } from '../data/wishlist';
import { useAppState } from '../state/AppStateContext';
import { formatWon } from '../utils/format';
import { HeartIcon, useWishToggle } from './Heart';
import styles from './ProductCard.module.css';

type ProductCardProps = {
  product: Product;
  /** 기본값: src/assets/products의 PRODUCT_IMAGES. 둘 다 없으면 회색 자리만 보인다. */
  image?: ProductImage;
  /** 기본값: '~12.03(수)까지'. 컴포넌트 보드처럼 ' · 쿠폰 적용가'를 붙이려면 직접 넘긴다. */
  caption?: string;
  /**
   * 가격 아래 할인 조건 (이번 주 행사 목록에서만 넘긴다, utils/discounts.ts).
   * 최대 2줄까지 보여 주고, 나머지는 "할인 N개 더"로 접는다.
   */
  conditions?: string[];
  /** 카드 맨 아래 작은 칩 (찜한 상품 필터: "이번 주 행사", "지난 구매보다 1,000원 저렴") */
  tag?: string;
};

const MAX_CONDITION_LINES = 2;

export function ProductCard({ product, image, caption, conditions = [], tag }: ProductCardProps) {
  const { isWished } = useAppState();
  const toggleWish = useWishToggle();
  const wished = isWished(product.id);
  const text = caption ?? (product.endsLabel ? `~${product.endsLabel}` : undefined);
  const img = image ?? PRODUCT_IMAGES[product.id];

  return (
    <article className={styles.card}>
      <Link to={`/events/${product.id}`} className={styles.link}>
        <div className={styles.image}>
          {img && <img className={styles.photo} src={img.src} style={img.crop} alt="" />}
          <span className={styles.badge}>{product.badge}</span>
        </div>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>
          <span className={styles.rate}>{product.discountRate}%</span>
          <span className={styles.amount}>{formatWon(product.finalPrice)}</span>
        </p>
        {conditions.length > 0 && (
          <ul className={styles.conditions}>
            {conditions.slice(0, MAX_CONDITION_LINES).map((c) => (
              <li key={c}>{c}</li>
            ))}
            {conditions.length > MAX_CONDITION_LINES && <li>할인 {conditions.length - MAX_CONDITION_LINES}개 더</li>}
          </ul>
        )}
        {text && <p className={styles.caption}>{text}</p>}
        {tag && <span className={styles.tag}>{tag}</span>}
      </Link>
      <LikeButton label={product.name} wished={wished} onClick={() => toggleWish(product.id)} />
    </article>
  );
}

/** 카드 오른쪽 위 찜 버튼 — 행사 정보가 없는 찜 카드(이번 주 행사 '찜한 상품')에서도 같이 쓴다 */
export function LikeButton({ label, wished, onClick }: { label: string; wished: boolean; onClick: () => void }) {
  return (
    <button type="button" className={styles.like} aria-label={`${label} 찜하기`} aria-pressed={wished} onClick={onClick}>
      <HeartIcon size={16} filled={wished} />
    </button>
  );
}

/**
 * 행사 정보가 없는 찜 상품 카드 (회색) — 이번 주 행사 '찜한 상품'에서만 쓴다.
 * 상세 화면이 없어서 카드 자체는 누를 수 없고, 하트로 찜만 끌 수 있다.
 */
export function WatchCard({ item, storeName }: { item: WatchItem; storeName: string }) {
  const { isWished } = useAppState();
  const toggleWish = useWishToggle();
  return (
    <article className={`${styles.card} ${styles.watch}`}>
      <div className={styles.link}>
        <div className={styles.image}>
          <img className={styles.watchIcon} src={imageIcon} width={30} height={30} alt="" />
        </div>
        <p className={styles.name}>{item.name}</p>
        <p className={styles.watchNote}>아직 {storeName} 행사 정보가 없어요</p>
      </div>
      <LikeButton label={item.name} wished={isWished(item.id)} onClick={() => toggleWish(item.id)} />
    </article>
  );
}
