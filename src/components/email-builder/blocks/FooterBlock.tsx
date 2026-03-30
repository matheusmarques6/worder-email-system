'use client';

export function FooterBlock({ data }: { data: Record<string, unknown> }) {
  const companyName = (data.companyName as string) ?? 'Sua Empresa';
  const address = (data.address as string) ?? '';
  const showUnsubscribe = (data.showUnsubscribe as boolean) ?? true;
  const textColor = (data.textColor as string) ?? '#999999';
  const linkColor = (data.linkColor as string) ?? '#F26B2A';
  const fontSize = (data.fontSize as number) ?? 12;
  const alignment = (data.alignment as string) ?? 'center';

  return (
    <div
      style={{
        padding: '20px',
        textAlign: alignment as 'left' | 'center' | 'right',
        color: textColor,
        fontSize,
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{companyName}</p>
      {address && <p style={{ margin: '0 0 8px' }}>{address}</p>}
      {showUnsubscribe && (
        <p style={{ margin: 0 }}>
          <span
            style={{
              color: linkColor,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Descadastrar
          </span>
          {' | '}
          <span
            style={{
              color: linkColor,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Gerenciar preferencias
          </span>
        </p>
      )}
    </div>
  );
}
