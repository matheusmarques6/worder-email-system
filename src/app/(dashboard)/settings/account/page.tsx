"use client"

import { AccountSettings } from "@/components/settings/account-settings"
import { TeamMembers } from "@/components/settings/team-members"
import { useStore } from "@/hooks/use-store"

export default function AccountSettingsPage() {
  const { store, loading } = useStore()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-white border border-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Conta</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie sua conta e equipe</p>
      </div>
      <AccountSettings />
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipe</h2>
        <TeamMembers storeId={store?.id ?? ""} />
      </div>
    </div>
  )
}
