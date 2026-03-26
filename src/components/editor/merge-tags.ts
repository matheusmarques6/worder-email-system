export const mergeTags = {
  first_name: { name: "Nome", value: "{{first_name}}" },
  last_name: { name: "Sobrenome", value: "{{last_name}}" },
  email: { name: "Email", value: "{{email}}" },
  phone: { name: "Telefone", value: "{{phone}}" },
  store_name: { name: "Nome da Loja", value: "{{store_name}}" },
  store_url: { name: "URL da Loja", value: "{{store_url}}" },
  cart_items: { name: "Itens do Carrinho", value: "{{cart_items}}" },
  cart_total: { name: "Total do Carrinho", value: "{{cart_total}}" },
  cart_url: { name: "URL do Carrinho", value: "{{cart_url}}" },
  order_number: { name: "Número do Pedido", value: "{{order_number}}" },
  order_total: { name: "Total do Pedido", value: "{{order_total}}" },
  order_tracking_url: {
    name: "URL de Rastreio",
    value: "{{order_tracking_url}}",
  },
  product_name: { name: "Nome do Produto", value: "{{product_name}}" },
  product_image: { name: "Imagem do Produto", value: "{{product_image}}" },
  product_price: { name: "Preço do Produto", value: "{{product_price}}" },
  product_url: { name: "URL do Produto", value: "{{product_url}}" },
};

export const mergeTagCategories = {
  Perfil: ["first_name", "last_name", "email", "phone"],
  Loja: ["store_name", "store_url"],
  Carrinho: ["cart_items", "cart_total", "cart_url"],
  Pedido: ["order_number", "order_total", "order_tracking_url"],
  Produto: ["product_name", "product_image", "product_price", "product_url"],
};
