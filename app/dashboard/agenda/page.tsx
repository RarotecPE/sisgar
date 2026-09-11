"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { uploadArquivo } from "@/lib/upload-blob"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MunicipioCombobox } from "@/components/municipio-combobox"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Calendar, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  MapPin,
  Clock,
  Building2,
  CalendarPlus,
  CalendarDays,
  Check,
  X,
  Filter,
  Search,
  Table2,
  Eye,
  User,
  ChevronsUpDown,
  AlertTriangle,
  Send,
  Pencil,
  Paperclip,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"
import { isTipoMedico } from "@/lib/documentos-medicos"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  parseISO, 
  isWeekend,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isSameMonth,
  isToday,
  isBefore,
  addDays
} from "date-fns"
import { ptBR } from "date-fns/locale"

interface Evento {
  id: number
  titulo: string
  descricao: string | null
  data_inicio: string
  data_fim: string | null
  tipo: string | null
  status: string
  local: string | null
  municipio: string | null
  tecnico_rarotec_id: number | null
  cliente_id: number | null
  tecnico_nome: string | null
  cliente_nome: string | null
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Helper para obter nome + sobrenome (evita duplicatas como "Felipe" e "Felipe")
const getNomeSobrenome = (nomeCompleto: string) => {
  const partes = nomeCompleto.trim().split(" ")
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[partes.length - 1]}`
}

// Tipos que requerem cliente ou municipio
const TIPOS_EXTERNOS = [
  { value: "visita", label: "Visita Tecnica", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50", externo: true },
  { value: "treinamento", label: "Treinamento", color: "bg-emerald-500", textColor: "text-emerald-700", bgLight: "bg-emerald-50", externo: true },
  { value: "reuniao", label: "Reuniao", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50", externo: true },
  { value: "implantacao", label: "Implantacao", color: "bg-rose-500", textColor: "text-rose-700", bgLight: "bg-rose-50", externo: true },
  { value: "processo_licitatorio", label: "Processo Licitatório", color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-50", externo: true },
]

// Tipos internos (nao requerem cliente/municipio)
const TIPOS_INTERNOS = [
  { value: "escritorio", label: "Escritorio", color: "bg-cyan-500", textColor: "text-cyan-700", bgLight: "bg-cyan-50", externo: false },
  { value: "home_office", label: "Home-Office", color: "bg-teal-500", textColor: "text-teal-700", bgLight: "bg-teal-50", externo: false },
  { value: "ferias", label: "Ferias", color: "bg-amber-400", textColor: "text-amber-700", bgLight: "bg-amber-50", externo: false },
  { value: "folga", label: "Folga", color: "bg-gray-400", textColor: "text-gray-700", bgLight: "bg-gray-50", externo: false },
  { value: "atestado", label: "Atestado Médico", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50", externo: false },
  { value: "consulta_medica", label: "Consulta Médica", color: "bg-orange-400", textColor: "text-orange-700", bgLight: "bg-orange-50", externo: false },
  { value: "licenca_maternidade", label: "Lic. Maternidade", color: "bg-pink-400", textColor: "text-pink-700", bgLight: "bg-pink-50", externo: false },
  { value: "licenca_paternidade", label: "Lic. Paternidade", color: "bg-indigo-400", textColor: "text-indigo-700", bgLight: "bg-indigo-50", externo: false },
  { value: "licenca_medica", label: "Licenca Medica", color: "bg-red-400", textColor: "text-red-700", bgLight: "bg-red-50", externo: false },
  { value: "suspensao", label: "Suspensao", color: "bg-red-600", textColor: "text-red-700", bgLight: "bg-red-50", externo: false },
  { value: "indisponivel", label: "Indisponivel", color: "bg-gray-600", textColor: "text-gray-700", bgLight: "bg-gray-50", externo: false },
  { value: "feriado", label: "Feriado", color: "bg-lime-500", textColor: "text-lime-700", bgLight: "bg-lime-50", externo: false },
]

const TIPOS_EVENTO = [...TIPOS_EXTERNOS, ...TIPOS_INTERNOS]

// Verifica se um tipo e externo (requer cliente/municipio)
const isTipoExterno = (tipo: string) => TIPOS_EXTERNOS.some(t => t.value === tipo)

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

export default function AgendaPage() {
  const { user, loading: userLoading } = useSession()
  const userIsGestor = user?.nome ? isGestor(user.nome, user.cargo) : false
  const userTecnicoId = user?.tecnico_rarotec_id
  
  const [mesAtual, setMesAtual] = useState(new Date())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(false)
  const [filtroTecnico, setFiltroTecnico] = useState<string>("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const inicioMes = startOfMonth(mesAtual)
  const fimMes = endOfMonth(mesAtual)

  // Buscar eventos de todo o periodo visivel no calendario (pode incluir dias do mes anterior/proximo)
  const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 0 })
  const fimCalendario = endOfWeek(fimMes, { weekStartsOn: 0 })

  const { data: eventos, mutate } = useSWR<Evento[]>(
    `/api/agenda?data_inicio=${format(inicioCalendario, "yyyy-MM-dd")}&data_fim=${format(fimCalendario, "yyyy-MM-dd")}`,
    fetcher
  )
  const { data: tecnicos } = useSWR<TecnicoRarotec[]>("/api/tecnicos-rarotec", fetcher)
  const { data: clientes } = useSWR<Cliente[]>("/api/clientes", fetcher)

  const tecnicosAtivos = tecnicos?.filter(t => t.ativo) || []
  const clientesAtivos = clientes?.filter(c => c.ativo) || []

  const [formData, setFormData] = useState({
    tecnico_rarotec_id: "",
    cliente_id: "",
    municipio: "",
    tipo: "visita",
    descricao: "",
    data_inicio: "",
    data_fim: "",
  })

  const [semanaResumo, setSemanaResumo] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
  
  // Filtros do resumo semanal
  const [filtroResumoTecnico, setFiltroResumoTecnico] = useState<string>("todos")
  const [filtroResumoCliente, setFiltroResumoCliente] = useState<string>("todos")
  const [filtroResumoMunicipio, setFiltroResumoMunicipio] = useState<string>("")
  const [filtroResumoDataInicio, setFiltroResumoDataInicio] = useState<string>("")
  const [filtroResumoDataFim, setFiltroResumoDataFim] = useState<string>("")
  
  // Dias da semana para o resumo
  const diasSemanaResumo = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(semanaResumo, i))
  }, [semanaResumo])

  // Fetch separado para o resumo semanal (pode navegar para fora do mês atual)
  const inicioSemanaResumo = format(semanaResumo, "yyyy-MM-dd")
  const fimSemanaResumo = format(addDays(semanaResumo, 6), "yyyy-MM-dd")
  const { data: eventosResumo } = useSWR<Evento[]>(
    `/api/agenda?data_inicio=${inicioSemanaResumo}&data_fim=${fimSemanaResumo}`,
    fetcher
  )

  const DIAS_SEMANA_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

  // Funcao para verificar se um tipo e externo
  const isTipoExterno = (tipo: string) => TIPOS_EXTERNOS.some(t => t.value === tipo)
  
  // Verifica se o usuario pode editar diretamente um evento
  // Gestores podem editar qualquer evento
  // Tecnicos so podem solicitar alteracao da propria agenda (nao editar diretamente)
  const canEditEvento = (evento: Evento) => {
    // Se o user ainda não carregou, não pode editar
    if (!user?.nome) return false
    // Gestores podem editar qualquer evento
    if (isGestor(user.nome, user.cargo)) return true
    return false // Tecnicos nao podem editar diretamente, apenas solicitar
  }
  
  // Verifica se o usuario pode solicitar alteracao de um evento
  // So pode solicitar se for da propria agenda e nao tiver mais de 2 semanas de atraso
  const canRequestChange = (evento: Evento) => {
    if (!user?.nome) return false
    // Gestores editam direto, não solicitam
    if (isGestor(user.nome, user.cargo)) return false
    if (!userTecnicoId) return false
    if (evento.tecnico_rarotec_id !== userTecnicoId) return false
    
    // Verificar limite de 2 semanas
    const dataEvento = parseISO(evento.data_inicio)
    const limiteAtraso = addDays(new Date(), -14) // 2 semanas atras
    if (isBefore(dataEvento, limiteAtraso)) return false
    
    return true
  }
  
  // Verifica se o usuário é gestor (pode criar diretamente)
  const canCreateDirectly = user?.nome ? isGestor(user.nome, user.cargo) : false
  
  // Verificar se tecnico pode criar solicitacao para si mesmo
  const canCreateRequest = !canCreateDirectly && !!userTecnicoId

  // Dias do mes para o calendario
  const diasCalendario = useMemo(() => {
    const dias: Date[] = []
    let diaAtual = inicioCalendario
    while (diaAtual <= fimCalendario) {
      dias.push(diaAtual)
      diaAtual = addDays(diaAtual, 1)
    }
    return dias
  }, [inicioCalendario, fimCalendario])

  // Eventos filtrados
  const eventosFiltrados = useMemo(() => {
    let filtered = eventos || []
    if (filtroTecnico !== "todos") {
      filtered = filtered.filter(e => e.tecnico_rarotec_id === parseInt(filtroTecnico))
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(e => 
        e.cliente_nome?.toLowerCase().includes(term) ||
        e.tecnico_nome?.toLowerCase().includes(term)
      )
    }
    return filtered
  }, [eventos, filtroTecnico, searchTerm])

  const getEventosDia = (data: Date) => {
    return eventosFiltrados?.filter((e) => isSameDay(parseISO(e.data_inicio), data)) || []
  }

  // Estado para solicitacao de alteracao
  const [isSolicitacaoOpen, setIsSolicitacaoOpen] = useState(false)
  const [solicitacaoEvento, setSolicitacaoEvento] = useState<Evento | null>(null)
  const [solicitacaoDescricao, setSolicitacaoDescricao] = useState("")
  const [solicitacaoTipo, setSolicitacaoTipo] = useState<string>("alteracao")
  // Campos adicionais para novo agendamento
  const [solicitacaoTipoEvento, setSolicitacaoTipoEvento] = useState<string>("visita")
  const [solicitacaoClienteId, setSolicitacaoClienteId] = useState<string>("")
  const [solicitacaoMunicipio, setSolicitacaoMunicipio] = useState<string>("")
  const [solicitacaoArquivo, setSolicitacaoArquivo] = useState<File | null>(null)
  
  // Estado para dialog de escolha quando há evento existente
  const [isEscolhaOpen, setIsEscolhaOpen] = useState(false)
  const [eventosNoDia, setEventosNoDia] = useState<Evento[]>([])
  const [dataSelecionadaParaEscolha, setDataSelecionadaParaEscolha] = useState<Date | null>(null)
  
  const handleDayClick = (data: Date, evento?: Evento) => {
    if (evento) {
      // Se for gestor, pode editar diretamente
      if (canEditEvento(evento)) {
        setSelectedEvento(evento)
        setFormData({
          tecnico_rarotec_id: evento.tecnico_rarotec_id?.toString() || "",
          cliente_id: evento.cliente_id?.toString() || "",
          municipio: evento.municipio || evento.local || "",
          tipo: evento.tipo || "visita",
          descricao: evento.descricao || "",
          data_inicio: evento.data_inicio,
          data_fim: evento.data_fim || "",
        })
        setIsFormOpen(true)
      } 
      // Se pode solicitar alteracao, abre o dialogo de solicitacao
      else if (canRequestChange(evento)) {
        setSolicitacaoEvento(evento)
        setSolicitacaoDescricao("")
        setSolicitacaoTipo("alteracao")
        setIsSolicitacaoOpen(true)
      }
      // Se nao pode nem editar nem solicitar, apenas visualiza
      else {
        alert(`Evento: ${evento.titulo}\nTecnico: ${evento.tecnico_nome}\nData: ${format(parseISO(evento.data_inicio), "dd/MM/yyyy")}\n\nVoce nao pode editar este evento.`)
      }
    } else {
      // Novo evento
      if (canCreateDirectly) {
        // Gestores podem criar diretamente
        setSelectedEvento(null)
        setSelectedDate(data)
        setFormData({
          tecnico_rarotec_id: "",
          cliente_id: "",
          municipio: "",
          tipo: "visita",
          descricao: "",
          data_inicio: format(data, "yyyy-MM-dd'T'09:00"),
          data_fim: format(data, "yyyy-MM-dd'T'18:00"),
        })
        setIsFormOpen(true)
      } else if (canCreateRequest) {
        // Técnicos criam solicitação para si mesmos
        // Verificar se já tem eventos do técnico nesse dia
        const meusEventosNoDia = eventosFiltrados?.filter(e => 
          e.tecnico_rarotec_id === userTecnicoId && 
          isSameDay(parseISO(e.data_inicio), data)
        ) || []
        
        if (meusEventosNoDia.length > 0) {
          // Se já tem evento(s), mostrar dialog de escolha
          setEventosNoDia(meusEventosNoDia)
          setDataSelecionadaParaEscolha(data)
          setIsEscolhaOpen(true)
        } else {
          // Se não tem evento, abre direto para novo
          setSolicitacaoEvento(null)
          setSolicitacaoDescricao("")
          setSolicitacaoTipo("novo")
          setSolicitacaoTipoEvento("visita")
          setSolicitacaoClienteId("")
          setSolicitacaoMunicipio("")
          setSelectedDate(data)
          setIsSolicitacaoOpen(true)
        }
      } else {
        alert("Aguarde o carregamento dos dados...")
      }
    }
  }
  
  // Função para abrir novo agendamento (após escolha)
  const handleNovoAgendamento = () => {
    setIsEscolhaOpen(false)
    if (dataSelecionadaParaEscolha) {
      setSolicitacaoEvento(null)
      setSolicitacaoDescricao("")
      setSolicitacaoTipo("novo")
      setSolicitacaoTipoEvento("visita")
      setSolicitacaoClienteId("")
      setSolicitacaoMunicipio("")
      setSelectedDate(dataSelecionadaParaEscolha)
      setIsSolicitacaoOpen(true)
    }
  }
  
  // Função para alterar evento existente (após escolha)
  const handleAlterarEvento = (evento: Evento) => {
    setIsEscolhaOpen(false)
    setSolicitacaoEvento(evento)
    setSolicitacaoDescricao("")
    setSolicitacaoTipo("alteracao")
    // Pré-preencher com dados do evento atual
    setSolicitacaoTipoEvento(evento.tipo || "visita")
    setSolicitacaoClienteId(evento.cliente_id?.toString() || "")
    setSolicitacaoMunicipio(evento.municipio || evento.local || "")
    setSelectedDate(parseISO(evento.data_inicio))
    setIsSolicitacaoOpen(true)
  }
  
  // Funcao para enviar solicitacao de alteracao ou criacao
  const handleSolicitacaoSubmit = async () => {
    // Para novos agendamentos, validar tipo de evento
    if (solicitacaoTipo === 'novo') {
      const isExterno = TIPOS_EXTERNOS.some(t => t.value === solicitacaoTipoEvento)
      if (isExterno && !solicitacaoClienteId && !solicitacaoMunicipio) {
        alert("Selecione um cliente ou municipio")
        return
      }
    } else if (solicitacaoTipo === 'alteracao') {
      // Para alterações, validar data sugerida
      if (!selectedDate) {
        alert("Selecione a nova data")
        return
      }
      // Para eventos externos, exigir cliente ou municipio
      const isExterno = TIPOS_EXTERNOS.some(t => t.value === solicitacaoTipoEvento)
      if (isExterno && !solicitacaoClienteId && !solicitacaoMunicipio) {
        alert("Selecione um cliente ou municipio")
        return
      }
    } else if (!solicitacaoDescricao.trim()) {
      alert("Descreva a solicitacao")
      return
    }
    
    // Montar descricao automatica para novos agendamentos
    let descricaoFinal = solicitacaoDescricao
    if (solicitacaoTipo === 'novo') {
      const tipoLabel = TIPOS_EVENTO.find(t => t.value === solicitacaoTipoEvento)?.label || solicitacaoTipoEvento
      const isExterno = TIPOS_EXTERNOS.some(t => t.value === solicitacaoTipoEvento)
      
      if (isExterno) {
        const clienteNome = solicitacaoClienteId 
          ? clientes?.find(c => c.id === parseInt(solicitacaoClienteId))?.nome_fantasia || 
            clientes?.find(c => c.id === parseInt(solicitacaoClienteId))?.razao_social
          : null
        const destino = clienteNome || solicitacaoMunicipio || "Sem destino"
        descricaoFinal = `${tipoLabel} - ${destino}${solicitacaoDescricao ? '. ' + solicitacaoDescricao : ''}`
      } else {
        descricaoFinal = `${tipoLabel}${solicitacaoDescricao ? '. ' + solicitacaoDescricao : ''}`
      }
    }
    
    setLoading(true)
    try {
      // Se for tipo medico e houver arquivo, faz upload primeiro (blob privado)
      let anexo: { pathname: string; nome: string; tipo: string; tamanho: number } | null = null
      if (isTipoMedico(solicitacaoTipoEvento) && solicitacaoArquivo) {
        const blob = await uploadArquivo(solicitacaoArquivo)
        anexo = {
          pathname: blob.pathname,
          nome: solicitacaoArquivo.name,
          tipo: solicitacaoArquivo.type,
          tamanho: solicitacaoArquivo.size,
        }
      }

      await fetch("/api/agenda-solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agenda_evento_id: solicitacaoEvento?.id || null,
          tecnico_solicitante_id: userTecnicoId,
          tipo_solicitacao: solicitacaoTipo,
          descricao: descricaoFinal,
          dados_alteracao: (solicitacaoTipo === 'novo' || solicitacaoTipo === 'alteracao') && selectedDate ? {
            data_sugerida: format(selectedDate, "yyyy-MM-dd"),
            tipo_evento: solicitacaoTipoEvento,
            cliente_id: solicitacaoClienteId || null,
            municipio: solicitacaoMunicipio || null,
            anexo_pathname: anexo?.pathname || null,
            anexo_nome: anexo?.nome || null,
            anexo_tipo: anexo?.tipo || null,
            anexo_tamanho: anexo?.tamanho || null,
          } : null,
        }),
      })
      alert("Solicitacao enviada com sucesso! Aguarde a aprovacao.")
      setIsSolicitacaoOpen(false)
      setSolicitacaoEvento(null)
      setSolicitacaoDescricao("")
      setSelectedDate(null)
      setSolicitacaoArquivo(null)
    } catch (error) {
      console.error("Erro ao enviar solicitacao:", error)
      alert("Erro ao enviar solicitacao")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.tecnico_rarotec_id) {
      alert("Selecione o tecnico")
      return
    }

    setLoading(true)
    try {
      const clienteSelecionado = formData.cliente_id 
        ? clientesAtivos.find((c) => c.id === parseInt(formData.cliente_id))
        : null
      const tipoLabel = TIPOS_EVENTO.find(t => t.value === formData.tipo)?.label
      
      // Titulo pode ser com cliente, municipio ou apenas o tipo
      const destino = clienteSelecionado 
        ? (clienteSelecionado.nome_fantasia || clienteSelecionado.razao_social)
        : formData.municipio || tipoLabel
      const titulo = `${tipoLabel}${destino !== tipoLabel ? ` - ${destino}` : ""}`

      const url = selectedEvento ? `/api/agenda/${selectedEvento.id}` : "/api/agenda"
      const method = selectedEvento ? "PUT" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          titulo,
          tecnico_rarotec_id: parseInt(formData.tecnico_rarotec_id),
          cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
          local: formData.municipio || null,
          status: "agendado",
        }),
      })
      mutate()
      setIsFormOpen(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este agendamento?")) return
    try {
      await fetch(`/api/agenda/${id}`, { method: "DELETE" })
      mutate()
      setIsFormOpen(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
    }
  }

  const resetForm = () => {
    setSelectedEvento(null)
    setSelectedDate(null)
    setFormData({
      tecnico_rarotec_id: "",
      cliente_id: "",
      municipio: "",
      tipo: "visita",
      descricao: "",
      data_inicio: "",
      data_fim: "",
    })
  }

  const getTipoStyle = (tipo: string | null) => {
    return TIPOS_EVENTO.find(t => t.value === tipo) || TIPOS_EVENTO[0]
  }

  // Resumo do mes
  const resumoMes = useMemo(() => {
    const eventosDoMes = eventosFiltrados?.filter(e => 
      isSameMonth(parseISO(e.data_inicio), mesAtual)
    ) || []
    
    const porTecnico: Record<string, number> = {}
    eventosDoMes.forEach(e => {
      const nome = getNomeSobrenome(e.tecnico_nome || "Sem tecnico")
      porTecnico[nome] = (porTecnico[nome] || 0) + 1
    })

    return {
      total: eventosDoMes.length,
      porTecnico
    }
  }, [eventosFiltrados, mesAtual])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Cabecalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie a agenda de visitas e atendimentos
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Ver Resumo
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Resumo Semanal</SheetTitle>
              </SheetHeader>
              
              {/* Navegacao da semana */}
              <div className="flex items-center justify-between mt-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSemanaResumo(prev => addDays(prev, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <div className="font-semibold">
                    {format(diasSemanaResumo[0], "dd/MM", { locale: ptBR })} - {format(diasSemanaResumo[6], "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-xs h-auto p-0"
                    onClick={() => setSemanaResumo(startOfWeek(new Date(), { weekStartsOn: 0 }))}
                  >
                    Ir para semana atual
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSemanaResumo(prev => addDays(prev, 7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Filtros do resumo - linha unica centralizada */}
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <Select value={filtroResumoTecnico} onValueChange={setFiltroResumoTecnico}>
                  <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
                    <User className="h-3 w-3 mr-1 shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {tecnicosAtivos.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>{getNomeSobrenome(t.nome)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filtroResumoCliente} onValueChange={setFiltroResumoCliente}>
                  <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
                    <Building2 className="h-3 w-3 mr-1 shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {clientes?.filter(c => c.ativo).map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nome_fantasia || c.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs w-[130px] pl-7"
                    placeholder="Municipio..."
                    value={filtroResumoMunicipio}
                    onChange={(e) => setFiltroResumoMunicipio(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    className="h-8 text-xs w-[130px]"
                    value={filtroResumoDataInicio}
                    onChange={(e) => setFiltroResumoDataInicio(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">a</span>
                  <Input
                    type="date"
                    className="h-8 text-xs w-[130px]"
                    value={filtroResumoDataFim}
                    onChange={(e) => setFiltroResumoDataFim(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                {tecnicosAtivos
                  .filter(tecnico => filtroResumoTecnico === "todos" || tecnico.id.toString() === filtroResumoTecnico)
                  .map(tecnico => {
                  // Coleta todos os eventos do tecnico na semana (ou periodo filtrado)
                  const diasParaFiltrar = filtroResumoDataInicio && filtroResumoDataFim
                    ? (() => {
                        const inicio = parseISO(filtroResumoDataInicio)
                        const fim = parseISO(filtroResumoDataFim)
                        const dias: Date[] = []
                        let atual = inicio
                        while (atual <= fim) {
                          dias.push(atual)
                          atual = addDays(atual, 1)
                        }
                        return dias
                      })()
                    : diasSemanaResumo
                  
                  const eventosSemana = diasParaFiltrar.map(dia => {
                    const eventosNoDia = eventosResumo?.filter(e => {
                      if (e.tecnico_rarotec_id !== tecnico.id) return false
                      if (!isSameDay(parseISO(e.data_inicio), dia)) return false
                      
                      // Filtro por cliente
                      if (filtroResumoCliente !== "todos" && e.cliente_id?.toString() !== filtroResumoCliente) {
                        return false
                      }
                      
                      // Filtro por municipio (busca textual)
                      if (filtroResumoMunicipio.trim()) {
                        const eventoMunicipio = e.local || e.municipio || ""
                        if (!eventoMunicipio.toLowerCase().includes(filtroResumoMunicipio.toLowerCase())) {
                          return false
                        }
                      }
                      
                      return true
                    }) || []
                    return {
                      dia,
                      diaSemana: DIAS_SEMANA_LABELS[dia.getDay()],
                      itens: eventosNoDia
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
                        <div>
                          <div className="font-semibold">{getNomeSobrenome(tecnico.nome)}</div>
                          <div className="text-xs text-muted-foreground">{tecnico.cargo}</div>
                        </div>
                      </div>
                      </div>
                      
                      <div className="space-y-2">
                        {eventosSemana.map(({ dia, diaSemana, itens }) => {
                          if (itens.length === 0) return null
                          const isFds = dia.getDay() === 0 || dia.getDay() === 6
                          
                          return (
                            <div key={dia.toISOString()} className={cn("flex gap-3 p-2 rounded", isFds ? "bg-red-500/10 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200/50 dark:border-red-900/40" : "bg-muted/30 dark:bg-muted/15")}>
                              <div className={cn("text-sm font-medium w-16", isFds ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                                {diaSemana} {format(dia, "dd")}
                              </div>
                              <div className="flex-1 space-y-1">
                                {itens.map((item, idx) => {
                                  const tipo = item.tipo || "visita"
                                  const allTipos = [...TIPOS_EXTERNOS, ...TIPOS_INTERNOS]
                                  const tipoConfig = allTipos.find(t => t.value === tipo) || allTipos[0]
                                  const isExterno = isTipoExterno(tipo)
                                  
                                  // Determina o local/destino
                                  let destino = ""
                                  if (isExterno) {
                                    if (item.cliente_nome) {
                                      destino = item.cliente_nome
                                    } else if (item.local || item.municipio) {
                                      destino = item.local || item.municipio || ""
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
                  const total = diasSemanaResumo.reduce((acc, dia) => {
                    const eventosNoDia = eventosResumo?.filter(e => 
                      e.tecnico_rarotec_id === t.id &&
                      isSameDay(parseISO(e.data_inicio), dia)
                    ) || []
                    return acc + eventosNoDia.length
                  }, 0)
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
          
          {/* Botões sempre visíveis - a lógica de permissão é aplicada na ação */}
          <Button variant="outline" asChild>
            <Link href="/dashboard/agenda/planejamento">
              <Table2 className="mr-2 h-4 w-4" />
              Planejamento Semanal
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel Lateral - Filtros e Resumo */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cliente ou tecnico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tecnico</Label>
                <Select value={filtroTecnico} onValueChange={setFiltroTecnico}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tecnicos</SelectItem>
                    {tecnicosAtivos.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Mes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumo do Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{resumoMes.total}</div>
              <p className="text-sm text-muted-foreground mb-4">agendamentos</p>
              
              <Separator className="my-3" />
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Por Tecnico</p>
                {Object.entries(resumoMes.porTecnico).map(([nome, count]) => (
                  <div key={nome} className="flex items-center justify-between text-sm">
                    <span className="truncate">{getNomeSobrenome(nome)}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {Object.keys(resumoMes.porTecnico).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Legenda */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TIPOS_EVENTO.map((tipo) => (
                <div key={tipo.value} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${tipo.color}`} />
                  <span className="text-sm">{tipo.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Calendario Principal */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl capitalize">
                {format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setMesAtual(new Date())}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMesAtual(subMonths(mesAtual, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMesAtual(addMonths(mesAtual, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Cabecalho dos dias da semana */}
            <div className="grid grid-cols-7 mb-2 gap-1.5">
              {DIAS_SEMANA.map((dia, i) => (
                <div 
                  key={dia} 
                  className={cn(
                    "py-2 text-center text-xs font-semibold uppercase tracking-wider",
                    i === 0 || i === 6 ? "text-muted-foreground/60" : "text-muted-foreground"
                  )}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid do calendario */}
            <div className="grid grid-cols-7 gap-1.5">
              {diasCalendario.map((dia) => {
                const eventosDia = getEventosDia(dia)
                const isHoje = isToday(dia)
                const isMesAtual = isSameMonth(dia, mesAtual)
                const isFimDeSemana = isWeekend(dia)
                
                // Determinar periodo relativo a semana atual
                const inicioSemanaAtual = startOfWeek(new Date(), { weekStartsOn: 0 })
                const fimSemanaAtual = endOfWeek(new Date(), { weekStartsOn: 0 })
                const isSemanaPassada = dia < inicioSemanaAtual
                const isSemanaAtual = dia >= inicioSemanaAtual && dia <= fimSemanaAtual
                
                // Estilo do fundo e borda da celula compativel com modo claro e escuro
                let cellTheme = "bg-card dark:bg-card/70 border-border/60 hover:bg-accent/40 dark:hover:bg-accent/25"
                if (!isMesAtual) {
                  cellTheme = "opacity-35 bg-muted/20 dark:bg-muted/10 border-border/30 hover:opacity-75"
                } else if (isHoje) {
                  cellTheme = "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/[0.06] dark:bg-primary/[0.14] border-primary/50 shadow-xs"
                } else if (isFimDeSemana) {
                  cellTheme = "bg-muted/35 dark:bg-muted/15 border-border/40 hover:bg-muted/50 dark:hover:bg-muted/25"
                } else if (isSemanaAtual) {
                  cellTheme = "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.10] border-emerald-500/25 dark:border-emerald-500/30 hover:bg-emerald-500/[0.09] dark:hover:bg-emerald-500/[0.15]"
                } else if (isSemanaPassada) {
                  cellTheme = "bg-blue-50/40 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/30"
                }

                // Tipos únicos para os mini indicadores coloridos
                const tiposNoDia = Array.from(new Set(eventosDia.map((e) => e.tipo || "visita"))).slice(0, 4)

                return (
                  <div
                    key={dia.toISOString()}
                    className={cn(
                      "group min-h-28 rounded-lg border p-2 flex flex-col justify-between transition-all cursor-pointer select-none",
                      cellTheme
                    )}
                    onClick={() => handleDayClick(dia)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors",
                          isHoje
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : !isMesAtual
                            ? "text-muted-foreground/50 font-normal"
                            : isFimDeSemana
                            ? "text-muted-foreground font-medium"
                            : "text-foreground font-medium"
                        )}
                      >
                        {format(dia, "d")}
                      </span>
                      {isHoje && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Hoje
                        </span>
                      )}
                    </div>

                    {eventosDia.length > 0 && (
                      <div className="mt-auto pt-2 flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            "inline-flex w-full items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors border shadow-2xs",
                            isHoje
                              ? "bg-primary/15 text-primary border-primary/30 dark:bg-primary/25 dark:text-blue-200 dark:border-primary/40"
                              : "bg-primary/10 text-primary border-primary/20 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 group-hover:bg-primary/20 dark:group-hover:bg-blue-500/25"
                          )}
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary dark:bg-blue-400" />
                          <span className="font-semibold tabular-nums">{eventosDia.length}</span>
                          <span className="hidden sm:inline text-[10px]">{eventosDia.length === 1 ? "evento" : "eventos"}</span>
                        </span>

                        {tiposNoDia.length > 1 && (
                          <div className="flex items-center gap-1 justify-center py-0.5">
                            {tiposNoDia.map((t) => {
                              const cfg = TIPOS_EVENTO.find((x) => x.value === t) || TIPOS_EVENTO[0]
                              return (
                                <span
                                  key={t}
                                  className={cn("h-1.5 w-1.5 rounded-full ring-1 ring-background", cfg.color)}
                                  title={cfg.label}
                                />
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de agendamento individual */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormOpen(open) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedEvento ? "Editar Agendamento" : "Novo Agendamento"}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Tecnico */}
            <div className="space-y-2">
              <Label>Tecnico *</Label>
              <Select
                value={formData.tecnico_rarotec_id}
                onValueChange={(value) => setFormData({ ...formData, tecnico_rarotec_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tecnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicosAtivos.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {t.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cliente (opcional) */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => {
                  const cliente = clientesAtivos.find(c => c.id === parseInt(value))
                  setFormData({ 
                    ...formData, 
                    cliente_id: value,
                    // Preenche municipio automaticamente se cliente tiver cidade
                    municipio: cliente?.cidade ? `${cliente.cidade}/${cliente.estado}` : formData.municipio
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-60">
                    {clientesAtivos.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        <div className="flex flex-col">
                          <span className="font-medium">{c.nome_fantasia || c.razao_social}</span>
                          {c.cidade && (
                            <span className="text-xs text-muted-foreground">
                              {c.cidade}/{c.estado}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Municipio */}
            <div className="space-y-2">
              <Label>Municipio</Label>
              <MunicipioCombobox
                value={formData.municipio || ""}
                onValueChange={(v) => setFormData({ ...formData, municipio: v })}
                placeholder="Selecione um municipio..."
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo de Atendimento</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS_EVENTO.map((tipo) => (
                  <Button
                    key={tipo.value}
                    type="button"
                    variant={formData.tipo === tipo.value ? "default" : "outline"}
                    size="sm"
                    className={`justify-start ${formData.tipo === tipo.value ? tipo.color : ""}`}
                    onClick={() => setFormData({ ...formData, tipo: tipo.value })}
                  >
                    <div className={`h-2 w-2 rounded-full mr-2 ${formData.tipo === tipo.value ? "bg-white" : tipo.color}`} />
                    <span className="text-xs">{tipo.label.split(" ")[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data/Hora Inicio</Label>
                <Input
                  type="datetime-local"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data/Hora Fim</Label>
                <Input
                  type="datetime-local"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                />
              </div>
            </div>

            {/* Descricao */}
            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Anotacoes sobre o atendimento..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {selectedEvento && (
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(selectedEvento.id)}
                className="mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : selectedEvento ? "Atualizar" : "Agendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de escolha - quando já há evento no dia */}
      <Dialog open={isEscolhaOpen} onOpenChange={setIsEscolhaOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Você já tem agendamento neste dia</DialogTitle>
            <DialogDescription>
              {dataSelecionadaParaEscolha && format(dataSelecionadaParaEscolha, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O que você deseja fazer?
            </p>
            
            {/* Lista de eventos existentes */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Seus agendamentos neste dia:
              </p>
              {eventosNoDia.map((evento) => (
                <div 
                  key={evento.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{evento.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {evento.cliente_nome || evento.municipio || evento.local || "-"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAlterarEvento(evento)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Alterar
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <Button
                className="w-full"
                onClick={handleNovoAgendamento}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo Agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de solicitacao de alteracao/criacao - Para tecnicos */}
      <Dialog open={isSolicitacaoOpen} onOpenChange={setIsSolicitacaoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {solicitacaoTipo === 'novo' ? 'Solicitar Novo Agendamento' : 'Solicitar Alteracao'}
            </DialogTitle>
            <DialogDescription>
              {solicitacaoTipo === 'novo' 
                ? 'Descreva o agendamento que voce precisa. A solicitacao sera analisada pela coordenacao.'
                : 'Descreva a alteracao que voce precisa neste agendamento. A solicitacao sera analisada pela coordenacao.'}
            </DialogDescription>
          </DialogHeader>
          
          {solicitacaoEvento && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p><strong>Evento:</strong> {solicitacaoEvento.titulo}</p>
              <p><strong>Data:</strong> {format(parseISO(solicitacaoEvento.data_inicio), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          )}
          
          {solicitacaoTipo === 'novo' && selectedDate && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p><strong>Data Selecionada:</strong> {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          )}
          
          <div className="space-y-4 py-2">
            {solicitacaoTipo !== 'novo' && (
              <div className="space-y-2">
                <Label>Tipo de Solicitação</Label>
                <Select value={solicitacaoTipo} onValueChange={setSolicitacaoTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alteracao">Alteração de Data/Cliente</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Campos para novo agendamento OU alteração */}
            {(solicitacaoTipo === 'novo' || solicitacaoTipo === 'alteracao') && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de Evento *</Label>
                  <Select value={solicitacaoTipoEvento} onValueChange={setSolicitacaoTipoEvento}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_EVENTO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tipo.color}`} />
                            {tipo.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Anexo do documento medico (atestado, consulta, licenca) */}
                {isTipoMedico(solicitacaoTipoEvento) && (
                  <div className="space-y-2 rounded-lg border border-red-200/60 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/25 p-3">
                    <Label className="flex items-center gap-2 text-red-800 dark:text-red-300">
                      <Paperclip className="h-4 w-4" />
                      Anexar Documento (atestado/comprovante)
                    </Label>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      Anexe o documento agora para agilizar. Se preferir, pode anexar depois na tela de Documentos Médicos, mas ficará pendente até o envio.
                    </p>
                    {solicitacaoArquivo ? (
                      <div className="flex items-center justify-between gap-2 rounded-md bg-white dark:bg-card border border-red-100 dark:border-red-900/30 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0 text-red-600" />
                          <span className="truncate">{solicitacaoArquivo.name}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-600 hover:text-red-800"
                          onClick={() => setSolicitacaoArquivo(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setSolicitacaoArquivo(e.target.files?.[0] || null)}
                      />
                    )}
                  </div>
                )}
                
                {/* Nova data sugerida - para alterações */}
                {solicitacaoTipo === 'alteracao' && (
                  <div className="space-y-2">
                    <Label>Nova Data Sugerida *</Label>
                    <Input
                      type="date"
                      value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => setSelectedDate(e.target.value ? parseISO(e.target.value) : null)}
                      min={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                )}
                
                {/* Cliente - apenas para tipos externos */}
                {TIPOS_EXTERNOS.some(t => t.value === solicitacaoTipoEvento) && (
                  <>
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select 
                        value={solicitacaoClienteId || "none"} 
                        onValueChange={(val) => setSolicitacaoClienteId(val === "none" ? "" : val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum cliente</SelectItem>
                          {clientes?.filter(c => c.ativo).map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                              {cliente.nome_fantasia || cliente.razao_social}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Município {!solicitacaoClienteId && '*'}</Label>
                      <MunicipioCombobox
                        value={solicitacaoMunicipio}
                        onValueChange={setSolicitacaoMunicipio}
                        placeholder="Selecione o município..."
                      />
                    </div>
                  </>
                )}
              </>
            )}
            
            <div className="space-y-2">
              <Label>
                {solicitacaoTipo === 'novo' || solicitacaoTipo === 'alteracao' 
                  ? 'Observações (opcional)' 
                  : 'Descrição da Solicitação *'}
              </Label>
              <Input
                value={solicitacaoDescricao}
                onChange={(e) => setSolicitacaoDescricao(e.target.value)}
                placeholder={solicitacaoTipo === 'novo' || solicitacaoTipo === 'alteracao'
                  ? "Alguma observação adicional..."
                  : "Descreva o que precisa ser alterado..."}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsSolicitacaoOpen(false); setSolicitacaoArquivo(null) }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSolicitacaoSubmit} 
              disabled={
                loading ||
                (solicitacaoTipo !== 'novo' && solicitacaoTipo !== 'alteracao' && !solicitacaoDescricao.trim()) ||
                (solicitacaoTipo === 'alteracao' && !selectedDate) ||
                ((solicitacaoTipo === 'novo' || solicitacaoTipo === 'alteracao') &&
                  TIPOS_EXTERNOS.some(t => t.value === solicitacaoTipoEvento) &&
                  !solicitacaoClienteId &&
                  !solicitacaoMunicipio)
              }
            >
              {loading ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
