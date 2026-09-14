"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || "Erro ao carregar alertas")
  return data
}

const checklistAlertsSWRConfig = {
  refreshInterval: 60000,
  dedupingInterval: 30000,
  revalidateOnFocus: false,
  shouldRetryOnError: false,
}

interface AlertasResponse {
  gestor: boolean
  resumo: { vencidas: number }
}

// Faixa fixa e persistente exibida em TODAS as telas do dashboard sempre que houver
// checklists vencidos (que ultrapassaram o mês). Não bloqueia o trabalho: fica ancorada
// no canto inferior e pode ser recolhida temporariamente, reaparecendo a cada recarga.
export function ChecklistPendenciaBanner() {
  const [recolhido, setRecolhido] = useState(false)
  const { data } = useSWR<AlertasResponse>("/api/checklists/alertas", fetcher, checklistAlertsSWRConfig)

  const vencidas = data?.resumo?.vencidas ?? 0
  if (vencidas === 0 || recolhido) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-600 p-4 text-white shadow-lg">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {vencidas} checklist{vencidas > 1 ? "s" : ""} vencido{vencidas > 1 ? "s" : ""}
          </p>
          <p className="mt-0.5 text-xs text-red-50">
            {data?.gestor
              ? "Existem checklists que passaram do mês com itens obrigatórios pendentes."
              : "Você tem checklists de meses anteriores com itens obrigatórios pendentes."}
          </p>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="mt-2 h-8 bg-white text-red-700 hover:bg-red-50"
          >
            <Link href="/dashboard/checklists">Resolver agora</Link>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setRecolhido(true)}
          className="shrink-0 rounded-md p-1 text-red-100 transition-colors hover:bg-red-500 hover:text-white"
          aria-label="Recolher aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
