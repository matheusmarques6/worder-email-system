interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateEmailHtml(html: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar tamanho (limite do Gmail: 102KB)
  const sizeBytes = new TextEncoder().encode(html).length;
  const sizeKb = sizeBytes / 1024;
  if (sizeKb > 102) {
    errors.push(
      `O email tem ${sizeKb.toFixed(1)}KB e excede o limite de 102KB do Gmail. O conteudo sera cortado.`
    );
  }

  // Verificar tags proibidas
  if (/<script[\s>]/i.test(html)) {
    errors.push('Tags <script> nao sao permitidas em emails. Clientes de email bloqueiam scripts.');
  }

  if (/<form[\s>]/i.test(html)) {
    errors.push('Tags <form> nao sao suportadas pela maioria dos clientes de email.');
  }

  if (/<iframe[\s>]/i.test(html)) {
    errors.push('Tags <iframe> nao sao suportadas pela maioria dos clientes de email.');
  }

  // Verificar imagens sem alt
  const imgRegex = /<img\b[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const imgTag = imgMatch[0];
    if (!/\balt\s*=/i.test(imgTag)) {
      warnings.push(
        'Uma ou mais imagens estao sem atributo alt. Adicione texto alternativo para acessibilidade.'
      );
      break;
    }
  }

  // Verificar propriedades CSS problematicas
  const cssProblematicas: { prop: string; label: string }[] = [
    { prop: 'position\\s*:', label: 'position' },
    { prop: 'float\\s*:', label: 'float' },
    { prop: 'display\\s*:\\s*flex', label: 'display: flex' },
    { prop: 'display\\s*:\\s*grid', label: 'display: grid' },
  ];

  for (const { prop, label } of cssProblematicas) {
    if (new RegExp(prop, 'i').test(html)) {
      warnings.push(
        `CSS "${label}" detectado. Essa propriedade nao e suportada por muitos clientes de email.`
      );
    }
  }

  return { errors, warnings };
}
