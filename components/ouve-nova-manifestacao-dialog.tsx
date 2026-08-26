"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Paperclip, X, FileText, Loader2, CheckCircle2, Copy } from "lucide-react"
import {
  NATUREZAS,
  CATEGORIAS,
  TIPOS_VIDA,
  TIPOS_SIGILO,
  rotuloCodigo,
  type TipoSigilo,
} from "@/lib/ouve-rarotec"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  setores: string[]
  onCreated: () => void
}

interface AnexoPreparado {
  pathname: string
  nome: string
  tipo: string
  tamanho: number
}

export function OuveNovaManifestacaoDialog({ open, onOpenChange, setores, onCreated }: Props) {
  const [tipoSigilo, setTipoSigilo] = useState<TipoSigilo>("identificavel_aberta")
  const [natureza, setNatureza] = useState("")
  const [categoria, setCategoria] = useState("")
  const [tipoVida, setTipoVida] = useState("")
  const [setor, setSetor] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [arquivos, setArquivos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [codigoGerado, setCodigoGerado] = useState<string | null>(null)
  const [erro, setErro] = useState("")

  function reset() {
    setTipoSigilo("identificavel_aberta")
    setNatureza("")
    setCategoria("")
    setTipoVida("")
    setSetor("")
    setMensagem("")
    setArquivos([])
    setCodigoGerado(null)
    setErro("")
  }

  function handleClose(v: boolean) {
    if (!v) {
      const criou = !!codigoGerado
      reset()
      onOpenChange(false)
      if (criou) onCreated()
    } else {
      onOpenChange(true)
    }
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    const novos = Array.from(files)
    setArquivos((prev) => [...prev, ...novos].slice(0, 4))
  }

  async function handleSubmit() {
    setErro("")
    if (!natureza || !categoria || !tipoVida || !mensagem.trim()) {
      setErro("Preencha natureza, categoria, tipo e a mensagem.")
      return
    }
    setLoading(true)
    try {
      // Upload dos anexos
      const anexos: AnexoPreparado[] = []
      for (const file of arquivos.slice(0, 4)) {
        const fd = new FormData()
        fd.append("file", file)
        const up = await fetch("/api/ouve/upload", { method: "POST", body: fd })
        if (!up.ok) {
          const e = await up.json().catch(() => ({}))
          throw new Error(e.error || "Falha ao enviar anexo")
        }
        anexos.push(await up.json())
      }

      const res = await fetch("/api/ouve/manifestacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_sigilo: tipoSigilo,
          natureza,
          categoria,
          tipo_vida: tipoVida,
          setor: categoria === "Setorizado" ? setor || null : null,
          mensagem,
          anexos,
        }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || "Erro ao registrar manifestação")
      }
      const data = await res.json()
      setCodigoGerado(data.codigo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {codigoGerado ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Manifestação registrada</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Guarde o código abaixo para acompanhar sua manifestação, inclusive fora do sistema.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 p-3">
              <span className="font-mono text-lg font-semibold">{codigoGerado}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigator.clipboard?.writeText(codigoGerado)}
                title="Copiar código"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{rotuloCodigo(codigoGerado)}</p>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Concluir
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Nova manifestação</DialogTitle>
              <DialogDescription>
                Sua voz ajuda a Rarotec a melhorar. Escolha o nível de identificação e conte o que precisa.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Tipo de sigilo */}
              <div className="space-y-2">
                <Label>Identificação</Label>
                <div className="grid gap-2">
                  {TIPOS_SIGILO.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTipoSigilo(t.value)}
                      className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                        tipoSigilo === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-medium">{t.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{t.descricao}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Natureza</Label>
                  <Select value={natureza} onValueChange={setNatureza}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATUREZAS.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={tipoVida} onValueChange={setTipoVida}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_VIDA.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {categoria === "Setorizado" && (
                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <Select value={setor} onValueChange={setSetor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {setores.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  rows={5}
                  placeholder="Descreva sua manifestação…"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
              </div>

              {/* Anexos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Anexos (até 4 — imagens, vídeos, PDF, Word, Excel)
                </Label>
                {arquivos.length > 0 && (
                  <div className="space-y-1">
                    {arquivos.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{f.name}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => setArquivos((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {arquivos.length < 4 && (
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                )}
              </div>

              {erro && <p className="text-sm text-destructive">{erro}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar manifestação
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
