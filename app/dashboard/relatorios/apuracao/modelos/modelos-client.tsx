"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { MunicipioClientesSelect } from "@/components/municipio-clientes-select"
import { ItensServicoEditor } from "@/components/itens-servico-editor"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Pencil, Trash2, Layers, Loader2, FileCog, CalendarClock } from "lucide-react"
import {
  MODULOS_SISTEMAS,
  formatBRL,
  textoPadraoSugerido,
  type ApuracaoModelo,
  type ApuracaoItem,
  type ApuracaoItemServico,
  type ApuracaoModoValor,
} from "@/lib/apuracao"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const emptyForm = {
  municipio: "",
  nome: "",
  sigla_orgao: "",
  numero_contrato_texto: "",
  destinatario_nome: "",
  destinatario_cargo: "",
  modo_valor: "global" as ApuracaoModoValor,
  valor_global: "",
  texto_padrao: "",
  observacoes_padrao: "",
  modalidade_remoto: true,
  modalidade_presencial: false,
  ultimo_numero: "0",
  emissao_automatica: false,
}

export function ModelosClient() {
  const { data: modelos, mutate, isLoading } = useSWR<ApuracaoModelo[]>(
    "/api/apuracao/modelos",
    fetcher,
  )
  const { data: clientes } = useSWR<any[]>("/api/clientes", fetcher)

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [clienteIds, setClienteIds] = useState<number[]>([])
  const [itens, setItens] = useState<ApuracaoItem[]>([])
  const [itensServico, setItensServico] = useState<ApuracaoItemServico[]>([])
  const [saving, setSaving] = useState(false)
  const [excluirId, setExcluirId] = useState<number | null>(null)

  const clientesArr = Array.isArray(clientes) ? clientes : []
  const modelosArr = Array.isArray(modelos) ? modelos : []

  function abrirNovo() {
    setEditId(null)
    setForm({ ...emptyForm })
    setClienteIds([])
    setItens([])
    setItensServico([])
    setOpen(true)
  }

  function abrirEdicao(m: ApuracaoModelo) {
    setEditId(m.id)
    const ids =
      Array.isArray(m.cliente_ids) && m.cliente_ids.length > 0 ? m.cliente_ids : [m.cliente_id]
    setClienteIds(ids)
    setForm({
      municipio: m.municipio || "",
      nome: m.nome || "",
      sigla_orgao: m.sigla_orgao || "",
      numero_contrato_texto: m.numero_contrato_texto || "",
      destinatario_nome: m.destinatario_nome || "",
      destinatario_cargo: m.destinatario_cargo || "",
      modo_valor: m.modo_valor || "global",
      valor_global: m.valor_global != null ? String(m.valor_global) : "",
      texto_padrao: m.texto_padrao || "",
      observacoes_padrao: m.observacoes_padrao || "",
      modalidade_remoto: m.modalidade_remoto,
      modalidade_presencial: m.modalidade_presencial,
      ultimo_numero: String(m.ultimo_numero ?? 0),
      emissao_automatica: m.emissao_automatica ?? false,
    })
    setItens(Array.isArray(m.itens) ? m.itens : [])
    setItensServico(Array.isArray(m.itens_servico) ? m.itens_servico : [])
    setOpen(true)
  }

  function toggleItem(nome: string) {
    setItens((prev) =>
      prev.some((i) => i.nome === nome)
        ? prev.filter((i) => i.nome !== nome)
        : [...prev, { nome, valor: 0 }],
    )
  }

  function setItemValor(nome: string, valor: string) {
    setItens((prev) =>
      prev.map((i) => (i.nome === nome ? { ...i, valor: Number(valor) || 0 } : i)),
    )
  }

  function preencherTextoPadrao() {
    const nomes = clienteIds
      .map((id) => clientesArr.find((c) => c.id === id)?.nome_fantasia)
      .filter(Boolean) as string[]
    const nomeCliente = nomes.length ? nomes.join(", ") : form.municipio || "cliente"
    setForm((f) => ({ ...f, texto_padrao: textoPadraoSugerido(nomeCliente, itens.map((i) => i.nome)) }))
  }

  async function salvar() {
    if (clienteIds.length === 0 || !form.nome) {
      alert("Selecione o municipio, ao menos um cliente e informe o nome do modelo.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        cliente_ids: clienteIds,
        cliente_id: clienteIds[0],
        municipio: form.municipio || null,
        valor_global: form.valor_global ? Number(form.valor_global) : null,
        ultimo_numero: Number(form.ultimo_numero) || 0,
        itens,
        itens_servico: itensServico,
      }
      const url = editId ? `/api/apuracao/modelos/${editId}` : "/api/apuracao/modelos"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Falha ao salvar")
      setOpen(false)
      mutate()
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar o modelo.")
    } finally {
      setSaving(false)
    }
  }

  async function excluir() {
    if (!excluirId) return
    await fetch(`/api/apuracao/modelos/${excluirId}`, { method: "DELETE" })
    setExcluirId(null)
    mutate()
  }

  // Liga/desliga a emissao automatica direto do card (atualizacao otimista)
  async function toggleEmissaoAutomatica(m: ApuracaoModelo, valor: boolean) {
    mutate(
      (atual) =>
        (atual || []).map((x) => (x.id === m.id ? { ...x, emissao_automatica: valor } : x)),
      { revalidate: false },
    )
    try {
      await fetch(`/api/apuracao/modelos/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emissao_automatica: valor }),
      })
    } catch (e) {
      console.error(e)
    } finally {
      mutate()
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <FileCog className="h-6 w-6 text-primary" />
            Modelos de Apuracao
          </h1>
          <p className="text-sm text-muted-foreground">
            Padroes semi-automaticos por contrato: gestor, modulos, valores, numeracao e texto padrao.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-1 h-4 w-4" />
          Novo modelo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...
        </div>
      ) : modelosArr.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Layers className="mx-auto mb-3 h-10 w-10 opacity-40" />
            Nenhum modelo cadastrado. Crie um modelo por contrato (ex.: Paulista - Contabilidade).
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modelosArr.map((m) => (
            <Card key={m.id} className={m.ativo ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{m.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {m.municipio ? `${m.municipio} — ` : ""}
                      {(() => {
                        const ids =
                          Array.isArray(m.cliente_ids) && m.cliente_ids.length > 0
                            ? m.cliente_ids
                            : [m.cliente_id]
                        const nomes = ids
                          .map((id) => clientesArr.find((c) => c.id === id)?.nome_fantasia)
                          .filter(Boolean)
                        return nomes.length ? nomes.join(", ") : m.cliente_nome
                      })()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => abrirEdicao(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setExcluirId(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-1">
                  {(m.itens || []).map((i) => (
                    <Badge key={i.nome} variant="secondary" className="font-normal">
                      {i.nome}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                  <span>
                    Valor:{" "}
                    <strong className="text-foreground">
                      {m.modo_valor === "global"
                        ? formatBRL(m.valor_global)
                        : m.modo_valor === "por_item"
                          ? `${(m.itens_servico || []).length} itens`
                          : "por modulo"}
                    </strong>
                  </span>
                  <span>
                    Ultimo nº: <strong className="text-foreground">{m.ultimo_numero}</strong>
                  </span>
                  {m.numero_contrato_texto && <span>Contrato: {m.numero_contrato_texto}</span>}
                </div>
                {m.destinatario_nome && (
                  <p className="text-muted-foreground">
                    Gestor: <span className="text-foreground">{m.destinatario_nome}</span>
                    {m.destinatario_cargo ? ` — ${m.destinatario_cargo}` : ""}
                  </p>
                )}
                <div
                  className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                    m.emissao_automatica
                      ? "border-emerald-500/50 bg-emerald-50"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <CalendarClock
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        m.emissao_automatica ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    />
                    <div className="leading-tight">
                      <p
                        className={`text-sm font-medium ${
                          m.emissao_automatica ? "text-emerald-700" : "text-foreground"
                        }`}
                      >
                        Emissao automatica
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.emissao_automatica
                          ? "Gera no 1º dia util, competencia anterior."
                          : "Desligada. Emissao apenas manual."}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!!m.emissao_automatica}
                    onCheckedChange={(v) => toggleEmissaoAutomatica(m, v)}
                    aria-label="Alternar emissao automatica"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de criacao/edicao */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar modelo" : "Novo modelo de apuracao"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Municipio e clientes atendidos</Label>
                <MunicipioClientesSelect
                  clientes={clientesArr}
                  value={clienteIds}
                  municipio={form.municipio}
                  onChange={(ids, municipio) => {
                    setClienteIds(ids)
                    setForm((f) => ({ ...f, municipio }))
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nome do modelo</Label>
                <Input
                  placeholder="Ex.: Paulista - Contabilidade"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sigla / Orgao</Label>
                <Input
                  placeholder="Ex.: PMP - Secretaria de Financas"
                  value={form.sigla_orgao}
                  onChange={(e) => setForm((f) => ({ ...f, sigla_orgao: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nº do contrato</Label>
                <Input
                  placeholder="Ex.: 023/2024"
                  value={form.numero_contrato_texto}
                  onChange={(e) => setForm((f) => ({ ...f, numero_contrato_texto: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gestor do contrato</Label>
                <Input
                  placeholder="Nome do gestor"
                  value={form.destinatario_nome}
                  onChange={(e) => setForm((f) => ({ ...f, destinatario_nome: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo do gestor</Label>
                <Input
                  placeholder="Ex.: Secretario de Financas"
                  value={form.destinatario_cargo}
                  onChange={(e) => setForm((f) => ({ ...f, destinatario_cargo: e.target.value }))}
                />
              </div>
            </div>

            {/* Modulos aferidos */}
            <div className="space-y-2">
              <Label>Modulos aferidos</Label>
              <div className="flex flex-wrap gap-1.5 rounded-lg border p-3">
                {MODULOS_SISTEMAS.map((mod) => {
                  const ativo = itens.some((i) => i.nome === mod)
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleItem(mod)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        ativo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {mod}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Modo de valor */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Modo de valor</Label>
                <Select
                  value={form.modo_valor}
                  onValueChange={(v: ApuracaoModoValor) =>
                    setForm((f) => ({ ...f, modo_valor: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Valor global</SelectItem>
                    <SelectItem value="por_modulo">Valor por modulo</SelectItem>
                    <SelectItem value="por_item">Valor por item de servico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.modo_valor === "global" ? (
                <div className="space-y-1.5">
                  <Label>Valor global (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={form.valor_global}
                    onChange={(e) => setForm((f) => ({ ...f, valor_global: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Numeracao inicial (ultimo nº)</Label>
                  <Input
                    type="number"
                    value={form.ultimo_numero}
                    onChange={(e) => setForm((f) => ({ ...f, ultimo_numero: e.target.value }))}
                  />
                </div>
              )}
            </div>

            {form.modo_valor === "por_modulo" && itens.length > 0 && (
              <div className="space-y-2 rounded-lg border p-3">
                <Label className="text-xs text-muted-foreground">Valor por modulo (R$)</Label>
                {itens.map((i) => (
                  <div key={i.nome} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{i.nome}</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-32"
                      value={i.valor ?? 0}
                      onChange={(e) => setItemValor(i.nome, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {form.modo_valor === "por_item" && (
              <ItensServicoEditor itens={itensServico} onChange={setItensServico} />
            )}

            {form.modo_valor === "global" && (
              <div className="space-y-1.5">
                <Label>Numeracao inicial (ultimo nº emitido)</Label>
                <Input
                  type="number"
                  className="w-40"
                  value={form.ultimo_numero}
                  onChange={(e) => setForm((f) => ({ ...f, ultimo_numero: e.target.value }))}
                />
              </div>
            )}

            {/* Texto padrao */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Texto padrao</Label>
                <Button type="button" size="sm" variant="ghost" onClick={preencherTextoPadrao}>
                  Gerar sugestao
                </Button>
              </div>
              <Textarea
                rows={4}
                placeholder="Texto que sera reaproveitado a cada emissao..."
                value={form.texto_padrao}
                onChange={(e) => setForm((f) => ({ ...f, texto_padrao: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Observacoes padrao</Label>
              <Textarea
                rows={2}
                value={form.observacoes_padrao}
                onChange={(e) => setForm((f) => ({ ...f, observacoes_padrao: e.target.value }))}
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.modalidade_remoto}
                  onChange={(e) => setForm((f) => ({ ...f, modalidade_remoto: e.target.checked }))}
                />
                Atendimento remoto
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.modalidade_presencial}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, modalidade_presencial: e.target.checked }))
                  }
                />
                Atendimento presencial
              </label>
            </div>

            {/* Emissao automatica */}
            <div
              className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                form.emissao_automatica
                  ? "border-emerald-500/50 bg-emerald-50"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-2">
                <CalendarClock
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    form.emissao_automatica ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">Emissao automatica</p>
                  <p className="text-xs text-muted-foreground">
                    No primeiro dia util de cada mes, gera o relatorio da competencia anterior
                    anexando as visitas do periodo.
                  </p>
                </div>
              </div>
              <Switch
                checked={form.emissao_automatica}
                onCheckedChange={(v) => setForm((f) => ({ ...f, emissao_automatica: v }))}
                aria-label="Alternar emissao automatica"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {editId ? "Salvar alteracoes" : "Criar modelo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={excluirId !== null} onOpenChange={(o) => !o && setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              Os relatorios ja emitidos com este modelo serao mantidos, mas perderao o vinculo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
