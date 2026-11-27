import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import checkIcon from '../assets/icons/check-14-green.svg';
import { Button } from '../components/Button';
import { CouponCard, type CouponCardState } from '../components/CouponCard';
import { CouponHelp } from '../components/CouponHelp';
import { useLoginGate } from '../components/LoginSheet';
import { StatusBar } from '../components/StatusBar';
import { TabBar } from '../components/TabBar';
import { useToast } from '../components/Toast';
import { COUPONS, isCouponUsableAt, sumCouponAmount, type Coupon } from '../data/coupons';
import { useAppState } from '../state/AppStateContext';
import { formatWon } from '../utils/format';
import styles from './Coupons.module.css';

type TabKey = 'claimable' | 'mine' | 'past';

/**
 * B3-2 쿠폰 / B3-3 쿠폰 받은 직후
 * - "받을 수 있는" 탭은 쿠폰 3장을 모두 보여 주고 상태만 바뀐다 (받기 → 받음, 다른 매장 전용은 불가)
 * - 개수는 동작 규칙 2 (현재 단골 매장에서 쓸 수 있고 아직 안 받은 쿠폰)
 */
export default function Coupons() {
  const { favoriteStore, claimableCoupons, myCoupons, isCouponClaimed, claimCoupon } = useAppState();
  const requireLogin = useLoginGate();
  const showToast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('claimable');

  const stateOf = (c: Coupon): CouponCardState =>
    isCouponClaimed(c.id) ? 'claimed' : isCouponUsableAt(c, favoriteStore.id) ? 'claimable' : 'unavailable';

  // 단골 매장에서 받을 수 있는 쿠폰을 한 번에 (다른 매장 전용 쿠폰은 claimableCoupons에 없다)
  const handleClaimAll = () => {
    const targets = claimableCoupons;
    if (targets.length === 0) return;
    requireLogin({
      title: `로그인하고 ${formatWon(sumCouponAmount(targets))} 쿠폰 ${targets.length}장 받기`,
      onLoggedIn: () => {
        targets.forEach((c) => claimCoupon(c.id));
        showToast('받은 쿠폰은 바코드에 자동으로 담겼어요');
      },
    });
  };

  const handleClaim = (c: Coupon) =>
    requireLogin({
      title: `로그인하고 ${formatWon(c.amount)} 쿠폰 받기`,
      onLoggedIn: () => {
        claimCoupon(c.id);
        showToast('받은 쿠폰은 바코드에 자동으로 담겼어요');
      },
    });

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'claimable', label: `받을 수 있는 ${claimableCoupons.length}` },
    { key: 'mine', label: `내 쿠폰 ${myCoupons.length}` },
    { key: 'past', label: '지난 쿠폰' },
  ];

  // 탭 목록 좌우 화살표 이동 (WAI-ARIA tabs 패턴)
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    setTab(tabs[next].key);
    document.getElementById(`coupon-tab-${tabs[next].key}`)?.focus();
  };

  const list = tab === 'claimable' ? COUPONS : tab === 'mine' ? myCoupons : [];

  return (
    <div className={styles.screen}>
      <StatusBar background="var(--gray-100)" />

      <header className={styles.header}>
        <h1 className={styles.title}>쿠폰</h1>
      </header>

      <div className={styles.summary}>
        <p className={styles.summaryTitle}>
          받을 수 있는 쿠폰 <span className={styles.summaryCount}>{claimableCoupons.length}장</span>
        </p>
        <p className={styles.summaryNote}>
          <img src={checkIcon} width={14} height={14} alt="" />
          받은 쿠폰은 계산할 때 바코드로 자동 할인돼요
        </p>
        <Button
          variant={claimableCoupons.length > 0 ? 'primary' : 'tint'}
          className={styles.claimAll}
          disabled={claimableCoupons.length === 0}
          onClick={handleClaimAll}
        >
          {claimableCoupons.length > 0
            ? `${claimableCoupons.length}장 모두 받기`
            : '모두 받았어요' /* COPY_TODO.md */}
        </Button>
        <CouponHelp className={styles.help} />
      </div>

      <div className={styles.segment} role="tablist" aria-label="쿠폰 목록">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            id={`coupon-tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            aria-controls="coupon-panel"
            tabIndex={tab === t.key ? 0 : -1}
            className={styles.tab}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="coupon-panel" role="tabpanel" aria-labelledby={`coupon-tab-${tab}`}>
        {list.length > 0 ? (
          <ul className={styles.list}>
            {list.map((c) => (
              <li key={c.id}>
                <CouponCard
                  coupon={c}
                  state={stateOf(c)}
                  onClaim={handleClaim}
                  onChangeStore={() => navigate('/stores')}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            {tab === 'mine'
              ? '받은 쿠폰이 여기에 모여요' /* COPY_TODO.md */
              : '다 쓴 쿠폰과 기간이 지난 쿠폰을 여기서 볼 수 있어요' /* COPY_TODO.md */}
          </p>
        )}
      </div>

      <TabBar />
    </div>
  );
}
