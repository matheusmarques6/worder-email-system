import type { EmailTemplate, BlockBase } from './types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPadding(padding: { top: number; bottom: number; left: number; right: number }): string {
  return `padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px;`;
}

function renderTextBlock(data: Record<string, unknown>): string {
  const html = (data.html as string) ?? '';
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number; bottom: number; left: number; right: number;
  };

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="${renderPadding(padding)} color: ${(style.color as string) ?? '#333333'}; font-size: ${(style.fontSize as number) ?? 16}px; font-family: ${(style.fontFamily as string) ?? 'Arial, sans-serif'}; text-align: ${(style.textAlign as string) ?? 'left'}; line-height: ${(style.lineHeight as number) ?? 1.5};${(style.backgroundColor as string) ? ` background-color: ${style.backgroundColor};` : ''}">
        ${html}
      </td>
    </tr>
  </table>`;
}

function renderImageBlock(data: Record<string, unknown>): string {
  const url = (data.url as string) ?? '';
  const alt = escapeHtml((data.alt as string) ?? 'Imagem');
  const width = (data.width as number) ?? 600;
  const alignment = (data.alignment as string) ?? 'center';
  const borderRadius = (data.borderRadius as number) ?? 0;
  const padding = (data.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number; bottom: number; left: number; right: number;
  };
  const linkHref = (data.linkHref as string) ?? '';

  if (!url) return '';

  const alignMap: Record<string, string> = { left: 'left', center: 'center', right: 'right' };
  const imgHtml = `<img src="${escapeHtml(url)}" alt="${alt}" width="${width}" style="display: block; max-width: 100%; height: auto;${borderRadius ? ` border-radius: ${borderRadius}px;` : ''}" />`;

  const content = linkHref
    ? `<a href="${escapeHtml(linkHref)}" target="_blank">${imgHtml}</a>`
    : imgHtml;

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="${renderPadding(padding)} text-align: ${alignMap[alignment] ?? 'center'};">
        ${content}
      </td>
    </tr>
  </table>`;
}

function renderButtonBlock(data: Record<string, unknown>): string {
  const text = escapeHtml((data.text as string) ?? 'Clique aqui');
  const href = escapeHtml((data.href as string) ?? '#');
  const style = (data.style ?? {}) as Record<string, unknown>;
  const bgColor = (style.backgroundColor as string) ?? '#F26B2A';
  const textColor = (style.textColor as string) ?? '#FFFFFF';
  const fontSize = (style.fontSize as number) ?? 16;
  const fontWeight = (style.fontWeight as string) ?? 'bold';
  const borderRadius = (style.borderRadius as number) ?? 4;
  const btnPadding = (style.padding ?? { top: 12, bottom: 12, left: 24, right: 24 }) as {
    top: number; bottom: number; left: number; right: number;
  };
  const alignment = (style.alignment as string) ?? 'center';
  const isFullWidth = (style.width as string) === 'full';

  const alignMap: Record<string, string> = { left: 'left', center: 'center', right: 'right' };

  // VML fallback for Outlook
  const vmlButton = `<!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${btnPadding.top + btnPadding.bottom + fontSize + 4}px;v-text-anchor:middle;${isFullWidth ? 'width:100%;' : ''}" arcsize="${Math.round((borderRadius / 40) * 100)}%" stroke="f" fillcolor="${bgColor}">
    <w:anchorlock/>
    <center style="color:${textColor};font-family:Arial,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};">${text}</center>
  </v:roundrect>
  <![endif]-->`;

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="${alignMap[alignment] ?? 'center'}" style="padding: 10px 20px;">
        ${vmlButton}
        <!--[if !mso]><!-->
        <a href="${href}" target="_blank" style="display: inline-block; background-color: ${bgColor}; color: ${textColor}; font-size: ${fontSize}px; font-weight: ${fontWeight}; font-family: Arial, sans-serif; text-decoration: none; border-radius: ${borderRadius}px; ${renderPadding(btnPadding)}${isFullWidth ? ' width: 100%; box-sizing: border-box; text-align: center;' : ''}">${text}</a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>`;
}

function renderDividerBlock(data: Record<string, unknown>): string {
  const style = (data.style ?? {}) as Record<string, unknown>;
  const color = (style.color as string) ?? '#DDDDDD';
  const thickness = (style.thickness as number) ?? 1;
  const padding = (style.padding ?? { top: 10, bottom: 10 }) as { top: number; bottom: number };

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding: ${padding.top}px 20px ${padding.bottom}px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-top: ${thickness}px solid ${color}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderSpacerBlock(data: Record<string, unknown>): string {
  const height = (data.height as number) ?? 20;
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="height: ${height}px; font-size: 0; line-height: 0;">&nbsp;</td>
    </tr>
  </table>`;
}

function renderHeadingBlock(data: Record<string, unknown>): string {
  const text = escapeHtml((data.text as string) ?? '');
  const level = (data.level as number) ?? 1;
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number; bottom: number; left: number; right: number;
  };

  const tag = `h${level}`;

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="${renderPadding(padding)}">
        <${tag} style="margin: 0; color: ${(style.color as string) ?? '#333333'}; font-size: ${(style.fontSize as number) ?? 28}px; font-family: ${(style.fontFamily as string) ?? 'Arial, sans-serif'}; text-align: ${(style.textAlign as string) ?? 'left'}; font-weight: bold;">
          ${text}
        </${tag}>
      </td>
    </tr>
  </table>`;
}

function renderColumnsBlock(data: Record<string, unknown>): string {
  const layout = (data.layout as string) ?? '50-50';
  const gap = (data.gap as number) ?? 10;
  const mobileStack = (data.mobileStack as boolean) ?? true;

  const layoutWidths: Record<string, number[]> = {
    '50-50': [50, 50],
    '33-33-33': [33, 34, 33],
    '66-33': [66, 34],
    '33-66': [34, 66],
  };

  const widths = layoutWidths[layout] ?? layoutWidths['50-50'];
  const totalWidth = 600;

  // Ghost table pattern for Outlook
  const cols = widths.map((pct, i) => {
    const w = Math.floor((totalWidth * pct) / 100) - gap;
    return `<!--[if mso]><td width="${w}" valign="top"><![endif]-->
      <div style="display: inline-block; width: 100%; max-width: ${pct}%; vertical-align: top;${mobileStack ? '' : ''}"${mobileStack ? ` class="mobile-stack"` : ''}>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: ${gap / 2}px;">
              &nbsp;
            </td>
          </tr>
        </table>
      </div>
    <!--[if mso]></td>${i < widths.length - 1 ? '' : ''}<![endif]-->`;
  });

  return `<!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><![endif]-->
    ${cols.join('\n')}
  <!--[if mso]></tr></table><![endif]-->`;
}

function renderHtmlBlock(data: Record<string, unknown>): string {
  return (data.html as string) ?? '';
}

function renderProductBlock(data: Record<string, unknown>): string {
  const product = data.product as
    | { title: string; imageUrl: string; price: string; compareAtPrice?: string; productUrl: string }
    | undefined;
  const showImage = (data.showImage as boolean) ?? true;
  const showTitle = (data.showTitle as boolean) ?? true;
  const showPrice = (data.showPrice as boolean) ?? true;
  const showButton = (data.showButton as boolean) ?? true;
  const buttonText = escapeHtml((data.buttonText as string) ?? 'Comprar agora');
  const buttonStyle = (data.buttonStyle ?? {}) as Record<string, unknown>;

  if (!product) return '';

  let html = '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 10px 20px; text-align: center;">';

  if (showImage && product.imageUrl) {
    html += `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.title)}" style="max-width: 100%; height: auto; display: block; margin: 0 auto 10px;" />`;
  }
  if (showTitle) {
    html += `<h3 style="font-size: 18px; font-weight: bold; margin: 0 0 8px; color: #333;">${escapeHtml(product.title)}</h3>`;
  }
  if (showPrice) {
    html += '<p style="font-size: 16px; margin: 0 0 12px;">';
    if (product.compareAtPrice) {
      html += `<span style="text-decoration: line-through; color: #999; margin-right: 8px;">${escapeHtml(product.compareAtPrice)}</span>`;
    }
    html += `<span style="color: #333; font-weight: bold;">${escapeHtml(product.price)}</span></p>`;
  }
  if (showButton) {
    const bgColor = (buttonStyle.backgroundColor as string) ?? '#F26B2A';
    const txtColor = (buttonStyle.textColor as string) ?? '#FFFFFF';
    html += `<a href="${escapeHtml(product.productUrl)}" target="_blank" style="display: inline-block; background-color: ${bgColor}; color: ${txtColor}; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 4px; padding: 10px 20px;">${buttonText}</a>`;
  }

  html += '</td></tr></table>';
  return html;
}

function renderCouponBlock(data: Record<string, unknown>): string {
  const type = (data.type as string) ?? 'static';
  const staticCode = escapeHtml((data.staticCode as string) ?? 'DESCONTO10');
  const dynamicTag = (data.dynamicTag as string) ?? '{{coupon_code}}';
  const headerText = escapeHtml((data.headerText as string) ?? 'Seu cupom de desconto');
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 16, bottom: 16, left: 24, right: 24 }) as {
    top: number; bottom: number; left: number; right: number;
  };

  const code = type === 'dynamic' ? dynamicTag : staticCode;

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding: 10px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${(style.backgroundColor as string) ?? '#FFF8F0'}; border: 2px ${(style.borderStyle as string) ?? 'dashed'} ${(style.borderColor as string) ?? '#F26B2A'}; border-radius: ${(style.borderRadius as number) ?? 8}px;">
          <tr>
            <td style="${renderPadding(padding)} text-align: center; color: ${(style.textColor as string) ?? '#333333'};">
              <p style="font-size: 14px; margin: 0 0 8px;">${headerText}</p>
              <p style="font-size: ${(style.fontSize as number) ?? 20}px; font-weight: bold; margin: 0; letter-spacing: 2px; font-family: monospace;">${code}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderFooterBlock(data: Record<string, unknown>): string {
  const companyName = escapeHtml((data.companyName as string) ?? 'Sua Empresa');
  const address = escapeHtml((data.address as string) ?? '');
  const showUnsubscribe = (data.showUnsubscribe as boolean) ?? true;
  const textColor = (data.textColor as string) ?? '#999999';
  const linkColor = (data.linkColor as string) ?? '#F26B2A';
  const fontSize = (data.fontSize as number) ?? 12;
  const alignment = (data.alignment as string) ?? 'center';

  let html = `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding: 20px; text-align: ${alignment}; color: ${textColor}; font-size: ${fontSize}px; font-family: Arial, sans-serif; line-height: 1.6;">
        <p style="margin: 0 0 4px; font-weight: bold;">${companyName}</p>`;

  if (address) {
    html += `<p style="margin: 0 0 8px;">${address}</p>`;
  }
  if (showUnsubscribe) {
    html += `<p style="margin: 0;">
          <a href="{{unsubscribe_url}}" style="color: ${linkColor}; text-decoration: underline;">Descadastrar</a>
          &nbsp;|&nbsp;
          <a href="{{preferences_url}}" style="color: ${linkColor}; text-decoration: underline;">Gerenciar preferencias</a>
        </p>`;
  }

  html += `</td></tr></table>`;
  return html;
}

function renderSocialLinksBlock(data: Record<string, unknown>): string {
  const networks = (data.networks ?? []) as Array<{ type: string; url: string }>;
  const iconSize = (data.iconSize as number) ?? 32;
  const alignment = (data.alignment as string) ?? 'center';

  if (networks.length === 0) return '';

  const socialLabels: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    whatsapp: 'WhatsApp',
  };

  const links = networks.map((n) => {
    const label = socialLabels[n.type] ?? n.type;
    return `<a href="${escapeHtml(n.url)}" target="_blank" style="display: inline-block; margin: 0 4px; text-decoration: none; color: #999; font-size: ${Math.round(iconSize * 0.4)}px; font-family: Arial, sans-serif;">[${label}]</a>`;
  });

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding: 10px 20px; text-align: ${alignment};">
        ${links.join('\n        ')}
      </td>
    </tr>
  </table>`;
}

function renderBlock(block: BlockBase): string {
  const renderers: Record<string, (data: Record<string, unknown>) => string> = {
    text: renderTextBlock,
    image: renderImageBlock,
    button: renderButtonBlock,
    divider: renderDividerBlock,
    spacer: renderSpacerBlock,
    heading: renderHeadingBlock,
    columns: renderColumnsBlock,
    html: renderHtmlBlock,
    header: renderTextBlock,
    footer: renderFooterBlock,
    'social-links': renderSocialLinksBlock,
    product: renderProductBlock,
    'product-grid': renderProductBlock,
    'abandoned-cart': renderProductBlock,
    coupon: renderCouponBlock,
  };

  const renderer = renderers[block.type];
  if (!renderer) return '';
  return renderer(block.data);
}

export function renderEmailToHtml(template: EmailTemplate): string {
  const { root, blocks } = template;
  const { data } = root;

  const blockHtml = data.childrenIds
    .map((id) => {
      const block = blocks[id];
      if (!block) return '';
      return renderBlock(block);
    })
    .join('\n');

  const preheader = data.preheaderText
    ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(data.preheaderText)}${'&zwnj;&nbsp;'.repeat(50)}</div>`
    : '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(data.subject || '')}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td { font-family: ${data.fontFamily}; }
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }
    @media only screen and (max-width: 620px) {
      .mobile-stack { display: block !important; width: 100% !important; max-width: 100% !important; }
      .email-container { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${data.backdropColor}; color: ${data.textColor};">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${data.backdropColor};">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!--[if mso]>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${data.width}">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" class="email-container" width="${data.width}" cellpadding="0" cellspacing="0" border="0" style="max-width: ${data.width}px; width: 100%; background-color: ${data.canvasColor};">
          <tr>
            <td>
              ${blockHtml}
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}
