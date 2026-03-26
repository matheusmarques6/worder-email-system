"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    router.push("/");
    router.refresh();
  };

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
        Entrar
      </h1>
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
        <div>
          <Label htmlFor="password" className="mb-1.5 text-sm font-medium text-gray-700">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm text-brand-500 hover:text-brand-600"
          >
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-500 hover:text-brand-600"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
