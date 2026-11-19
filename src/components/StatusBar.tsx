import statusIcons from '../assets/icons/status-bar.svg';
import styles from './StatusBar.module.css';

/** 목업용 iOS 상태 표시줄. 장식이라 스크린리더에서는 숨긴다. */
export function StatusBar({ background = 'var(--white)' }: { background?: string }) {
  return (
    <div className={styles.statusBar} style={{ background }} aria-hidden="true">
      <span className={styles.time}>9:41</span>
      <img className={styles.icons} src={statusIcons} width={66} height={14} alt="" />
    </div>
  );
}
