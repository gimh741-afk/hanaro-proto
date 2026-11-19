import { EVENT_PERIOD } from '../data/stores';

/**
 * 프로토타입의 "오늘". 테스트·캡처 결과가 날짜에 따라 달라지지 않게 행사 시작일로 고정한다.
 * B2-3 "6일 남음" = 12.03 − 11.27.
 */
export const DEMO_TODAY = EVENT_PERIOD.start;

/** ISO 날짜(YYYY-MM-DD)까지 남은 일수 */
export function daysUntil(iso: string, today: string = DEMO_TODAY): number {
  const ms = Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}
