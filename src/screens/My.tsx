import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import chevRight from '../assets/icons/chev-right.svg';
import { StatusBar } from '../components/StatusBar';
import { TabBar } from '../components/TabBar';
import { useToast } from '../components/Toast';
import { MEMBER } from '../data/member';
import { DevMenu } from '../dev/DevMenu';
import { useAppState } from '../state/AppStateContext';
import styles from './My.module.css';

const APP_VERSION = '1.0.0';
const DEV_TAPS = 5;
const DEV_TAP_WINDOW_MS = 1500;

interface MenuItem {
  label: string;
  value?: string;
  onClick: () => void;
}

/**
 * MY 탭 — 하위 메뉴: 단골 매장 · 포인트 · 영수증 · 관심상품 (포트폴리오 IA TO-BE).
 * 담당자 계정일 때만 목록 맨 아래에 "매장 관리"가 보인다 → M-1 전단 올리기.
 * 맨 아래 버전 글자를 1.5초 안에 5번 누르면 개발용 메뉴가 열린다 (Maze 테스트 지원).
 */
export default function My() {
  const { isLoggedIn, isManager, favoriteStore, wishlistIds, logout } = useAppState();
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

  // 포인트·이벤트·공지사항·계정 관리는 다음 화면이 없어 "준비 중이에요" (CLAUDE.md 작업 원칙)
  const soon = () => showToast('준비 중이에요');

  const items: MenuItem[] = [
    { label: '단골 매장', value: favoriteStore.name, onClick: () => navigate('/stores') },
    { label: '포인트', value: `${MEMBER.nhPoint}P`, onClick: soon },
    { label: '영수증', onClick: () => navigate('/my/receipt') },
    { label: '관심상품', value: `${wishlistIds.length}개`, onClick: () => navigate('/events?filter=wish') },
    { label: '이벤트', onClick: soon },
    { label: '공지사항', onClick: soon },
    { label: '계정 관리', onClick: soon },
  ];
  if (isManager) items.push({ label: '매장 관리', onClick: () => navigate('/manage') });

  return (
    <div className={styles.screen}>
      <StatusBar />

      <header className={styles.header}>
        <h1 className={styles.title}>MY</h1>
      </header>

      <section className={styles.section}>
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
      </section>

      {/* 메뉴 목록과 분리된 계정 동작 — 로그인 전 화면(B0-1)으로 돌아갈 수 있게 */}
      <button
        type="button"
        className={styles.logout}
        onClick={() => {
          logout();
          showToast('로그아웃했어요' /* COPY_TODO.md */);
          navigate('/');
        }}
      >
        로그아웃
      </button>

      {/* 개발용 메뉴 진입점: 일부러 버튼으로 드러내지 않는다 */}
      <p className={styles.version} onClick={onVersionTap}>
        버전 {APP_VERSION}
      </p>

      <TabBar />
      {devOpen && <DevMenu onClose={() => setDevOpen(false)} />}
    </div>
  );
}
