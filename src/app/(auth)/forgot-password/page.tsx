"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          <span className="text-gray-900">Convertfy</span>{" "}
          <span className="text-brand-500">Mail</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">Recuperar senha</p>
      </div>

      {sent ? (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Enviamos um link de recuperação para <strong>{email}</strong>
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            Voltar para login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="font-medium text-brand-500 hover:text-brand-600">
              Voltar para login
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
