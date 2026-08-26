"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, Send, Trash2, Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-context"
import { type DocumentoInstitucional, type NotaInstitucional } from "@/lib/documentos-institucionais"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  documento: DocumentoInstitucional | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onChanged?: () => void
}

export function NotasAtaDialog({ documento, open, onOpenChange, onChanged }: Props) {
  const { user } = useSession()
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)

  const { data: notas, mutate } = useSWR<NotaInstitucional[]>(
    open && documento ? `/api/documentos-institucionais/${documento.id}/notas` : null,
    fetcher,
  )

  async function enviar() {
    if (!documento || !texto.trim()) return
    setEnviando(true)
    try {
      const res = await fetch(`/api/documentos-institucionais/${documento.id}/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota: texto.trim() }),
      })
      if (!res.ok) throw new Error("Falha ao enviar")
      setTexto("")
      mutate()
      onChanged?.()
    } catch (e) {
      console.error(e)
      alert("Erro ao enviar anotação")
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(notaId: number) {
    if (!documento) return
    try {
      const res = await fetch(
        `/api/documentos-institucionais/${documento.id}/notas/${notaId}`,
        { method: "DELETE" },
      )
      if (!res.ok) throw new Error("Falha ao excluir")
      mutate()
      onChanged?.()
    } catch (e) {
      console.error(e)
      alert("Erro ao excluir anotação")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="truncate">{documento?.titulo}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-amber-600">
            <Lock className="h-3.5 w-3.5" />
            Anotações internas — visíveis apenas a coordenadores e gerentes
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[45vh] pr-3">
          {!notas || notas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma anotação ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {notas.map((n) => (
                <div key={n.id} className="rounded-lg border bg-muted/40 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{n.autor_nome || "Gestor"}</span>
                    <div className="flex items-center gap-2">
                      {n.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(n.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      )}
                      {user && n.autor_id === user.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => excluir(n.id)}
                          title="Excluir anotação"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{n.nota}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-end gap-2 border-t pt-3">
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escrever anotação ou comentário interno…"
            rows={2}
            className="flex-1"
          />
          <Button onClick={enviar} disabled={enviando || !texto.trim()} size="icon">
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
