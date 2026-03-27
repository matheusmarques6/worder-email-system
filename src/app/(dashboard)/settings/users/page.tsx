"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/hooks/use-store"
import { toast } from "sonner"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TeamMember {
  id: string
  email: string
  name: string
  role: "admin" | "editor" | "viewer"
  status: "active" | "pending"
  addedAt: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return (
        <Badge className="border-transparent bg-brand-100 text-brand-700 hover:bg-brand-100">
          Admin
        </Badge>
      )
    case "editor":
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100">
          Editor
        </Badge>
      )
    case "viewer":
      return (
        <Badge className="border-transparent bg-gray-100 text-gray-700 hover:bg-gray-100">
          Visualizador
        </Badge>
      )
    default:
      return null
  }
}

export default function UsersPage() {
  const { store, loading: storeLoading } = useStore()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("editor")
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    async function fetchCurrentUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setMembers([
          {
            id: user.id,
            email: user.email ?? "",
            name: user.user_metadata?.full_name ?? user.email ?? "Usuário",
            role: "admin",
            status: "active",
            addedAt: user.created_at,
          },
        ])
      }

      setLoading(false)
    }

    fetchCurrentUser()
  }, [])

  function handleInvite() {
    if (!inviteEmail.trim()) {
      toast.error("Informe o email do usuário")
      return
    }

    setInviting(true)

    // MVP: simulate invite
    setTimeout(() => {
      toast.success(`Convite enviado para ${inviteEmail}`)
      setInviteEmail("")
      setInviteRole("editor")
      setDialogOpen(false)
      setInviting(false)
    }, 500)
  }

  if (loading || storeLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Equipe</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-[18px] w-[18px] mr-2" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Usuário</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um novo membro à equipe.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Função</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? "Enviando..." : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Adicionado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
                      {getInitials(member.name)}
                    </div>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{member.email}</TableCell>
                <TableCell>{getRoleBadge(member.role)}</TableCell>
                <TableCell>
                  <Badge className="border-transparent bg-green-100 text-green-700 hover:bg-green-100">
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {new Date(member.addedAt).toLocaleDateString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
