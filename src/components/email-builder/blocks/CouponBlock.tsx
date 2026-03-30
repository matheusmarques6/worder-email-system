'use client';

export function CouponBlock({ data }: { data: Record<string, unknown> }) {
  const type = (data.type as string) ?? 'static';
  const staticCode = (data.staticCode as string) ?? 'DESCONTO10';
  const dynamicTag = (data.dynamicTag as string) ?? '{{coupon_code}}';
  const headerText = (data.headerText as string) ?? 'Seu cupom de desconto';
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 16, bottom: 16, left: 24, right: 24 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  const code = type === 'dynamic' ? dynamicTag : staticCode;

  return (
    <div style={{ padding: '10px 20px' }}>
      <div
        style={{
          backgroundColor: (style.backgroundColor as string) ?? '#FFF8F0',
          color: (style.textColor as string) ?? '#333333',
          border: `2px ${(style.borderStyle as string) ?? 'dashed'} ${(style.borderColor as string) ?? '#F26B2A'}`,
          borderRadius: (style.borderRadius as number) ?? 8,
          paddingTop: padding.top,
          paddingBottom: padding.bottom,
          paddingLeft: padding.left,
          paddingRight: padding.right,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 14, margin: '0 0 8px', color: (style.textColor as string) ?? '#333' }}>
          {headerText}
        </p>
        <p
          style={{
            fontSize: (style.fontSize as number) ?? 20,
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: 2,
            fontFamily: 'monospace',
          }}
        >
          {code}
        </p>
      </div>
    </div>
  );
}
