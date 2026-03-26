export type UserRole = "owner" | "admin" | "editor" | "viewer"

export interface StoreUser {
  id: string
  store_id: string
  user_id: string | null
  email: string
  name: string | null
  role: UserRole
  invite_token: string | null
  invited_at: string
  accepted_at: string | null
}

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
}

export const ROLE_COLORS: Record<UserRole, string> = {
  owner: "bg-orange-50 text-orange-700 border border-orange-200",
  admin: "bg-blue-50 text-blue-700 border border-blue-200",
  editor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  viewer: "bg-gray-100 text-gray-600 border border-gray-200",
}
