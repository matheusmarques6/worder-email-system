'use client';

import { useEmailBuilderStore } from '@/lib/email-builder/store';
import type { BlockType } from '@/lib/email-builder/types';

function PaddingInputs({
  padding,
  onChange,
}: {
  padding: { top: number; bottom: number; left: number; right: number };
  onChange: (p: { top: number; bottom: number; left: number; right: number }) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="text-xs text-gray-500">
        Topo
        <input
          type="number"
          value={padding.top}
          onChange={(e) => onChange({ ...padding, top: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="text-xs text-gray-500">
        Base
        <input
          type="number"
          value={padding.bottom}
          onChange={(e) => onChange({ ...padding, bottom: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="text-xs text-gray-500">
        Esquerda
        <input
          type="number"
          value={padding.left}
          onChange={(e) => onChange({ ...padding, left: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="text-xs text-gray-500">
        Direita
        <input
          type="number"
          value={padding.right}
          onChange={(e) => onChange({ ...padding, right: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
    </div>
  );
}

function TextConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        Clique no bloco para editar o texto
      </div>
      <label className="block text-sm font-medium text-gray-700">
        Cor do texto
        <input
          type="color"
          value={(style.color as string) ?? '#333333'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, color: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Tamanho da fonte
        <input
          type="number"
          value={(style.fontSize as number) ?? 16}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, fontSize: Number(e.target.value) } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Alinhamento
        <select
          value={(style.textAlign as string) ?? 'left'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, textAlign: e.target.value } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Altura da linha
        <input
          type="number"
          step="0.1"
          value={(style.lineHeight as number) ?? 1.5}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, lineHeight: Number(e.target.value) } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor de fundo
        <input
          type="color"
          value={(style.backgroundColor as string) ?? '#ffffff'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, backgroundColor: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Espacamento</p>
        <PaddingInputs
          padding={padding}
          onChange={(p) => updateBlock(blockId, { style: { ...style, padding: p } })}
        />
      </div>
    </div>
  );
}

function ImageConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const padding = (data.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        URL da imagem
        <input
          type="url"
          value={(data.url as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { url: e.target.value })}
          placeholder="https://exemplo.com/imagem.png"
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Texto alternativo
        <input
          type="text"
          value={(data.alt as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { alt: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Link (opcional)
        <input
          type="url"
          value={(data.linkHref as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { linkHref: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Largura (px)
        <input
          type="number"
          value={(data.width as number) ?? 600}
          onChange={(e) => updateBlock(blockId, { width: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Alinhamento
        <select
          value={(data.alignment as string) ?? 'center'}
          onChange={(e) => updateBlock(blockId, { alignment: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Borda arredondada
        <input
          type="number"
          value={(data.borderRadius as number) ?? 0}
          onChange={(e) => updateBlock(blockId, { borderRadius: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Espacamento</p>
        <PaddingInputs
          padding={padding}
          onChange={(p) => updateBlock(blockId, { padding: p })}
        />
      </div>
    </div>
  );
}

function ButtonConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 12, bottom: 12, left: 24, right: 24 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Texto do botao
        <input
          type="text"
          value={(data.text as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { text: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        URL de destino
        <input
          type="url"
          value={(data.href as string) ?? '#'}
          onChange={(e) => updateBlock(blockId, { href: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor de fundo
        <input
          type="color"
          value={(style.backgroundColor as string) ?? '#F26B2A'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, backgroundColor: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor do texto
        <input
          type="color"
          value={(style.textColor as string) ?? '#FFFFFF'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, textColor: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Tamanho da fonte
        <input
          type="number"
          value={(style.fontSize as number) ?? 16}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, fontSize: Number(e.target.value) } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Peso da fonte
        <select
          value={(style.fontWeight as string) ?? 'bold'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, fontWeight: e.target.value } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="normal">Normal</option>
          <option value="bold">Negrito</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Borda arredondada
        <input
          type="number"
          value={(style.borderRadius as number) ?? 4}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, borderRadius: Number(e.target.value) } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Largura
        <select
          value={(style.width as string) ?? 'auto'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, width: e.target.value } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="auto">Automatica</option>
          <option value="full">Largura total</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Alinhamento
        <select
          value={(style.alignment as string) ?? 'center'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, alignment: e.target.value } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </label>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Espacamento</p>
        <PaddingInputs
          padding={padding}
          onChange={(p) => updateBlock(blockId, { style: { ...style, padding: p } })}
        />
      </div>
    </div>
  );
}

function DividerConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10 }) as { top: number; bottom: number };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Cor
        <input
          type="color"
          value={(style.color as string) ?? '#DDDDDD'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, color: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Espessura
        <input
          type="number"
          value={(style.thickness as number) ?? 1}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, thickness: Number(e.target.value) } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Espacamento vertical
        <div className="grid grid-cols-2 gap-2 mt-1">
          <label className="text-xs text-gray-500">
            Topo
            <input
              type="number"
              value={padding.top}
              onChange={(e) =>
                updateBlock(blockId, {
                  style: { ...style, padding: { ...padding, top: Number(e.target.value) } },
                })
              }
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>
          <label className="text-xs text-gray-500">
            Base
            <input
              type="number"
              value={padding.bottom}
              onChange={(e) =>
                updateBlock(blockId, {
                  style: { ...style, padding: { ...padding, bottom: Number(e.target.value) } },
                })
              }
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>
        </div>
      </label>
    </div>
  );
}

function SpacerConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Altura (px)
        <input
          type="number"
          value={(data.height as number) ?? 20}
          onChange={(e) => updateBlock(blockId, { height: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
    </div>
  );
}

function HeadingConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const style = (data.style ?? {}) as Record<string, unknown>;
  const padding = (style.padding ?? { top: 10, bottom: 10, left: 20, right: 20 }) as {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Texto
        <input
          type="text"
          value={(data.text as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { text: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Nivel
        <select
          value={String((data.level as number) ?? 1)}
          onChange={(e) => updateBlock(blockId, { level: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor
        <input
          type="color"
          value={(style.color as string) ?? '#333333'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, color: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Tamanho da fonte
        <input
          type="number"
          value={(style.fontSize as number) ?? 28}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, fontSize: Number(e.target.value) } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Alinhamento
        <select
          value={(style.textAlign as string) ?? 'left'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, textAlign: e.target.value } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </label>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Espacamento</p>
        <PaddingInputs
          padding={padding}
          onChange={(p) => updateBlock(blockId, { style: { ...style, padding: p } })}
        />
      </div>
    </div>
  );
}

function ColumnsConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Layout
        <select
          value={(data.layout as string) ?? '50-50'}
          onChange={(e) => updateBlock(blockId, { layout: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="50-50">50% / 50%</option>
          <option value="33-33-33">33% / 33% / 33%</option>
          <option value="66-33">66% / 33%</option>
          <option value="33-66">33% / 66%</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Espaco entre colunas
        <input
          type="number"
          value={(data.gap as number) ?? 10}
          onChange={(e) => updateBlock(blockId, { gap: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={(data.mobileStack as boolean) ?? true}
          onChange={(e) => updateBlock(blockId, { mobileStack: e.target.checked })}
          className="rounded"
        />
        Empilhar no mobile
      </label>
    </div>
  );
}

function HtmlConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Codigo HTML
        <textarea
          value={(data.html as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { html: e.target.value })}
          rows={8}
          className="w-full mt-1 px-2 py-1 border rounded text-sm font-mono"
        />
      </label>
    </div>
  );
}

function FooterConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Nome da empresa
        <input
          type="text"
          value={(data.companyName as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { companyName: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Endereco
        <input
          type="text"
          value={(data.address as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { address: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor do texto
        <input
          type="color"
          value={(data.textColor as string) ?? '#999999'}
          onChange={(e) => updateBlock(blockId, { textColor: e.target.value })}
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor dos links
        <input
          type="color"
          value={(data.linkColor as string) ?? '#F26B2A'}
          onChange={(e) => updateBlock(blockId, { linkColor: e.target.value })}
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Tamanho da fonte
        <input
          type="number"
          value={(data.fontSize as number) ?? 12}
          onChange={(e) => updateBlock(blockId, { fontSize: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={(data.showUnsubscribe as boolean) ?? true}
          onChange={(e) => updateBlock(blockId, { showUnsubscribe: e.target.checked })}
          className="rounded"
        />
        Mostrar link de descadastro
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Alinhamento
        <select
          value={(data.alignment as string) ?? 'center'}
          onChange={(e) => updateBlock(blockId, { alignment: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </label>
    </div>
  );
}

function SocialLinksConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const networks = (data.networks ?? []) as Array<{ type: string; url: string }>;

  const socialOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  return (
    <div className="space-y-4">
      {networks.map((network, index) => (
        <div key={index} className="border rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Rede social
              <select
                value={network.type}
                onChange={(e) => {
                  const newNetworks = [...networks];
                  newNetworks[index] = { ...network, type: e.target.value };
                  updateBlock(blockId, { networks: newNetworks });
                }}
                className="w-full mt-1 px-2 py-1 border rounded text-sm"
              >
                {socialOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                const newNetworks = networks.filter((_, i) => i !== index);
                updateBlock(blockId, { networks: newNetworks });
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Remover
            </button>
          </div>
          <label className="block text-xs text-gray-500">
            URL
            <input
              type="url"
              value={network.url}
              onChange={(e) => {
                const newNetworks = [...networks];
                newNetworks[index] = { ...network, url: e.target.value };
                updateBlock(blockId, { networks: newNetworks });
              }}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          updateBlock(blockId, {
            networks: [...networks, { type: 'instagram', url: '#' }],
          });
        }}
        className="w-full py-2 text-sm border border-dashed border-gray-300 rounded hover:border-[#F26B2A] hover:text-[#F26B2A] transition-colors"
      >
        + Adicionar rede social
      </button>
      <label className="block text-sm font-medium text-gray-700">
        Tamanho dos icones
        <select
          value={String((data.iconSize as number) ?? 32)}
          onChange={(e) => updateBlock(blockId, { iconSize: Number(e.target.value) })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="24">Pequeno (24px)</option>
          <option value="32">Medio (32px)</option>
          <option value="40">Grande (40px)</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Alinhamento
        <select
          value={(data.alignment as string) ?? 'center'}
          onChange={(e) => updateBlock(blockId, { alignment: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
          <option value="right">Direita</option>
        </select>
      </label>
    </div>
  );
}

function ProductConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const product = data.product as Record<string, unknown> | undefined;
  const buttonStyle = (data.buttonStyle ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-4">
      {product ? (
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Produto selecionado</p>
          <p className="text-sm font-medium text-gray-900 truncate">{String(product.title ?? '')}</p>
          <button
            type="button"
            onClick={() => updateBlock(blockId, { product: undefined })}
            className="mt-2 w-full py-1.5 text-xs border border-[#F26B2A] text-[#F26B2A] rounded hover:bg-orange-50 transition-colors"
          >
            Trocar Produto
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400">Clique em &quot;Selecionar Produto&quot; no bloco</p>
      )}

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">DADOS MANUAIS</p>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titulo
          <input
            type="text"
            value={product ? String(product.title ?? '') : ''}
            onChange={(e) =>
              updateBlock(blockId, { product: { ...(product ?? {}), title: e.target.value, shopifyId: (product?.shopifyId as string) ?? '', imageUrl: (product?.imageUrl as string) ?? '', price: (product?.price as string) ?? '', productUrl: (product?.productUrl as string) ?? '' } })
            }
            className="w-full mt-1 px-2 py-1 border rounded text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL da imagem
          <input
            type="url"
            value={product ? String(product.imageUrl ?? '') : ''}
            onChange={(e) =>
              updateBlock(blockId, { product: { ...(product ?? {}), imageUrl: e.target.value, shopifyId: (product?.shopifyId as string) ?? '', title: (product?.title as string) ?? '', price: (product?.price as string) ?? '', productUrl: (product?.productUrl as string) ?? '' } })
            }
            className="w-full mt-1 px-2 py-1 border rounded text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preco
          <input
            type="text"
            value={product ? String(product.price ?? '') : ''}
            onChange={(e) =>
              updateBlock(blockId, { product: { ...(product ?? {}), price: e.target.value, shopifyId: (product?.shopifyId as string) ?? '', title: (product?.title as string) ?? '', imageUrl: (product?.imageUrl as string) ?? '', productUrl: (product?.productUrl as string) ?? '' } })
            }
            className="w-full mt-1 px-2 py-1 border rounded text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL do produto
          <input
            type="url"
            value={product ? String(product.productUrl ?? '') : ''}
            onChange={(e) =>
              updateBlock(blockId, { product: { ...(product ?? {}), productUrl: e.target.value, shopifyId: (product?.shopifyId as string) ?? '', title: (product?.title as string) ?? '', imageUrl: (product?.imageUrl as string) ?? '', price: (product?.price as string) ?? '' } })
            }
            className="w-full mt-1 px-2 py-1 border rounded text-sm"
          />
        </label>
      </div>

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">VISIBILIDADE</p>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={(data.showImage as boolean) ?? true}
            onChange={(e) => updateBlock(blockId, { showImage: e.target.checked })}
            className="rounded"
          />
          Mostrar imagem
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-2">
          <input
            type="checkbox"
            checked={(data.showTitle as boolean) ?? true}
            onChange={(e) => updateBlock(blockId, { showTitle: e.target.checked })}
            className="rounded"
          />
          Mostrar titulo
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-2">
          <input
            type="checkbox"
            checked={(data.showPrice as boolean) ?? true}
            onChange={(e) => updateBlock(blockId, { showPrice: e.target.checked })}
            className="rounded"
          />
          Mostrar preco
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-2">
          <input
            type="checkbox"
            checked={(data.showButton as boolean) ?? true}
            onChange={(e) => updateBlock(blockId, { showButton: e.target.checked })}
            className="rounded"
          />
          Mostrar botao
        </label>
      </div>

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">BOTAO</p>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texto do botao
          <input
            type="text"
            value={(data.buttonText as string) ?? 'Comprar agora'}
            onChange={(e) => updateBlock(blockId, { buttonText: e.target.value })}
            className="w-full mt-1 px-2 py-1 border rounded text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor de fundo do botao
          <input
            type="color"
            value={(buttonStyle.backgroundColor as string) ?? '#F26B2A'}
            onChange={(e) =>
              updateBlock(blockId, { buttonStyle: { ...buttonStyle, backgroundColor: e.target.value } })
            }
            className="w-full h-8 mt-1 cursor-pointer"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Cor do texto do botao
          <input
            type="color"
            value={(buttonStyle.textColor as string) ?? '#FFFFFF'}
            onChange={(e) =>
              updateBlock(blockId, { buttonStyle: { ...buttonStyle, textColor: e.target.value } })
            }
            className="w-full h-8 mt-1 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

function CountdownConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const labels = (data.labels ?? { days: 'dias', hours: 'horas', minutes: 'minutos', seconds: 'segundos' }) as Record<string, string>;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Data e hora de termino
        <input
          type="datetime-local"
          value={(data.endDate as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { endDate: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Estilo
        <select
          value={(data.style as string) ?? 'dark'}
          onChange={(e) => {
            const s = e.target.value;
            const presets: Record<string, { backgroundColor: string; numberColor: string; labelColor: string }> = {
              light: { backgroundColor: '#FFFFFF', numberColor: '#333333', labelColor: '#666666' },
              dark: { backgroundColor: '#1a1a2e', numberColor: '#FFFFFF', labelColor: '#cccccc' },
              minimal: { backgroundColor: 'transparent', numberColor: '#333333', labelColor: '#666666' },
            };
            updateBlock(blockId, { style: s, ...presets[s] });
          }}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="minimal">Minimalista</option>
        </select>
      </label>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Rotulos</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-500">
            Dias
            <input
              type="text"
              value={labels.days ?? 'dias'}
              onChange={(e) => updateBlock(blockId, { labels: { ...labels, days: e.target.value } })}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>
          <label className="text-xs text-gray-500">
            Horas
            <input
              type="text"
              value={labels.hours ?? 'horas'}
              onChange={(e) => updateBlock(blockId, { labels: { ...labels, hours: e.target.value } })}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>
          <label className="text-xs text-gray-500">
            Minutos
            <input
              type="text"
              value={labels.minutes ?? 'minutos'}
              onChange={(e) => updateBlock(blockId, { labels: { ...labels, minutes: e.target.value } })}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>
          <label className="text-xs text-gray-500">
            Segundos
            <input
              type="text"
              value={labels.seconds ?? 'segundos'}
              onChange={(e) => updateBlock(blockId, { labels: { ...labels, seconds: e.target.value } })}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </label>
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700">
        Cor de fundo
        <input
          type="color"
          value={(data.backgroundColor as string) ?? '#1a1a2e'}
          onChange={(e) => updateBlock(blockId, { backgroundColor: e.target.value })}
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor dos numeros
        <input
          type="color"
          value={(data.numberColor as string) ?? '#FFFFFF'}
          onChange={(e) => updateBlock(blockId, { numberColor: e.target.value })}
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor dos rotulos
        <input
          type="color"
          value={(data.labelColor as string) ?? '#cccccc'}
          onChange={(e) => updateBlock(blockId, { labelColor: e.target.value })}
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Texto de expirado
        <input
          type="text"
          value={(data.expiredText as string) ?? 'Oferta expirada!'}
          onChange={(e) => updateBlock(blockId, { expiredText: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
    </div>
  );
}

function CouponConfig({ blockId, data }: { blockId: string; data: Record<string, unknown> }) {
  const updateBlock = useEmailBuilderStore((s) => s.updateBlock);
  const style = (data.style ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Tipo
        <select
          value={(data.type as string) ?? 'static'}
          onChange={(e) => updateBlock(blockId, { type: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="static">Estatico</option>
          <option value="dynamic">Dinamico</option>
        </select>
      </label>
      {(data.type as string) === 'dynamic' ? (
        <label className="block text-sm font-medium text-gray-700">
          Tag dinamica
          <input
            type="text"
            value={(data.dynamicTag as string) ?? ''}
            onChange={(e) => updateBlock(blockId, { dynamicTag: e.target.value })}
            placeholder="{{coupon_code}}"
            className="w-full mt-1 px-2 py-1 border rounded text-sm"
          />
        </label>
      ) : (
        <label className="block text-sm font-medium text-gray-700">
          Codigo do cupom
          <input
            type="text"
            value={(data.staticCode as string) ?? ''}
            onChange={(e) => updateBlock(blockId, { staticCode: e.target.value })}
            className="w-full mt-1 px-2 py-1 border rounded text-sm"
          />
        </label>
      )}
      <label className="block text-sm font-medium text-gray-700">
        Texto do cabecalho
        <input
          type="text"
          value={(data.headerText as string) ?? ''}
          onChange={(e) => updateBlock(blockId, { headerText: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor de fundo
        <input
          type="color"
          value={(style.backgroundColor as string) ?? '#FFF8F0'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, backgroundColor: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor do texto
        <input
          type="color"
          value={(style.textColor as string) ?? '#333333'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, textColor: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Estilo da borda
        <select
          value={(style.borderStyle as string) ?? 'dashed'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, borderStyle: e.target.value } })
          }
          className="w-full mt-1 px-2 py-1 border rounded text-sm"
        >
          <option value="solid">Solida</option>
          <option value="dashed">Tracejada</option>
          <option value="dotted">Pontilhada</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Cor da borda
        <input
          type="color"
          value={(style.borderColor as string) ?? '#F26B2A'}
          onChange={(e) =>
            updateBlock(blockId, { style: { ...style, borderColor: e.target.value } })
          }
          className="w-full h-8 mt-1 cursor-pointer"
        />
      </label>
    </div>
  );
}

const configComponents: Partial<
  Record<BlockType, React.ComponentType<{ blockId: string; data: Record<string, unknown> }>>
> = {
  text: TextConfig,
  heading: HeadingConfig,
  image: ImageConfig,
  button: ButtonConfig,
  divider: DividerConfig,
  spacer: SpacerConfig,
  columns: ColumnsConfig,
  html: HtmlConfig,
  header: TextConfig,
  footer: FooterConfig,
  'social-links': SocialLinksConfig,
  product: ProductConfig,
  'product-grid': ProductConfig,
  'abandoned-cart': ProductConfig,
  coupon: CouponConfig,
  countdown: CountdownConfig,
};

const blockLabels: Partial<Record<BlockType, string>> = {
  text: 'Texto',
  heading: 'Titulo',
  image: 'Imagem',
  button: 'Botao',
  divider: 'Divisor',
  spacer: 'Espacador',
  columns: 'Colunas',
  html: 'HTML',
  header: 'Cabecalho',
  footer: 'Rodape',
  'social-links': 'Redes Sociais',
  product: 'Produto',
  'product-grid': 'Grid de Produtos',
  'abandoned-cart': 'Carrinho Abandonado',
  coupon: 'Cupom',
  countdown: 'Contagem Regressiva',
};

export function StylePanel() {
  const selectedBlockId = useEmailBuilderStore((s) => s.selectedBlockId);
  const blocks = useEmailBuilderStore((s) => s.template.blocks);

  if (!selectedBlockId || !blocks[selectedBlockId]) {
    return (
      <div className="p-4 flex items-center justify-center h-full text-gray-400">
        <p className="text-sm">Selecione um bloco para editar suas propriedades</p>
      </div>
    );
  }

  const block = blocks[selectedBlockId];
  const ConfigComponent = configComponents[block.type];

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-500 mb-1">Propriedades</h2>
      <p className="text-xs text-gray-400 mb-4">
        {blockLabels[block.type] ?? block.type}
      </p>
      {ConfigComponent ? (
        <ConfigComponent blockId={selectedBlockId} data={block.data} />
      ) : (
        <p className="text-sm text-gray-400">
          Configuracao nao disponivel para este tipo de bloco.
        </p>
      )}
    </div>
  );
}
