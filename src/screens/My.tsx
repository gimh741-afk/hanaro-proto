import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import chevRight from '../assets/icons/chev-right.svg';
import { StatusBar } from '../components/StatusBar';
import { StoreRow } from '../components/StoreRow';
import { TabBar } from '../components/TabBar';
import { useToast } from '../components/Toast';
import { MEMBER } from '../data/member';
import { DevMenu } from '../dev/DevMenu';
import { useAppState } from '../state/AppStateContext';
import styles from './My.module.css';

const APP_VERSION = '1.0.0';
const DEV_TAPS = 5;
const DEV_TAP_WINDOW_MS = 1500;

/**
 * MY — Figma에 디자인이 없어 최소 구성. 문구는 COPY_TODO.md 검토 대상.
 * 맨 아래 버전 글자를 1.5초 안에 5번 누르면 개발용 메뉴가 열린다 (Maze 테스트 지원).
 */
export default function My() {
  const { isLoggedIn, favoriteStore, myCoupons, logout } = useAppState();
  const navigate = useNavigate();
  const showToast = useToast();
  const [devOpen, setDevOpen] = useState(false);
  const taps = useRef<number[]>([]);

  if (!isLoggedIn && !devOpen) return <Navigate to="/" replace />;

  const onVersionTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < DEV_TAP_WINDOW_MS), now];
    if (taps.current.length >= DEV_TAPS) {
      taps.current = [];
      setDevOpen(true);
    }
  };

  const soon = () => showToast('준비 중이에요');

  const items: { label: string; value?: string; onClick: () => void }[] = [
    { label: 'NH포인트', value: `${MEMBER.nhPoint}P`, onClick: soon },
    { label: '내 쿠폰', value: `${myCoupons.length}장`, onClick: () => navigate('/coupons') },
    { label: '찜한 행사상품', value: `${MEMBER.wishlistCount}개`, onClick: soon },
    { label: '멤버십 바코드', onClick: () => navigate('/barcode') },
  ];

  const settings: { label: string; onClick: () => void }[] = [
    { label: '알림 설정', onClick: soon },
    {
      label: '로그아웃',
      onClick: () => {
        logout();
        showToast('로그아웃했어요');
        navigate('/');
      },
    },
  ];

  return (
    <div className={styles.screen}>
      <StatusBar />

      <header className={styles.header}>
        <h1 className={styles.title}>MY</h1>
      </header>

      <section className={styles.section} aria-labelledby="my-store">
        <h2 id="my-store" className={styles.sectionTitle}>
          단골 매장
        </h2>
        <StoreRow store={favoriteStore} isCurrent onSelect={() => navigate('/stores')} />
      </section>

      <section className={styles.section} aria-labelledby="my-benefits">
        <h2 id="my-benefits" className={styles.sectionTitle}>
          내 혜택
        </h2>
        <MenuList items={items} />
      </section>

      <section className={styles.section} aria-labelledby="my-settings">
        <h2 id="my-settings" className={styles.sectionTitle}>
          설정
        </h2>
        <MenuList items={settings} />
      </section>

      {/* 개발용 메뉴 진입점: 일부러 버튼으로 드러내지 않는다 */}
      <p className={styles.version} onClick={onVersionTap}>
        버전 {APP_VERSION}
      </p>

      <TabBar />
      {devOpen && <DevMenu onClose={() => setDevOpen(false)} />}
    </div>
  );
}

function MenuList({ items }: { items: { label: string; value?: string; onClick: () => void }[] }) {
  return (
    <ul className={styles.menu}>
      {items.map((it) => (
        <li key={it.label} className={styles.menuItem}>
          <button type="button" className={styles.menuButton} onClick={it.onClick}>
            <span className={styles.menuLabel}>{it.label}</span>
            {it.value && <span className={styles.menuValue}>{it.value}</span>}
            <img src={chevRight} width={16} height={16} alt="" />
          </button>
        </li>
      ))}
    </ul>
  );
}
