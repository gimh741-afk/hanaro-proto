import { useCallback } from 'react';
import { getWishName, type WishId } from '../data/wishlist';
import { useAppState } from '../state/AppStateContext';
import { useLoginGate } from './LoginSheet';
import { useToast } from './Toast';

/**
 * 찜 하트 아이콘 — Figma icon/heart(16·22·24)와 같은 선. 찜하면 그린으로 채운다.
 * 색은 currentColor가 아니라 토큰을 직접 써서 기존 아이콘(회색·ink 선)과 같게 보인다.
 */
const PATHS = {
  16: { d: 'M8 13.3333C8 13.3333 2.66667 10.2667 2.66667 6.53333C2.55458 5.86656 2.68178 5.18162 3.02579 4.59954C3.3698 4.01747 3.90849 3.57573 4.54666 3.35237C5.18484 3.129 5.88142 3.1384 6.51333 3.3789C7.14525 3.6194 7.67182 4.07552 8 4.66667C8.32818 4.07552 8.85475 3.6194 9.48667 3.3789C10.1186 3.1384 10.8152 3.129 11.4533 3.35237C12.0915 3.57573 12.6302 4.01747 12.9742 4.59954C13.3182 5.18162 13.4454 5.86656 13.3333 6.53333C13.3333 10.2667 8 13.3333 8 13.3333Z', stroke: 2, color: 'var(--gray-700)' },
  22: { d: 'M11 18.3333C11 18.3333 3.66667 14.1167 3.66667 8.98333C3.51254 8.06652 3.68744 7.12473 4.16046 6.32437C4.63348 5.52402 5.37417 4.91662 6.25166 4.6095C7.12915 4.30238 8.08695 4.31531 8.95583 4.64599C9.82472 4.97668 10.5487 5.60384 11 6.41667C11.4513 5.60384 12.1753 4.97668 13.0442 4.64599C13.913 4.31531 14.8709 4.30238 15.7483 4.6095C16.6258 4.91662 17.3665 5.52402 17.8395 6.32437C18.3126 7.12473 18.4875 8.06652 18.3333 8.98333C18.3333 14.1167 11 18.3333 11 18.3333Z', stroke: 1.8, color: 'var(--ink-900)' },
  24: { d: 'M12 20C12 20 4 15.4 4 9.8C3.83186 8.79983 4.02266 7.77243 4.53868 6.89932C5.0547 6.02621 5.86273 5.36359 6.81999 5.02855C7.77725 4.69351 8.82213 4.70761 9.77 5.06836C10.7179 5.4291 11.5077 6.11328 12 7C12.4923 6.11328 13.2821 5.4291 14.23 5.06836C15.1779 4.70761 16.2227 4.69351 17.18 5.02855C18.1373 5.36359 18.9453 6.02621 19.4613 6.89932C19.9773 7.77243 20.1681 8.79983 20 9.8C20 15.4 12 20 12 20Z', stroke: 1.8, color: 'var(--ink-900)' },
} as const;

/** size는 Figma 아이콘 원본(선 굵기 기준), px는 실제로 그릴 크기 (기본값 size) */
export function HeartIcon({ size, filled, color, px }: { size: 16 | 22 | 24; filled: boolean; color?: string; px?: number }) {
  const p = PATHS[size];
  return (
    <svg width={px ?? size} height={px ?? size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true" style={{ display: 'block', position: 'relative' }}>
      <path
        d={p.d}
        strokeWidth={p.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={filled ? 'var(--green-600)' : (color ?? p.color)}
        fill={filled ? 'var(--green-600)' : 'none'}
      />
    </svg>
  );
}

/**
 * 하트를 눌렀을 때: 회원이면 찜을 켜고 끄고, 비회원이면 로그인 안내 → 로그인 뒤 찜을 켠다.
 * "계속 둘러볼게요"를 누르면 아무것도 바꾸지 않고 보던 화면으로 돌아간다 (행사는 로그인 없이 볼 수 있다).
 */
export function useWishToggle() {
  const { isWished, setWished } = useAppState();
  const requireLogin = useLoginGate();
  const showToast = useToast();

  return useCallback(
    (id: WishId) => {
      const name = getWishName(id);
      requireLogin({
        title: `로그인하고 ${name} 찜하기` /* COPY_TODO.md */,
        onLoggedIn: () => {
          // 비회원 → 로그인 직후에는 isWished가 이전 렌더 값(false)이라 항상 찜을 켠다
          const next = !isWished(id);
          setWished(id, next);
          showToast(next ? '찜한 상품에 담았어요' : '찜한 상품에서 뺐어요' /* COPY_TODO.md */);
        },
      });
    },
    [isWished, setWished, requireLogin, showToast],
  );
}
