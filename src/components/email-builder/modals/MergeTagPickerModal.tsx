'use client';

import { useState } from 'react';
import { X, Search, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { MERGE_TAG_REGISTRY } from '@/lib/email-builder/merge-tags';

interface MergeTagPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tagValue: string) => void;
}

export function MergeTagPickerModal({ open, onClose, onSelect }: MergeTagPickerModalProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(MERGE_TAG_REGISTRY.map((c) => c.id))
  );

  if (!open) return null;

  const lowerSearch = search.toLowerCase();

  const filteredCategories = MERGE_TAG_REGISTRY.map((category) => ({
    ...category,
    tags: category.tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(lowerSearch) ||
        tag.value.toLowerCase().includes(lowerSearch) ||
        tag.description.toLowerCase().includes(lowerSearch)
    ),
  })).filter((category) => category.tags.length > 0);

  function toggleCategory(id: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#F26B2A]" />
            <h3 className="text-lg font-semibold text-gray-900">Inserir Merge Tag</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tags..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCategories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma tag encontrada</p>
          ) : (
            filteredCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              return (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-700">{category.label}</span>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="divide-y">
                      {category.tags.map((tag) => (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => {
                            onSelect(tag.value);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{tag.name}</p>
                            <p className="text-xs text-gray-400">{tag.description}</p>
                          </div>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-[#F26B2A] whitespace-nowrap ml-2">
                            {tag.value}
                          </code>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
