"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { type DocumentoInstitucional } from "@/lib/documentos-institucionais"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Trash2, FileText, MessageSquare, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Props {
  documentos?: DocumentoInstitucional[]
  isLoading: boolean
  userIsGestor: boolean
  onChanged: () => void
  emptyLabel: string
  // Ao clicar em "notas" (apenas gestor). Se ausente, esconde o botao.
  onAbrirNotas?: (doc: DocumentoInstitucional) => void
  // Mostra metadados extras (setor / usuario alvo)
  mostrarSetor?: boolean
  mostrarUsuarioAlvo?: boolean
}

export function DocumentosLista({
  documentos,
  isLoading,
  userIsGestor,
  onChanged,
  emptyLabel,
  onAbrirNotas,
  mostrarSetor,
  mostrarUsuarioAlvo,
}: Props) {
  const [excluirId, setExcluirId] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function handleExcluir() {
    if (excluirId == null) return
    setExcluindo(true)
    try {
      const res = await fetch(`/api/documentos-institucionais/${excluirId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao excluir")
      setExcluirId(null)
      onChanged()
    } catch (e) {
      console.error(e)
      alert("Erro ao excluir documento")
    } finally {
      setExcluindo(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full bg-muted" />
        ))}
      </div>
    )
  }

  if (!documentos || documentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <FileText className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {documentos.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{doc.titulo}</p>
                {doc.descricao && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{doc.descricao}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {doc.data_documento && (
                    <span>{format(new Date(doc.data_documento), "dd/MM/yyyy", { locale: ptBR })}</span>
                  )}
                  {mostrarSetor && doc.setor && (
                    <Badge variant="secondary" className="font-normal">{doc.setor}</Badge>
                  )}
                  {mostrarUsuarioAlvo && doc.usuario_alvo_nome && (
                    <Badge variant="secondary" className="font-normal">{doc.usuario_alvo_nome}</Badge>
                  )}
                  {doc.created_by_nome && <span>por {doc.created_by_nome}</span>}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {userIsGestor && onAbrirNotas && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  onClick={() => onAbrirNotas(doc)}
                  title="Anotações internas dos gestores"
                >
                  <MessageSquare className="h-4 w-4" />
                  {typeof doc.total_notas === "number" && doc.total_notas > 0 && (
                    <span className="text-xs">{doc.total_notas}</span>
                  )}
                </Button>
              )}
              {doc.blob_pathname ? (
                <Button asChild size="icon" variant="ghost" title="Baixar">
                  <a
                    href={`/api/file?pathname=${encodeURIComponent(doc.blob_pathname)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Baixar</span>
                  </a>
                </Button>
              ) : (
                <span className="px-2 text-xs text-muted-foreground">Sem arquivo</span>
              )}
              {userIsGestor && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setExcluirId(doc.id)}
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={excluirId != null} onOpenChange={(o) => !o && setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleExcluir()
              }}
              disabled={excluindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
