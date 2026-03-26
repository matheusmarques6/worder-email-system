"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          <span className="text-gray-900">Convertfy</span>{" "}
          <span className="text-brand-500">Mail</span>
        </h1>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Entrar na sua conta
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-600 text-white"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-brand-500 hover:text-brand-600 font-medium">
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}
