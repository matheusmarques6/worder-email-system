'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { type BrandKit, DEFAULT_BRAND_KIT, WEB_SAFE_FONTS } from '@/lib/email-builder/brand-kit';

interface BrandKitModalProps {
  open: boolean;
  onClose: () => void;
  storeId: string | undefined;
  onSave?: (kit: BrandKit) => void;
}

export function BrandKitModal({ open, onClose, storeId, onSave }: BrandKitModalProps) {
  const [kit, setKit] = useState<BrandKit>({ ...DEFAULT_BRAND_KIT });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBrandKit = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (data) {
        setKit({
          id: String(data.id ?? ''),
          storeId: String(data.store_id ?? ''),
          logo: (data.logo as BrandKit['logo']) ?? DEFAULT_BRAND_KIT.logo,
          colors: (data.colors as BrandKit['colors']) ?? DEFAULT_BRAND_KIT.colors,
          fonts: (data.fonts as BrandKit['fonts']) ?? DEFAULT_BRAND_KIT.fonts,
          buttons: (data.buttons as BrandKit['buttons']) ?? DEFAULT_BRAND_KIT.buttons,
          footer: (data.footer as BrandKit['footer']) ?? DEFAULT_BRAND_KIT.footer,
        });
      }
    } catch {
      // Usar valores padrão
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (open) {
      loadBrandKit();
    }
  }, [open, loadBrandKit]);

  async function handleSave() {
    if (!storeId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('brand_kits').upsert(
        {
          store_id: storeId,
          logo: kit.logo,
          colors: kit.colors,
          fonts: kit.fonts,
          buttons: kit.buttons,
          footer: kit.footer,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'store_id' }
      );
      onSave?.(kit);
      onClose();
    } catch {
      // Erro ao salvar
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Brand Kit</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Carregando...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs defaultValue="logo">
              <TabsList className="w-full">
                <TabsTrigger value="logo">Logo</TabsTrigger>
                <TabsTrigger value="cores">Cores</TabsTrigger>
                <TabsTrigger value="fontes">Fontes</TabsTrigger>
                <TabsTrigger value="botoes">Botões</TabsTrigger>
                <TabsTrigger value="rodape">Rodapé</TabsTrigger>
              </TabsList>

              <TabsContent value="logo" className="space-y-4 pt-4">
                <label className="block text-sm font-medium text-gray-700">
                  URL do logo
                  <input
                    type="url"
                    value={kit.logo.url}
                    onChange={(e) =>
                      setKit({ ...kit, logo: { ...kit.logo, url: e.target.value } })
                    }
                    placeholder="https://..."
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </label>
                {kit.logo.url && (
                  <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={kit.logo.url}
                      alt="Logo preview"
                      style={{ width: kit.logo.width }}
                      className="max-h-20 object-contain"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura: {kit.logo.width}px
                  </label>
                  <Slider
                    value={[kit.logo.width]}
                    onValueChange={([w]) =>
                      setKit({ ...kit, logo: { ...kit.logo, width: w } })
                    }
                    min={50}
                    max={400}
                    step={10}
                  />
                </div>
              </TabsContent>

              <TabsContent value="cores" className="space-y-4 pt-4">
                <ColorField
                  label="Cor primária"
                  value={kit.colors.primary}
                  onChange={(v) =>
                    setKit({ ...kit, colors: { ...kit.colors, primary: v } })
                  }
                />
                <ColorField
                  label="Cor secundária"
                  value={kit.colors.secondary}
                  onChange={(v) =>
                    setKit({ ...kit, colors: { ...kit.colors, secondary: v } })
                  }
                />
                <ColorField
                  label="Cor do texto"
                  value={kit.colors.text}
                  onChange={(v) =>
                    setKit({ ...kit, colors: { ...kit.colors, text: v } })
                  }
                />
                <ColorField
                  label="Cor de fundo"
                  value={kit.colors.background}
                  onChange={(v) =>
                    setKit({ ...kit, colors: { ...kit.colors, background: v } })
                  }
                />
                <ColorField
                  label="Cor do canvas"
                  value={kit.colors.canvas}
                  onChange={(v) =>
                    setKit({ ...kit, colors: { ...kit.colors, canvas: v } })
                  }
                />
              </TabsContent>

              <TabsContent value="fontes" className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte dos títulos
                  </label>
                  <Select
                    value={kit.fonts.heading}
                    onValueChange={(v) =>
                      setKit({ ...kit, fonts: { ...kit.fonts, heading: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEB_SAFE_FONTS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          <span style={{ fontFamily: f.value }}>{f.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte do corpo
                  </label>
                  <Select
                    value={kit.fonts.body}
                    onValueChange={(v) =>
                      setKit({ ...kit, fonts: { ...kit.fonts, body: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEB_SAFE_FONTS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          <span style={{ fontFamily: f.value }}>{f.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p
                    className="text-lg font-bold mb-1"
                    style={{ fontFamily: kit.fonts.heading }}
                  >
                    Prévia do título
                  </p>
                  <p className="text-sm" style={{ fontFamily: kit.fonts.body }}>
                    Prévia do texto do corpo do e-mail. Assim ficará a fonte selecionada.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="botoes" className="space-y-4 pt-4">
                <ColorField
                  label="Cor de fundo do botão"
                  value={kit.buttons.backgroundColor}
                  onChange={(v) =>
                    setKit({
                      ...kit,
                      buttons: { ...kit.buttons, backgroundColor: v },
                    })
                  }
                />
                <ColorField
                  label="Cor do texto do botão"
                  value={kit.buttons.textColor}
                  onChange={(v) =>
                    setKit({
                      ...kit,
                      buttons: { ...kit.buttons, textColor: v },
                    })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Borda arredondada: {kit.buttons.borderRadius}px
                  </label>
                  <Slider
                    value={[kit.buttons.borderRadius]}
                    onValueChange={([r]) =>
                      setKit({
                        ...kit,
                        buttons: { ...kit.buttons, borderRadius: r },
                      })
                    }
                    min={0}
                    max={30}
                    step={1}
                  />
                </div>
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  <div
                    className="px-6 py-3 text-sm font-bold"
                    style={{
                      backgroundColor: kit.buttons.backgroundColor,
                      color: kit.buttons.textColor,
                      borderRadius: kit.buttons.borderRadius,
                    }}
                  >
                    Prévia do botão
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rodape" className="space-y-4 pt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nome da empresa
                  <input
                    type="text"
                    value={kit.footer.companyName}
                    onChange={(e) =>
                      setKit({
                        ...kit,
                        footer: { ...kit.footer, companyName: e.target.value },
                      })
                    }
                    placeholder="Sua Empresa Ltda."
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Endereço
                  <textarea
                    value={kit.footer.address}
                    onChange={(e) =>
                      setKit({
                        ...kit,
                        footer: { ...kit.footer, address: e.target.value },
                      })
                    }
                    placeholder="Rua Exemplo, 123 - São Paulo, SP"
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </label>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#F26B2A] rounded-lg hover:bg-[#d95d22] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
      />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-0.5 px-2 py-1 border rounded text-xs font-mono"
        />
      </div>
    </div>
  );
}
