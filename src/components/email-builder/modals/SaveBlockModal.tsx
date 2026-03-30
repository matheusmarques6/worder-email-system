'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import type { BlockBase } from '@/lib/email-builder/types';

interface SaveBlockModalProps {
  open: boolean;
  onClose: () => void;
  block: BlockBase | null;
  storeId: string | undefined;
  onSaved?: () => void;
}

const CATEGORIES = [
  { value: 'cabecalhos', label: 'Cabeçalhos' },
  { value: 'conteudo', label: 'Conteúdo' },
  { value: 'botoes', label: 'Botões' },
  { value: 'rodapes', label: 'Rodapés' },
  { value: 'outros', label: 'Outros' },
];

export function SaveBlockModal({
  open,
  onClose,
  block,
  storeId,
  onSaved,
}: SaveBlockModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('conteudo');
  const [saving, setSaving] = useState(false);

  if (!open || !block) return null;

  async function handleSave() {
    if (!name.trim() || !storeId || !block) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('saved_blocks').insert({
        store_id: storeId,
        name: name.trim(),
        category,
        block_type: block.type,
        block_data: block.data,
        created_at: new Date().toISOString(),
      });
      onSaved?.();
      onClose();
      setName('');
      setCategory('conteudo');
    } catch {
      // Erro ao salvar
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Salvar bloco reutilizável
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Nome do bloco
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Banner principal"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              autoFocus
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p>
              Tipo do bloco: <strong className="text-gray-700">{block.type}</strong>
            </p>
          </div>
        </div>

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
            disabled={saving || !name.trim()}
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
