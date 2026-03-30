'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Type,
  Heading,
  ImageIcon,
  MousePointerClick,
  Code,
  Columns2,
  Minus,
  Space,
  ShoppingBag,
  LayoutGrid,
  Ticket,
  Timer,
  PanelTop,
  PanelBottom,
  Share2,
  Video,
  ShoppingCart,
  Bookmark,
  Loader2,
} from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import type { BlockType, BlockBase } from '@/lib/email-builder/types';
import type { LucideIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';

interface BlockConfig {
  type: BlockType;
  label: string;
  icon: LucideIcon;
}

interface SavedBlock {
  id: string;
  name: string;
  category: string;
  block_type: BlockType;
  block_data: Record<string, unknown>;
}

const blockGroups: { title: string; blocks: BlockConfig[] }[] = [
  {
    title: 'CONTEUDO',
    blocks: [
      { type: 'text', label: 'Texto', icon: Type },
      { type: 'heading', label: 'Titulo', icon: Heading },
      { type: 'image', label: 'Imagem', icon: ImageIcon },
      { type: 'button', label: 'Botao', icon: MousePointerClick },
      { type: 'html', label: 'HTML', icon: Code },
      { type: 'video', label: 'Video', icon: Video },
    ],
  },
  {
    title: 'LAYOUT',
    blocks: [
      { type: 'columns', label: 'Colunas', icon: Columns2 },
      { type: 'divider', label: 'Divisor', icon: Minus },
      { type: 'spacer', label: 'Espacador', icon: Space },
    ],
  },
  {
    title: 'E-COMMERCE',
    blocks: [
      { type: 'product', label: 'Produto', icon: ShoppingBag },
      { type: 'product-grid', label: 'Grid de Produtos', icon: LayoutGrid },
      { type: 'abandoned-cart', label: 'Carrinho Abandonado', icon: ShoppingCart },
      { type: 'coupon', label: 'Cupom', icon: Ticket },
      { type: 'countdown', label: 'Contagem Regressiva', icon: Timer },
    ],
  },
  {
    title: 'ESTRUTURA',
    blocks: [
      { type: 'header', label: 'Cabecalho', icon: PanelTop },
      { type: 'footer', label: 'Rodape', icon: PanelBottom },
      { type: 'social-links', label: 'Redes Sociais', icon: Share2 },
    ],
  },
];

interface SidebarProps {
  storeId?: string;
}

export function Sidebar({ storeId }: SidebarProps) {
  const addBlock = useEmailBuilderStore((s) => s.addBlock);
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const fetchSavedBlocks = useCallback(async () => {
    if (!storeId) return;
    setLoadingSaved(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('saved_blocks')
        .select('id, name, category, block_type, block_data')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (data) {
        setSavedBlocks(
          data.map((d: Record<string, unknown>) => ({
            id: String(d.id ?? ''),
            name: String(d.name ?? ''),
            category: String(d.category ?? 'outros'),
            block_type: d.block_type as BlockType,
            block_data: (d.block_data ?? {}) as Record<string, unknown>,
          }))
        );
      }
    } catch {
      setSavedBlocks([]);
    } finally {
      setLoadingSaved(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchSavedBlocks();
  }, [fetchSavedBlocks]);

  function handleDragStart(e: React.DragEvent, type: BlockType) {
    e.dataTransfer.setData('block-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  }

  function handleAddSavedBlock(saved: SavedBlock) {
    const id = nanoid();
    const block: BlockBase = {
      id,
      type: saved.block_type,
      data: JSON.parse(JSON.stringify(saved.block_data)),
    };

    const state = useEmailBuilderStore.getState();
    const childrenIds = [...state.template.root.data.childrenIds, id];
    const newTemplate = {
      ...state.template,
      root: {
        ...state.template.root,
        data: { ...state.template.root.data, childrenIds },
      },
      blocks: { ...state.template.blocks, [id]: block },
    };

    state.setTemplate(newTemplate);
    useEmailBuilderStore.getState().selectBlock(id);
  }

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-500 mb-4">Blocos</h2>
      {blockGroups.map((group) => (
        <div key={group.title} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
            {group.title}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {group.blocks.map((block) => {
              const Icon = block.icon;
              return (
                <button
                  key={block.type}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, block.type)}
                  onClick={() => addBlock(block.type)}
                  data-block-type={block.type}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:border-[#F26B2A] hover:bg-orange-50 transition-colors cursor-grab active:cursor-grabbing text-gray-600 hover:text-[#F26B2A]"
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{block.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
          SALVOS
        </h3>
        {loadingSaved ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        ) : savedBlocks.length === 0 ? (
          <div className="text-center py-4">
            <Bookmark size={20} className="mx-auto text-gray-300 mb-1" />
            <p className="text-[10px] text-gray-400">
              Nenhum bloco salvo. Use o ícone de marcador em um bloco para salvá-lo.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {savedBlocks.map((saved) => (
              <button
                key={saved.id}
                type="button"
                onClick={() => handleAddSavedBlock(saved)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#F26B2A] hover:bg-orange-50 transition-colors text-left"
              >
                <Bookmark size={14} className="text-[#F26B2A] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {saved.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {saved.block_type} - {saved.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
