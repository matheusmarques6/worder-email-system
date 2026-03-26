"use client"

import { AccountSettings } from "@/components/settings/account-settings"
import { TeamMembers } from "@/components/settings/team-members"

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Conta</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie sua conta e equipe</p>
      </div>
      <AccountSettings />
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipe</h2>
        <TeamMembers storeId="" />
      </div>
    </div>
  )
}
