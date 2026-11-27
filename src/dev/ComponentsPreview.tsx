import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { CouponCard } from '../components/CouponCard';
import { ProductCard } from '../components/ProductCard';
import { StatusBar } from '../components/StatusBar';
import { StoreRow } from '../components/StoreRow';
import { TabBar, type TabKey } from '../components/TabBar';
import { Toast, useToast } from '../components/Toast';
import { getCoupon, type Coupon } from '../data/coupons';
import { PRODUCTS } from '../data/products';
import { getStore } from '../data/stores';

/** Figma "Components · TO-BE"(39:395)와 나란히 비교하는 개발용 페이지. 개발 서버에서만 /dev/components로 열린다. */
export default function ComponentsPreview() {
  const showToast = useToast();
  const navigate = useNavigate();
  const kimjang = getCoupon('kimjang-4000') as Coupon;

  return (
    <div style={{ background: 'var(--gray-100)', minHeight: '100%', paddingBottom: 40 }}>
      <StatusBar />

      <Section title="TabBar">
        <div style={{ display: 'grid', gap: 40, paddingTop: 16, margin: '0 calc(var(--side) * -1)' }}>
          {(['home', 'events', 'barcode', 'coupons', 'my'] as TabKey[]).map((key) => (
            <TabBar key={key} active={key} position="static" onTabClick={(_, e) => e.preventDefault()} />
          ))}
        </div>
      </Section>

      <Section title="Button">
        <div style={{ display: 'grid', gap: 12 }}>
          <Button onClick={() => showToast('Primary')}>버튼</Button>
          <Button variant="secondary">버튼</Button>
          <Button variant="tint">버튼</Button>
        </div>
      </Section>

      <Section title="Toast">
        <Toast message="메시지" />
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" onClick={() => showToast('받은 쿠폰은 바코드에 자동으로 담겼어요')}>
            토스트 띄워 보기
          </Button>
        </div>
      </Section>

      <Section title="ProductCard">
        <div style={{ display: 'grid', gridTemplateColumns: '167px 167px', gap: 16 }}>
          {PRODUCTS.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              caption={p.id === 'jeju-tangerine' ? '~12.03까지 · 쿠폰 적용가' : undefined}
            />
          ))}
        </div>
      </Section>

      <Section title="StoreRow">
        <div style={{ display: 'grid', gap: 12 }}>
          <StoreRow store={getStore('yangjae')} />
          <StoreRow store={getStore('umyeon')} />
          <StoreRow store={getStore('yangjae')} isCurrent />
        </div>
      </Section>

      <Section title="CouponCard">
        <div style={{ display: 'grid', gap: 20 }}>
          <CouponCard coupon={kimjang} state="claimable" onClaim={() => showToast('받기')} />
          <CouponCard coupon={kimjang} state="claimed" />
          <CouponCard
            coupon={getCoupon('yangjae-open-1000') as Coupon}
            state="unavailable"
            onChangeStore={() => navigate('/stores')}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ padding: '24px var(--side) 0' }}>
      <h2 style={{ fontSize: 'var(--fs-caption-1)', color: 'var(--gray-700)', marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  );
}
