"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Papa from "papaparse"
import { toast } from "sonner"
import {
  Upload,
  FileSpreadsheet,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ImportCSVProps {
  storeId: string
  onComplete?: () => void
}

interface ListInfo {
  id: string
  name: string
  store_id: string
  description: string | null
  opt_in_type: "single" | "double"
  created_at: string
}

type ContactField =
  | "email"
  | "first_name"
  | "last_name"
  | "phone"
  | "tags"
  | "skip"

const CONTACT_FIELD_LABELS: Record<ContactField, string> = {
  email: "Email (obrigatório)",
  first_name: "Nome",
  last_name: "Sobrenome",
  phone: "Telefone",
  tags: "Tags",
  skip: "Ignorar coluna",
}

const BATCH_SIZE = 50

export function ImportCSV({ storeId, onComplete }: ImportCSVProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [columnMapping, setColumnMapping] = useState<
    Record<number, ContactField>
  >({})
  const [lists, setLists] = useState<ListInfo[]>([])
  const [selectedListId, setSelectedListId] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [importing, setImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setFile(null)
      setHeaders([])
      setRows([])
      setTotalRows(0)
      setColumnMapping({})
      setSelectedListId("")
      setProgress(0)
      setImporting(false)
      setImportComplete(false)
    }
  }, [open])

  const fetchLists = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("lists")
      .select("*")
      .eq("store_id", storeId)
      .order("name")

    if (data) {
      setLists(data as ListInfo[])
    }
  }, [storeId])

  function parseFile(csvFile: File) {
    setFile(csvFile)
    Papa.parse<string[]>(csvFile, {
      complete: (results) => {
        const allRows = results.data.filter(
          (row) => row.length > 1 || (row.length === 1 && row[0] !== "")
        )
        if (allRows.length > 0) {
          setHeaders(allRows[0])
          setRows(allRows.slice(1))
          setTotalRows(allRows.length - 1)

          // Auto-map columns
          const autoMapping: Record<number, ContactField> = {}
          allRows[0].forEach((header, index) => {
            const lower = header.toLowerCase().trim()
            if (lower.includes("email")) autoMapping[index] = "email"
            else if (
              lower.includes("first") ||
              lower.includes("nome") ||
              lower === "name"
            )
              autoMapping[index] = "first_name"
            else if (lower.includes("last") || lower.includes("sobrenome"))
              autoMapping[index] = "last_name"
            else if (
              lower.includes("phone") ||
              lower.includes("telefone") ||
              lower.includes("celular")
            )
              autoMapping[index] = "phone"
            else if (lower.includes("tag")) autoMapping[index] = "tags"
            else autoMapping[index] = "skip"
          })
          setColumnMapping(autoMapping)
          setStep(2)
        }
      },
    })
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      parseFile(droppedFile)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      parseFile(selectedFile)
    }
  }

  const hasEmailMapping = Object.values(columnMapping).includes("email")

  async function handleImport() {
    setImporting(true)
    setProgress(0)

    const supabase = createClient()
    const emailColIndex = Object.entries(columnMapping).find(
      ([, field]) => field === "email"
    )?.[0]

    if (emailColIndex === undefined) return

    let processed = 0
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE)

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchRows = rows.slice(
        batch * BATCH_SIZE,
        (batch + 1) * BATCH_SIZE
      )

      const contacts = batchRows
        .map((row) => {
          const email = row[Number(emailColIndex)]?.trim()
          if (!email) return null

          const contact: Record<string, string> = {
            email,
            store_id: storeId,
          }

          Object.entries(columnMapping).forEach(([colIndex, field]) => {
            if (field !== "skip" && field !== "email") {
              const value = row[Number(colIndex)]?.trim()
              if (value) {
                contact[field] = value
              }
            }
          })

          return contact
        })
        .filter(
          (c): c is Record<string, string> => c !== null && c.email !== ""
        )

      if (contacts.length > 0) {
        const { data: upsertedContacts } = await supabase
          .from("contacts")
          .upsert(
            contacts.map((c) => {
              const row: Record<string, unknown> = {
                store_id: c.store_id,
                email: c.email,
                first_name: c.first_name || null,
                last_name: c.last_name || null,
                phone: c.phone || null,
                subscribed: true,
              }
              if (c.tags) {
                row.tags = c.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
              }
              return row
            }),
            { onConflict: "store_id,email" }
          )
          .select("id, email")

        if (selectedListId && upsertedContacts) {
          const listMembers = upsertedContacts.map(
            (contact: { id: string; email: string }) => ({
              list_id: selectedListId,
              contact_id: contact.id,
              store_id: storeId,
            })
          )

          await supabase
            .from("list_members")
            .upsert(listMembers, {
              onConflict: "list_id,contact_id",
            })
        }
      }

      processed += batchRows.length
      setProgress(Math.round((processed / rows.length) * 100))
    }

    setImporting(false)
    setImportComplete(true)
    toast.success(
      `${rows.length} contatos importados com sucesso!`
    )
    onComplete?.()
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-brand-400 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Arraste um arquivo CSV ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500">
              Formatos aceitos: .csv
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileSpreadsheet size={18} className="text-brand-500" />
              <span className="font-medium">{file?.name}</span>
              <span className="text-gray-400">
                ({totalRows} linhas encontradas)
              </span>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, i) => (
                      <TableHead key={i}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalRows > 5 && (
              <p className="text-xs text-gray-400 text-center">
                Mostrando 5 de {totalRows} linhas
              </p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Mapeie cada coluna do CSV para o campo correspondente do contato.
              O campo Email é obrigatório.
            </p>
            <div className="space-y-3">
              {headers.map((header, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm font-medium text-gray-700 w-40 truncate">
                    {header}
                  </span>
                  <Select
                    value={columnMapping[index] || "skip"}
                    onValueChange={(value) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        [index]: value as ContactField,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTACT_FIELD_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {!hasEmailMapping && (
              <p className="text-sm text-red-500">
                Mapeie pelo menos uma coluna como Email para continuar.
              </p>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selecione uma lista para adicionar os contatos (opcional).
            </p>
            <RadioGroup
              value={selectedListId}
              onValueChange={setSelectedListId}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="no-list" />
                <Label htmlFor="no-list" className="text-sm">
                  Nenhuma lista
                </Label>
              </div>
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem value={list.id} id={list.id} />
                  <Label htmlFor={list.id} className="text-sm">
                    {list.name}
                    {list.description && (
                      <span className="text-gray-400 ml-1">
                        - {list.description}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 py-4">
            {importComplete ? (
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Check size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Importação concluída!
                </h3>
                <p className="text-sm text-gray-500">
                  {totalRows} contatos foram importados com sucesso.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Importando {totalRows} contatos...
                </p>
                <Progress value={progress} />
                <p className="text-sm text-gray-500 text-center">
                  {progress}% concluído
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const stepTitles: Record<number, string> = {
    1: "Upload CSV",
    2: "Preview dos dados",
    3: "Mapear colunas",
    4: "Selecionar lista",
    5: importing ? "Importando..." : "Concluído",
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload size={18} />
        Importar CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{stepTitles[step]}</DialogTitle>
            <DialogDescription>
              Passo {step} de 5 - Importar contatos via arquivo CSV
            </DialogDescription>
          </DialogHeader>

          {renderStep()}

          <DialogFooter>
            {step > 1 && step < 5 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={18} />
                Voltar
              </Button>
            )}
            {step === 2 && (
              <Button onClick={() => setStep(3)}>
                Continuar
                <ArrowRight size={18} />
              </Button>
            )}
            {step === 3 && (
              <Button
                disabled={!hasEmailMapping}
                onClick={() => {
                  fetchLists()
                  setStep(4)
                }}
              >
                Continuar
                <ArrowRight size={18} />
              </Button>
            )}
            {step === 4 && (
              <Button
                onClick={() => {
                  setStep(5)
                  handleImport()
                }}
              >
                Iniciar importação
                <ArrowRight size={18} />
              </Button>
            )}
            {step === 5 && importComplete && (
              <Button onClick={() => setOpen(false)}>Fechar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
