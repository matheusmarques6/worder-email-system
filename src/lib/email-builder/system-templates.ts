import type { EmailTemplate } from './types';

export interface SystemTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template: EmailTemplate;
}

function makeId(prefix: string, n: number): string {
  return `${prefix}_${n}`;
}

const boasVindas: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['bv_1', 'bv_2', 'bv_3', 'bv_4', 'bv_5'],
      preheaderText: 'Bem-vindo(a) à nossa loja! Confira as novidades.',
      subject: 'Bem-vindo(a), {{contact.first_name}}!',
      width: 600,
    },
  },
  blocks: {
    bv_1: {
      id: 'bv_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo da loja',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    bv_2: {
      id: 'bv_2',
      type: 'heading',
      data: {
        text: 'Olá, {{contact.first_name}}!',
        level: 1,
        style: {
          color: '#333333',
          fontSize: 28,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 5, left: 20, right: 20 },
        },
      },
    },
    bv_3: {
      id: 'bv_3',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">Estamos muito felizes em ter você conosco! Explore nossos produtos e aproveite ofertas exclusivas para novos clientes.</p>',
        style: {
          color: '#555555',
          fontSize: 16,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: { top: 5, bottom: 15, left: 30, right: 30 },
        },
      },
    },
    bv_4: {
      id: 'bv_4',
      type: 'button',
      data: {
        text: 'Conhecer a loja',
        href: '{{organization.url}}',
        style: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 12, bottom: 12, left: 32, right: 32 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    bv_5: {
      id: 'bv_5',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

const carrinhoAbandonado: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['ca_1', 'ca_2', 'ca_3', 'ca_4', 'ca_5', 'ca_6'],
      preheaderText: 'Você esqueceu algo no carrinho! Finalize sua compra.',
      subject: '{{contact.first_name}}, você esqueceu algo no carrinho!',
      width: 600,
    },
  },
  blocks: {
    ca_1: {
      id: 'ca_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    ca_2: {
      id: 'ca_2',
      type: 'heading',
      data: {
        text: 'Você esqueceu algo!',
        level: 1,
        style: {
          color: '#333333',
          fontSize: 26,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 5, left: 20, right: 20 },
        },
      },
    },
    ca_3: {
      id: 'ca_3',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">Olá, {{contact.first_name}}! Notamos que você deixou itens no seu carrinho. Que tal finalizar a compra?</p>',
        style: {
          color: '#555555',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: { top: 5, bottom: 10, left: 30, right: 30 },
        },
      },
    },
    ca_4: {
      id: 'ca_4',
      type: 'abandoned-cart',
      data: {
        showImage: true,
        showTitle: true,
        showPrice: true,
        showButton: true,
        buttonText: 'Finalizar compra',
        buttonStyle: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 14,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 10, bottom: 10, left: 20, right: 20 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    ca_5: {
      id: 'ca_5',
      type: 'button',
      data: {
        text: 'Finalizar compra',
        href: '{{event.checkout_url}}',
        style: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 14, bottom: 14, left: 40, right: 40 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    ca_6: {
      id: 'ca_6',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

const confirmacaoPedido: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['cp_1', 'cp_2', 'cp_3', 'cp_4', 'cp_5', 'cp_6'],
      preheaderText: 'Seu pedido foi confirmado! Confira os detalhes.',
      subject: 'Pedido #{{event.order_number}} confirmado!',
      width: 600,
    },
  },
  blocks: {
    cp_1: {
      id: 'cp_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    cp_2: {
      id: 'cp_2',
      type: 'heading',
      data: {
        text: 'Pedido confirmado!',
        level: 1,
        style: {
          color: '#27AE60',
          fontSize: 28,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 5, left: 20, right: 20 },
        },
      },
    },
    cp_3: {
      id: 'cp_3',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">Olá, {{contact.first_name}}! Recebemos seu pedido <strong>#{{event.order_number}}</strong> no valor de <strong>{{event.total_price}}</strong>.</p>',
        style: {
          color: '#555555',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: { top: 5, bottom: 10, left: 30, right: 30 },
        },
      },
    },
    cp_4: {
      id: 'cp_4',
      type: 'divider',
      data: {
        style: {
          color: '#EEEEEE',
          width: '100%',
          thickness: 1,
          padding: { top: 10, bottom: 10 },
        },
      },
    },
    cp_5: {
      id: 'cp_5',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">Você receberá atualizações sobre o envio do seu pedido em breve. Obrigado pela compra!</p>',
        style: {
          color: '#777777',
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.5,
          padding: { top: 5, bottom: 15, left: 30, right: 30 },
        },
      },
    },
    cp_6: {
      id: 'cp_6',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

const posCompra: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['pc_1', 'pc_2', 'pc_3', 'pc_4', 'pc_5', 'pc_6'],
      preheaderText: 'Obrigado pela sua compra! Veja nossas recomendações.',
      subject: 'Obrigado pela compra, {{contact.first_name}}!',
      width: 600,
    },
  },
  blocks: {
    pc_1: {
      id: 'pc_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    pc_2: {
      id: 'pc_2',
      type: 'heading',
      data: {
        text: 'Obrigado pela sua compra!',
        level: 1,
        style: {
          color: '#333333',
          fontSize: 26,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 5, left: 20, right: 20 },
        },
      },
    },
    pc_3: {
      id: 'pc_3',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">{{contact.first_name}}, esperamos que você adore seus novos produtos! Enquanto isso, confira mais novidades da nossa loja.</p>',
        style: {
          color: '#555555',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: { top: 5, bottom: 15, left: 30, right: 30 },
        },
      },
    },
    pc_4: {
      id: 'pc_4',
      type: 'heading',
      data: {
        text: 'Você também pode gostar',
        level: 2,
        style: {
          color: '#333333',
          fontSize: 20,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 10, left: 20, right: 20 },
        },
      },
    },
    pc_5: {
      id: 'pc_5',
      type: 'product-grid',
      data: {
        showImage: true,
        showTitle: true,
        showPrice: true,
        showButton: true,
        buttonText: 'Ver produto',
        buttonStyle: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 14,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 10, bottom: 10, left: 20, right: 20 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    pc_6: {
      id: 'pc_6',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

const newsletter: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F0F0F0',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['nl_1', 'nl_2', 'nl_3', 'nl_4', 'nl_5', 'nl_6'],
      preheaderText: 'As últimas novidades da semana para você.',
      subject: 'Newsletter semanal - {{organization.name}}',
      width: 600,
    },
  },
  blocks: {
    nl_1: {
      id: 'nl_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    nl_2: {
      id: 'nl_2',
      type: 'heading',
      data: {
        text: 'Novidades da semana',
        level: 1,
        style: {
          color: '#333333',
          fontSize: 28,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 10, left: 20, right: 20 },
        },
      },
    },
    nl_3: {
      id: 'nl_3',
      type: 'text',
      data: {
        html: '<p>Olá, {{contact.first_name}}! Confira as últimas novidades e conteúdos que separamos especialmente para você esta semana.</p>',
        style: {
          color: '#555555',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'left',
          lineHeight: 1.6,
          padding: { top: 5, bottom: 10, left: 20, right: 20 },
        },
      },
    },
    nl_4: {
      id: 'nl_4',
      type: 'columns',
      data: {
        layout: '50-50',
        columns: [
          { width: '50%', childrenIds: [], padding: { top: 0, bottom: 0, left: 10, right: 10 } },
          { width: '50%', childrenIds: [], padding: { top: 0, bottom: 0, left: 10, right: 10 } },
        ],
        mobileStack: true,
        gap: 10,
      },
    },
    nl_5: {
      id: 'nl_5',
      type: 'social-links',
      data: {
        networks: [
          { type: 'instagram', url: '#' },
          { type: 'facebook', url: '#' },
          { type: 'twitter', url: '#' },
        ],
        iconSize: 32,
        alignment: 'center',
      },
    },
    nl_6: {
      id: 'nl_6',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

const promocao: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#1A1A2E',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['pm_1', 'pm_2', 'pm_3', 'pm_4', 'pm_5', 'pm_6', 'pm_7', 'pm_8'],
      preheaderText: 'Promoção imperdível! Descontos de até 50%.',
      subject: 'Promoção exclusiva para você, {{contact.first_name}}!',
      width: 600,
    },
  },
  blocks: {
    pm_1: {
      id: 'pm_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    pm_2: {
      id: 'pm_2',
      type: 'heading',
      data: {
        text: 'Promoção Imperdível!',
        level: 1,
        style: {
          color: '#F26B2A',
          fontSize: 32,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 5, left: 20, right: 20 },
        },
      },
    },
    pm_3: {
      id: 'pm_3',
      type: 'countdown',
      data: {
        endDate: '',
        style: 'dark',
        labels: { days: 'dias', hours: 'horas', minutes: 'minutos', seconds: 'segundos' },
        expiredText: 'Promoção encerrada!',
        backgroundColor: '#1a1a2e',
        numberColor: '#FFFFFF',
        labelColor: '#cccccc',
        padding: { top: 15, bottom: 15, left: 20, right: 20 },
      },
    },
    pm_4: {
      id: 'pm_4',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">{{contact.first_name}}, preparamos descontos incríveis para você! Use o cupom abaixo e aproveite.</p>',
        style: {
          color: '#555555',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: { top: 10, bottom: 10, left: 30, right: 30 },
        },
      },
    },
    pm_5: {
      id: 'pm_5',
      type: 'coupon',
      data: {
        type: 'static',
        staticCode: 'PROMO50',
        headerText: 'Use o cupom:',
        style: {
          backgroundColor: '#FFF8F0',
          textColor: '#333333',
          fontSize: 22,
          borderStyle: 'dashed',
          borderColor: '#F26B2A',
          borderRadius: 8,
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
      },
    },
    pm_6: {
      id: 'pm_6',
      type: 'product-grid',
      data: {
        showImage: true,
        showTitle: true,
        showPrice: true,
        showButton: true,
        buttonText: 'Comprar com desconto',
        buttonStyle: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 14,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 10, bottom: 10, left: 20, right: 20 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    pm_7: {
      id: 'pm_7',
      type: 'button',
      data: {
        text: 'Ver todos os produtos',
        href: '{{organization.url}}',
        style: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 14, bottom: 14, left: 40, right: 40 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    pm_8: {
      id: 'pm_8',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

const reativacao: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['rt_1', 'rt_2', 'rt_3', 'rt_4', 'rt_5', 'rt_6'],
      preheaderText: 'Sentimos sua falta! Temos uma oferta especial.',
      subject: 'Sentimos sua falta, {{contact.first_name}}!',
      width: 600,
    },
  },
  blocks: {
    rt_1: {
      id: 'rt_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    rt_2: {
      id: 'rt_2',
      type: 'heading',
      data: {
        text: 'Sentimos sua falta!',
        level: 1,
        style: {
          color: '#333333',
          fontSize: 28,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 5, left: 20, right: 20 },
        },
      },
    },
    rt_3: {
      id: 'rt_3',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">Olá, {{contact.first_name}}! Faz um tempo que não nos visitamos. Preparamos uma oferta especial para você voltar:</p>',
        style: {
          color: '#555555',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: { top: 5, bottom: 10, left: 30, right: 30 },
        },
      },
    },
    rt_4: {
      id: 'rt_4',
      type: 'coupon',
      data: {
        type: 'static',
        staticCode: 'VOLTEI15',
        headerText: 'Desconto exclusivo para você:',
        style: {
          backgroundColor: '#FFF8F0',
          textColor: '#333333',
          fontSize: 22,
          borderStyle: 'dashed',
          borderColor: '#F26B2A',
          borderRadius: 8,
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
      },
    },
    rt_5: {
      id: 'rt_5',
      type: 'button',
      data: {
        text: 'Aproveitar oferta',
        href: '{{organization.url}}',
        style: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 14, bottom: 14, left: 40, right: 40 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    rt_6: {
      id: 'rt_6',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

const lancamentoProduto: EmailTemplate = {
  root: {
    type: 'EmailLayout',
    data: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      childrenIds: ['lp_1', 'lp_2', 'lp_3', 'lp_4', 'lp_5', 'lp_6'],
      preheaderText: 'Novidade fresquinha! Conheça nosso novo produto.',
      subject: 'Acabou de chegar! Novidade para você, {{contact.first_name}}',
      width: 600,
    },
  },
  blocks: {
    lp_1: {
      id: 'lp_1',
      type: 'image',
      data: {
        url: '',
        alt: 'Logo',
        width: 150,
        alignment: 'center',
        borderRadius: 0,
        padding: { top: 20, bottom: 10, left: 20, right: 20 },
      },
    },
    lp_2: {
      id: 'lp_2',
      type: 'heading',
      data: {
        text: 'Acabou de chegar!',
        level: 1,
        style: {
          color: '#F26B2A',
          fontSize: 30,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: { top: 10, bottom: 5, left: 20, right: 20 },
        },
      },
    },
    lp_3: {
      id: 'lp_3',
      type: 'image',
      data: {
        url: '',
        alt: 'Novo produto',
        width: 500,
        alignment: 'center',
        borderRadius: 8,
        padding: { top: 10, bottom: 10, left: 40, right: 40 },
      },
    },
    lp_4: {
      id: 'lp_4',
      type: 'text',
      data: {
        html: '<p style="text-align:center;">{{contact.first_name}}, apresentamos nosso mais novo lançamento! Desenvolvido com carinho e pensado especialmente para você.</p>',
        style: {
          color: '#555555',
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
          padding: { top: 5, bottom: 15, left: 30, right: 30 },
        },
      },
    },
    lp_5: {
      id: 'lp_5',
      type: 'button',
      data: {
        text: 'Quero conhecer',
        href: '{{organization.url}}',
        style: {
          backgroundColor: '#F26B2A',
          textColor: '#FFFFFF',
          fontSize: 16,
          fontWeight: 'bold',
          borderRadius: 4,
          padding: { top: 14, bottom: 14, left: 40, right: 40 },
          width: 'auto',
          alignment: 'center',
        },
      },
    },
    lp_6: {
      id: 'lp_6',
      type: 'footer',
      data: {
        companyName: '{{organization.name}}',
        address: '',
        showUnsubscribe: true,
        textColor: '#999999',
        linkColor: '#F26B2A',
        fontSize: 12,
        alignment: 'center',
      },
    },
  },
};

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    id: 'tpl-boas-vindas',
    name: 'Boas-vindas',
    category: 'Onboarding',
    description: 'E-mail de boas-vindas com logo, saudação e CTA para conhecer a loja.',
    template: boasVindas,
  },
  {
    id: 'tpl-carrinho-abandonado',
    name: 'Carrinho Abandonado',
    category: 'E-commerce',
    description: 'Recuperação de carrinho abandonado com itens e botão para checkout.',
    template: carrinhoAbandonado,
  },
  {
    id: 'tpl-confirmacao-pedido',
    name: 'Confirmação de Pedido',
    category: 'Transacional',
    description: 'Confirmação de pedido com detalhes do número e valor.',
    template: confirmacaoPedido,
  },
  {
    id: 'tpl-pos-compra',
    name: 'Pós-compra',
    category: 'E-commerce',
    description: 'Agradecimento pós-compra com recomendações de produtos.',
    template: posCompra,
  },
  {
    id: 'tpl-newsletter',
    name: 'Newsletter',
    category: 'Conteúdo',
    description: 'Newsletter limpa com cabeçalho, conteúdo em 2 colunas e rodapé.',
    template: newsletter,
  },
  {
    id: 'tpl-promocao',
    name: 'Promoção',
    category: 'Marketing',
    description: 'E-mail promocional com contagem regressiva, cupom e grid de produtos.',
    template: promocao,
  },
  {
    id: 'tpl-reativacao',
    name: 'Reativação',
    category: 'Marketing',
    description: 'E-mail de reativação (win-back) com oferta especial.',
    template: reativacao,
  },
  {
    id: 'tpl-lancamento-produto',
    name: 'Lançamento de Produto',
    category: 'Marketing',
    description: 'Anúncio de novo produto com imagem destaque e CTA.',
    template: lancamentoProduto,
  },
];

// Suppress unused makeId warning
void makeId;
