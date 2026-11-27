import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import checkIcon from '../../assets/icons/check-14-green.svg';
import chevLeft from '../../assets/icons/chev-left.svg';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { StatusBar } from '../../components/StatusBar';
import { useToast } from '../../components/Toast';
import {
  ISSUE_MESSAGE,
  MANAGER_STORE_ID,
  REVIEW_ROWS,
  THIS_WEEK_FLYER,
  type FlyerEdits,
  type ReviewRow,
} from '../../data/manager';
import { getStore } from '../../data/stores';
import { useAppState } from '../../state/AppStateContext';
import { formatWon } from '../../utils/format';
import styles from './FlyerReview.module.css';

type Filter = 'all' | 'issue';

function rowSub(row: ReviewRow): string {
  if (row.issue) return ISSUE_MESSAGE[row.issue];
  if (row.price !== undefined) return `${formatWon(row.price)} · ${row.rate}%`;
  return `행사기간 ${row.period ?? THIS_WEEK_FLYER.period}`;
}

/**
 * M-2 정리된 상품 확인 (담당자 계정 전용)
 * - 자동 정리가 안 된 항목은 주황 행 + [수정] → 시트에서 고치면 확인 완료로 바뀐다
 * - '확인 필요'가 남아 있으면 게시 버튼을 막고 "확인 필요 N개를 고치면 게시할 수 있어요"
 * - [신촌점 고객에게 게시하기] → 고친 값과 함께 저장 → 고객 화면 '이번 주 행사'(B0-2)로 이어진다
 */
export default function FlyerReview() {
  const { publishFlyer } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const store = getStore(MANAGER_STORE_ID);

  const [rows, setRows] = useState<ReviewRow[]>(REVIEW_ROWS);
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [draft, setDraft] = useState('');
  // 고친 값 — 게시할 때 함께 저장해서 고객 화면(깐마늘 행사기간 등)에 쓴다
  const [edits, setEdits] = useState<FlyerEdits>({});

  const issueCount = rows.filter((r) => r.issue).length;
  const visible = filter === 'issue' ? rows.filter((r) => r.issue) : rows;

  const goBack = () => (location.key === 'default' ? navigate('/manage') : navigate(-1));

  const openEdit = (row: ReviewRow) => {
    setEditing(row);
    setDraft(row.issue === 'price' ? (row.price ?? '').toLocaleString('ko-KR') : (row.period ?? THIS_WEEK_FLYER.period));
  };

  const saveEdit = () => {
    if (!editing) return;
    const price = Number(draft.replace(/[^0-9]/g, ''));
    const period = draft.trim() || THIS_WEEK_FLYER.period;
    const fix =
      editing.issue === 'price' ? { price: price > 0 ? price : editing.price } : { period };
    setRows((rs) => rs.map((r) => (r.id === editing.id ? { ...r, ...fix, issue: undefined } : r)));
    setEdits((es) => ({ ...es, [editing.id]: { ...es[editing.id], ...fix } }));
    showToast(`${editing.name} ${editing.issue === 'price' ? '가격' : '행사기간'}을 고쳤어요` /* COPY_TODO.md */);
    setEditing(null);
  };

  const publish = () => {
    if (issueCount > 0) return;
    publishFlyer('items', edits);
    showToast(`${store.name} 고객에게 게시했어요` /* COPY_TODO.md */);
    // 고객 화면 '이번 주 행사'로 이어서 보여 준다. 뒤로 가면 M-1(최근 올린 전단에 '게시됨')
    navigate('/events', { replace: true });
  };

  return (
    <div className={styles.screen}>
      <StatusBar />

      <div className={styles.nav}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={chevLeft} width={26} height={26} alt="" />
        </button>
        <h1 className={styles.title}>정리된 상품 확인</h1>
      </div>

      <section className={styles.summary} aria-label="정리 결과">
        <p className={styles.summaryTitle}>상품 {THIS_WEEK_FLYER.productCount}개를 찾았어요</p>
        <p className={styles.summarySub}>
          행사기간 {THIS_WEEK_FLYER.period} · {store.name}
        </p>
        {issueCount > 0 && <span className={styles.warnChip}>확인 필요 {issueCount}개</span>}
      </section>

      <div className={styles.filters} role="group" aria-label="목록 보기">
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>
          전체 {THIS_WEEK_FLYER.productCount}
        </Chip>
        <Chip selected={filter === 'issue'} onClick={() => setFilter('issue')}>
          확인 필요 {issueCount}
        </Chip>
      </div>

      {visible.length > 0 ? (
        <ul className={styles.list}>
          {visible.map((row) => (
            <li key={row.id} className={`${styles.row} ${row.issue ? styles.issue : ''}`}>
              <span className={styles.rowText}>
                <span className={styles.rowName}>{row.name}</span>
                <span className={styles.rowSub}>{rowSub(row)}</span>
              </span>
              {row.issue ? (
                <button
                  type="button"
                  className={styles.editButton}
                  aria-label={`${row.name} ${row.issue === 'price' ? '가격' : '행사기간'} 수정`}
                  onClick={() => openEdit(row)}
                >
                  수정
                </button>
              ) : (
                <span className={styles.ok}>
                  <img src={checkIcon} width={14} height={14} alt="확인 완료" />
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>확인할 상품을 모두 고쳤어요{/* COPY_TODO.md */}</p>
      )}

      <div className={styles.cta}>
        {issueCount > 0 ? (
          <p className={`${styles.ctaNote} ${styles.ctaWarn}`} role="status">
            확인 필요 {issueCount}개를 고치면 게시할 수 있어요
          </p>
        ) : (
          <p className={styles.ctaNote}>게시하면 고객 앱 '이번 주 행사'에 바로 보여요</p>
        )}
        <Button onClick={publish} disabled={issueCount > 0}>
          {store.name} 고객에게 게시하기
        </Button>
      </div>

      {editing && (
        <BottomSheet title={ISSUE_MESSAGE[editing.issue!]} onClose={() => setEditing(null)}>
          <p className={styles.sheetSub}>{editing.name}</p>
          <label className={styles.field}>
            {editing.issue === 'price' ? '가격(원)' : '행사기간'}
            <input
              className={styles.input}
              value={draft}
              inputMode={editing.issue === 'price' ? 'numeric' : 'text'}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            />
          </label>
          <Button onClick={saveEdit}>{editing.issue === 'price' ? '가격 저장하기' : '행사기간 저장하기'}</Button>
        </BottomSheet>
      )}
    </div>
  );
}
