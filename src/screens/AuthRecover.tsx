import { Link, useLocation, useNavigate } from 'react-router-dom';
import alertIcon from '../assets/icons/alert-36-green.svg';
import checkIcon from '../assets/icons/check-14-green.svg';
import chevLeft from '../assets/icons/chev-left.svg';
import chevRight from '../assets/icons/chev-right-16-green600.svg';
import { Button } from '../components/Button';
import { StatusBar } from '../components/StatusBar';
import { useToast } from '../components/Toast';
import { useAppState } from '../state/AppStateContext';
import styles from './AuthRecover.module.css';

/**
 * S-1 인증 실패 복구 — `?scenario=auth-fail`에서 로그인하면 여기로 온다 (동작 규칙 7).
 * 실제 인증은 없으므로 "인증 다시 하기"·"카카오로 인증하기"는 성공 처리하고 시나리오를 끝낸다.
 * 오류 화면에는 해결할 수 있는 버튼을 둔다 (문구 규칙).
 */
export default function AuthRecover() {
  const { login, clearScenario } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();

  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1));

  const retry = () => {
    clearScenario();
    login();
    showToast('로그인했어요' /* COPY_TODO.md */);
    goBack();
  };

  return (
    <div className={styles.screen}>
      <StatusBar />

      <div className={styles.nav}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={chevLeft} width={26} height={26} alt="" />
        </button>
      </div>

      <div className={styles.content}>
        <span className={styles.icon}>
          <img src={alertIcon} width={36} height={36} alt="" />
        </span>
        <h1 className={styles.title}>인증을 한 번만 더 해주세요</h1>
        <p className={styles.desc}>
          통신이 잠시 불안정했어요.
          <br />
          다시 시도하거나 카카오로 인증할 수 있어요.
        </p>
        <p className={styles.kept}>
          <img src={checkIcon} width={14} height={14} alt="" />
          입력한 정보는 그대로 남겨뒀어요
        </p>
      </div>

      <div className={styles.actions}>
        <Button onClick={retry}>인증 다시 하기</Button>
        <Button variant="secondary" onClick={retry}>
          카카오로 인증하기
        </Button>
        <Link to="/events" className={styles.guestLink}>
          로그인 없이 행사 먼저 보기
          <img src={chevRight} width={16} height={16} alt="" />
        </Link>
      </div>
    </div>
  );
}
