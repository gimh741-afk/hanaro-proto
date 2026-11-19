import { lazy, Suspense, useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AuthRecover from '../screens/AuthRecover';
import Barcode from '../screens/Barcode';
import Coupons from '../screens/Coupons';
import Events from '../screens/Events';
import Home from '../screens/Home';
import My from '../screens/My';
import ProductDetail from '../screens/ProductDetail';
import Stores from '../screens/Stores';

// 개발 서버에서만: 컴포넌트 미리보기 (빌드 결과물에는 포함되지 않음)
const ComponentsPreview = import.meta.env.DEV ? lazy(() => import('../dev/ComponentsPreview')) : null;

/** 라우트 표는 CLAUDE.md "화면 | 노드 ID | 라우트"와 맞춘다. */
/** 화면을 옮기면 PhoneFrame 스크롤을 맨 위로 (스크롤 영역이 window가 아니라서 직접 처리) */
function ScrollReset() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    document.getElementById('app-viewport')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollReset />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:productId" element={<ProductDetail />} />
      <Route path="/stores" element={<Stores />} />
      <Route path="/coupons" element={<Coupons />} />
      <Route path="/barcode" element={<Barcode />} />
      <Route path="/my" element={<My />} />
      <Route path="/auth/recover" element={<AuthRecover />} />
      {ComponentsPreview && (
        <Route
          path="/dev/components"
          element={
            <Suspense fallback={null}>
              <ComponentsPreview />
            </Suspense>
          }
        />
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
