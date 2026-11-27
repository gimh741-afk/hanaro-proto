import { useNavigate } from 'react-router-dom';
import bellIcon from '../assets/icons/bell.svg';
import locationIcon from '../assets/icons/location.svg';
import { Button } from '../components/Button';
import { StatusBar } from '../components/StatusBar';
import styles from './Welcome.module.css';

/**
 * 첫 실행 ① 권한 안내 → ② 단골 매장 선택(/welcome/store) → ③ 고른 매장으로 홈.
 * `?start=guest|member|manager`로 들어오면 건너뛴다. 실제 권한 요청은 하지 않는다 (프로토타입).
 * 문구는 앱에 있는 안내를 쓴다: "현재 위치 기준"(매장 고르기), "전단이 올라올 때 알려드려요"(매장 고르기 안내).
 */
const PERMISSIONS = [
  { icon: locationIcon, iconSize: 18, name: '위치', desc: '현재 위치 기준으로 가까운 매장을 찾아요' },
  { icon: bellIcon, iconSize: 22, name: '알림', desc: '단골 매장 전단이 올라오면 알려드려요' },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className={styles.screen}>
      <StatusBar />

      <div className={styles.body}>
        <p className={styles.brand}>하나로마트</p>
        <h1 className={styles.title}>
          이번 주 행사를 보려면
          <br />
          이 권한이 필요해요
        </h1>

        <ul className={styles.list}>
          {PERMISSIONS.map((p) => (
            <li key={p.name} className={styles.item}>
              <span className={styles.icon}>
                <img src={p.icon} width={p.iconSize} height={p.iconSize} alt="" />
              </span>
              <span className={styles.text}>
                <span className={styles.name}>
                  {p.name} <span className={styles.optional}>(선택)</span>
                </span>
                <span className={styles.desc}>{p.desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.note}>허용하지 않아도 행사는 둘러볼 수 있어요</p>
      </div>

      <div className={styles.cta}>
        <Button onClick={() => navigate('/welcome/store')}>단골 매장 고르기</Button>
      </div>
    </div>
  );
}
