import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import checkIcon from '../../assets/icons/check-14-green.svg';
import uploadArrow from '../../assets/icons/upload-arrow.svg';
import uploadCircle from '../../assets/icons/upload-circle.svg';
import { Button } from '../../components/Button';
import { StatusBar } from '../../components/StatusBar';
import { TabBar } from '../../components/TabBar';
import { useToast } from '../../components/Toast';
import { FLYER_HISTORY, MANAGER_STORE_ID, THIS_WEEK_FLYER } from '../../data/manager';
import { getStore } from '../../data/stores';
import { useAppState } from '../../state/AppStateContext';
import styles from './FlyerUpload.module.css';

/** 파일을 고른 뒤 "정리하는 중"을 보여 주는 시간 (실제 분석은 없다) */
const READING_MS = 1200;

type UploadState = { step: 'idle' } | { step: 'reading'; fileName: string } | { step: 'failed'; fileName: string };

/**
 * M-1 매장 관리 · 전단 올리기 (담당자 계정 전용, MY > 매장 관리)
 * 파일 선택하기 → 정리하는 중 → M-2 정리된 상품 확인
 * 실패 경로(`?scenario=flyer-fail`): 글자를 읽지 못하면 직접 입력하거나 이미지 그대로 게시하도록 안내한다.
 */
export default function FlyerUpload() {
  const { scenario, publishedFlyer, publishFlyer } = useAppState();
  const navigate = useNavigate();
  const showToast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<UploadState>({ step: 'idle' });
  const store = getStore(MANAGER_STORE_ID);

  useEffect(() => {
    if (upload.step !== 'reading') return;
    const t = window.setTimeout(() => {
      if (scenario === 'flyer-fail') setUpload({ step: 'failed', fileName: upload.fileName });
      else navigate('/manage/review');
    }, READING_MS);
    return () => window.clearTimeout(t);
  }, [upload, scenario, navigate]);

  const pickFile = () => fileInput.current?.click();

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일을 다시 골라도 동작하게
    if (file) setUpload({ step: 'reading', fileName: file.name });
  };

  const publishImage = () => {
    publishFlyer('image');
    showToast(`전단 이미지를 ${store.name} 고객에게 게시했어요` /* COPY_TODO.md */);
    navigate('/events', { replace: true });
  };

  const history = [
    ...(publishedFlyer
      ? [
          {
            period: THIS_WEEK_FLYER.period,
            sub: publishedFlyer === 'items' ? `게시 완료 · 상품 ${THIS_WEEK_FLYER.productCount}개` : '게시 완료 · 전단 이미지',
          },
        ]
      : []),
    ...FLYER_HISTORY.map((h) => ({ period: h.period, sub: `게시 완료 · 상품 ${h.productCount}개` })),
  ];

  return (
    <div className={styles.screen}>
      <StatusBar />

      <header className={styles.header}>
        <h1 className={styles.title}>매장 관리</h1>
        <p className={styles.account}>하나로마트 {store.name} · 담당자 계정</p>
      </header>

      <section className={styles.section} aria-labelledby="flyer-this-week">
        <h2 id="flyer-this-week" className={styles.sectionTitle}>
          이번 주 전단
        </h2>

        <input
          ref={fileInput}
          className={styles.fileInput}
          type="file"
          accept=".pdf,image/*,.xls,.xlsx,.csv"
          onChange={onFileChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {upload.step === 'idle' && (
          <div className={styles.upload}>
            <span className={styles.uploadIcon}>
              <img src={uploadCircle} width={56} height={56} alt="" />
              <img src={uploadArrow} width={18} height={22} alt="" />
            </span>
            <p className={styles.uploadTitle}>전단 파일을 올려 주세요</p>
            <p className={styles.uploadSub}>PDF · 이미지 · 엑셀 파일 모두 괜찮아요</p>
            <button type="button" className={styles.fileButton} onClick={pickFile}>
              파일 선택하기
            </button>
          </div>
        )}

        {upload.step === 'reading' && (
          <div className={styles.upload} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <p className={styles.uploadTitle}>상품을 정리하고 있어요{/* COPY_TODO.md */}</p>
            <p className={styles.uploadSub}>{upload.fileName}</p>
          </div>
        )}

        {upload.step === 'failed' && (
          <div className={`${styles.upload} ${styles.failed}`} role="alert">
            <p className={styles.uploadTitle}>파일에서 글자를 읽지 못했어요{/* COPY_TODO.md */}</p>
            <p className={styles.uploadSub}>
              상품을 직접 입력하거나,
              <br />
              전단 이미지를 그대로 게시할 수 있어요
            </p>
            <div className={styles.failedActions}>
              <Button onClick={publishImage}>이미지 그대로 게시하기</Button>
              <Button variant="secondary" onClick={() => showToast('준비 중이에요')}>
                상품 직접 입력하기
              </Button>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  setUpload({ step: 'idle' });
                  pickFile();
                }}
              >
                다른 파일 올리기
              </button>
            </div>
          </div>
        )}

        <p className={styles.tip}>
          <img src={checkIcon} width={14} height={14} alt="" />
          올린 파일에서 상품명·가격·기간을 자동으로 정리해요
        </p>
      </section>

      <section className={styles.section} aria-labelledby="flyer-history">
        <h2 id="flyer-history" className={`${styles.sectionTitle} ${styles.small}`}>
          최근 올린 전단
        </h2>
        <ul className={styles.history}>
          {history.map((h) => (
            <li key={h.period} className={styles.historyRow}>
              <span className={styles.historyText}>
                <span className={styles.historyTitle}>{h.period} 전단</span>
                <span className={styles.historySub}>{h.sub}</span>
              </span>
              <span className={styles.chip}>게시됨</span>
            </li>
          ))}
        </ul>
      </section>

      <TabBar />
    </div>
  );
}
