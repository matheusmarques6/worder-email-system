"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlowNode, FlowNodeData } from "@/types/flows";

interface FlowConfigPanelProps {
  node: FlowNode;
  onUpdate: (nodeId: string, data: FlowNodeData) => void;
  onClose: () => void;
}

export function FlowConfigPanel({ node, onUpdate, onClose }: FlowConfigPanelProps) {
  const nodeKey = node.id;
  const initialConfig = useMemo(
    () => node.data.config as Record<string, unknown>,
    [nodeKey] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const initialLabel = useMemo(() => node.data.label, [nodeKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [config, setConfig] = useState<Record<string, unknown>>(initialConfig);
  const [label, setLabel] = useState(initialLabel);

  const handleApply = () => {
    onUpdate(node.id, {
      ...node.data,
      label,
      config: config as FlowNodeData["config"],
    });
  };

  const updateConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Configuração</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Nome</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1.5"
          />
        </div>

        {node.data.type === "trigger" && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700">Tipo de Trigger</Label>
              <Select
                value={(config.triggerType as string) || "metric"}
                onValueChange={(v) => updateConfig("triggerType", v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Métrica / Evento</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                  <SelectItem value="segment">Segmento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.triggerType === "metric" && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Evento</Label>
                <Select
                  value={(config.metric as string) || ""}
                  onValueChange={(v) => updateConfig("metric", v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placed_order">Pedido Realizado</SelectItem>
                    <SelectItem value="started_checkout">Checkout Iniciado</SelectItem>
                    <SelectItem value="viewed_product">Produto Visualizado</SelectItem>
                    <SelectItem value="added_to_cart">Adicionou ao Carrinho</SelectItem>
                    <SelectItem value="order_fulfilled">Pedido Enviado</SelectItem>
                    <SelectItem value="customer_created">Cliente Criado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {node.data.type === "send_email" && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700">Assunto</Label>
              <Input
                value={(config.subject as string) || ""}
                onChange={(e) => updateConfig("subject", e.target.value)}
                placeholder="Assunto do email"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Preview Text</Label>
              <Input
                value={(config.previewText as string) || ""}
                onChange={(e) => updateConfig("previewText", e.target.value)}
                placeholder="Texto de preview"
                className="mt-1.5"
              />
            </div>
          </>
        )}

        {node.data.type === "send_whatsapp" && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700">Tipo</Label>
              <Select
                value={(config.type as string) || "text"}
                onValueChange={(v) => updateConfig("type", v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.type === "text" ? (
              <div>
                <Label className="text-sm font-medium text-gray-700">Mensagem</Label>
                <Textarea
                  value={(config.message as string) || ""}
                  onChange={(e) => updateConfig("message", e.target.value)}
                  placeholder="Digite a mensagem..."
                  className="mt-1.5"
                  rows={4}
                />
              </div>
            ) : (
              <div>
                <Label className="text-sm font-medium text-gray-700">Nome do Template</Label>
                <Input
                  value={(config.templateName as string) || ""}
                  onChange={(e) => updateConfig("templateName", e.target.value)}
                  placeholder="nome_do_template"
                  className="mt-1.5"
                />
              </div>
            )}
          </>
        )}

        {node.data.type === "send_sms" && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Mensagem</Label>
            <Textarea
              value={(config.message as string) || ""}
              onChange={(e) => updateConfig("message", e.target.value)}
              placeholder="Digite a mensagem SMS..."
              className="mt-1.5"
              rows={3}
              maxLength={160}
            />
            <p className="mt-1 text-xs text-gray-400">
              {((config.message as string) || "").length}/160 caracteres
            </p>
          </div>
        )}

        {node.data.type === "time_delay" && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700">Valor</Label>
              <Input
                type="number"
                min={1}
                value={(config.value as number) || 1}
                onChange={(e) => updateConfig("value", Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700">Unidade</Label>
              <Select
                value={(config.unit as string) || "hours"}
                onValueChange={(v) => updateConfig("unit", v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                  <SelectItem value="days">Dias</SelectItem>
                  <SelectItem value="weeks">Semanas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {node.data.type === "conditional" && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Tipo de Condição</Label>
            <Select
              value={(config.type as string) || "has_placed_order"}
              onValueChange={(v) => updateConfig("type", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="has_placed_order">Fez pedido</SelectItem>
                <SelectItem value="has_opened_email">Abriu email</SelectItem>
                <SelectItem value="property_equals">Propriedade igual a</SelectItem>
                <SelectItem value="total_spent_gt">Total gasto maior que</SelectItem>
                <SelectItem value="in_list">Está na lista</SelectItem>
                <SelectItem value="financial_status_equals">Status financeiro</SelectItem>
                <SelectItem value="added_to_cart">Adicionou ao carrinho</SelectItem>
                <SelectItem value="left_review">Deixou review</SelectItem>
              </SelectContent>
            </Select>
            {(config.type === "property_equals" ||
              config.type === "total_spent_gt" ||
              config.type === "financial_status_equals") && (
              <div className="mt-3">
                <Label className="text-sm font-medium text-gray-700">Valor</Label>
                <Input
                  value={(config.value as string) || ""}
                  onChange={(e) => updateConfig("value", e.target.value)}
                  placeholder="Valor da condição"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        )}

        {node.data.type === "webhook" && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700">URL</Label>
              <Input
                value={(config.url as string) || ""}
                onChange={(e) => updateConfig("url", e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Método</Label>
              <Select
                value={(config.method as string) || "POST"}
                onValueChange={(v) => updateConfig("method", v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button
          onClick={handleApply}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white"
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
}
