"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessagesSquare, Loader2, ArrowLeft, EyeOff, Lock, User, Paperclip } from "lucide-react"
import { STATUS_OUVE, rotuloCodigo } from "@/lib/ouve-rarotec"

interface Resultado {
  codigo: string
  tipo_sigilo: string
  natureza: string
  categoria: string
  tipo_vida: string
  mensagem: string
  setor?: string | null
  status: string
  created_at: string
  autor_nome?: string | null
  autor_cargo?: string | null
  respostas: { id: number; autor_nome: string; mensagem: string; created_at: string }[]
  anexos_total: number
}

export default function OuvePublicPage() {
  const [codigo, setCodigo] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [resultado, setResultado] = useState<Resultado | null>(null)

  async function consultar(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    setErro("")
    setResultado(null)
    try {
      const res = await fetch(`/api/ouve/rastreio/${encodeURIComponent(codigo.trim())}`)
      if (res.status === 404) {
        setErro("Código não encontrado. Verifique e tente novamente.")
        return
      }
      if (res.status === 403) {
        setErro("O canal OuveRarotec não está disponível no momento.")
        return
      }
      if (!res.ok) {
        setErro("Não foi possível consultar agora. Tente novamente.")
        return
      }
      setResultado(await res.json())
    } catch {
      setErro("Erro ao conectar com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  const status = resultado?.status ? STATUS_OUVE[resultado.status] : null
  const anonima = resultado?.tipo_sigilo === "anonima"
  const semId = resultado && !resultado.autor_nome

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <MessagesSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold">OuveRarotec</span>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acompanhe seu OuveRarotec</CardTitle>
            <CardDescription>
              Informe o código de acompanhamento gerado ao registrar sua manifestação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={consultar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  placeholder="OUV-XXXXXXXX"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Consultar
              </Button>
            </form>
            {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
          </CardContent>
        </Card>

        {resultado && (
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{rotuloCodigo(resultado.codigo)}</CardTitle>
                {status && (
                  <Badge variant="outline" className={status.badge}>
                    {status.label}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Registrada em {new Date(resultado.created_at).toLocaleDateString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{resultado.natureza}</Badge>
                <Badge variant="secondary">{resultado.categoria}</Badge>
                <Badge variant="secondary">{resultado.tipo_vida}</Badge>
                {resultado.setor && <Badge variant="secondary">{resultado.setor}</Badge>}
              </div>

              {/* Identificacao */}
              <div className="rounded-lg border p-3 text-sm">
                {anonima ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="h-4 w-4" /> Manifestação anônima
                  </span>
                ) : semId ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4" /> Identificação sigilosa
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{resultado.autor_nome}</span>
                    {resultado.autor_cargo && (
                      <span className="text-muted-foreground">— {resultado.autor_cargo}</span>
                    )}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Mensagem</p>
                <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">
                  {resultado.mensagem}
                </p>
              </div>

              {resultado.anexos_total > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Paperclip className="h-3.5 w-3.5" /> {resultado.anexos_total} anexo(s) — disponíveis
                  internamente
                </p>
              )}

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Tratativas</p>
                {resultado.respostas.length > 0 ? (
                  resultado.respostas.map((r) => (
                    <div key={r.id} className="rounded-lg border p-3 text-sm">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium">{r.autor_nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-muted-foreground">{r.mensagem}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ainda não há tratativas registradas.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
