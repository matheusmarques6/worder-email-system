'use client';

import { Code } from 'lucide-react';

export function HtmlBlock({ data }: { data: Record<string, unknown> }) {
  const html = (data.html as string) ?? '';

  return (
    <div className="p-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Code size={14} />
          <span className="text-xs font-medium">Bloco HTML</span>
        </div>
        <pre className="text-xs text-gray-600 font-mono overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
          {html || '<!-- Seu HTML aqui -->'}
        </pre>
      </div>
    </div>
  );
}
