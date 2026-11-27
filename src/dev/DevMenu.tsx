import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { useToast } from '../components/Toast';
import { COUPONS } from '../data/coupons';
import { STORES } from '../data/stores';
import { useAppState } from '../state/AppStateContext';
import styles from './DevMenu.module.css';

const MAZE_URLS = [
  { query: '?start=guest', hint: '비회원으로 시작' },
  { query: '?start=member', hint: '회원으로 시작' },
  { query: '?start=member&scenario=auth-fail', hint: '인증 실패 화면 보기' },
  { query: '?start=manager', hint: '담당자 계정으로 시작' },
  { query: '?start=manager&scenario=flyer-fail', hint: '전단 읽기 실패 보기' },
  { query: '?start=member&scenario=after-checkout', hint: '계산 직후 영수증 · 할인 확인' },
  { query: '?reset=1', hint: '저장 상태 지우기' },
];

/**
 * 개발용 메뉴 (MY 맨 아래 버전 글자 5번 탭). 테스트 진행자가 참가자 사이에 상태를 되돌릴 때 쓴다.
 * 테스트 참가자에게 보이는 화면이 아니라서 문구 규칙·COPY_TODO 대상이 아니다.
 */
export function DevMenu({ onClose }: { onClose: () => void }) {
  const app = useAppState();
  const navigate = useNavigate();
  const showToast = useToast();
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const done = (message: string, goHome = true) => {
    showToast(message);
    if (goHome) {
      onClose();
      navigate('/');
    }
  };

  const copyUrl = async (query: string) => {
    const url = `${window.location.origin}/${query}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('주소를 복사했어요');
    } catch {
      window.prompt('주소를 복사하세요', url);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-menu-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <h2 id="dev-menu-title" className={styles.headTitle}>
            개발용 메뉴
          </h2>
          <button ref={closeButton} type="button" className={styles.close} onClick={onClose}>
            닫기
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.group}>
            <h3 className={styles.groupTitle}>지금 상태</h3>
            <dl className={styles.state}>
              <dt>로그인</dt>
              <dd>{app.isManager ? '담당자' : app.isLoggedIn ? '회원' : '비회원'}</dd>
              <dt>단골 매장</dt>
              <dd>{app.favoriteStore.name}</dd>
              <dt>받은 쿠폰</dt>
              <dd>{app.claimedCouponIds.length ? app.claimedCouponIds.join(', ') : '없음'}</dd>
              <dt>시나리오</dt>
              <dd>{app.scenario ?? '없음'}</dd>
            </dl>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>테스트 시작 상태 (신촌점 · 쿠폰 미수령)</h3>
            <div className={styles.row}>
              <Button
                variant="secondary"
                onClick={() => {
                  app.startAs('guest');
                  done('비회원 상태로 시작해요');
                }}
              >
                비회원으로 시작
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  app.startAs('member');
                  done('회원 상태로 시작해요');
                }}
              >
                회원으로 시작
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  app.startAs('manager');
                  done('담당자 계정으로 시작해요');
                }}
              >
                담당자 계정으로 시작
              </Button>
            </div>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>단골 매장</h3>
            <div className={styles.chips}>
              {STORES.map((s) => (
                <Chip
                  key={s.id}
                  selected={s.id === app.favoriteStoreId}
                  onClick={() => app.patchState({ favoriteStoreId: s.id })}
                >
                  {s.name}
                </Chip>
              ))}
            </div>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>로그인 · 쿠폰 · 시나리오</h3>
            <div className={styles.row}>
              <Button variant="tint" onClick={() => app.patchState({ isLoggedIn: !app.isLoggedIn })}>
                {app.isLoggedIn ? '비회원으로 바꾸기' : '회원으로 바꾸기'}
              </Button>
              <Button
                variant="tint"
                onClick={() => app.patchState({ scenario: app.scenario === 'auth-fail' ? null : 'auth-fail' })}
              >
                인증 실패 {app.scenario === 'auth-fail' ? '끄기' : '켜기'}
              </Button>
              <Button
                variant="tint"
                onClick={() => app.patchState({ scenario: app.scenario === 'flyer-fail' ? null : 'flyer-fail' })}
              >
                전단 읽기 실패 {app.scenario === 'flyer-fail' ? '끄기' : '켜기'}
              </Button>
              <Button variant="tint" onClick={() => app.patchState({ claimedCouponIds: COUPONS.map((c) => c.id) })}>
                쿠폰 모두 받기
              </Button>
              <Button variant="tint" onClick={() => app.patchState({ claimedCouponIds: [] })}>
                받은 쿠폰 비우기
              </Button>
            </div>
          </section>

          <section className={styles.group}>
            <h3 className={styles.groupTitle}>테스트 주소 (눌러서 복사)</h3>
            <div className={styles.urls}>
              {MAZE_URLS.map((u) => (
                <button key={u.query} type="button" className={styles.url} onClick={() => copyUrl(u.query)}>
                  <code>{u.query}</code>
                  <span className={styles.urlHint}>{u.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.group}>
            <Button
              onClick={() => {
                app.resetAll();
                done('저장된 상태를 지웠어요');
              }}
            >
              저장된 상태 지우기
            </Button>
            {import.meta.env.DEV && (
              <Link to="/dev/components" className={styles.devLink} onClick={onClose}>
                컴포넌트 미리보기 열기
              </Link>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
