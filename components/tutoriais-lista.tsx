"use client"

import { useState } from "react"
import { type Tutorial, labelPessoa } from "@/lib/capacitacao"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Trash2, Loader2, Download, Calendar, FileText } from "lucide-react"
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

// Data "date-only" formatada sem `new Date` (evita deslocar o dia pelo fuso UTC-3).
function formatarData(valor?: string | null): string {
  if (!valor) return "-"
  const iso = String(valor).slice(0, 10)
  const [ano, mes, dia] = iso.split("-")
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : String(valor)
}

interface Props {
  tutoriais?: Tutorial[]
  isLoading: boolean
  userIsGestor: boolean
  onChanged: () => void
}

export function TutoriaisLista({ tutoriais, isLoading, userIsGestor, onChanged }: Props) {
  const [excluirId, setExcluirId] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function handleExcluir() {
    if (excluirId == null) return
    setExcluindo(true)
    try {
      const res = await fetch(`/api/tutoriais/${excluirId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao excluir")
      setExcluirId(null)
      onChanged()
    } catch (e) {
      console.error(e)
      alert("Erro ao excluir tutorial")
    } finally {
      setExcluindo(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full bg-muted" />
        ))}
      </div>
    )
  }

  if (!tutoriais || tutoriais.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Nenhum tutorial cadastrado.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {tutoriais.map((t) => (
          <div key={t.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="flex items-center gap-2 font-medium text-balance">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {t.titulo}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatarData(t.data_tutorial)}
                  </span>
                  {t.responsaveis?.length > 0 && (
                    <span>Responsável(is): {t.responsaveis.map(labelPessoa).join(", ")}</span>
                  )}
                  {t.nome_arquivo && <span className="truncate">{t.nome_arquivo}</span>}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.setores?.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>

                {t.observacoes && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Obs.: </span>
                    {t.observacoes}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button asChild size="icon" variant="ghost" title="Baixar anexo">
                  <a
                    href={`/api/file?pathname=${encodeURIComponent(t.blob_pathname)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Baixar anexo</span>
                  </a>
                </Button>
                {userIsGestor && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    title="Excluir"
                    onClick={() => setExcluirId(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={excluirId != null} onOpenChange={(o) => !o && setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tutorial?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} disabled={excluindo}>
              {excluindo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
