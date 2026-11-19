/** 7784 → '7,784원' */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/** 60000 → '6만 원', 15000 → '1만 5,000원', 8000 → '8,000원' */
export function formatManWon(amount: number): string {
  const man = Math.floor(amount / 10000);
  const rest = amount % 10000;
  if (man === 0) return formatWon(rest);
  if (rest === 0) return `${man}만 원`;
  return `${man}만 ${formatWon(rest)}`;
}
