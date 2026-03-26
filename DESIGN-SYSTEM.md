# DESIGN-SYSTEM.md — Convertfy Mail

## Paleta de Cores (BRANCO + CINZA + LARANJA)
Inspirado no Klaviyo (neutro profissional) + Omnisend (clean e-commerce). Toque de energia com laranja.

### CSS Variables
```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --bg-tertiary: #F1F3F5;
  --bg-sidebar: #1A1D21;
  --bg-sidebar-hover: #2C3035;
  --bg-sidebar-active: #35393E;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --text-on-dark: #E5E7EB;
  --orange-500: #F97316;   /* COR PRIMÁRIA */
  --orange-600: #EA580C;   /* Hover */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  --border-light: #E5E7EB;
  --border-focus: #F97316;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --radius-md: 8px;
}
```

### Tailwind Config
```typescript
theme: {
  extend: {
    colors: {
      brand: {
        50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
        400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
        800: '#9A3412', 900: '#7C2D12',
      },
      sidebar: { DEFAULT: '#1A1D21', hover: '#2C3035', active: '#35393E' },
    },
    fontFamily: {
      sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
    },
  },
}
```

## Tipografia
| Elemento | Size | Weight | Color |
|----------|------|--------|-------|
| H1 página | 24px text-2xl | 600 semibold | text-gray-900 |
| H2 subtítulo | 18px text-lg | 600 semibold | text-gray-900 |
| H3 label seção | 14px text-sm | 500 medium | text-gray-500 uppercase tracking-wider |
| Body | 14px text-sm | 400 regular | text-gray-700 |
| Small/caption | 12px text-xs | 400 regular | text-gray-500 |
| Metric number | 28px text-3xl | 700 bold | text-gray-900 |

Fonte: **DM Sans** via `next/font/google` com weights 400, 500, 600, 700.

## Layout Principal
```
┌──────────────────────────────────────────────────────┐
│ SIDEBAR (240px, bg-[#1A1D21])  │  CONTEÚDO           │
│                                │  ┌────────────────┐ │
│ Logo "Convertfy Mail"          │  │ Header/Breadcrumb│ │
│ ─────────────────              │  ├────────────────┤ │
│ 📊 Dashboard                   │  │                │ │
│ 📧 Campanhas                   │  │  CONTEÚDO      │ │
│ ⚡ Automações                   │  │  max-w-7xl     │ │
│ ✉️ Templates                    │  │  mx-auto       │ │
│ 👥 Audiência ▾                  │  │  px-6 py-6     │ │
│    Perfis                      │  │                │ │
│    Segmentos                   │  │  bg-white ou   │ │
│    Listas                      │  │  bg-gray-50    │ │
│ 📈 Analytics                   │  │                │ │
│ ─────────────────              │  │                │ │
│ ⚙️ Configurações ▾             │  └────────────────┘ │
│    Integrações                 │                      │
│    Email                       │                      │
│    WhatsApp                    │                      │
└──────────────────────────────────────────────────────┘
```

- Sidebar: item ativo = bg-sidebar-active + border-left 3px laranja + text-white
- Items inativos: text-gray-400, hover:text-gray-200 hover:bg-sidebar-hover
- Ícones: lucide-react 18px, mr-3
- Submenus: indent ml-8, text-sm
- Separadores: border-t border-gray-700/50 my-2

## Componentes Padrão

### Metric Cards
```
┌──────────────────────────┐
│ 📧 Emails Enviados       │  ← ícone 20px + label text-sm text-gray-500
│                          │
│ 12.458                   │  ← text-3xl font-bold text-gray-900
│ ↑ 12.5% vs anterior     │  ← text-xs text-emerald-600 (ou text-red-500)
└──────────────────────────┘
```
Classes: bg-white border border-gray-200 rounded-lg p-6 shadow-sm

### Status Badges
| Status | Classes Tailwind |
|--------|-----------------|
| Live / Sent / Verified | `bg-emerald-50 text-emerald-700 border border-emerald-200` |
| Draft / Pending | `bg-gray-100 text-gray-600 border border-gray-200` |
| Scheduled / Manual | `bg-amber-50 text-amber-700 border border-amber-200` |
| Failed / Bounced | `bg-red-50 text-red-700 border border-red-200` |
| Sending / Active | `bg-orange-50 text-orange-700 border border-orange-200` |

Formato: rounded-full px-2.5 py-0.5 text-xs font-medium

### Botões
| Tipo | Classes |
|------|---------|
| Primary | `bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm` |
| Secondary | `bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium rounded-lg px-4 py-2 text-sm` |
| Ghost | `hover:bg-gray-100 text-gray-600 font-medium rounded-lg px-4 py-2 text-sm` |
| Destructive | `bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-4 py-2 text-sm` |

### Tabelas
- Header: `bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider`
- Row: `border-b border-gray-100 hover:bg-gray-50`
- Cell: `px-6 py-4 text-sm text-gray-900`
- Paginação simples: Anterior / Próximo no rodapé

### Empty States
Quando tabela/lista vazia:
```
┌─────────────────────────────────────┐
│                                     │
│         📧 (ícone 48px cinza)       │
│                                     │
│   Você ainda não criou campanhas    │  ← text-lg text-gray-600
│   Envie seu primeiro email agora    │  ← text-sm text-gray-400
│                                     │
│      [ Criar Campanha ]             │  ← botão primary (laranja)
│                                     │
└─────────────────────────────────────┘
```

### Formulários
- Labels: text-sm font-medium text-gray-700 mb-1.5
- Inputs: border-gray-300 focus:border-brand-500 focus:ring-brand-500 rounded-md
- Erro: border-red-500 + text-sm text-red-600 abaixo
- Hint: text-xs text-gray-400 abaixo do input
- Espaçamento entre campos: space-y-4

### Modais/Dialogs
- Overlay: bg-black/50
- Dialog: bg-white rounded-xl shadow-lg max-w-lg p-6
- Título: text-lg font-semibold text-gray-900
- Botões no footer: flex justify-end gap-3

## Fluxos de UX

### Onboarding (primeiro acesso)
Register → Wizard 3 steps: 1.Nome loja → 2.Conectar Shopify → 3.Config domínio → Dashboard

### Campanha
/campaigns → lista → /campaigns/new (wizard 4 steps) → /campaigns/[id] (relatório)

### Automação
/flows → lista → /flows/new (nome+trigger ou template) → /flows/[id] (canvas fullscreen)

### Segmento
/audience/segments → lista → /audience/segments/new (builder visual) → preview

## 🚫 15 ERROS QUE AI COMETE NO FRONTEND

### 1. ROXO/VIOLETA COMO COR PRIMÁRIA
O Claude adora usar o tema default do shadcn (roxo). PROIBIDO. Nossa cor é LARANJA #F97316.

### 2. CARDS COM BACKGROUND COLORIDO
NÃO criar cards azuis, verdes, roxos. Cards são SEMPRE bg-white com border-gray-200.

### 3. SOMBRAS EXAGERADAS
NÃO usar shadow-lg ou shadow-xl em cards. SEMPRE shadow-sm. Sem drama visual.

### 4. BORDER-RADIUS GIGANTE
NÃO usar rounded-2xl ou rounded-3xl. SEMPRE rounded-lg (8px) para cards e botões, rounded-md para inputs.

### 5. TIPOGRAFIA INCONSISTENTE
Seguir a tabela acima EXATAMENTE. Não inventar tamanhos. H1=24px, Body=14px, sempre.

### 6. PADDING/SPACING ALEATÓRIO
Cards: SEMPRE p-6. Container: SEMPRE px-6 py-6. Gap entre seções: gap-6. Gap entre items: gap-4.

### 7. MÚLTIPLOS BOTÕES PRIMARY
UMA ação principal por tela (laranja). Resto é secondary (branco/borda) ou ghost.

### 8. EMPTY STATE INEXISTENTE
NUNCA deixar tabela vazia sem orientação. Sempre: ícone + texto + botão CTA.

### 9. SEM LOADING STATE
NUNCA página branca durante load. SEMPRE Skeleton components do shadcn.

### 10. SIDEBAR SEM INDICAÇÃO DE ATIVO
Item ativo DEVE ter: bg-sidebar-active + text-white + border-left laranja 3px.

### 11. TEXTOS PLACEHOLDER/LOREM IPSUM
TODO texto em Português BR e contextual. "Criar campanha", não "Create campaign" ou "Click here".

### 12. ÍCONES INCONSISTENTES
SOMENTE lucide-react. Tamanho padrão 18px. Em cards de métrica 20px. Em botões 16px.

### 13. RESPONSIVO QUEBRADO
Sidebar collapse em mobile. Tabelas com scroll horizontal. Cards stack vertical. TESTAR 375px.

### 14. EXCESSO DE INFORMAÇÃO
Max 5-6 cards. Max 5-7 colunas em tabela. Mostrar resumo → drill-down nos detalhes.

### 15. NAVEGAÇÃO CONFUSA
SEMPRE breadcrumb. SEMPRE botão voltar em páginas de detalhe. URLs semânticas.

## Referências visuais
- **Klaviyo**: sidebar escura, metric cards em row, flow builder canvas, wizard step-by-step
- **Omnisend**: editor com library à esquerda, templates em grid, empty states educativos, forms limpos
