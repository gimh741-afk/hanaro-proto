import { Link } from 'react-router-dom';
import heartIcon from '../assets/icons/heart.svg';
import { PRODUCT_IMAGES, type ProductImage } from '../assets/products';
import type { Product } from '../data/products';
import { formatWon } from '../utils/format';
import styles from './ProductCard.module.css';
import { useToast } from './Toast';

type ProductCardProps = {
  product: Product;
  /** 기본값: src/assets/products의 PRODUCT_IMAGES. 둘 다 없으면 회색 자리만 보인다. */
  image?: ProductImage;
  /** 기본값: '~12.03(수)까지'. 컴포넌트 보드처럼 ' · 쿠폰 적용가'를 붙이려면 직접 넘긴다. */
  caption?: string;
  onLikeClick?: (product: Product) => void;
};

export function ProductCard({ product, image, caption, onLikeClick }: ProductCardProps) {
  const showToast = useToast();
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
        {text && <p className={styles.caption}>{text}</p>}
      </Link>
      <button
        type="button"
        className={styles.like}
        aria-label={`${product.name} 찜하기`}
        onClick={() => (onLikeClick ? onLikeClick(product) : showToast('준비 중이에요'))}
      >
        <img src={heartIcon} width={16} height={16} alt="" />
      </button>
    </article>
  );
}
