"use client"

import { useEffect, useState, useRef } from "react"
import type { RuleGroupType } from "react-querybuilder"
import { createClient } from "@/lib/supabase/client"
import { buildSupabaseQuery, applyProfileFilters } from "@/lib/segments/query-builder"
import type { ProfileFilter } from "@/lib/segments/query-builder"
import { Users, AlertCircle } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

interface PreviewContact {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

interface SegmentPreviewProps {
  rules: RuleGroupType | null
  storeId: string
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? ""
  const last = lastName?.charAt(0)?.toUpperCase() ?? ""
  return first + last || "?"
}

function getContactDisplayName(
  firstName: string | null,
  lastName: string | null
): string {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : "Sem nome"
}

export function SegmentPreview({ rules, storeId }: SegmentPreviewProps) {
  const [count, setCount] = useState<number>(0)
  const [contacts, setContacts] = useState<PreviewContact[]>([])
  const [loading, setLoading] = useState(false)
  const [hasEventFilters, setHasEventFilters] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!rules || !storeId || rules.rules.length === 0) {
      setCount(0)
      setContacts([])
      setHasEventFilters(false)
      setLoading(false)
      return
    }

    setLoading(true)

    timeoutRef.current = setTimeout(async () => {
      try {
        const supabase = createClient()
        const { filters, eventFilters, combinator } = buildSupabaseQuery(rules, storeId)

        setHasEventFilters(eventFilters.length > 0)

        // Count query
        let countQuery = supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("store_id", storeId)

        countQuery = applyProfileFilters(
          countQuery,
          filters as ProfileFilter[],
          combinator
        )

        const { count: totalCount } = await countQuery

        // Sample contacts query
        let sampleQuery = supabase
          .from("contacts")
          .select("id, email, first_name, last_name")
          .eq("store_id", storeId)
          .limit(5)

        sampleQuery = applyProfileFilters(
          sampleQuery,
          filters as ProfileFilter[],
          combinator
        )

        const { data: sampleContacts } = await sampleQuery

        setCount(totalCount ?? 0)
        setContacts((sampleContacts as PreviewContact[]) ?? [])
      } catch {
        setCount(0)
        setContacts([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [rules, storeId])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-[18px] w-[18px] text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">
          Contatos correspondentes
        </h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-gray-900">
            {count.toLocaleString("pt-BR")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {count === 1 ? "contato encontrado" : "contatos encontrados"}
          </p>

          {hasEventFilters && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <AlertCircle className="h-[18px] w-[18px] text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Este segmento contém filtros de evento. A contagem exibida é aproximada e considera apenas filtros de perfil. A contagem final ao salvar incluirá todos os filtros.
              </p>
            </div>
          )}

          {contacts.length > 0 && (
            <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Amostra
              </p>
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-medium">
                    {getInitials(contact.first_name, contact.last_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getContactDisplayName(
                        contact.first_name,
                        contact.last_name
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {contact.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!rules || rules.rules.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">
              Adicione condições para ver a contagem de contatos
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
