"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      toast.error("Erro ao enviar email de recuperação.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Email enviado
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Verifique sua caixa de entrada para redefinir sua senha.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          Voltar para login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">
        Recuperar senha
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Informe seu email para receber o link de recuperação.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link
          href="/login"
          className="font-medium text-brand-500 hover:text-brand-600"
        >
          Voltar para login
        </Link>
      </p>
    </div>
  );
}
