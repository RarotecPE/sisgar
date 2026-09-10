"use client"

import { useState } from "react"
import { uploadArquivo } from "@/lib/upload-blob"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Paperclip, FileText, X } from "lucide-react"
import { PessoasMultiselect } from "@/components/pessoas-multiselect"
import { SetoresMultiselect } from "@/components/setores-multiselect"
import { extensaoAceitaTutorial, type PessoaVinculada } from "@/lib/capacitacao"

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
}

const Obrigatorio = () => <span className="text-destructive">*</span>

export function NovoTutorialDialog({ open, onOpenChange, onCreated }: Props) {
  const [titulo, setTitulo] = useState("")
  const [dataTutorial, setDataTutorial] = useState("")
  const [responsaveis, setResponsaveis] = useState<PessoaVinculada[]>([])
  const [setores, setSetores] = useState<string[]>([])
  const [observacoes, setObservacoes] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)

  function reset() {
    setTitulo("")
    setDataTutorial("")
    setResponsaveis([])
    setSetores([])
    setObservacoes("")
    setArquivo(null)
  }

  async function handleSalvar() {
    if (!titulo.trim()) return alert("Informe o título do tutorial")
    if (responsaveis.length === 0) return alert("Informe o(s) responsável(is) pelo tutorial")
    if (setores.length === 0) return alert("Informe o setor/departamento relativo ao tutorial")
    if (!dataTutorial) return alert("Informe a data do tutorial")
    if (!arquivo) return alert("Anexe o arquivo em PDF ou Word")
    if (!extensaoAceitaTutorial(arquivo.name)) return alert("O anexo deve ser PDF ou Word (.pdf, .doc, .docx)")

    setSalvando(true)
    try {
      const blob = await uploadArquivo(arquivo)
      const res = await fetch("/api/tutoriais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          data_tutorial: dataTutorial,
          responsaveis,
          setores,
          observacoes: observacoes.trim() || null,
          blob_pathname: blob.pathname,
          nome_arquivo: arquivo.name,
          tipo_arquivo: arquivo.type,
          tamanho: arquivo.size,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Falha ao salvar")
      }
      reset()
      onOpenChange(false)
      onCreated()
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Tutorial</DialogTitle>
          <DialogDescription>Registre um tutorial com anexo. Campos com * são obrigatórios.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              Título do Tutorial <Obrigatorio />
            </Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Como emitir uma nota no ERP" />
          </div>

          <div className="space-y-1.5">
            <Label>
              Nome do Responsável pelo Tutorial <Obrigatorio />
            </Label>
            <PessoasMultiselect value={responsaveis} onChange={setResponsaveis} placeholder="Selecionar responsável(is)" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Setor/Departamento relativo ao tutorial <Obrigatorio />
              </Label>
              <SetoresMultiselect value={setores} onChange={setSetores} />
            </div>
            <div className="space-y-1.5">
              <Label>
                Data do Tutorial <Obrigatorio />
              </Label>
              <Input type="date" className="mt-1.5" value={dataTutorial} onChange={(e) => setDataTutorial(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Anexo em PDF ou Word <Obrigatorio />
            </Label>
            {arquivo ? (
              <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                <span className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{arquivo.name}</span>
                </span>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => setArquivo(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} placeholder="Observações adicionais" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
