"use client"

import { useState } from "react"
import useSWR from "swr"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Paperclip, FileText, X } from "lucide-react"
import { LABEL_CATEGORIA, CATEGORIAS_ATA } from "@/lib/documentos-institucionais"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
  // Se definido, a categoria e fixa (documentos institucionais).
  categoriaFixa?: string
  // Se true, e criacao de ata (permite escolher entre as categorias de ata).
  modoAta?: boolean
  categoriaAtaInicial?: string
}

export function NovoDocumentoDialog({
  open,
  onOpenChange,
  onCreated,
  categoriaFixa,
  modoAta,
  categoriaAtaInicial,
}: Props) {
  const [categoria, setCategoria] = useState<string>(
    categoriaFixa || categoriaAtaInicial || "ata_geral",
  )
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [dataDocumento, setDataDocumento] = useState("")
  const [setor, setSetor] = useState("")
  const [usuarioAlvoId, setUsuarioAlvoId] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)

  const catAtual = categoriaFixa || categoria
  const isAtaSetor = catAtual === "ata_setor"
  const isAtaIndividual = catAtual === "ata_individual"

  // Carrega setores/usuarios apenas quando necessario
  const { data: setores } = useSWR<string[]>(open && isAtaSetor ? "/api/setores" : null, fetcher)
  const { data: usuarios } = useSWR<{ id: number; nome: string }[]>(
    open && isAtaIndividual ? "/api/usuarios" : null,
    fetcher,
  )

  function reset() {
    setCategoria(categoriaFixa || categoriaAtaInicial || "ata_geral")
    setTitulo("")
    setDescricao("")
    setDataDocumento("")
    setSetor("")
    setUsuarioAlvoId("")
    setArquivo(null)
  }

  async function handleSalvar() {
    if (!titulo.trim()) {
      alert("Informe o título")
      return
    }
    if (isAtaSetor && !setor) {
      alert("Selecione o setor")
      return
    }
    if (isAtaIndividual && !usuarioAlvoId) {
      alert("Selecione o usuário")
      return
    }
    setSalvando(true)
    try {
      let anexo: { pathname: string; nome: string; tipo: string; tamanho: number } | null = null
      if (arquivo) {
        const blob = await uploadArquivo(arquivo)
        anexo = { pathname: blob.pathname, nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size }
      }

      const usuarioAlvoNome = usuarios?.find((u) => String(u.id) === usuarioAlvoId)?.nome || null

      const res = await fetch("/api/documentos-institucionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria: catAtual,
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          data_documento: dataDocumento || null,
          setor: isAtaSetor ? setor : null,
          usuario_alvo_id: isAtaIndividual ? parseInt(usuarioAlvoId) : null,
          usuario_alvo_nome: isAtaIndividual ? usuarioAlvoNome : null,
          blob_pathname: anexo?.pathname || null,
          nome_arquivo: anexo?.nome || null,
          tipo_arquivo: anexo?.tipo || null,
          tamanho: anexo?.tamanho || null,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {modoAta ? "Nova Ata" : `Novo Documento — ${LABEL_CATEGORIA[catAtual] || ""}`}
          </DialogTitle>
          <DialogDescription>
            {modoAta
              ? "Registre uma ata e defina sua visibilidade."
              : "Anexe um documento institucional para consulta."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {modoAta && (
            <div className="space-y-2">
              <Label>Tipo de ata</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_ATA.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {LABEL_CATEGORIA[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isAtaSetor && (
            <div className="space-y-2">
              <Label>Setor / Departamento</Label>
              <Select value={setor} onValueChange={setSetor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {(setores || []).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isAtaIndividual && (
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={usuarioAlvoId} onValueChange={setUsuarioAlvoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {(usuarios || []).map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Reunião de planejamento" />
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo ou observações"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Data do documento (opcional)</Label>
            <Input type="date" value={dataDocumento} onChange={(e) => setDataDocumento(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Arquivo (PDF ou imagem)
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
                accept="image/*,application/pdf"
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              />
            )}
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
