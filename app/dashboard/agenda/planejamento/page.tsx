"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  ChevronLeft, 
  ChevronRight, 
  Save,
  Plus,
  X,
  Calendar,
  Building2,
  MapPin,
  Copy,
  ClipboardPaste,
  Trash2,
  Check,
  Search,
  Eye,
  User,
  ChevronsUpDown,
  MousePointerSquareDashed,
  Link2,
  Unlink
} from "lucide-react"
import { 
  format, 
  addWeeks, 
  subWeeks, 
  startOfWeek,
  addDays,
  isToday,
  isSameDay,
  parseISO
} from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { MunicipioCombobox } from "@/components/municipio-combobox"
import { cn } from "@/lib/utils"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"
import { ShieldAlert } from "lucide-react"

interface Evento {
  id: number
  titulo: string
  descricao: string | null
  data_inicio: string
  data_fim: string | null
  tipo: string | null
  status: string
  local: string | null
  tecnico_rarotec_id: number | null
  cliente_id: number | null
  tecnico_nome: string | null
  cliente_nome: string | null
  relatorio_grupo_id: string | null
}

interface TecnicoRarotec {
  id: number
  nome: string
  cargo: string | null
  ativo: boolean
}

interface Cliente {
  id: number
  razao_social: string
  nome_fantasia: string | null
  cidade: string | null
  estado: string | null
  ativo: boolean
}

// Celula representa um agendamento em uma celula da planilha
interface CelulaAgendamento {
  id?: number // Se existir, e edicao
  tecnicoId: number
  data: string
  clienteId?: number | null
  municipio?: string
  tipo: string
  isNew?: boolean
  isDeleted?: boolean
  isModified?: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Helper para obter nome + sobrenome (evita duplicatas como "Felipe" e "Felipe")
const getNomeSobrenome = (nomeCompleto: string) => {
  const partes = nomeCompleto.trim().split(" ")
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[partes.length - 1]}`
}

// Tipos que requerem cliente ou municipio
const TIPOS_EXTERNOS = [
  { value: "visita", label: "Visita Tecnica", color: "bg-blue-500", short: "VT", externo: true },
  { value: "treinamento", label: "Treinamento", color: "bg-emerald-500", short: "TR", externo: true },
  { value: "reuniao", label: "Reuniao", color: "bg-purple-500", short: "RE", externo: true },
  { value: "implantacao", label: "Implantacao", color: "bg-rose-500", short: "IM", externo: true },
  { value: "processo_licitatorio", label: "Processo Licitatório", color: "bg-orange-500", short: "PL", externo: true },
]

// Tipos internos (nao requerem cliente/municipio)
const TIPOS_INTERNOS = [
  { value: "escritorio", label: "Escritorio", color: "bg-cyan-500", short: "ES", externo: false },
  { value: "home_office", label: "Home-Office", color: "bg-teal-500", short: "HO", externo: false },
  { value: "ferias", label: "Ferias", color: "bg-amber-400", short: "FE", externo: false },
  { value: "folga", label: "Folga", color: "bg-gray-400", short: "FG", externo: false },
  { value: "atestado", label: "Atestado Médico", color: "bg-red-500", short: "AT", externo: false },
  { value: "consulta_medica", label: "Consulta Médica", color: "bg-orange-400", short: "CM", externo: false },
  { value: "licenca_maternidade", label: "Lic. Maternidade", color: "bg-pink-400", short: "LM", externo: false },
  { value: "licenca_paternidade", label: "Lic. Paternidade", color: "bg-indigo-400", short: "LP", externo: false },
  { value: "licenca_medica", label: "Licenca Medica", color: "bg-red-400", short: "LM", externo: false },
  { value: "suspensao", label: "Suspensao", color: "bg-red-600", short: "SP", externo: false },
  { value: "indisponivel", label: "Indisponivel", color: "bg-gray-600", short: "IN", externo: false },
  { value: "feriado", label: "Feriado", color: "bg-lime-500", short: "FR", externo: false },
]

const TIPOS_EVENTO = [...TIPOS_EXTERNOS, ...TIPOS_INTERNOS]

// Verifica se um tipo e externo (requer cliente/municipio)
const isTipoExterno = (tipo: string) => TIPOS_EXTERNOS.some(t => t.value === tipo)

const DIAS_SEMANA = [
  { key: 0, label: "Dom", short: "D" },
  { key: 1, label: "Seg", short: "S" },
  { key: 2, label: "Ter", short: "T" },
  { key: 3, label: "Qua", short: "Q" },
  { key: 4, label: "Qui", short: "Q" },
  { key: 5, label: "Sex", short: "S" },
  { key: 6, label: "Sab", short: "S" },
]

export default function PlanejamentoSemanalPage() {
  const { user, loading: userLoading } = useSession()
  const userIsGestor = user?.nome ? isGestor(user.nome, user.cargo) : false
  
  const [semanaAtual, setSemanaAtual] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [pendingChanges, setPendingChanges] = useState<CelulaAgendamento[]>([])
  const [saving, setSaving] = useState(false)
  const [autoOpenItem, setAutoOpenItem] = useState<CelulaAgendamento | null>(null)
  // Copiar/colar cartao
  const [copiedCard, setCopiedCard] = useState<{
    tipo: string
    clienteId?: number | null
    municipio?: string
    label: string
  } | null>(null)
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false)
  const [pasteDays, setPasteDays] = useState<number[]>([])
  const [pasteTecnicos, setPasteTecnicos] = useState<number[]>([])
  // Selecao de celulas por arraste (estilo Windows)
  const [isSelecting, setIsSelecting] = useState(false)
  const selectionStartRef = useRef<{ row: number; col: number } | null>(null)
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  // Selecao base (mantida ao arrastar com Ctrl) e modo aditivo
  const baseSelectionRef = useRef<Set<string>>(new Set())
  const additiveRef = useRef(false)
  // Estado de gravacao do relatorio unico (esporadico)
  const [savingGrupo, setSavingGrupo] = useState(false)
  
  // Datas da semana
  const diasDaSemana = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(semanaAtual, i))
  }, [semanaAtual])

  const dataInicio = format(diasDaSemana[0], "yyyy-MM-dd")
  const dataFim = format(diasDaSemana[6], "yyyy-MM-dd")

  const { data: eventos, mutate } = useSWR<Evento[]>(
    `/api/agenda?data_inicio=${dataInicio}&data_fim=${dataFim}`,
    fetcher
  )
  const { data: tecnicos } = useSWR<TecnicoRarotec[]>("/api/tecnicos-rarotec", fetcher)
  const { data: clientes } = useSWR<Cliente[]>("/api/clientes", fetcher)
  
  // Aguardar carregamento do usuario
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }
  
  // OPÇÃO A: Apenas gestores podem acessar o Planejamento Semanal
  if (!userIsGestor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <ShieldAlert className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">Acesso Restrito</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Apenas coordenadores, gerentes e diretores podem acessar o Planejamento Semanal.
        </p>
        <p className="text-muted-foreground text-center max-w-md mt-2 text-sm">
          Para solicitar alteracoes na sua agenda, utilize a pagina de Agenda.
        </p>
        <Link href="/dashboard/agenda" className="mt-4">
          <Button variant="outline">Voltar para Agenda</Button>
        </Link>
      </div>
    )
  }

  // Técnicos que não devem aparecer na agenda (administrativos)
  const TECNICOS_OCULTOS = ["administrador", "financeiro", "ronaldson", "rafaelle"]
  const tecnicosAtivos = tecnicos?.filter(t => 
    t.ativo && !TECNICOS_OCULTOS.some(nome => t.nome.toLowerCase().includes(nome))
  ) || []
  const clientesAtivos = clientes?.filter(c => c.ativo) || []

  // Mapa de eventos por tecnico e data
  const eventosMap = useMemo(() => {
    const map: Record<string, Evento[]> = {}
    eventos?.forEach(e => {
      const key = `${e.tecnico_rarotec_id}-${e.data_inicio.split("T")[0]}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [eventos])

  // Verifica se ha mudancas pendentes
  const hasPendingChanges = pendingChanges.length > 0

  // Obtem eventos de uma celula (tecnico + data)
  const getEventosCelula = useCallback((tecnicoId: number, data: Date): (Evento | CelulaAgendamento)[] => {
    const dataStr = format(data, "yyyy-MM-dd")
    const key = `${tecnicoId}-${dataStr}`
    const existentes = eventosMap[key] || []
    
    // Filtra eventos deletados e adiciona novos
    const deletedIds = pendingChanges
      .filter(p => p.isDeleted && p.id)
      .map(p => p.id)
    
    const modificados = pendingChanges
      .filter(p => p.isModified && p.id)
    
    const novos = pendingChanges
      .filter(p => p.isNew && p.tecnicoId === tecnicoId && p.data === dataStr)
    
    const eventosAtuais = existentes
      .filter(e => !deletedIds.includes(e.id))
      .map(e => {
        const mod = modificados.find(m => m.id === e.id)
        if (mod) {
          return { ...e, ...mod }
        }
        return e
      })
    
    return [...eventosAtuais, ...novos]
  }, [eventosMap, pendingChanges])

  // Adiciona novo agendamento em uma celula
  const addAgendamento = (tecnicoId: number, data: Date) => {
    const dataStr = format(data, "yyyy-MM-dd")
    const newItem: CelulaAgendamento = {
      tecnicoId,
      data: dataStr,
      tipo: "escritorio", // Default para escritorio (mais comum)
      isNew: true,
    }
    setPendingChanges(prev => [...prev, newItem])
    // Define o item para abrir automaticamente o popover
    setAutoOpenItem(newItem)
  }

  // Copia um cartao para o "clipboard"
  const copiarCartao = (card: { tipo: string; clienteId?: number | null; municipio?: string }) => {
    const tipoLabel = TIPOS_EVENTO.find(t => t.value === card.tipo)?.label || card.tipo
    const isExterno = isTipoExterno(card.tipo)
    let destino = ""
    if (isExterno) {
      const cliente = card.clienteId ? clientesAtivos.find(c => c.id === card.clienteId) : null
      destino = cliente ? (cliente.nome_fantasia || cliente.razao_social) : (card.municipio || "")
    }
    const label = destino ? `${tipoLabel} - ${destino}` : tipoLabel
    setCopiedCard({ tipo: card.tipo, clienteId: card.clienteId, municipio: card.municipio, label })
  }

  // Abre o dialogo de colagem (pre-seleciona nenhum dia/tecnico)
  const abrirColagem = () => {
    setPasteDays([])
    setPasteTecnicos([])
    setPasteDialogOpen(true)
  }

  // Aplica a colagem do cartao nos dias/tecnicos selecionados
  const aplicarColagem = () => {
    if (!copiedCard || pasteDays.length === 0 || pasteTecnicos.length === 0) return
    const isExterno = isTipoExterno(copiedCard.tipo)
    const novos: CelulaAgendamento[] = []
    for (const tecId of pasteTecnicos) {
      for (const dayIdx of pasteDays) {
        const dataStr = format(diasDaSemana[dayIdx], "yyyy-MM-dd")
        novos.push({
          tecnicoId: tecId,
          data: dataStr,
          tipo: copiedCard.tipo,
          clienteId: isExterno ? (copiedCard.clienteId ?? null) : null,
          municipio: isExterno ? (copiedCard.municipio ?? "") : "",
          isNew: true,
        })
      }
    }
    setPendingChanges(prev => [...prev, ...novos])
    setPasteDialogOpen(false)
    setPasteDays([])
    setPasteTecnicos([])
  }

  // ---- Selecao de celulas por arraste ----
  const computeRect = (start: { row: number; col: number }, end: { row: number; col: number }) => {
    const r1 = Math.min(start.row, end.row)
    const r2 = Math.max(start.row, end.row)
    const c1 = Math.min(start.col, end.col)
    const c2 = Math.max(start.col, end.col)
    const set = new Set<string>()
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        set.add(`${r}_${c}`)
      }
    }
    return set
  }

  const handleCellMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    // Nao iniciar selecao ao clicar em cartoes, botoes ou popovers
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest('[role="dialog"]') || target.closest("[data-radix-popper-content-wrapper]")) {
      return
    }
    e.preventDefault()
    setIsSelecting(true)
    selectionStartRef.current = { row, col }

    const key = `${row}_${col}`
    const ctrl = e.ctrlKey || e.metaKey
    additiveRef.current = ctrl

    if (ctrl) {
      // Mantem a selecao atual como base e alterna a celula clicada
      baseSelectionRef.current = new Set(selectedCells)
      setSelectedCells(prev => {
        const next = new Set(prev)
        if (next.has(key)) {
          next.delete(key)
        } else {
          next.add(key)
        }
        return next
      })
    } else {
      // Selecao normal: recomeca do zero
      baseSelectionRef.current = new Set()
      setSelectedCells(new Set([key]))
    }
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !selectionStartRef.current) return
    const rect = computeRect(selectionStartRef.current, { row, col })
    if (additiveRef.current) {
      // Une o retangulo arrastado com a selecao base (Ctrl)
      setSelectedCells(new Set([...baseSelectionRef.current, ...rect]))
    } else {
      setSelectedCells(rect)
    }
  }

  const limparSelecao = () => {
    setSelectedCells(new Set())
    selectionStartRef.current = null
    baseSelectionRef.current = new Set()
    additiveRef.current = false
  }

  // Cola o cartao copiado em todas as celulas selecionadas
  const colarNaSelecao = () => {
    if (!copiedCard || selectedCells.size === 0) return
    const isExterno = isTipoExterno(copiedCard.tipo)
    const novos: CelulaAgendamento[] = []
    selectedCells.forEach(key => {
      const [r, c] = key.split("_").map(Number)
      const tecnico = tecnicosAtivos[r]
      const dia = diasDaSemana[c]
      if (!tecnico || !dia) return
      novos.push({
        tecnicoId: tecnico.id,
        data: format(dia, "yyyy-MM-dd"),
        tipo: copiedCard.tipo,
        clienteId: isExterno ? (copiedCard.clienteId ?? null) : null,
        municipio: isExterno ? (copiedCard.municipio ?? "") : "",
        isNew: true,
      })
    })
    setPendingChanges(prev => [...prev, ...novos])
    limparSelecao()
  }

  // Coleta os eventos JA SALVOS (com id no banco) das celulas selecionadas
  const eventosSalvosSelecionados = useCallback((): Evento[] => {
    const acc: Evento[] = []
    selectedCells.forEach(key => {
      const [r, c] = key.split("_").map(Number)
      const tecnico = tecnicosAtivos[r]
      const dia = diasDaSemana[c]
      if (!tecnico || !dia) return
      const itens = getEventosCelula(tecnico.id, dia)
      itens.forEach(item => {
        // Evento salvo tem data_inicio; cartao novo pendente nao
        if ("data_inicio" in item && "id" in item && item.id) {
          acc.push(item as Evento)
        }
      })
    })
    return acc
  }, [selectedCells, tecnicosAtivos, diasDaSemana, getEventosCelula])

  // A selecao contem algum evento ja agrupado em relatorio unico?
  const selecaoTemGrupo = useMemo(
    () => eventosSalvosSelecionados().some(e => e.relatorio_grupo_id),
    [eventosSalvosSelecionados]
  )

  // Habilita relatorio unico (esporadico) para as visitas selecionadas ja salvas
  const habilitarRelatorioUnico = async () => {
    const eventosSalvos = eventosSalvosSelecionados().filter(e => isTipoExterno(e.tipo || ""))
    if (eventosSalvos.length < 2) {
      alert(
        "Selecione ao menos 2 visitas ja salvas para agrupar em um relatorio unico. Se voce acabou de criar os cartoes, clique em 'Salvar Tudo' antes de agrupar."
      )
      return
    }
    setSavingGrupo(true)
    try {
      const res = await fetch("/api/agenda/relatorio-unico", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventoIds: eventosSalvos.map(e => e.id), acao: "set" }),
      })
      if (!res.ok) throw new Error()
      await mutate()
      limparSelecao()
    } catch {
      alert("Erro ao habilitar relatorio unico")
    } finally {
      setSavingGrupo(false)
    }
  }

  // Desabilita o relatorio unico dos eventos agrupados na selecao
  const desabilitarRelatorioUnico = async () => {
    const comGrupo = eventosSalvosSelecionados().filter(e => e.relatorio_grupo_id)
    if (comGrupo.length === 0) return
    setSavingGrupo(true)
    try {
      const res = await fetch("/api/agenda/relatorio-unico", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventoIds: comGrupo.map(e => e.id), acao: "clear" }),
      })
      if (!res.ok) throw new Error()
      await mutate()
      limparSelecao()
    } catch {
      alert("Erro ao desabilitar relatorio unico")
    } finally {
      setSavingGrupo(false)
    }
  }

  // Finaliza a selecao ao soltar o mouse em qualquer lugar
  useEffect(() => {
    const onUp = () => setIsSelecting(false)
    window.addEventListener("mouseup", onUp)
    return () => window.removeEventListener("mouseup", onUp)
  }, [])

  // Copia o cartao da primeira celula selecionada que tenha um agendamento (Ctrl+C)
  const copiarSelecao = useCallback(() => {
    if (selectedCells.size === 0) return false
    for (const key of selectedCells) {
      const [r, c] = key.split("_").map(Number)
      const tecnico = tecnicosAtivos[r]
      const dia = diasDaSemana[c]
      if (!tecnico || !dia) continue
      const itens = getEventosCelula(tecnico.id, dia)
      if (itens.length > 0) {
        const item = itens[0]
        const clienteId = 'cliente_id' in item ? item.cliente_id : ('clienteId' in item ? item.clienteId : null)
        const municipio = 'local' in item ? item.local : ('municipio' in item ? item.municipio : "")
        copiarCartao({ tipo: item.tipo || "visita", clienteId, municipio: municipio || undefined })
        return true
      }
    }
    return false
  }, [selectedCells, tecnicosAtivos, diasDaSemana, getEventosCelula])

  // Atalhos de teclado Ctrl+C (copiar) e Ctrl+V (colar) na selecao
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignora quando o foco esta em um campo de texto
      const el = document.activeElement as HTMLElement | null
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === "c" && selectedCells.size > 0) {
        if (copiarSelecao()) e.preventDefault()
      } else if (k === "v" && copiedCard && selectedCells.size > 0) {
        e.preventDefault()
        colarNaSelecao()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedCells, copiedCard, copiarSelecao])

  // Remove um agendamento
  const removeAgendamento = (item: Evento | CelulaAgendamento) => {
    if ('id' in item && item.id && !('isNew' in item)) {
      // Evento existente - marca para deletar
      const ev = item as Evento
      setPendingChanges(prev => [...prev, { 
        id: ev.id, 
        tecnicoId: ev.tecnico_rarotec_id!, 
        data: ev.data_inicio.split("T")[0],
        tipo: ev.tipo || "visita",
        isDeleted: true 
      }])
    } else if ('isNew' in item && item.isNew) {
      // Novo item - remove da lista de pendentes
      setPendingChanges(prev => prev.filter(p => p !== item))
    }
  }

  // Atualiza um agendamento pendente
  const updatePendingAgendamento = (
    item: CelulaAgendamento, 
    field: 'clienteId' | 'municipio' | 'tipo', 
    value: any
  ) => {
    setPendingChanges(prev => prev.map(p => {
      if (p === item) {
        return { ...p, [field]: value }
      }
      return p
    }))
  }

  // Atualiza um evento existente
  const updateExistingEvento = (evento: Evento, field: string, value: any) => {
    const existing = pendingChanges.find(p => p.id === evento.id && p.isModified)
    if (existing) {
      setPendingChanges(prev => prev.map(p => 
        p.id === evento.id ? { ...p, [field]: value } : p
      ))
    } else {
      setPendingChanges(prev => [...prev, {
        id: evento.id,
        tecnicoId: evento.tecnico_rarotec_id!,
        data: evento.data_inicio.split("T")[0],
        clienteId: evento.cliente_id,
        municipio: evento.local || "",
        tipo: evento.tipo || "visita",
        isModified: true,
        [field]: value
      }])
    }
  }

  // Copia semana anterior (apenas para dias vazios)
  const copiarSemanaAnterior = async () => {
    const semanaAnterior = subWeeks(semanaAtual, 1)
    const dataInicioAnterior = format(semanaAnterior, "yyyy-MM-dd")
    const dataFimAnterior = format(addDays(semanaAnterior, 6), "yyyy-MM-dd")
    
    // Buscar eventos da semana anterior
    const res = await fetch(`/api/agenda?data_inicio=${dataInicioAnterior}&data_fim=${dataFimAnterior}`)
    const eventosAnteriores: Evento[] = await res.json()
    
    // Buscar eventos da semana atual para verificar quais dias já estão preenchidos
    const dataInicioAtual = format(semanaAtual, "yyyy-MM-dd")
    const dataFimAtual = format(addDays(semanaAtual, 6), "yyyy-MM-dd")
    const resAtual = await fetch(`/api/agenda?data_inicio=${dataInicioAtual}&data_fim=${dataFimAtual}`)
    const eventosAtuais: Evento[] = await resAtual.json()
    
    // Criar um Set de "tecnicoId-data" para verificar dias já ocupados
    const diasOcupados = new Set<string>()
    eventosAtuais.forEach(e => {
      const dataStr = e.data_inicio.split('T')[0]
      diasOcupados.add(`${e.tecnico_rarotec_id}-${dataStr}`)
    })
    // Incluir também mudanças pendentes (novos agendamentos ainda não salvos)
    pendingChanges.forEach(c => {
      if (!c.isDeleted) {
        diasOcupados.add(`${c.tecnicoId}-${c.data}`)
      }
    })
    
    const novosAgendamentos: CelulaAgendamento[] = []
    
    eventosAnteriores.forEach(e => {
      const dataOriginal = parseISO(e.data_inicio)
      const diaSemana = dataOriginal.getDay()
      const novaData = addDays(semanaAtual, diaSemana)
      const novaDataStr = format(novaData, "yyyy-MM-dd")
      
      // Verificar se o dia já está ocupado para este técnico
      const chave = `${e.tecnico_rarotec_id}-${novaDataStr}`
      if (diasOcupados.has(chave)) {
        return // Pular - dia já tem evento
      }
      
      // Marcar como ocupado para evitar duplicatas no mesmo loop
      diasOcupados.add(chave)
      
      novosAgendamentos.push({
        tecnicoId: e.tecnico_rarotec_id!,
        data: novaDataStr,
        clienteId: e.cliente_id,
        municipio: e.local || "",
        tipo: e.tipo || "visita",
        isNew: true,
      })
    })
    
    if (novosAgendamentos.length === 0) {
      alert("Nenhum agendamento copiado. Todos os dias da semana atual já possuem eventos.")
      return
    }
    
    setPendingChanges(prev => [...prev, ...novosAgendamentos])
  }

  // Salva todas as mudancas (apenas gestores acessam esta pagina)
  const salvarMudancas = async () => {
    setSaving(true)
    try {
      for (const change of pendingChanges) {
        if (change.isDeleted && change.id) {
          await fetch(`/api/agenda/${change.id}`, { method: "DELETE" })
        } else if (change.isNew) {
          const tipoLabel = TIPOS_EVENTO.find(t => t.value === change.tipo)?.label
          const isExterno = isTipoExterno(change.tipo)
          
          let titulo: string
          if (isExterno) {
            const cliente = change.clienteId 
              ? clientesAtivos.find(c => c.id === change.clienteId)
              : null
            const destino = cliente 
              ? (cliente.nome_fantasia || cliente.razao_social)
              : change.municipio || "Sem destino"
            titulo = `${tipoLabel} - ${destino}`
          } else {
            titulo = tipoLabel || change.tipo
          }
          
          await fetch("/api/agenda", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo,
              tipo: change.tipo,
              descricao: "",
              tecnico_rarotec_id: change.tecnicoId,
              cliente_id: isExterno ? (change.clienteId || null) : null,
              local: isExterno ? (change.municipio || null) : null,
              data_inicio: `${change.data}T09:00`,
              data_fim: `${change.data}T18:00`,
              status: "agendado",
            }),
          })
        } else if (change.isModified && change.id) {
          const tipoLabel = TIPOS_EVENTO.find(t => t.value === change.tipo)?.label
          const isExterno = isTipoExterno(change.tipo)
          
          let titulo: string
          if (isExterno) {
            const cliente = change.clienteId 
              ? clientesAtivos.find(c => c.id === change.clienteId)
              : null
            const destino = cliente 
              ? (cliente.nome_fantasia || cliente.razao_social)
              : change.municipio || "Sem destino"
            titulo = `${tipoLabel} - ${destino}`
          } else {
            titulo = tipoLabel || change.tipo
          }
          
          await fetch(`/api/agenda/${change.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo,
              tipo: change.tipo,
              tecnico_rarotec_id: change.tecnicoId,
              cliente_id: isExterno ? (change.clienteId || null) : null,
              local: isExterno ? (change.municipio || null) : null,
              data_inicio: `${change.data}T09:00`,
              data_fim: `${change.data}T18:00`,
              status: "agendado",
            }),
          })
        }
      }
      
      setPendingChanges([])
      mutate()
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar mudancas")
    } finally {
      setSaving(false)
    }
  }

  // Descarta mudancas
  const descartarMudancas = () => {
    if (confirm("Descartar todas as mudancas?")) {
      setPendingChanges([])
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Cabecalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/agenda" className="text-muted-foreground hover:text-foreground text-sm">
              Agenda
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Planejamento Semanal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Planejamento Semanal</h1>
          <p className="text-muted-foreground">
            Visualize e edite a agenda de todos os tecnicos de uma vez
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/agenda">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Calendario
            </Link>
          </Button>
        </div>
      </div>

      {/* Barra de navegacao da semana */}
      <Card>
        <CardContent className="p-4">
          {/* Linha 1: Navegação da semana */}
          <div className="mb-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 w-full items-center justify-center gap-2 sm:flex-1 sm:justify-start">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSemanaAtual(subWeeks(semanaAtual, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1 text-center sm:flex-none sm:min-w-44">
                <div className="text-balance font-semibold text-sm">
                  {format(diasDaSemana[0], "dd 'de' MMMM", { locale: ptBR })} - {format(diasDaSemana[6], "dd 'de' MMMM", { locale: ptBR })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(diasDaSemana[0], "yyyy")}
                </div>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSemanaAtual(addWeeks(semanaAtual, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setSemanaAtual(startOfWeek(new Date(), { weekStartsOn: 0 }))}>
                Hoje
              </Button>
            </div>
            
            {/* Botões de ação à direita */}
            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Eye className="mr-1.5 h-4 w-4" />
                    Resumo
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Resumo da Semana</SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(diasDaSemana[0], "dd/MM", { locale: ptBR })} a {format(diasDaSemana[6], "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {tecnicosAtivos.map(tecnico => {
                      // Coleta todos os eventos do tecnico na semana
                      const eventosSemana = diasDaSemana.map(dia => {
                        const itens = getEventosCelula(tecnico.id, dia)
                        return {
                          dia,
                          diaSemana: DIAS_SEMANA[dia.getDay()].label,
                          itens
                        }
                      })
                      
                      const totalEventos = eventosSemana.reduce((acc, d) => acc + d.itens.length, 0)
                      if (totalEventos === 0) return null
                      
                      return (
                        <div key={tecnico.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{tecnico.nome}</div>
                              <div className="text-xs text-muted-foreground">{tecnico.cargo}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {eventosSemana.map(({ dia, diaSemana, itens }) => {
                              if (itens.length === 0) return null
                              const isFds = dia.getDay() === 0 || dia.getDay() === 6
                              
                              return (
                                <div key={dia.toISOString()} className={cn("flex gap-3 p-2 rounded", isFds ? "bg-red-500/10 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200/50 dark:border-red-900/40" : "bg-muted/30 dark:bg-muted/15")}>
                                  <div className={cn("text-sm font-medium w-12", isFds ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                                    {diaSemana} {format(dia, "dd")}
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    {itens.map((item, idx) => {
                                      const tipo = item.tipo || "visita"
                                      const tipoConfig = TIPOS_EVENTO.find(t => t.value === tipo) || TIPOS_EVENTO[0]
                                      const isExterno = isTipoExterno(tipo)
                                      
                                      // Determina o local/destino
                                      let destino = ""
                                      if (isExterno) {
                                        if ('cliente_nome' in item && item.cliente_nome) {
                                          destino = item.cliente_nome
                                        } else if ('clienteId' in item && item.clienteId) {
                                          const cliente = clientesAtivos.find(c => c.id === item.clienteId)
                                          destino = cliente?.nome_fantasia || cliente?.razao_social || ""
                                        }
                                        if (!destino) {
                                          destino = ('local' in item ? item.local : ('municipio' in item ? item.municipio : "")) || ""
                                        }
                                      }
                                      
                                      return (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                          <div className={`h-2 w-2 rounded-full ${tipoConfig.color}`} />
                                          <span className="font-medium">{tipoConfig.label}</span>
                                          {destino && (
                                            <>
                                              <span className="text-muted-foreground">-</span>
                                              <span className="text-muted-foreground truncate">{destino}</span>
                                            </>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                    
                    {tecnicosAtivos.every(t => {
                      const total = diasDaSemana.reduce((acc, dia) => acc + getEventosCelula(t.id, dia).length, 0)
                      return total === 0
                    }) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum agendamento nesta semana</p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button variant="outline" size="sm" className="h-8" onClick={copiarSemanaAnterior}>
                <Copy className="mr-1.5 h-4 w-4" />
                Copiar Semana Anterior
              </Button>
            </div>
          </div>

          {/* Barra do cartao copiado */}
          {copiedCard && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t mt-3">
              <div className="flex items-center gap-2 text-sm">
                <Copy className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Cartao copiado:</span>
                <Badge variant="secondary" className="font-medium">{copiedCard.label}</Badge>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" className="h-8" onClick={abrirColagem}>
                  <ClipboardPaste className="mr-1.5 h-4 w-4" />
                  Colar em...
                </Button>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => setCopiedCard(null)}>
                  <X className="mr-1.5 h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </div>
          )}
          
          {/* Linha 2: Ações de salvar (quando há mudanças pendentes) */}
          {hasPendingChanges && (
            <div className="flex items-center justify-end gap-2 pt-3 border-t mt-3">
              <Badge variant="secondary" className="gap-1">
                {pendingChanges.length} mudanca(s)
              </Badge>
              <Button variant="outline" size="sm" className="h-8" onClick={descartarMudancas}>
                <X className="mr-1.5 h-4 w-4" />
                Descartar
              </Button>
              <Button size="sm" className="h-8" onClick={salvarMudancas} disabled={saving}>
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Salvando..." : "Salvar Tudo"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planilha de agendamentos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(100vh-300px)]">
            <table className={cn("w-full border-collapse table-fixed", isSelecting && "select-none")}>
              <thead className="sticky top-0 z-20">
                <tr className="border-b bg-muted/95 backdrop-blur-sm shadow-sm">
                  <th className="p-2 text-left font-medium text-sm w-32 sticky left-0 bg-muted/95 z-30 border-r">
                    Tecnico
                  </th>
                  {diasDaSemana.map((dia, i) => {
                    const isHoje = isToday(dia)
                    const isFds = i === 0 || i === 6
                    return (
                      <th 
                        key={i} 
                        className={cn(
                          "p-2 text-center font-medium text-xs w-[calc((100%-8rem)/7)]",
                          isHoje ? "bg-primary/10" : "bg-muted/95",
                          isFds && "bg-red-500/10 dark:bg-red-950/25"
                        )}
                      >
                        <div className={cn("text-[10px] uppercase", isHoje ? "text-primary font-bold" : isFds ? "text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground")}>
                          {DIAS_SEMANA[dia.getDay()].label}
                        </div>
                        <div className={cn("text-base font-bold", isHoje ? "text-primary" : isFds ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                          {format(dia, "dd")}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {tecnicosAtivos.map((tecnico, rowIdx) => (
                  <tr key={tecnico.id} className="border-b hover:bg-muted/20">
                    <td className="p-2 font-medium sticky left-0 bg-background z-10 border-r">
                      <div className="flex items-center gap-1.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {tecnico.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-xs truncate">{getNomeSobrenome(tecnico.nome)}</div>
                        </div>
                      </div>
                    </td>
                    {diasDaSemana.map((dia, i) => {
                      const isHoje = isToday(dia)
                      const isFds = i === 0 || i === 6
                      const itens = getEventosCelula(tecnico.id, dia)
                      const isSelected = selectedCells.has(`${rowIdx}_${i}`)
                      
                      return (
                        <td 
                          key={i}
                          onMouseDown={(e) => handleCellMouseDown(rowIdx, i, e)}
                          onMouseEnter={() => handleCellMouseEnter(rowIdx, i)}
                          className={cn(
                            "p-1.5 align-top",
                            isHoje && "bg-primary/5 dark:bg-primary/10",
                            isFds && "bg-red-500/5 dark:bg-red-950/20",
                            isSelected && "bg-primary/15 ring-2 ring-inset ring-primary"
                          )}
                        >
                          <div className="space-y-1 min-h-14">
                            {itens.map((item, idx) => (
                              <CelulaItem
                                key={`item-${idx}`}
                                item={item}
                                clientes={clientesAtivos}
                                onRemove={() => removeAgendamento(item)}
                                onCopy={copiarCartao}
                                onUpdate={(field, value) => {
                                  if ('isNew' in item && item.isNew) {
                                    updatePendingAgendamento(item as CelulaAgendamento, field, value)
                                  } else {
                                    updateExistingEvento(item as Evento, field, value)
                                  }
                                }}
                                autoOpen={autoOpenItem === item}
                                onAutoOpenHandled={() => setAutoOpenItem(null)}
                              />
                            ))}
                            
                            {/* Botao para adicionar */}
                            <button
                              onClick={() => addAgendamento(tecnico.id, dia)}
                              className="w-full h-6 border border-dashed border-muted-foreground/20 rounded text-muted-foreground/40 hover:border-primary/50 hover:text-primary/50 transition-colors flex items-center justify-center"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                
                {tecnicosAtivos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Nenhum tecnico cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Barra flutuante de selecao por arraste */}
      {selectedCells.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <MousePointerSquareDashed className="h-4 w-4 text-primary" />
              <span className="font-medium">{selectedCells.size}</span>
              <span className="text-muted-foreground">celula(s) selecionada(s)</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full"
              onClick={copiarSelecao}
            >
              <Copy className="mr-1.5 h-4 w-4" />
              Copiar
              <kbd className="ml-1.5 rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">Ctrl+C</kbd>
            </Button>
            {copiedCard ? (
              <Button size="sm" className="h-8 rounded-full" onClick={colarNaSelecao}>
                <ClipboardPaste className="mr-1.5 h-4 w-4" />
                Colar "{copiedCard.label}"
                <kbd className="ml-1.5 rounded bg-primary-foreground/20 px-1 text-[10px] font-medium">Ctrl+V</kbd>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Copie um cartao (Ctrl+C) para colar na selecao
              </span>
            )}
            <div className="h-4 w-px bg-border" />
            {selecaoTemGrupo ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-full"
                onClick={desabilitarRelatorioUnico}
                disabled={savingGrupo}
              >
                <Unlink className="mr-1.5 h-4 w-4" />
                Desagrupar Relatorio
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-full"
                onClick={habilitarRelatorioUnico}
                disabled={savingGrupo}
              >
                <Link2 className="mr-1.5 h-4 w-4" />
                Habilitar Relatorio Unico
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 rounded-full" onClick={limparSelecao}>
              <X className="mr-1.5 h-4 w-4" />
              Limpar
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Segure Ctrl para somar/remover celulas
            </span>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        {TIPOS_EVENTO.map((tipo) => (
          <div key={tipo.value} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded ${tipo.color}`} />
            <span className="text-muted-foreground">{tipo.label}</span>
          </div>
        ))}
      </div>

      {/* Dialogo de colagem do cartao */}
      <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Colar cartao</DialogTitle>
            <DialogDescription>
              {copiedCard?.label
                ? `Aplicar "${copiedCard.label}" nos dias e tecnicos selecionados desta semana.`
                : "Selecione os dias e tecnicos de destino."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Dias da semana */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Dias da semana</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    setPasteDays(prev => (prev.length === 7 ? [] : diasDaSemana.map((_, i) => i)))
                  }
                >
                  {pasteDays.length === 7 ? "Limpar" : "Selecionar todos"}
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasDaSemana.map((dia, i) => {
                  const checked = pasteDays.includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setPasteDays(prev =>
                          prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
                        )
                      }
                      className={cn(
                        "flex flex-col items-center rounded-md border py-2 text-xs transition-colors",
                        checked
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-input hover:bg-accent"
                      )}
                    >
                      <span className="uppercase text-[10px]">{DIAS_SEMANA[dia.getDay()].label}</span>
                      <span className="text-sm font-bold">{format(dia, "dd")}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tecnicos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Tecnicos</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    setPasteTecnicos(prev =>
                      prev.length === tecnicosAtivos.length ? [] : tecnicosAtivos.map(t => t.id)
                    )
                  }
                >
                  {pasteTecnicos.length === tecnicosAtivos.length ? "Limpar" : "Selecionar todos"}
                </Button>
              </div>
              <ScrollArea className="h-52 rounded-md border">
                <div className="p-1">
                  {tecnicosAtivos.map(tecnico => {
                    const checked = pasteTecnicos.includes(tecnico.id)
                    return (
                      <label
                        key={tecnico.id}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            setPasteTecnicos(prev =>
                              prev.includes(tecnico.id)
                                ? prev.filter(id => id !== tecnico.id)
                                : [...prev, tecnico.id]
                            )
                          }
                        />
                        <span className="truncate">{getNomeSobrenome(tecnico.nome)}</span>
                      </label>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={aplicarColagem}
              disabled={pasteDays.length === 0 || pasteTecnicos.length === 0}
            >
              <ClipboardPaste className="mr-1.5 h-4 w-4" />
              Colar {pasteDays.length * pasteTecnicos.length > 0
                ? `(${pasteDays.length * pasteTecnicos.length} cartao(oes))`
                : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente da celula individual
function CelulaItem({ 
  item, 
  clientes, 
  onRemove, 
  onCopy,
  onUpdate,
  autoOpen = false,
  onAutoOpenHandled
}: { 
  item: Evento | CelulaAgendamento
  clientes: Cliente[]
  onRemove: () => void
  onCopy: (card: { tipo: string; clienteId?: number | null; municipio?: string }) => void
  onUpdate: (field: 'clienteId' | 'municipio' | 'tipo', value: any) => void
  autoOpen?: boolean
  onAutoOpenHandled?: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [clientePopoverOpen, setClientePopoverOpen] = useState(false)
  
  // Quando autoOpen muda para true, abre o popover
  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true)
      onAutoOpenHandled?.()
    }
  }, [autoOpen, onAutoOpenHandled])
  
  const isNew = 'isNew' in item && item.isNew
  const isModified = 'isModified' in item && item.isModified
  
  const clienteId = 'cliente_id' in item ? item.cliente_id : ('clienteId' in item ? item.clienteId : null)
  const municipio = 'local' in item ? item.local : ('municipio' in item ? item.municipio : "")
  const tipo = item.tipo || "visita"
  const temGrupoRelatorio = 'relatorio_grupo_id' in item && !!item.relatorio_grupo_id
  
  const cliente = clienteId ? clientes.find(c => c.id === clienteId) : null
  const tipoConfig = TIPOS_EVENTO.find(t => t.value === tipo) || TIPOS_EVENTO[0]
  const isExterno = isTipoExterno(tipo)
  
  // Para tipos externos mostra cliente/municipio, para internos mostra o label do tipo
  const displayName = isExterno
    ? (cliente 
        ? (cliente.nome_fantasia || cliente.razao_social).substring(0, 20)
        : municipio 
          ? municipio.substring(0, 20)
          : "Selecionar...")
    : tipoConfig.label
  
  const filteredClientes = clientes.filter(c => 
    c.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div 
          className={`
            group relative px-1.5 py-1 rounded text-[10px] cursor-pointer transition-all
            ${tipoConfig.color} text-white
            ${isNew ? "ring-2 ring-offset-1 ring-green-500" : ""}
            ${isModified ? "ring-2 ring-offset-1 ring-amber-500" : ""}
          `}
        >
          <div className="font-medium truncate pr-4 leading-tight">{displayName}</div>
          <div className="flex items-center gap-1 text-white/70 text-[9px]">
            <span>{tipoConfig.short}</span>
            {temGrupoRelatorio && (
              <span title="Relatorio unico (agrupado)" className="inline-flex items-center">
                <Link2 className="h-2.5 w-2.5" />
              </span>
            )}
          </div>

          {/* Botao remover */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity h-3.5 w-3.5 rounded bg-black/20 hover:bg-black/40 flex items-center justify-center"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div className="font-medium text-sm">Editar Agendamento</div>
          
          {/* Tipo */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Situacao</label>
            <Select value={tipo} onValueChange={(v) => onUpdate('tipo', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Atividades Externas
                </div>
                {TIPOS_EXTERNOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${t.color}`} />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
                <Separator className="my-1" />
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Situacoes Internas
                </div>
                {TIPOS_INTERNOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${t.color}`} />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Cliente e Municipio - apenas para tipos externos */}
          {isExterno && (
            <>
              {/* Cliente */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Cliente</label>
                <Popover open={clientePopoverOpen} onOpenChange={setClientePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-8 w-full justify-between text-xs font-normal"
                    >
                      <span className="truncate">
                        {clienteId
                          ? clientes.find(c => c.id === clienteId)?.nome_fantasia ||
                            clientes.find(c => c.id === clienteId)?.razao_social ||
                            "Selecione..."
                          : "Nenhum cliente"}
                      </span>
                      <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-7 text-xs"
                        autoFocus
                      />
                    </div>
                    <ScrollArea className="h-40">
                      <div className="p-1">
                        <div
                          className={cn(
                            "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent",
                            !clienteId && "bg-accent"
                          )}
                          onClick={() => {
                            onUpdate('clienteId', null)
                            setSearchTerm("")
                            setClientePopoverOpen(false)
                          }}
                        >
                          Nenhum cliente
                        </div>
                        {filteredClientes.map((c) => (
                          <div
                            key={c.id}
                            className={cn(
                              "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent",
                              clienteId === c.id && "bg-accent"
                            )}
                            onClick={() => {
                              onUpdate('clienteId', c.id)
                              if (c.cidade) {
                                onUpdate('municipio', `${c.cidade}/${c.estado}`)
                              }
                              setSearchTerm("")
                              setClientePopoverOpen(false)
                            }}
                          >
                            <div className="truncate">
                              {c.nome_fantasia || c.razao_social}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Municipio */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Municipio</label>
                {clienteId ? (
                  <>
                    <div className="flex h-8 items-center rounded-md border border-input bg-muted px-3 text-xs text-muted-foreground">
                      {municipio || "Municipio do cliente"}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Definido automaticamente pelo cliente selecionado
                    </p>
                  </>
                ) : (
                  <MunicipioCombobox
                    value={municipio || ""}
                    onValueChange={(v) => onUpdate('municipio', v)}
                    placeholder="Selecione um municipio..."
                  />
                )}
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onCopy({ tipo, clienteId, municipio: municipio || undefined })
                setIsOpen(false)
              }}
            >
              <Copy className="mr-1 h-3 w-3" />
              Copiar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
              <Check className="mr-1 h-3 w-3" />
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
