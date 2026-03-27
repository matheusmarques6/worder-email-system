"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  QrCode,
  Monitor,
  LogIn,
  Settings,
  Mail,
  UserPlus,
  Clock,
} from "lucide-react";

interface AuditEntry {
  id: string;
  type: "login" | "settings" | "campaign" | "user_invited";
  description: string;
  timestamp: string;
}

const auditIconMap = {
  login: LogIn,
  settings: Settings,
  campaign: Mail,
  user_invited: UserPlus,
};

const placeholderAuditEntries: AuditEntry[] = [
  {
    id: "1",
    type: "login",
    description: "Login realizado com sucesso",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    type: "settings",
    description: "Configurações de email atualizadas",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    type: "campaign",
    description: "Campanha 'Boas-vindas' enviada",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "4",
    type: "user_invited",
    description: "Usuário convidado para a equipe",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
];

function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin} min atr\u00e1s`;
  if (diffHours < 24) return `${diffHours}h atr\u00e1s`;
  if (diffDays < 7) return `${diffDays}d atr\u00e1s`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Seguran\u00e7a</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie a seguran\u00e7a da sua conta
        </p>
      </div>

      {/* 2FA Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Shield className="h-[18px] w-[18px] text-brand-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Autentica\u00e7\u00e3o em Dois Fatores (2FA)
              </h3>
              <Badge
                variant="secondary"
                className={
                  twoFactorEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {twoFactorEnabled ? "Ativado" : "Desativado"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Adicione uma camada extra de seguran\u00e7a \u00e0 sua conta
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
        </div>

        {twoFactorEnabled && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="flex h-[200px] w-[200px] flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <QrCode className="h-12 w-12" />
                  <span className="text-xs text-center px-4">
                    Escaneie com seu app autenticador
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">
                    C\u00f3digo de verifica\u00e7\u00e3o
                  </p>
                  <Input
                    placeholder="Digite o c\u00f3digo de 6 d\u00edgitos"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="max-w-xs"
                  />
                </div>
                <Button
                  disabled
                  className="bg-brand-500 hover:bg-brand-600 text-white"
                >
                  Verificar
                </Button>
                <p className="text-xs text-gray-500">
                  Funcionalidade em desenvolvimento. Em breve voc\u00ea poder\u00e1
                  ativar o 2FA.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Monitor className="h-[18px] w-[18px] text-brand-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sess\u00f5es Ativas
            </h3>
            <p className="text-sm text-gray-500">
              Dispositivos conectados \u00e0 sua conta
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispositivo</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>\u00daltima atividade</TableHead>
              <TableHead className="w-[120px]">A\u00e7\u00e3o</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Monitor className="h-[18px] w-[18px] text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Navegador Web
                    </p>
                    <p className="text-xs text-gray-500">Este dispositivo</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                192.168.1.1
              </TableCell>
              <TableCell className="text-sm text-gray-500">Agora</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  Sess\u00e3o atual
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Audit Log Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Clock className="h-[18px] w-[18px] text-brand-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Log de Auditoria
            </h3>
            <p className="text-sm text-gray-500">\u00daltimas atividades</p>
          </div>
        </div>

        <div className="space-y-0">
          {placeholderAuditEntries.map((entry, index) => {
            const Icon = auditIconMap[entry.type];
            const isLast = index === placeholderAuditEntries.length - 1;

            return (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <Icon className="h-[18px] w-[18px] text-gray-500" />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-gray-200 my-1" />
                  )}
                </div>
                <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                  <p className="text-sm font-medium text-gray-900">
                    {entry.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatRelativeDate(entry.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
