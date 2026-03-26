"use client";

import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ListDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/audience/lists">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500">2.450 contatos</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 shadow-sm">
        <Users className="mb-4 h-12 w-12 text-gray-300" />
        <p className="text-lg text-gray-600">Membros da lista</p>
        <p className="mt-1 text-sm text-gray-400">Os contatos desta lista serão exibidos aqui</p>
      </div>
    </div>
  );
}
