/** 찜(관심상품)은 상태로 관리한다 — data/wishlist.ts DEFAULT_WISHLIST (초기 2개) */
export interface Member {
  nhPoint: number;
  barcodeNumber: string;
}

export const MEMBER: Member = {
  nhPoint: 34,
  barcodeNumber: '9410 2201 3384 0715',
};
