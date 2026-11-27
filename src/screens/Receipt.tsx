import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import checkIcon from '../assets/icons/check-14-green.svg';
import chevLeft from '../assets/icons/chev-left.svg';
import coinIcon from '../assets/icons/coin-18-green.svg';
import ticketIcon from '../assets/icons/ticket-18-green.svg';
import { Button } from '../components/Button';
import { StatusBar } from '../components/StatusBar';
import { TabBar } from '../components/TabBar';
import { useToast } from '../components/Toast';
import { buildLatestReceipt, sumApplied, type AppliedDiscount } from '../data/receipt';
import { getStore } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import { formatWon } from '../utils/format';
import styles from './Receipt.module.css';

/** 카드 할인 아이콘 — 아이콘 세트에 카드가 없어 같은 선 굵기·그린으로 그린다 (18px) */
function CardIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="14" height="10" rx="2" stroke="var(--green-600)" strokeWidth="1.6" />
      <path d="M2 7.5H16" stroke="var(--green-600)" strokeWidth="1.6" />
    </svg>
  );
}

function DiscountIcon({ kind }: { kind: AppliedDiscount['kind'] }) {
  if (kind === 'card') return <CardIcon />;
  return <img src={kind === 'point' ? coinIcon : ticketIcon} width={18} height={18} alt="" />;
}

/**
 * 영수증 · 할인 확인 — 계산한 뒤 앱에서 받은 쿠폰·할인이 영수증에 반영됐는지 맞춰 보여 준다.
 * 들어오는 길: MY > 영수증, 바코드 > "방금 장보기 결과 보기", `?start=member&scenario=after-checkout`
 * 적용되지 않은 할인은 주황으로, 이유(최소 금액)와 함께 보여 준다.
 */
export default function Receipt() {
  const { isLoggedIn, claimedCouponIds } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();

  if (!isLoggedIn) return <Navigate to="/" replace />;

  // 실제로 받은 쿠폰 기준 (감귤 쿠폰을 안 받았으면 미적용으로, 김장맞이는 받았을 때만)
  const receipt = buildLatestReceipt(claimedCouponIds);
  const store = getStore(receipt.storeId);
  const total = sumApplied(receipt);
  const goBack = () => (location.key === 'default' ? navigate('/my') : navigate(-1));

  return (
    <div className={styles.screen}>
      <StatusBar />

      <div className={styles.nav}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={chevLeft} width={26} height={26} alt="" />
        </button>
        <div>
          <h1 className={styles.title}>영수증 · 할인 확인</h1>
          <p className={styles.sub}>
            {receipt.dateLabel} {store.name} · 방금 계산
          </p>
        </div>
      </div>

      <section className={styles.summary} aria-labelledby="receipt-total">
        <h2 id="receipt-total" className={styles.summaryTitle}>
          {formatWon(total)} 할인받았어요
        </h2>
        <p className={styles.summarySub}>앱에서 받은 쿠폰과 할인이 영수증에 모두 반영됐어요</p>
        <p className={styles.match}>
          영수증과 일치
          <img src={checkIcon} width={14} height={14} alt="" />
        </p>
      </section>

      <section className={styles.group} aria-labelledby="receipt-applied">
        <h2 id="receipt-applied" className={styles.groupTitle}>
          적용된 할인
        </h2>
        <ul className={styles.list}>
          {receipt.applied.map((d) => (
            <li key={d.title} className={styles.row}>
              <span className={styles.rowIcon}>
                <DiscountIcon kind={d.kind} />
              </span>
              <span className={styles.rowName}>{d.title}</span>
              {d.amount !== undefined && <span className={styles.rowAmount}>−{formatWon(d.amount)}</span>}
            </li>
          ))}
        </ul>
      </section>

      {receipt.missed.length > 0 && (
      <section className={styles.group} aria-labelledby="receipt-missed">
        <h2 id="receipt-missed" className={`${styles.groupTitle} ${styles.missedTitle}`}>
          적용되지 않은 할인
        </h2>
        <ul className={styles.list}>
          {receipt.missed.map((m) => (
            <li key={m.id} className={`${styles.row} ${styles.missed}`}>
              <span className={styles.rowText}>
                <span className={styles.rowName}>{m.title}</span>
                <span className={styles.rowSub}>{m.reason}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      )}

      <div className={styles.actions}>
        {/* 영수증 원본 화면은 없어서 "준비 중이에요" (CLAUDE.md 작업 원칙) */}
        <Button variant="secondary" onClick={() => showToast('준비 중이에요')}>
          영수증 자세히 보기
        </Button>
      </div>

      <TabBar />
    </div>
  );
}
