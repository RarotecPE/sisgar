"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { BarChart3, CheckCircle2, ClipboardClock, Loader2, Target, TriangleAlert } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { ClienteCombobox } from "@/components/cliente-combobox"
import { ExportButton } from "@/components/export-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FiltroCompetencia, MESES as meses, periodoParaQuery, type Periodo } from "@/components/filtro-competencia"
import { exportToExcel, exportProdutividadePDF } from "@/lib/export-utils"

interface GrupoProdutividade {
  id?: number
  nome: string
  atendidos: number
  nao_atendidos: number
  pendentes: number
  nao_se_aplica: number
  pendencia_externa: number
  execucoes: number
  concluidas: number
  produtividade: number
}

interface Resultado {
  gestor: boolean
  competencia: string
  inicio?: string
  fim?: string
  resumo: GrupoProdutividade
  municipios: { value: string; label: string }[]
  tecnicos: GrupoProdutividade[]
  clientes: GrupoProdutividade[]
  modulos: GrupoProdutividade[]
}

// Faixas de desempenho para o filtro de status.
const FAIXAS_STATUS: Record<string, { label: string; teste: (p: number) => boolean }> = {
  alta: { label: "Alta (≥ 85%)", teste: (p) => p >= 85 },
  media: { label: "Média (60–84%)", teste: (p) => p >= 60 && p < 85 },
  baixa: { label: "Baixa (< 60%)", teste: (p) => p < 60 },
}

interface Opcoes {
  clientes: { id: number; nome: string }[]
  tecnicos: { id: number; nome: string }[]
  modulos: { modulo: string }[]
}

const resultadoVazio: Resultado = {
  gestor: false,
  competencia: "",
  resumo: { nome: "", atendidos: 0, nao_atendidos: 0, pendentes: 0, nao_se_aplica: 0, pendencia_externa: 0, execucoes: 0, concluidas: 0, produtividade: 0 },
  municipios: [], tecnicos: [], clientes: [], modulos: [],
}

export default function ProdutividadePage() {
  const agora = new Date()
  const [periodo, setPeriodo] = useState<Periodo>({
    modo: "mes",
    ano: String(agora.getFullYear()),
    mes: String(agora.getMonth() + 1),
  })
  const anos = Array.from({ length: 5 }, (_, index) => String(agora.getFullYear() - 2 + index))
  const [clienteId, setClienteId] = useState("all")
  const [tecnicoId, setTecnicoId] = useState("all")
  const [modulo, setModulo] = useState("all")
  const [municipio, setMunicipio] = useState("all")
  const [faixa, setFaixa] = useState("all")
  const [resultado, setResultado] = useState<Resultado>(resultadoVazio)
  const [opcoes, setOpcoes] = useState<Opcoes>({ clientes: [], tecnicos: [], modulos: [] })
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(periodoParaQuery(periodo))
      if (clienteId !== "all") params.set("cliente_id", clienteId)
      if (tecnicoId !== "all") params.set("tecnico_id", tecnicoId)
      if (modulo !== "all") params.set("modulo", modulo)
      if (municipio !== "all") params.set("municipio", municipio)
      const response = await fetch(`/api/produtividade?${params.toString()}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Erro ao carregar produtividade")
      setResultado({ ...resultadoVazio, ...result })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar produtividade")
    } finally {
      setLoading(false)
    }
  }, [periodo, clienteId, tecnicoId, modulo, municipio])

  useEffect(() => {
    fetch("/api/responsabilidades/opcoes").then((res) => res.json()).then(setOpcoes).catch(() => null)
  }, [])
  useEffect(() => { carregar() }, [carregar])

  const conclusao = resultado.resumo.execucoes > 0
    ? Math.round((resultado.resumo.concluidas / resultado.resumo.execucoes) * 1000) / 10
    : 0

  const tabela = useMemo(() => {
    const base = resultado.gestor ? resultado.tecnicos : resultado.modulos
    if (faixa === "all") return base
    const regra = FAIXAS_STATUS[faixa]
    return regra ? base.filter((item) => regra.teste(item.produtividade)) : base
  }, [resultado, faixa])

  const chartData = useMemo(
    () => tabela.slice(0, 12).map((item) => ({
      nome: item.nome.length > 20 ? `${item.nome.slice(0, 19)}…` : item.nome,
      produtividade: item.produtividade,
    })),
    [tabela],
  )

  const dimensao = resultado.gestor ? "Responsável" : "Módulo"

  function rotuloCompetencia(valor?: string) {
    if (!valor) return ""
    const [a, m] = valor.split("-").map(Number)
    return `${meses[m - 1]} de ${a}`
  }

  function exportar(tipo: "excel" | "pdf") {
    const inicio = resultado.inicio ?? resultado.competencia
    const fim = resultado.fim ?? resultado.competencia
    const periodoLabel = inicio === fim ? rotuloCompetencia(inicio) : `${rotuloCompetencia(inicio)} a ${rotuloCompetencia(fim)}`
    if (tipo === "pdf") {
      exportProdutividadePDF({
        periodo: periodoLabel,
        gestor: resultado.gestor,
        dimensao,
        resumo: resultado.resumo,
        conclusao,
        linhas: tabela,
        filtros: {
          municipio: municipio === "all" ? null : resultado.municipios.find((m) => m.value === municipio)?.label ?? municipio,
          faixa: faixa === "all" ? null : FAIXAS_STATUS[faixa]?.label ?? null,
        },
      })
      return
    }
    const dados = tabela.map((item) => ({
      nome: item.nome,
      produtividade: `${item.produtividade}%`,
      checklists: `${item.concluidas}/${item.execucoes}`,
      atendidos: item.atendidos,
      nao_atendidos: item.nao_atendidos,
      pendentes: item.pendentes,
      pendencia_externa: item.pendencia_externa,
      nao_se_aplica: item.nao_se_aplica,
    }))
    exportToExcel({
      filename: `produtividade-${inicio}${fim !== inicio ? `_a_${fim}` : ""}`,
      title: `Monitoramento de Produtividade - ${periodoLabel}`,
      columns: [
        { header: dimensao, key: "nome", width: 28 },
        { header: "Produtividade", key: "produtividade", width: 15 },
        { header: "Checklists", key: "checklists", width: 12 },
        { header: "Atendidos", key: "atendidos", width: 12 },
        { header: "Não atendidos", key: "nao_atendidos", width: 14 },
        { header: "Pendentes", key: "pendentes", width: 12 },
        { header: "Pendência externa", key: "pendencia_externa", width: 16 },
        { header: "Não se aplica", key: "nao_se_aplica", width: 14 },
      ],
      data: dados,
    })
  }

  return <div className="space-y-6 p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-semibold">Monitoramento de produtividade</h1><p className="mt-1 text-sm text-muted-foreground">Indicadores calculados a partir dos checklists mensais. “Não se aplica” é excluído do índice.</p></div><ExportButton onExportExcel={() => exportar("excel")} onExportPDF={() => exportar("pdf")} disabled={!tabela.length} /></div>

    <Card className="shadow-sm"><CardContent className="space-y-3 p-4"><div className="flex flex-wrap items-center gap-3"><FiltroCompetencia periodo={periodo} onChange={setPeriodo} anos={anos} /><Select value={faixa} onValueChange={setFaixa}><SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Faixa" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as faixas</SelectItem>{Object.entries(FAIXAS_STATUS).map(([value, item]) => <SelectItem key={value} value={value}>{item.label}</SelectItem>)}</SelectContent></Select></div><div className="flex flex-wrap gap-3 [&>*]:w-full [&>*]:sm:w-52"><ClienteCombobox clientes={opcoes.clientes.map((item) => ({ id: item.id, nome_fantasia: item.nome }))} value={clienteId} onChange={setClienteId} allLabel="Todos os clientes" /><Select value={municipio} onValueChange={setMunicipio}><SelectTrigger><SelectValue placeholder="Município" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os municípios</SelectItem>{resultado.municipios.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select>{resultado.gestor && <Select value={tecnicoId} onValueChange={setTecnicoId}><SelectTrigger><SelectValue placeholder="Responsável" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os responsáveis</SelectItem>{opcoes.tecnicos.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.nome}</SelectItem>)}</SelectContent></Select>}<Select value={modulo} onValueChange={setModulo}><SelectTrigger><SelectValue placeholder="Módulo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os módulos</SelectItem>{opcoes.modulos.map((item) => <SelectItem key={item.modulo} value={item.modulo}>{item.modulo}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>

    {loading ? <Card><CardContent className="flex h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin" /></CardContent></Card> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
        { label: "Índice de produtividade", value: `${resultado.resumo.produtividade}%`, icon: Target, color: "bg-primary/10 text-primary" },
        { label: "Checklists concluídos", value: `${resultado.resumo.concluidas}/${resultado.resumo.execucoes}`, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
        { label: resultado.resumo.pendentes === 1 ? "Item pendente" : "Itens pendentes", value: resultado.resumo.pendentes, icon: ClipboardClock, color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" },
        { label: resultado.resumo.nao_atendidos === 1 ? "Item não atendido" : "Itens não atendidos", value: resultado.resumo.nao_atendidos, icon: TriangleAlert, color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" },
      ].map(({ label, value, icon: Icon, color }) => <Card key={label} className="shadow-sm"><CardContent className="flex items-center gap-4 p-4"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div></CardContent></Card>)}</div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><Card className="shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-5 w-5 text-primary" />Produtividade por {resultado.gestor ? "responsável" : "módulo"}</CardTitle></CardHeader><CardContent><div className="h-80">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ left: -15, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="nome" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={75} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} /><Tooltip formatter={(value) => [`${value}%`, "Produtividade"]} /><Bar dataKey="produtividade" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Ainda não há dados nesta competência.</div>}</div></CardContent></Card>
        <Card className="shadow-sm"><CardHeader><CardTitle className="text-base">Leitura dos indicadores</CardTitle></CardHeader><CardContent className="space-y-5"><div><div className="mb-2 flex justify-between text-sm"><span>Conclusão dos checklists</span><strong>{conclusao}%</strong></div><Progress value={conclusao} /></div><div className="grid grid-cols-2 gap-3">{[
          [resultado.resumo.atendidos === 1 ? "Item atendido" : "Itens atendidos", resultado.resumo.atendidos, "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15"],
          [resultado.resumo.nao_atendidos === 1 ? "Item não atendido" : "Itens não atendidos", resultado.resumo.nao_atendidos, "text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-500/15"],
          [resultado.resumo.pendentes === 1 ? "Item pendente" : "Itens pendentes", resultado.resumo.pendentes, "text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15"],
          [resultado.resumo.pendencia_externa === 1 ? "Pendência externa" : "Pendências externas", resultado.resumo.pendencia_externa, "text-sky-700 dark:text-sky-300 bg-sky-500/10 dark:bg-sky-500/15"],
          [resultado.resumo.nao_se_aplica === 1 ? "Item não se aplica" : "Itens não se aplicam", resultado.resumo.nao_se_aplica, "text-slate-700 dark:text-slate-300 bg-slate-500/10 dark:bg-slate-500/15"],
        ].map(([label, value, color]) => <div key={String(label)} className={`rounded-lg p-3 ${color}`}><p className="text-xl font-bold">{value}</p><p className="text-xs">{label}</p></div>)}</div><p className="text-xs leading-relaxed text-muted-foreground">Fórmula: itens atendidos ÷ itens aplicáveis da competência. Itens pendentes permanecem no denominador; “Não se aplica” e “Pendência externa” são retirados do cálculo.</p></CardContent></Card></div>

      <Card className="overflow-hidden shadow-sm"><CardHeader><CardTitle className="text-base">Detalhamento por {resultado.gestor ? "responsável" : "módulo"}</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/50"><TableHead>{resultado.gestor ? "Responsável" : "Módulo"}</TableHead><TableHead>Produtividade</TableHead><TableHead>Checklists</TableHead><TableHead>Atendidos</TableHead><TableHead>Não atendidos</TableHead><TableHead>Pendentes</TableHead><TableHead>Pend. externa</TableHead><TableHead>N/A</TableHead></TableRow></TableHeader><TableBody>{!tabela.length ? <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">Nenhum dado encontrado.</TableCell></TableRow> : tabela.map((item) => <TableRow key={`${item.id || "m"}-${item.nome}`}><TableCell className="font-medium">{item.nome}</TableCell><TableCell><div className="flex min-w-36 items-center gap-3"><Progress value={item.produtividade} /><Badge variant="outline">{item.produtividade}%</Badge></div></TableCell><TableCell>{item.concluidas}/{item.execucoes}</TableCell><TableCell className="text-emerald-600 dark:text-emerald-400">{item.atendidos}</TableCell><TableCell className="text-rose-600 dark:text-rose-400">{item.nao_atendidos}</TableCell><TableCell className="text-amber-600 dark:text-amber-400">{item.pendentes}</TableCell><TableCell className="text-sky-600 dark:text-sky-400">{item.pendencia_externa}</TableCell><TableCell>{item.nao_se_aplica}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    </>}
  </div>
}
