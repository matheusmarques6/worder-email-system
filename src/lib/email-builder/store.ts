import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  BlockType,
  BlockBase,
  EmailTemplate,
  TextBlockData,
  ImageBlockData,
  ButtonBlockData,
  DividerBlockData,
  SpacerBlockData,
  HeadingBlockData,
  ColumnsBlockData,
  ProductBlockData,
  CouponBlockData,
  FooterBlockData,
  SocialLinksBlockData,
  HtmlBlockData,
  CountdownBlockData,
  VideoBlockData,
  ProductGridBlockData,
  AbandonedCartBlockData,
  HeaderBlockData,
} from './types';

type BlockDataMap = {
  text: TextBlockData;
  image: ImageBlockData;
  button: ButtonBlockData;
  divider: DividerBlockData;
  spacer: SpacerBlockData;
  heading: HeadingBlockData;
  columns: ColumnsBlockData;
  html: HtmlBlockData;
  header: HeaderBlockData;
  footer: FooterBlockData;
  'social-links': SocialLinksBlockData;
  product: ProductBlockData;
  'product-grid': ProductGridBlockData;
  'abandoned-cart': AbandonedCartBlockData;
  coupon: CouponBlockData;
  countdown: CountdownBlockData;
  video: VideoBlockData;
};

export function getDefaultBlockData(type: BlockType): BlockDataMap[BlockType] {
  const defaults: BlockDataMap = {
    text: {
      html: '<p>Digite seu texto aqui...</p>',
      style: {
        color: '#333333',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        textAlign: 'left',
        lineHeight: 1.5,
        padding: { top: 10, bottom: 10, left: 20, right: 20 },
      },
    },
    image: {
      url: '',
      alt: 'Imagem',
      width: 600,
      alignment: 'center',
      borderRadius: 0,
      padding: { top: 10, bottom: 10, left: 20, right: 20 },
    },
    button: {
      text: 'Clique aqui',
      href: '#',
      style: {
        backgroundColor: '#F26B2A',
        textColor: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        borderRadius: 4,
        padding: { top: 12, bottom: 12, left: 24, right: 24 },
        width: 'auto',
        alignment: 'center',
      },
    },
    divider: {
      style: {
        color: '#DDDDDD',
        width: '100%',
        thickness: 1,
        padding: { top: 10, bottom: 10 },
      },
    },
    spacer: {
      height: 20,
    },
    heading: {
      text: 'Seu Título Aqui',
      level: 1,
      style: {
        color: '#333333',
        fontSize: 28,
        fontFamily: 'Arial, sans-serif',
        textAlign: 'left',
        padding: { top: 10, bottom: 10, left: 20, right: 20 },
      },
    },
    columns: {
      layout: '50-50',
      columns: [
        { width: '50%', childrenIds: [], padding: { top: 0, bottom: 0, left: 10, right: 10 } },
        { width: '50%', childrenIds: [], padding: { top: 0, bottom: 0, left: 10, right: 10 } },
      ],
      mobileStack: true,
      gap: 10,
    },
    html: {
      html: '<!-- Seu HTML aqui -->',
    },
    header: {
      logoUrl: '',
      logoWidth: 150,
      logoLinkHref: '#',
      links: [],
      layout: 'logo-left',
      backgroundColor: '#FFFFFF',
      linkColor: '#333333',
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
    },
    footer: {
      companyName: 'Sua Empresa',
      address: 'Rua Exemplo, 123 - São Paulo, SP',
      showUnsubscribe: true,
      textColor: '#999999',
      linkColor: '#F26B2A',
      fontSize: 12,
      alignment: 'center',
    },
    'social-links': {
      networks: [
        { type: 'instagram', url: '#' },
        { type: 'facebook', url: '#' },
      ],
      iconSize: 32,
      alignment: 'center',
    },
    product: {
      showImage: true,
      showTitle: true,
      showPrice: true,
      showButton: true,
      buttonText: 'Comprar agora',
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
    'product-grid': {
      products: [],
      columns: 2,
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
    'abandoned-cart': {
      showImage: true,
      showTitle: true,
      showPrice: true,
      showQuantity: true,
      buttonText: 'Finalizar compra',
      buttonHref: '{{event.checkout_url}}',
      buttonStyle: { backgroundColor: '#F26B2A', textColor: '#FFFFFF', borderRadius: 4 },
      maxItems: 10,
    },
    coupon: {
      type: 'static',
      staticCode: 'DESCONTO10',
      headerText: 'Seu cupom de desconto',
      style: {
        backgroundColor: '#FFF8F0',
        textColor: '#333333',
        fontSize: 20,
        borderStyle: 'dashed',
        borderColor: '#F26B2A',
        borderRadius: 8,
        padding: { top: 16, bottom: 16, left: 24, right: 24 },
      },
    },
    countdown: {
      endDate: '',
      style: 'dark',
      labels: { days: 'dias', hours: 'horas', minutes: 'minutos', seconds: 'segundos' },
      expiredText: 'Oferta expirada!',
      backgroundColor: '#1a1a2e',
      numberColor: '#FFFFFF',
      labelColor: '#cccccc',
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
    },
    video: {
      videoUrl: '',
      thumbnailUrl: '',
      alt: 'Video',
      width: 600,
      padding: { top: 10, bottom: 10, left: 20, right: 20 },
    },
  };

  return defaults[type];
}

export function createEmptyTemplate(): EmailTemplate {
  return {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: '#F5F5F5',
        canvasColor: '#FFFFFF',
        textColor: '#333333',
        fontFamily: 'Arial, sans-serif',
        childrenIds: [],
        preheaderText: '',
        subject: '',
        width: 600,
      },
    },
    blocks: {},
  };
}

interface EditorActions {
  setTemplate: (template: EmailTemplate) => void;
  selectBlock: (id: string | null) => void;
  hoverBlock: (id: string | null) => void;
  addBlock: (type: BlockType, afterBlockId?: string) => string;
  updateBlock: (id: string, data: Record<string, unknown>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, newIndex: number) => void;
  duplicateBlock: (id: string) => void;
  addBlockToColumn: (columnBlockId: string, columnIndex: number, blockType: BlockType) => string;
  removeBlockFromColumn: (columnBlockId: string, columnIndex: number, childBlockId: string) => void;
  undo: () => void;
  redo: () => void;
  setPreviewMode: (mode: 'edit' | 'desktop' | 'mobile' | 'dark') => void;
  setDirty: (dirty: boolean) => void;
  setDragging: (dragging: boolean) => void;
}

interface EditorStore {
  template: EmailTemplate;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  isDragging: boolean;
  previewMode: 'edit' | 'desktop' | 'mobile' | 'dark';
  history: EmailTemplate[];
  historyIndex: number;
  isDirty: boolean;
}

function pushHistory(state: EditorStore): Pick<EditorStore, 'history' | 'historyIndex'> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.template)));
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

export const useEmailBuilderStore = create<EditorStore & EditorActions>((set, get) => ({
  template: createEmptyTemplate(),
  selectedBlockId: null,
  hoveredBlockId: null,
  isDragging: false,
  previewMode: 'edit',
  history: [createEmptyTemplate()],
  historyIndex: 0,
  isDirty: false,

  setTemplate: (template) => {
    set({
      template,
      history: [JSON.parse(JSON.stringify(template))],
      historyIndex: 0,
      isDirty: false,
      selectedBlockId: null,
    });
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  hoverBlock: (id) => set({ hoveredBlockId: id }),

  setDragging: (dragging) => set({ isDragging: dragging }),

  addBlock: (type, afterBlockId?) => {
    const id = nanoid();
    const data = getDefaultBlockData(type) as unknown as Record<string, unknown>;
    const state = get();

    const newBlock: BlockBase = { id, type, data };
    const childrenIds = [...state.template.root.data.childrenIds];

    if (afterBlockId) {
      const idx = childrenIds.indexOf(afterBlockId);
      if (idx >= 0) {
        childrenIds.splice(idx + 1, 0, id);
      } else {
        childrenIds.push(id);
      }
    } else {
      childrenIds.push(id);
    }

    const newTemplate: EmailTemplate = {
      ...state.template,
      root: {
        ...state.template.root,
        data: { ...state.template.root.data, childrenIds },
      },
      blocks: { ...state.template.blocks, [id]: newBlock },
    };

    const historyUpdate = pushHistory({ ...state, template: newTemplate });

    set({
      template: newTemplate,
      selectedBlockId: id,
      isDirty: true,
      ...historyUpdate,
    });

    return id;
  },

  updateBlock: (id, data) => {
    const state = get();
    const block = state.template.blocks[id];
    if (!block) return;

    const newTemplate: EmailTemplate = {
      ...state.template,
      blocks: {
        ...state.template.blocks,
        [id]: { ...block, data: { ...block.data, ...data } },
      },
    };

    const historyUpdate = pushHistory({ ...state, template: newTemplate });

    set({
      template: newTemplate,
      isDirty: true,
      ...historyUpdate,
    });
  },

  removeBlock: (id) => {
    const state = get();
    const childrenIds = state.template.root.data.childrenIds.filter((cid) => cid !== id);
    const newBlocks = { ...state.template.blocks };
    delete newBlocks[id];

    const newTemplate: EmailTemplate = {
      ...state.template,
      root: {
        ...state.template.root,
        data: { ...state.template.root.data, childrenIds },
      },
      blocks: newBlocks,
    };

    const historyUpdate = pushHistory({ ...state, template: newTemplate });

    set({
      template: newTemplate,
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      isDirty: true,
      ...historyUpdate,
    });
  },

  moveBlock: (id, newIndex) => {
    const state = get();
    const childrenIds = [...state.template.root.data.childrenIds];
    const oldIndex = childrenIds.indexOf(id);
    if (oldIndex < 0) return;

    childrenIds.splice(oldIndex, 1);
    childrenIds.splice(newIndex, 0, id);

    const newTemplate: EmailTemplate = {
      ...state.template,
      root: {
        ...state.template.root,
        data: { ...state.template.root.data, childrenIds },
      },
    };

    const historyUpdate = pushHistory({ ...state, template: newTemplate });

    set({
      template: newTemplate,
      isDirty: true,
      ...historyUpdate,
    });
  },

  duplicateBlock: (id) => {
    const state = get();
    const block = state.template.blocks[id];
    if (!block) return;

    const newId = nanoid();
    const newBlock: BlockBase = {
      ...block,
      id: newId,
      data: JSON.parse(JSON.stringify(block.data)),
    };

    const childrenIds = [...state.template.root.data.childrenIds];
    const idx = childrenIds.indexOf(id);
    if (idx >= 0) {
      childrenIds.splice(idx + 1, 0, newId);
    } else {
      childrenIds.push(newId);
    }

    const newTemplate: EmailTemplate = {
      ...state.template,
      root: {
        ...state.template.root,
        data: { ...state.template.root.data, childrenIds },
      },
      blocks: { ...state.template.blocks, [newId]: newBlock },
    };

    const historyUpdate = pushHistory({ ...state, template: newTemplate });

    set({
      template: newTemplate,
      selectedBlockId: newId,
      isDirty: true,
      ...historyUpdate,
    });
  },

  addBlockToColumn: (columnBlockId, columnIndex, blockType) => {
    const id = nanoid();
    const data = getDefaultBlockData(blockType) as unknown as Record<string, unknown>;
    const state = get();
    const columnBlock = state.template.blocks[columnBlockId];
    if (!columnBlock) return id;

    const columns = (columnBlock.data.columns ?? []) as Array<{
      width: string;
      childrenIds: string[];
      padding: { top: number; bottom: number; left: number; right: number };
    }>;
    if (columnIndex < 0 || columnIndex >= columns.length) return id;

    const newColumns = columns.map((col, i) => {
      if (i === columnIndex) {
        return { ...col, childrenIds: [...col.childrenIds, id] };
      }
      return col;
    });

    const newBlock: BlockBase = { id, type: blockType, data };

    const newTemplate: EmailTemplate = {
      ...state.template,
      blocks: {
        ...state.template.blocks,
        [id]: newBlock,
        [columnBlockId]: {
          ...columnBlock,
          data: { ...columnBlock.data, columns: newColumns },
        },
      },
    };

    const historyUpdate = pushHistory({ ...state, template: newTemplate });

    set({
      template: newTemplate,
      selectedBlockId: id,
      isDirty: true,
      ...historyUpdate,
    });

    return id;
  },

  removeBlockFromColumn: (columnBlockId, columnIndex, childBlockId) => {
    const state = get();
    const columnBlock = state.template.blocks[columnBlockId];
    if (!columnBlock) return;

    const columns = (columnBlock.data.columns ?? []) as Array<{
      width: string;
      childrenIds: string[];
      padding: { top: number; bottom: number; left: number; right: number };
    }>;
    if (columnIndex < 0 || columnIndex >= columns.length) return;

    const newColumns = columns.map((col, i) => {
      if (i === columnIndex) {
        return { ...col, childrenIds: col.childrenIds.filter((cid) => cid !== childBlockId) };
      }
      return col;
    });

    const newBlocks = { ...state.template.blocks };
    delete newBlocks[childBlockId];
    newBlocks[columnBlockId] = {
      ...columnBlock,
      data: { ...columnBlock.data, columns: newColumns },
    };

    const newTemplate: EmailTemplate = {
      ...state.template,
      blocks: newBlocks,
    };

    const historyUpdate = pushHistory({ ...state, template: newTemplate });

    set({
      template: newTemplate,
      selectedBlockId: state.selectedBlockId === childBlockId ? null : state.selectedBlockId,
      isDirty: true,
      ...historyUpdate,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;

    const newIndex = state.historyIndex - 1;
    const template = JSON.parse(JSON.stringify(state.history[newIndex]));

    set({
      template,
      historyIndex: newIndex,
      isDirty: true,
      selectedBlockId: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    const template = JSON.parse(JSON.stringify(state.history[newIndex]));

    set({
      template,
      historyIndex: newIndex,
      isDirty: true,
      selectedBlockId: null,
    });
  },

  setPreviewMode: (mode) => set({ previewMode: mode }),

  setDirty: (dirty) => set({ isDirty: dirty }),
}));
