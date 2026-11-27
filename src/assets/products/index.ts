import type { ProductId } from '../../data/products';
import cabbageSheet from './cabbage.png';
import garlicPhoto from './garlic.png';
import kimjangSheet from './kimjang.png';
import tangerineHanwooSheet from './tangerine-hanwoo.png';

/**
 * Figma의 상품 이미지는 원본 사진(664×1440) 한 장을 이미지 칸 안에서 잘라 보여 준다.
 * crop 값은 Figma get_design_context가 준 비율(이미지 칸 167px 기준 %) 그대로다.
 */
export interface ProductImage {
  src: string;
  crop: { width: string; height: string; left: string; top: string };
}

/**
 * 상세 화면 큰 이미지(390×300)용 crop. Figma B2-3 감귤 값과 같은 규칙으로 카드 crop에서 계산한다:
 * 가로는 카드와 같은 비율, 세로는 390/300배로 늘리고 세로 가운데 맞춤((390−300)/2 = 45px = 15%).
 * 감귤: 778.38% → 1011.89%, −432.43% → −577.16% (Figma와 일치)
 */
export function heroCrop(image: ProductImage): ProductImage['crop'] {
  const ratio = 390 / 300;
  const pct = (v: string) => parseFloat(v);
  return {
    width: image.crop.width,
    left: image.crop.left,
    height: `${(pct(image.crop.height) * ratio).toFixed(2)}%`,
    top: `${(pct(image.crop.top) * ratio - 15).toFixed(2)}%`,
  };
}

export const PRODUCT_IMAGES: Partial<Record<ProductId, ProductImage>> = {
  'jeju-tangerine': {
    src: tangerineHanwooSheet,
    crop: { width: '358.92%', height: '778.38%', left: '-221.62%', top: '-432.43%' },
  },
  'hanwoo-sirloin': {
    src: tangerineHanwooSheet,
    crop: { width: '316.19%', height: '685.71%', left: '-33.33%', top: '-386.67%' },
  },
  'kimjang-set': {
    src: kimjangSheet,
    crop: { width: '260.39%', height: '564.71%', left: '-14.12%', top: '-149.02%' },
  },
  'haenam-cabbage': {
    src: cabbageSheet,
    crop: { width: '402.42%', height: '872.73%', left: '-20.61%', top: '-200%' },
  },
};

/**
 * 고객 앱 상품 데이터에는 없는 찜 상품의 사진 (정사각 한 장, 카드 칸에 꽉 채운다).
 * 깐마늘 1kg: 사용자가 제공한 사진 (2026-11-27).
 */
export const WISH_PHOTOS: Record<string, string> = {
  'peeled-garlic': garlicPhoto,
};
