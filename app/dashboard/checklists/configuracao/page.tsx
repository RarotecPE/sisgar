"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, ClipboardList, Loader2, MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ChecklistModeloItem } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const formVazio = {
  titulo: "",
  descricao: "",
  modulo: "global",
  ordem: "0",
  obrigatorio: true,
  exige_observacao_negativa: true,
  ativo: true,
}

export default function ConfiguracaoChecklistPage() {
  const [itens, setItens] = useState<ChecklistModeloItem[]>([])
  const [modulos, setModulos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ChecklistModeloItem | null>(null)
  const [form, setForm] = useState(formVazio)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/checklists/modelos")
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Erro ao carregar itens")
      setItens(result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar itens")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])
  useEffect(() => {
    fetch("/api/responsabilidades/opcoes").then((res) => res.json()).then((data) => setModulos((data.modulos || []).map((item: { modulo: string }) => item.modulo))).catch(() => null)
  }, [])

  function novo() {
    setEditing(null)
    setForm(formVazio)
    setDialogOpen(true)
  }

  function editar(item: ChecklistModeloItem) {
    setEditing(item)
    setForm({
      titulo: item.titulo,
      descricao: item.descricao || "",
      modulo: item.modulo || "global",
      ordem: String(item.ordem),
      obrigatorio: item.obrigatorio,
      exige_observacao_negativa: item.exige_observacao_negativa,
      ativo: item.ativo,
    })
    setDialogOpen(true)
  }

  async function salvar() {
    if (!form.titulo.trim()) return toast.error("Informe o texto do item")
    setSaving(true)
    try {
      const response = await fetch("/api/checklists/modelos", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          ...form,
          modulo: form.modulo === "global" ? null : form.modulo,
          ordem: Number(form.ordem),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Erro ao salvar")
      toast.success(editing ? "Item atualizado" : "Item criado")
      setDialogOpen(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function alternar(item: ChecklistModeloItem, ativo: boolean) {
    const response = await fetch("/api/checklists/modelos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, ativo }),
    })
    if (!response.ok) return toast.error("Não foi possível alterar o item")
    toast.success(ativo ? "Item reativado" : "Item desativado")
    carregar()
  }

  async function desativar(item: ChecklistModeloItem) {
    if (!confirm("Desativar este item para as próximas competências? O histórico será preservado.")) return
    const response = await fetch(`/api/checklists/modelos?id=${item.id}`, { method: "DELETE" })
    if (!response.ok) return toast.error("Não foi possível desativar")
    toast.success("Item desativado")
    carregar()
  }

  return <div className="space-y-6 p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><Button variant="ghost" size="sm" asChild className="mb-2 -ml-3"><Link href="/dashboard/checklists"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link></Button><h1 className="text-2xl font-semibold">Modelo do checklist</h1><p className="mt-1 text-sm text-muted-foreground">Crie itens globais ou restritos a um módulo. Mudanças valem apenas para competências ainda não geradas.</p></div><Button onClick={novo}><Plus className="mr-2 h-4 w-4" />Novo item</Button></div>

    <div className="grid gap-4 sm:grid-cols-3">{[
      ["Total", itens.length, "bg-primary/10 text-primary"],
      ["Ativos", itens.filter((item) => item.ativo).length, "bg-emerald-100 text-emerald-700"],
      ["Específicos por módulo", itens.filter((item) => item.ativo && item.modulo).length, "bg-blue-100 text-blue-700"],
    ].map(([label, value, color]) => <Card key={String(label)} className="shadow-sm"><CardContent className="flex items-center gap-4 p-4"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><ClipboardList className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div></CardContent></Card>)}</div>

    <Card className="overflow-hidden shadow-sm"><CardHeader><CardTitle className="text-base">Itens configurados</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/50"><TableHead className="w-20">Ordem</TableHead><TableHead>Atividade</TableHead><TableHead>Aplicação</TableHead><TableHead>Regras</TableHead><TableHead>Status</TableHead><TableHead className="w-12" /></TableRow></TableHeader><TableBody>
      {loading ? <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow> : itens.map((item) => <TableRow key={item.id} className={!item.ativo ? "opacity-60" : ""}><TableCell>{item.ordem}</TableCell><TableCell><p className="font-medium">{item.titulo}</p>{item.descricao && <p className="mt-1 text-xs text-muted-foreground">{item.descricao}</p>}</TableCell><TableCell><Badge variant="outline">{item.modulo || "Todos os módulos"}</Badge></TableCell><TableCell className="text-sm text-muted-foreground">{item.obrigatorio ? "Obrigatório" : "Opcional"}{item.exige_observacao_negativa ? " • justificativa na negativa" : ""}</TableCell><TableCell><Badge className={item.ativo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}>{item.ativo ? "Ativo" : "Inativo"}</Badge></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => editar(item)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>{!item.ativo && <DropdownMenuItem onClick={() => alternar(item, true)}><Power className="mr-2 h-4 w-4" />Reativar</DropdownMenuItem>}<DropdownMenuSeparator />{item.ativo && <DropdownMenuItem className="text-destructive" onClick={() => desativar(item)}><Trash2 className="mr-2 h-4 w-4" />Desativar</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}
    </TableBody></Table></div></CardContent></Card>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle><DialogDescription>Itens globais aparecem em todos os módulos; itens específicos somente no módulo escolhido.</DialogDescription></DialogHeader><div className="grid gap-4 py-2"><div className="space-y-2"><Label>Atividade</Label><Textarea value={form.titulo} onChange={(event) => setForm((old) => ({ ...old, titulo: event.target.value }))} placeholder="Descreva objetivamente o que deverá ser verificado..." /></div><div className="space-y-2"><Label>Orientação complementar</Label><Textarea value={form.descricao} onChange={(event) => setForm((old) => ({ ...old, descricao: event.target.value }))} placeholder="Opcional" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Aplicação</Label><Select value={form.modulo} onValueChange={(value) => setForm((old) => ({ ...old, modulo: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="global">Todos os módulos</SelectItem>{modulos.map((modulo) => <SelectItem key={modulo} value={modulo}>{modulo}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(event) => setForm((old) => ({ ...old, ordem: event.target.value }))} /></div></div><label className="flex items-center gap-3 rounded-lg border p-3"><Checkbox checked={form.obrigatorio} onCheckedChange={(checked) => setForm((old) => ({ ...old, obrigatorio: checked === true }))} /><span className="text-sm">Item obrigatório para conclusão</span></label><label className="flex items-center gap-3 rounded-lg border p-3"><Checkbox checked={form.exige_observacao_negativa} onCheckedChange={(checked) => setForm((old) => ({ ...old, exige_observacao_negativa: checked === true }))} /><span className="text-sm">Exigir observação quando não atendido</span></label></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={salvar} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar item</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
