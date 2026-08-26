"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MessagesSquare, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function OuveConfigToggle() {
  const { data, mutate, isLoading } = useSWR<{ ativo: boolean }>("/api/ouve/config", fetcher)
  const [saving, setSaving] = useState(false)
  const ativo = data?.ativo ?? false

  async function toggle(next: boolean) {
    setSaving(true)
    // Atualizacao otimista
    mutate({ ativo: next }, false)
    try {
      const res = await fetch("/api/ouve/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: next }),
      })
      if (!res.ok) throw new Error()
      await mutate()
    } catch {
      await mutate() // reverte para valor real
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MessagesSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">OuveRarotec</CardTitle>
            <CardDescription>Canal de manifestações eletrônicas (NR-01)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Status do canal</p>
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <Badge
                  variant="outline"
                  className={
                    ativo
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }
                >
                  {ativo ? "Ativo" : "Inativo"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Quando ativo, o canal fica disponível no menu e para acompanhamento externo por código.
            </p>
          </div>
          <Switch checked={ativo} disabled={saving || isLoading} onCheckedChange={toggle} />
        </div>
      </CardContent>
    </Card>
  )
}
