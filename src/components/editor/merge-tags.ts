export interface MergeTagCategory {
  name: string
  tags: Array<{ name: string; value: string }>
}

export const mergeTags: MergeTagCategory[] = [
  {
    name: "Perfil",
    tags: [
      { name: "Primeiro Nome", value: "{{first_name}}" },
      { name: "Sobrenome", value: "{{last_name}}" },
      { name: "Email", value: "{{email}}" },
      { name: "Telefone", value: "{{phone}}" },
    ],
  },
  {
    name: "Loja",
    tags: [
      { name: "Nome da Loja", value: "{{store_name}}" },
      { name: "URL da Loja", value: "{{store_url}}" },
    ],
  },
  {
    name: "Carrinho",
    tags: [
      { name: "Itens do Carrinho", value: "{{cart_items}}" },
      { name: "Total do Carrinho", value: "{{cart_total}}" },
      { name: "Link do Carrinho", value: "{{cart_url}}" },
    ],
  },
  {
    name: "Pedido",
    tags: [
      { name: "Número do Pedido", value: "{{order_number}}" },
      { name: "Total do Pedido", value: "{{order_total}}" },
      { name: "Rastreamento", value: "{{order_tracking_url}}" },
    ],
  },
  {
    name: "Produto",
    tags: [
      { name: "Nome do Produto", value: "{{product_name}}" },
      { name: "Imagem do Produto", value: "{{product_image}}" },
      { name: "Preço do Produto", value: "{{product_price}}" },
      { name: "Link do Produto", value: "{{product_url}}" },
    ],
  },
]

export function getAllMergeTags(): Array<{ name: string; value: string }> {
  return mergeTags.flatMap((cat) => cat.tags)
}
