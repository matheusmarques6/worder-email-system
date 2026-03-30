export interface MergeTag {
  name: string;
  value: string;
  description: string;
}

export interface MergeTagCategory {
  id: string;
  label: string;
  tags: MergeTag[];
}

export const MERGE_TAG_REGISTRY: MergeTagCategory[] = [
  {
    id: 'contact',
    label: 'Contato',
    tags: [
      { name: 'Primeiro nome', value: '{{contact.first_name}}', description: 'Primeiro nome do contato' },
      { name: 'Sobrenome', value: '{{contact.last_name}}', description: 'Sobrenome do contato' },
      { name: 'Nome completo', value: '{{contact.full_name}}', description: 'Nome completo do contato' },
      { name: 'E-mail', value: '{{contact.email}}', description: 'E-mail do contato' },
      { name: 'Telefone', value: '{{contact.phone}}', description: 'Telefone do contato' },
    ],
  },
  {
    id: 'organization',
    label: 'Loja',
    tags: [
      { name: 'Nome da loja', value: '{{organization.name}}', description: 'Nome da organizacao' },
      { name: 'URL da loja', value: '{{organization.url}}', description: 'URL da loja' },
      { name: 'Logo da loja', value: '{{organization.logo}}', description: 'URL do logo da loja' },
    ],
  },
  {
    id: 'event',
    label: 'Evento',
    tags: [
      { name: 'URL do checkout', value: '{{event.checkout_url}}', description: 'URL para finalizar compra' },
      { name: 'Preco total', value: '{{event.total_price}}', description: 'Valor total do pedido' },
      { name: 'Numero do pedido', value: '{{event.order_number}}', description: 'Numero do pedido' },
      { name: 'URL de rastreio', value: '{{event.tracking_url}}', description: 'URL de rastreamento' },
      { name: 'Codigo de rastreio', value: '{{event.tracking_number}}', description: 'Codigo de rastreamento' },
    ],
  },
  {
    id: 'event.item',
    label: 'Evento - Item (loop)',
    tags: [
      { name: 'Titulo do item', value: '{{item.title}}', description: 'Titulo do produto no carrinho' },
      { name: 'Imagem do item', value: '{{item.image}}', description: 'URL da imagem do produto' },
      { name: 'Preco do item', value: '{{item.price}}', description: 'Preco do produto' },
      { name: 'Quantidade', value: '{{item.quantity}}', description: 'Quantidade do produto' },
      { name: 'Variante', value: '{{item.variant}}', description: 'Variante do produto' },
      { name: 'URL do item', value: '{{item.url}}', description: 'URL do produto' },
    ],
  },
  {
    id: 'coupon',
    label: 'Cupom',
    tags: [
      { name: 'Codigo do cupom', value: '{{coupon.code}}', description: 'Codigo do cupom de desconto' },
      { name: 'Desconto', value: '{{coupon.discount}}', description: 'Valor do desconto' },
      { name: 'Validade', value: '{{coupon.expiry}}', description: 'Data de validade do cupom' },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    tags: [
      { name: 'URL de descadastro', value: '{{system.unsubscribe_url}}', description: 'Link para descadastrar' },
      { name: 'Ano atual', value: '{{system.current_year}}', description: 'Ano corrente' },
      { name: 'Data de envio', value: '{{system.send_date}}', description: 'Data de envio do e-mail' },
    ],
  },
];
