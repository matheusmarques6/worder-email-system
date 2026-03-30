'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutTemplate, Loader2, Bookmark, Grid3X3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SYSTEM_TEMPLATES, type SystemTemplate } from '@/lib/email-builder/system-templates';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import { createClient } from '@/lib/supabase/client';
import type { EmailTemplate } from '@/lib/email-builder/types';

interface SavedTemplate {
  id: string;
  name: string;
  category: string;
  template: EmailTemplate;
  created_at: string;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Onboarding: 'from-green-400 to-emerald-500',
  'E-commerce': 'from-orange-400 to-red-500',
  Transacional: 'from-blue-400 to-indigo-500',
  'Conteúdo': 'from-purple-400 to-violet-500',
  Marketing: 'from-pink-400 to-rose-500',
  Outros: 'from-gray-400 to-gray-500',
};

function getGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS['Outros'];
}

export default function TemplateGalleryPage() {
  const router = useRouter();
  const setTemplate = useEmailBuilderStore((s) => s.setTemplate);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const fetchSavedTemplates = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('email_templates')
        .select('id, name, category, template, created_at')
        .order('created_at', { ascending: false });

      if (data) {
        setSavedTemplates(
          data.map((d: Record<string, unknown>) => ({
            id: String(d.id ?? ''),
            name: String(d.name ?? 'Sem nome'),
            category: String(d.category ?? 'Outros'),
            template: d.template as EmailTemplate,
            created_at: String(d.created_at ?? ''),
          }))
        );
      }
    } catch {
      setSavedTemplates([]);
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedTemplates();
  }, [fetchSavedTemplates]);

  function handleUseTemplate(template: EmailTemplate) {
    setTemplate(JSON.parse(JSON.stringify(template)));
    router.push('/email-builder');
  }

  function renderTemplateCard(
    id: string,
    name: string,
    category: string,
    description: string,
    template: EmailTemplate
  ) {
    return (
      <div
        key={id}
        className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white"
      >
        <div
          className={`h-36 bg-gradient-to-br ${getGradient(category)} flex items-center justify-center`}
        >
          <LayoutTemplate size={40} className="text-white/70" />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
              {category}
            </span>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{description}</p>
          )}
          <button
            type="button"
            onClick={() => handleUseTemplate(template)}
            className="w-full py-2 text-sm font-medium text-white bg-[#F26B2A] rounded-lg hover:bg-[#d95d22] transition-colors"
          >
            Usar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Grid3X3 size={24} className="text-[#F26B2A]" />
        <h1 className="text-2xl font-bold text-gray-900">Galeria de Templates</h1>
      </div>

      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="salvos">Salvos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {SYSTEM_TEMPLATES.map((t) =>
              renderTemplateCard(t.id, t.name, t.category, t.description, t.template)
            )}
            {savedTemplates.map((t) =>
              renderTemplateCard(t.id, t.name, t.category, '', t.template)
            )}
          </div>
        </TabsContent>

        <TabsContent value="sistema">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {SYSTEM_TEMPLATES.map((t) =>
              renderTemplateCard(t.id, t.name, t.category, t.description, t.template)
            )}
          </div>
        </TabsContent>

        <TabsContent value="salvos">
          {loadingSaved ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Carregando templates salvos...</span>
            </div>
          ) : savedTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Bookmark size={40} className="mb-3" />
              <p className="text-sm">Nenhum template salvo ainda.</p>
              <p className="text-xs mt-1">Salve um template no editor para ele aparecer aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {savedTemplates.map((t) =>
                renderTemplateCard(t.id, t.name, t.category, '', t.template)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
