"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Ban,
  Building2,
  CircleAlert,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundCog,
} from "lucide-react"
import { toast } from "sonner"
import { ResponsabilidadeModulo } from "@/lib/types"
import { ClienteCombobox } from "@/components/cliente-combobox"
import { ConciliacaoResponsaveisDialog } from "@/components/conciliacao-responsaveis-dialog"
import { Autocomplete } from "@/components/ui/autocomplete"
import { ExportButton } from "@/components/export-button"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface ClienteOpcao { id: number; nome: string; cidade: string | null; estado: string | null }
interface TecnicoOpcao { id: number; nome: string; email: string | null }
interface OrgaoOpcao { id: number; cliente_id: number; nome: string; tipo: string }
interface ModuloOpcao { modulo: string }
interface ClienteModulo { cliente_id: number; modulo: string }
interface MunicipioOpcao { cidade: string; estado: string | null }
interface Opcoes {
  clientes: ClienteOpcao[]
  tecnicos: TecnicoOpcao[]
  modulos: ModuloOpcao[]
  orgaos: OrgaoOpcao[]
  clientes_modulos: ClienteModulo[]
  municipios: MunicipioOpcao[]
}

const opcoesVazias: Opcoes = { clientes: [], tecnicos: [], modulos: [], orgaos: [], clientes_modulos: [], municipios: [] }

export default function ResponsabilidadesPage() {
  const [dados, setDados] = useState<ResponsabilidadeModulo[]>([])
  const [opcoes, setOpcoes] = useState<Opcoes>(opcoesVazias)
  const [gestor, setGestor] = useState(false)
  const [, setCobertura] = useState({ total_modulos: 0, modulos_atribuidos: 0, modulos_sem_responsavel: 0 })
  const [importacao, setImportacao] = useState({ importados: 0, pendentes: 0, ignorados: 0, nao_aplicavel: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [conciliacaoOpen, setConciliacaoOpen] = useState(false)
  const [editing, setEditing] = useState<ResponsabilidadeModulo | null>(null)
  const [criandoExcecao, setCriandoExcecao] = useState(false)
  const [busca, setBusca] = useState("")
  const [municipioFiltro, setMunicipioFiltro] = useState("all")
  const [clienteFiltro, setClienteFiltro] = useState("all")
  const [moduloFiltro, setModuloFiltro] = useState("all")
  const [tecnicoFiltro, setTecnicoFiltro] = useState("all")
  const [tipoFiltro, setTipoFiltro] = useState("all")
  const [form, setForm] = useState({
    cliente_id: "",
    modulo: "",
    tecnico_rarotec_id: "",
    orgao_id: "none",
    observacoes: "",
  })

  const carregarOpcoes = useCallback(async () => {
    const response = await fetch("/api/responsabilidades/opcoes")
    if (!response.ok) throw new Error("Não foi possível carregar os cadastros")
    setOpcoes(await response.json())
  }, [])

  const carregarDados = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (busca.trim()) params.set("busca", busca.trim())
      if (municipioFiltro !== "all") params.set("municipio", municipioFiltro)
      if (clienteFiltro !== "all") params.set("cliente_id", clienteFiltro)
      if (moduloFiltro !== "all") params.set("modulo", moduloFiltro)
      if (tecnicoFiltro !== "all") params.set("tecnico_id", tecnicoFiltro)
      if (tipoFiltro !== "all") params.set("tipo", tipoFiltro)
      const response = await fetch(`/api/responsabilidades?${params.toString()}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Erro ao carregar responsáveis")
      setDados(result.data || [])
      setGestor(Boolean(result.gestor))
      if (result.cobertura) setCobertura(result.cobertura)
      if (result.importacao) setImportacao(result.importacao)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar responsáveis")
    } finally {
      setLoading(false)
    }
  }, [busca, municipioFiltro, clienteFiltro, moduloFiltro, tecnicoFiltro, tipoFiltro])

  useEffect(() => {
    carregarOpcoes().catch((error) => toast.error(error.message))
  }, [carregarOpcoes])

  useEffect(() => {
    const timer = setTimeout(carregarDados, 250)
    return () => clearTimeout(timer)
  }, [carregarDados])

  const modulosDoCliente = useMemo(() => {
    if (!form.cliente_id) return opcoes.modulos.map((item) => item.modulo)
    const encontrados = opcoes.clientes_modulos
      .filter((item) => String(item.cliente_id) === form.cliente_id)
      .map((item) => item.modulo)
    return encontrados.length ? [...new Set(encontrados)].sort() : opcoes.modulos.map((item) => item.modulo)
  }, [form.cliente_id, opcoes])

  const orgaosDoCliente = useMemo(
    () => opcoes.orgaos.filter((orgao) => String(orgao.cliente_id) === form.cliente_id),
    [form.cliente_id, opcoes.orgaos],
  )

  const principais = dados.filter((item) => item.tipo_atribuicao === "principal").length
  const excecoes = dados.length - principais

  function abrirNovo() {
    setEditing(null)
    setCriandoExcecao(false)
    setForm({ cliente_id: "", modulo: "", tecnico_rarotec_id: "", orgao_id: "none", observacoes: "" })
    setDialogOpen(true)
  }

  function abrirEdicao(item: ResponsabilidadeModulo) {
    setEditing(item)
    setCriandoExcecao(false)
    setForm({
      cliente_id: String(item.cliente_id),
      modulo: item.modulo,
      tecnico_rarotec_id: String(item.tecnico_rarotec_id),
      orgao_id: item.orgao_id ? String(item.orgao_id) : "none",
      observacoes: item.observacoes || "",
    })
    setDialogOpen(true)
  }

  function abrirExcecao(item: ResponsabilidadeModulo) {
    setEditing(null)
    setCriandoExcecao(true)
    setForm({
      cliente_id: String(item.cliente_id),
      modulo: item.modulo,
      tecnico_rarotec_id: String(item.tecnico_rarotec_id),
      orgao_id: "",
      observacoes: "Exceção à responsabilidade principal",
    })
    setDialogOpen(true)
  }

  async function salvar() {
    if (!form.cliente_id || !form.modulo || !form.tecnico_rarotec_id) {
      toast.error("Selecione cliente, módulo e responsável")
      return
    }
    if (criandoExcecao && !form.orgao_id) {
      toast.error("Selecione o órgão que terá o responsável excepcional")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/responsabilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: Number(form.cliente_id),
          modulo: form.modulo,
          tecnico_rarotec_id: Number(form.tecnico_rarotec_id),
          orgao_id: form.orgao_id === "none" ? null : Number(form.orgao_id),
          observacoes: form.observacoes,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar")
      toast.success(editing ? "Responsável atualizado" : "Responsável atribuído")
      setDialogOpen(false)
      await carregarDados()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function remover(item: ResponsabilidadeModulo) {
    if (!confirm(`Remover ${item.tecnico_nome} da responsabilidade por ${item.modulo}?`)) return
    const response = await fetch(`/api/responsabilidades?id=${item.id}`, { method: "DELETE" })
    const result = await response.json()
    if (!response.ok) return toast.error(result.error || "Não foi possível remover")
    toast.success("Atribuição removida")
    carregarDados()
  }

  async function alternarNaoAplicavel(item: ResponsabilidadeModulo) {
    const novoValor = !item.nao_aplicavel
    const response = await fetch("/api/responsabilidades", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, nao_aplicavel: novoValor }),
    })
    const result = await response.json()
    if (!response.ok) return toast.error(result.error || "Não foi possível atualizar")
    toast.success(novoValor ? `${item.modulo} marcado como não se aplica` : `${item.modulo} voltou a se aplicar`)
    carregarDados()
  }

  const exportData = dados.map((item) => ({
    municipio: item.vinculado_municipio
      ? [item.cliente_cidade, item.cliente_estado].filter(Boolean).join("/") || "-"
      : "Consórcio / entidade regional",
    cliente: item.cliente_nome,
    modulo: item.modulo,
    abrangencia: item.orgao_nome || `Principal (${item.orgaos_herdados} órgão(s) herdados)`,
    responsavel: item.tecnico_nome,
    email: item.tecnico_email || "-",
    tipo: item.tipo_atribuicao === "principal" ? "Principal" : "Exceção",
    nao_aplicavel: item.nao_aplicavel ? "Sim" : "Não",
  }))

  function exportar(tipo: "excel" | "pdf") {
    const config = {
      filename: "responsaveis-por-cliente-e-modulo",
      title: "Responsáveis por Cliente e Módulo",
      columns: [
        { header: "Município", key: "municipio", width: 22 },
        { header: "Entidade / Cliente", key: "cliente", width: 32 },
        { header: "Módulo", key: "modulo", width: 30 },
        { header: "Abrangência", key: "abrangencia", width: 34 },
        { header: "Responsável", key: "responsavel", width: 24 },
        { header: "E-mail", key: "email", width: 30 },
        { header: "Tipo", key: "tipo", width: 12 },
      ],
      data: exportData,
    }
    if (tipo === "excel") exportToExcel(config)
    else exportToPDF(config)
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Responsáveis por Módulo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina o responsável principal do município e registre somente as exceções por órgão.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            onExportExcel={() => exportar("excel")}
            onExportPDF={() => exportar("pdf")}
            disabled={!dados.length}
          />
          {gestor && <Button onClick={abrirNovo}><Plus className="mr-2 h-4 w-4" />Nova atribuição</Button>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Atribuições", value: dados.length, icon: UserRoundCog, color: "text-primary bg-primary/10" },
          { label: "Responsáveis principais", value: principais, icon: ShieldCheck, color: "text-emerald-700 bg-emerald-100" },
          { label: "Exceções por órgão", value: excecoes, icon: Building2, color: "text-blue-700 bg-blue-100" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm"><CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {gestor && (importacao.pendentes > 0 || importacao.ignorados > 0) && (
        <Card className="border-amber-200 bg-amber-50/70 shadow-sm">
          <CardContent className="flex flex-wrap items-start gap-3 p-4 text-amber-900">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">A carga inicial possui registros que precisam de conferência</p>
              <p className="mt-1 text-sm">
                {importacao.pendentes + importacao.ignorados} registro(s) precisam de conferência.
              </p>
            </div>
            {(importacao.pendentes > 0 || importacao.ignorados > 0) && (
              <Button
                size="sm"
                className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
                onClick={() => setConciliacaoOpen(true)}
              >
                Conciliar registros
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-4"><CardTitle className="text-base">Filtros do relatório</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por município, cliente, módulo ou responsável..." className="pl-9" /></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="flex flex-col gap-1.5"><Label className="text-xs text-muted-foreground">Município</Label><Select value={municipioFiltro} onValueChange={setMunicipioFiltro}><SelectTrigger><SelectValue placeholder="Município" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os municípios</SelectItem>{opcoes.municipios.map((item) => <SelectItem key={item.cidade} value={item.cidade}>{item.cidade}{item.estado ? ` - ${item.estado}` : ""}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label className="text-xs text-muted-foreground">Cliente / Entidade</Label><ClienteCombobox clientes={opcoes.clientes.map((item) => ({ id: item.id, nome_fantasia: item.nome }))} value={clienteFiltro} onChange={setClienteFiltro} allLabel="Todos os clientes" /></div>
            <div className="flex flex-col gap-1.5"><Label className="text-xs text-muted-foreground">Módulo</Label><Select value={moduloFiltro} onValueChange={setModuloFiltro}><SelectTrigger><SelectValue placeholder="Módulo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os módulos</SelectItem>{opcoes.modulos.map((item) => <SelectItem key={item.modulo} value={item.modulo}>{item.modulo}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label className="text-xs text-muted-foreground">Responsável</Label><Select value={tecnicoFiltro} onValueChange={setTecnicoFiltro}><SelectTrigger><SelectValue placeholder="Responsável" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os responsáveis</SelectItem>{opcoes.tecnicos.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.nome}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label className="text-xs text-muted-foreground">Abrangência</Label><Select value={tipoFiltro} onValueChange={setTipoFiltro}><SelectTrigger><SelectValue placeholder="Abrangência" /></SelectTrigger><SelectContent><SelectItem value="all">Principal e exceções</SelectItem><SelectItem value="principal">Somente principais</SelectItem><SelectItem value="excecao">Somente exceções</SelectItem></SelectContent></Select></div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader><CardTitle className="text-base">Mapa de responsabilidades ({dados.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/50">
            <TableHead>Município / Entidade</TableHead><TableHead>Módulo</TableHead><TableHead>Abrangência</TableHead><TableHead>Responsável</TableHead><TableHead>Tipo</TableHead>{gestor && <TableHead className="w-12" />}
          </TableRow></TableHeader><TableBody>
            {loading ? <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow> : !dados.length ? <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground">Nenhuma atribuição encontrada.</TableCell></TableRow> : dados.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.vinculado_municipio && item.cliente_cidade ? (
                    <>
                      <p className="font-medium">{[item.cliente_cidade, item.cliente_estado].filter(Boolean).join(" - ")}</p>
                      <p className="text-xs text-muted-foreground">{item.cliente_nome}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{item.cliente_nome}</p>
                      <p className="text-xs text-muted-foreground">{[item.cliente_cidade, item.cliente_estado].filter(Boolean).join(" - ") || "Consórcio / entidade regional"}</p>
                    </>
                  )}
                </TableCell>
                <TableCell>{item.modulo}</TableCell>
                <TableCell>{item.orgao_nome ? <><p className="font-medium">{item.orgao_nome}</p><p className="text-xs text-muted-foreground">{item.orgao_tipo}</p></> : <><p className="font-medium">Todos por padrão</p><p className="text-xs text-muted-foreground">{item.orgaos_herdados} órgão(s) por herança</p></>}</TableCell>
                <TableCell><p className="font-medium">{item.tecnico_nome}</p><p className="text-xs text-muted-foreground">{item.tecnico_email || "Sem e-mail"}</p></TableCell>
                <TableCell><div className="flex flex-wrap items-center gap-1.5"><Badge variant="secondary" className={item.tipo_atribuicao === "principal" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}>{item.tipo_atribuicao === "principal" ? "Principal" : "Exceção"}</Badge>{item.nao_aplicavel && <Badge variant="outline" className="border-amber-300 text-amber-700">Não se aplica</Badge>}</div></TableCell>
                {gestor && <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => abrirEdicao(item)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>{item.tipo_atribuicao === "principal" && <DropdownMenuItem onClick={() => abrirExcecao(item)}><Building2 className="mr-2 h-4 w-4" />Criar exceção</DropdownMenuItem>}<DropdownMenuItem onClick={() => alternarNaoAplicavel(item)}><Ban className="mr-2 h-4 w-4" />{item.nao_aplicavel ? "Reativar (aplica-se)" : "Marcar como não se aplica"}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => remover(item)}><Trash2 className="mr-2 h-4 w-4" />Remover</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>}
              </TableRow>
            ))}
          </TableBody></Table></div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{editing ? "Editar responsabilidade" : "Nova responsabilidade"}</DialogTitle><DialogDescription>A seleção “Todos por padrão” aplica o responsável à prefeitura e aos órgãos sem exceção cadastrada.</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2"><Label>Cliente / Município</Label><ClienteCombobox clientes={opcoes.clientes.map((item) => ({ id: item.id, nome_fantasia: item.nome }))} value={form.cliente_id} onChange={(value) => setForm((old) => ({ ...old, cliente_id: value === "all" ? "" : value, modulo: "", orgao_id: "none" }))} disabled={Boolean(editing)} placeholder="Selecione o cliente" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Módulo</Label><Select value={form.modulo} onValueChange={(value) => setForm((old) => ({ ...old, modulo: value }))} disabled={!form.cliente_id || Boolean(editing)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{modulosDoCliente.map((modulo) => <SelectItem key={modulo} value={modulo}>{modulo}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Abrangência</Label><Select value={form.orgao_id} onValueChange={(value) => setForm((old) => ({ ...old, orgao_id: value }))} disabled={!form.cliente_id || Boolean(editing)}><SelectTrigger><SelectValue placeholder={criandoExcecao ? "Selecione o órgão" : "Todos por padrão"} /></SelectTrigger><SelectContent>{!criandoExcecao && <SelectItem value="none">Todos por padrão</SelectItem>}{orgaosDoCliente.map((orgao) => <SelectItem key={orgao.id} value={String(orgao.id)}>{orgao.nome}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>Funcionário responsável</Label><Autocomplete options={opcoes.tecnicos.map((item) => ({ value: String(item.id), label: item.nome, description: item.email || undefined }))} value={form.tecnico_rarotec_id} onValueChange={(value) => setForm((old) => ({ ...old, tecnico_rarotec_id: value }))} placeholder="Digite o nome do funcionário..." /></div>
          <div className="space-y-2"><Label>Observações</Label><Textarea value={form.observacoes} onChange={(event) => setForm((old) => ({ ...old, observacoes: event.target.value }))} placeholder="Contexto da atribuição ou exceção..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={salvar} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar atribuição</Button></DialogFooter>
      </DialogContent></Dialog>

      <ConciliacaoResponsaveisDialog
        open={conciliacaoOpen}
        onOpenChange={setConciliacaoOpen}
        onConcluido={carregarDados}
      />
    </div>
  )
}
