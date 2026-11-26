import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoginGate } from './LoginSheet';
import barcodeIcon from '../assets/icons/tab-barcode.svg';
import homeActive from '../assets/icons/tab-home-active.svg';
import homeIcon from '../assets/icons/tab-home.svg';
import tagActive from '../assets/icons/tab-tag-active.svg';
import tagIcon from '../assets/icons/tab-tag.svg';
import ticketActive from '../assets/icons/tab-ticket-active.svg';
import ticketIcon from '../assets/icons/tab-ticket.svg';
import userActive from '../assets/icons/tab-user-active.svg';
import userIcon from '../assets/icons/tab-user.svg';
import styles from './TabBar.module.css';

export type TabKey = 'home' | 'events' | 'barcode' | 'coupons' | 'my';

interface TabDef {
  key: TabKey;
  label: string;
  to: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabDef[] = [
  { key: 'home', label: '홈', to: '/', icon: homeIcon, activeIcon: homeActive },
  { key: 'events', label: '행사', to: '/events', icon: tagIcon, activeIcon: tagActive },
  { key: 'barcode', label: '바코드', to: '/barcode', icon: barcodeIcon, activeIcon: barcodeIcon },
  { key: 'coupons', label: '쿠폰', to: '/coupons', icon: ticketIcon, activeIcon: ticketActive },
  { key: 'my', label: 'MY', to: '/my', icon: userIcon, activeIcon: userActive },
];

function tabFromPath(pathname: string): TabKey | null {
  if (pathname === '/') return 'home';
  if (pathname === '/events' || pathname.startsWith('/events/')) return 'events';
  if (pathname === '/barcode') return 'barcode';
  if (pathname === '/coupons') return 'coupons';
  if (pathname === '/my' || pathname === '/manage' || pathname.startsWith('/manage/')) return 'my';
  return null;
}

type TabBarProps = {
  /** 지정하지 않으면 현재 주소로 정한다 */
  active?: TabKey | null;
  /** 'static'은 컴포넌트 미리보기용 */
  position?: 'fixed' | 'static';
  /** 기본 동작을 바꿀 때 (미리보기 등). 이동을 막으려면 event.preventDefault() */
  onTabClick?: (tab: TabKey, event: MouseEvent<HTMLAnchorElement>) => void;
};

/** 비회원이 누르면 로그인 안내부터 (정보 구조: 바코드·MY는 로그인 필요) */
const GATED_TABS: Partial<Record<TabKey, string>> = {
  barcode: '로그인하면 멤버십 바코드를 바로 쓸 수 있어요',
  my: '로그인하면 내 혜택을 한눈에 볼 수 있어요',
};

export function TabBar({ active, position = 'fixed', onTabClick }: TabBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const requireLogin = useLoginGate();
  const current = active === undefined ? tabFromPath(pathname) : active;

  const defaultTabClick = (tab: TabDef, e: MouseEvent<HTMLAnchorElement>) => {
    const title = GATED_TABS[tab.key];
    if (!title) return;
    e.preventDefault();
    requireLogin({ title, onLoggedIn: () => navigate(tab.to) });
  };

  return (
    <nav className={[styles.tabBar, position === 'fixed' && styles.fixed].filter(Boolean).join(' ')} aria-label="주요 메뉴">
      {TABS.map((tab) => {
        const isActive = tab.key === current;
        const isCenter = tab.key === 'barcode';
        const cls = [styles.tab, isCenter && styles.center, isActive && styles.active].filter(Boolean).join(' ');
        const icon = <img src={isActive ? tab.activeIcon : tab.icon} width={24} height={24} alt="" />;
        return (
          <Link
            key={tab.key}
            to={tab.to}
            className={cls}
            aria-current={isActive ? 'page' : undefined}
            onClick={(e) => (onTabClick ? onTabClick(tab.key, e) : defaultTabClick(tab, e))}
          >
            {isCenter ? <span className={styles.fab}>{icon}</span> : icon}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
