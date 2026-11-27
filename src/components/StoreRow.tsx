import checkIcon from '../assets/icons/check-14-green.svg';
import pinWhite from '../assets/icons/pin-white.svg';
import pinIcon from '../assets/icons/pin.svg';
import { STORE_EVENT_STATUS_LABEL, type Store } from '../data/stores';
import styles from './StoreRow.module.css';

type StoreRowProps = {
  store: Store;
  /** 현재 단골 매장이면 초록 배경 + "현재 단골" */
  isCurrent?: boolean;
  onSelect?: (store: Store) => void;
  /** 위치를 허용하지 않았으면 거리(km)를 숨긴다 */
  showDistance?: boolean;
};

/** 거리는 모든 화면에서 store.distanceKm(현재 위치 기준) 하나만 쓴다 */
export function StoreRow({ store, isCurrent = false, onSelect, showDistance = true }: StoreRowProps) {
  const badge = isCurrent ? (
    <span className={`${styles.badge} ${styles.badgeCurrent}`}>
      <img src={checkIcon} width={14} height={14} alt="" />
      현재 단골
    </span>
  ) : (
    <span className={`${styles.badge} ${store.eventStatus === 'active' ? styles.badgeActive : styles.badgePreparing}`}>
      {STORE_EVENT_STATUS_LABEL[store.eventStatus]}
    </span>
  );

  return (
    <button
      type="button"
      className={[styles.row, isCurrent && styles.current].filter(Boolean).join(' ')}
      aria-current={isCurrent ? 'true' : undefined}
      onClick={() => onSelect?.(store)}
    >
      <span className={styles.pin}>
        <img src={isCurrent ? pinWhite : pinIcon} width={18} height={18} alt="" />
      </span>
      <span className={styles.info}>
        <span className={styles.name}>하나로마트 {store.name}</span>
        <span className={styles.meta}>
          {store.district}
          {showDistance && ` · ${store.distanceKm.toFixed(1)}km`}
        </span>
      </span>
      {badge}
    </button>
  );
}
