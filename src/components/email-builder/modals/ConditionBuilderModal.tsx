'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DisplayCondition } from '@/lib/email-builder/types';

interface ConditionBuilderModalProps {
  open: boolean;
  onClose: () => void;
  conditions: DisplayCondition[];
  logic: 'and' | 'or';
  onSave: (conditions: DisplayCondition[], logic: 'and' | 'or') => void;
}

const CONDITION_FIELDS = [
  { value: 'contact.first_name', label: 'Nome do contato' },
  { value: 'contact.email', label: 'E-mail do contato' },
  { value: 'contact.tags', label: 'Tags do contato' },
  { value: 'contact.phone', label: 'Telefone do contato' },
  { value: 'event.total_price', label: 'Valor total do pedido' },
  { value: 'event.order_number', label: 'Número do pedido' },
  { value: 'event.checkout_url', label: 'URL do checkout' },
  { value: 'coupon.code', label: 'Código do cupom' },
  { value: 'coupon.discount', label: 'Valor do desconto' },
];

const OPERATORS: { value: DisplayCondition['operator']; label: string }[] = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'contains', label: 'Contém' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'is_set', label: 'Está definido' },
];

export function ConditionBuilderModal({
  open,
  onClose,
  conditions: initialConditions,
  logic: initialLogic,
  onSave,
}: ConditionBuilderModalProps) {
  const [conditions, setConditions] = useState<DisplayCondition[]>(
    initialConditions.length > 0 ? initialConditions : []
  );
  const [logic, setLogic] = useState<'and' | 'or'>(initialLogic);

  if (!open) return null;

  function addCondition() {
    setConditions([
      ...conditions,
      { field: 'contact.first_name', operator: 'is_set', value: '' },
    ]);
  }

  function removeCondition(index: number) {
    setConditions(conditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, updates: Partial<DisplayCondition>) {
    setConditions(
      conditions.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  }

  function handleSave() {
    onSave(conditions, logic);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Condições de exibição
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-gray-500">
            Configure quando este bloco deve ser exibido. O bloco será mostrado
            somente quando as condições forem satisfeitas.
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Lógica:</span>
            <button
              type="button"
              onClick={() => setLogic('and')}
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                logic === 'and'
                  ? 'bg-[#F26B2A] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas as condições (E)
            </button>
            <button
              type="button"
              onClick={() => setLogic('or')}
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                logic === 'or'
                  ? 'bg-[#F26B2A] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Qualquer condição (OU)
            </button>
          </div>

          {conditions.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              Nenhuma condição adicionada. O bloco será sempre exibido.
            </div>
          )}

          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex-1 space-y-2">
                  <Select
                    value={condition.field}
                    onValueChange={(v) => updateCondition(index, { field: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_FIELDS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(v) =>
                      updateCondition(index, {
                        operator: v as DisplayCondition['operator'],
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Operador" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {condition.operator !== 'is_set' && (
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) =>
                        updateCondition(index, { value: e.target.value })
                      }
                      placeholder="Valor"
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="p-1 hover:bg-red-50 rounded mt-1"
                  title="Remover condição"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCondition}
            className="flex items-center gap-1 text-sm text-[#F26B2A] hover:text-[#d95d22] font-medium"
          >
            <Plus size={16} />
            Adicionar condição
          </button>
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
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#F26B2A] rounded-lg hover:bg-[#d95d22]"
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
