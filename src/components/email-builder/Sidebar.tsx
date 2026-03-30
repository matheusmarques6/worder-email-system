'use client';

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
  PanelTop,
  PanelBottom,
  Share2,
} from 'lucide-react';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import type { BlockType } from '@/lib/email-builder/types';
import type { LucideIcon } from 'lucide-react';

interface BlockConfig {
  type: BlockType;
  label: string;
  icon: LucideIcon;
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
      { type: 'coupon', label: 'Cupom', icon: Ticket },
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

export function Sidebar() {
  const addBlock = useEmailBuilderStore((s) => s.addBlock);

  function handleDragStart(e: React.DragEvent, type: BlockType) {
    e.dataTransfer.setData('block-type', type);
    e.dataTransfer.effectAllowed = 'copy';
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
    </div>
  );
}
