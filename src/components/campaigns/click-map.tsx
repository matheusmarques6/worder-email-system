"use client"

import { useEffect, useState } from "react"
import { MousePointerClick, ExternalLink } from "lucide-react"

interface ClickMapEntry {
  url: string
  clicks: number
  percentage: number
}

interface ClickMapProps {
  campaignId: string
}

export function ClickMap({ campaignId }: ClickMapProps) {
  const [entries, setEntries] = useState<ClickMapEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClickMap() {
      setLoading(true)
      try {
        const { getClickMap } = await import("@/lib/analytics/heatmap")
        const data = await getClickMap(campaignId)
        setEntries(data)
      } catch {
        setEntries([])
      }
      setLoading(false)
    }

    fetchClickMap()
  }, [campaignId])

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Mapa de Cliques
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-2/5" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Mapa de Cliques
      </h2>

      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">URL</th>
                <th className="px-6 py-3 text-left">Cliques</th>
                <th className="px-6 py-3 text-left">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-brand-600 truncate max-w-xs"
                        title={entry.url}
                      >
                        {entry.url.length > 50
                          ? entry.url.slice(0, 50) + "..."
                          : entry.url}
                      </span>
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {entry.clicks}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${Math.min(entry.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {entry.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <MousePointerClick size={48} className="text-gray-300 mb-4" />
          <p className="text-lg text-gray-600 mb-1">
            Nenhum clique registrado
          </p>
          <p className="text-sm text-gray-400">
            Os cliques aparecerão aqui após o envio
          </p>
        </div>
      )}
    </div>
  )
}
