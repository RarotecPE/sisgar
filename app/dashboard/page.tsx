"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, FileText, Calendar, TrendingUp, Clock, ArrowRight, AlertTriangle, MapPin, CalendarClock, Check, X, Stethoscope, ClipboardCheck } from "lucide-react"
import { LABEL_TIPO_MEDICO } from "@/lib/documentos-medicos"
import Link from "next/link"
import useSWR from "swr"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Definição das estatísticas e cards de acesso rápido
const statCards = [
  {
    title: "Tecnicos Ativos",
    description: "Profissionais em campo",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    key: "tecnicos",
    href: "/dashboard/tecnicos-rarotec",
    gestorOnly: true,
  },
  {
    title: "Clientes",
    description: "Empresas atendidas",
    icon: Building2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    key: "clientes",
    href: "/dashboard/clientes",
  },
  {
    title: "Pendentes",
    description: "Atendimentos sem relatório",
    icon: FileText,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    key: "relatoriosPendentes",
    href: "/dashboard/relatorios/batimento",
    gestorOnly: true, // Apenas gestores veem pendências de batimento
  },
  {
    title: "Agenda Hoje",
    description: "Compromissos do dia",
    icon: Calendar,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    key: "agendaHoje",
    href: "/dashboard/agenda",
  },
]

export default function DashboardPage() {
  const { user } = useSession()
  const userIsGestor = user?.nome ? isGestor(user.nome, user.cargo) : false
  const tecnicoId = user?.tecnico_rarotec_id
  
  // Construir URLs com parâmetros de filtro
  const statsUrl = `/api/dashboard/stats?is_gestor=${userIsGestor}${tecnicoId ? `&tecnico_id=${tecnicoId}` : ''}`
  const activitiesUrl = `/api/dashboard/activities?is_gestor=${userIsGestor}${tecnicoId ? `&tecnico_id=${tecnicoId}` : ''}`
  const scheduleUrl = `/api/dashboard/schedule?is_gestor=${userIsGestor}${tecnicoId ? `&tecnico_id=${tecnicoId}` : ''}`
  
  // Buscar estatísticas
  const { data: stats } = useSWR(statsUrl, fetcher)
  
  // Buscar atividades recentes
  const { data: activities } = useSWR(activitiesUrl, fetcher)
  
  // Buscar próximos compromissos
  const { data: schedule } = useSWR(scheduleUrl, fetcher)
  
  // Buscar pendências de batimento do usuário
  const { data: pendencias } = useSWR(
    user?.tecnico_rarotec_id ? `/api/dashboard/pendencias?tecnico_id=${user.tecnico_rarotec_id}` : null,
    fetcher
  )
  
  // Buscar pendências de documentação médica (gestor vê de todos; técnico vê as próprias)
  const pendenciasMedicasUrl = userIsGestor
    ? '/api/dashboard/pendencias-medicas'
    : tecnicoId
      ? `/api/dashboard/pendencias-medicas?tecnico_id=${tecnicoId}`
      : null
  const { data: pendenciasMedicas } = useSWR(pendenciasMedicasUrl, fetcher)
  
  // Buscar documentos medicos aguardando analise/validacao (apenas gestores)
  const { data: documentosAnalise } = useSWR(
    userIsGestor ? '/api/dashboard/documentos-analise' : null,
    fetcher
  )
  
  // Buscar solicitações de agenda pendentes (apenas para gestores)
  const { data: solicitacoesPendentes, mutate: mutateSolicitacoes } = useSWR(
    userIsGestor ? '/api/agenda-solicitacoes/pendentes' : null,
    fetcher
  )
  
  // Função para aprovar/rejeitar solicitação
  const handleSolicitacao = async (id: number, acao: 'aprovar' | 'rejeitar') => {
    try {
      await fetch('/api/agenda-solicitacoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: acao === 'aprovar' ? 'aprovado' : 'rejeitado',
          aprovado_por: user?.id
        })
      })
      mutateSolicitacoes()
    } catch (error) {
      console.error('Erro ao processar solicitação:', error)
    }
  }
  
  // Filtrar cards baseado em permissões
  const visibleStatCards = statCards.filter(card => {
    if (card.gestorOnly && !userIsGestor) return false
    return true
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visao geral do Sistema de Gestao Administrativa
        </p>
      </div>

      {/* Alerta de Pendências de Batimento */}
      {pendencias && pendencias.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  Pendencias de Relatorio ({pendencias.length})
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Voce possui visitas a clientes/municipios sem relatorio correspondente
                </p>
                <div className="mt-3 space-y-2">
                  {pendencias.slice(0, 3).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100/50 rounded-md px-3 py-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{p.local || p.titulo}</span>
                      <span className="text-amber-600">-</span>
                      <span>{format(new Date(String(p.data_inicio).slice(0, 10) + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  ))}
                  {pendencias.length > 3 && (
                    <p className="text-xs text-amber-600">
                      + {pendencias.length - 3} outras pendencias
                    </p>
                  )}
                </div>
                <Link 
                  href="/dashboard/relatorios/novo"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-700 hover:text-amber-900"
                >
                  Criar Relatorio
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Documentação Médica Pendente (vermelho) */}
      {pendenciasMedicas && pendenciasMedicas.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <Stethoscope className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  Documentacao Medica Pendente ({pendenciasMedicas.length})
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {userIsGestor
                    ? "Existem eventos medicos na agenda sem documento (atestado/licenca) anexado"
                    : "Voce possui eventos medicos na agenda sem documento anexado"}
                </p>
                <div className="mt-3 space-y-2">
                  {pendenciasMedicas.slice(0, 3).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm text-red-800 bg-red-100/50 rounded-md px-3 py-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{LABEL_TIPO_MEDICO[p.tipo] || p.tipo}</span>
                      {userIsGestor && p.tecnico_nome && (
                        <>
                          <span className="text-red-600">-</span>
                          <span>{p.tecnico_nome}</span>
                        </>
                      )}
                      <span className="text-red-600">-</span>
                      <span>{format(new Date(String(p.data_inicio).slice(0, 10) + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  ))}
                  {pendenciasMedicas.length > 3 && (
                    <p className="text-xs text-red-600">
                      + {pendenciasMedicas.length - 3} outras pendencias
                    </p>
                  )}
                </div>
                <Link 
                  href="/dashboard/documentos-medicos/anexos"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-red-700 hover:text-red-900"
                >
                  Anexar Documento
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Documentos Medicos Aguardando Analise (teal) - Apenas para gestores */}
      {userIsGestor && documentosAnalise && documentosAnalise.length > 0 && (
        <Card className="mb-8 border-teal-200 bg-teal-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100">
                <ClipboardCheck className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-teal-900">
                  Documentos Medicos para Analise ({documentosAnalise.length})
                </h3>
                <p className="text-sm text-teal-700 mt-1">
                  Documentos anexados por tecnicos aguardando validacao da coordenacao/gerencia
                </p>
                <div className="mt-3 space-y-2">
                  {documentosAnalise.slice(0, 3).map((d: any) => (
                    <div key={d.id} className="flex items-center gap-2 text-sm text-teal-800 bg-teal-100/50 rounded-md px-3 py-2">
                      <Stethoscope className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{LABEL_TIPO_MEDICO[d.tipo] || d.tipo}</span>
                      {d.tecnico_nome && (
                        <>
                          <span className="text-teal-600">-</span>
                          <span className="truncate">{d.tecnico_nome}</span>
                        </>
                      )}
                      <span className="text-teal-600">-</span>
                      <span>{format(new Date(String(d.data_inicio).slice(0, 10) + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  ))}
                  {documentosAnalise.length > 3 && (
                    <p className="text-xs text-teal-600">
                      + {documentosAnalise.length - 3} outros documentos
                    </p>
                  )}
                </div>
                <Link 
                  href="/dashboard/documentos-medicos/batimento"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-700 hover:text-teal-900"
                >
                  Analisar Documentos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitações de Agenda Pendentes - Apenas para gestores */}
      {userIsGestor && solicitacoesPendentes && solicitacoesPendentes.length > 0 && (
        <Card className="mb-8 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <CalendarClock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-900">
                  Solicitacoes de Agenda ({solicitacoesPendentes.length})
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Tecnicos solicitaram alteracoes em suas agendas
                </p>
                <div className="mt-3 space-y-2">
                  {solicitacoesPendentes.slice(0, 5).map((s: any) => {
                    const alteracao = s.dados_alteracao
                    const isAlteracao = s.tipo_solicitacao === 'alteracao'
                    const tipoLabel = alteracao?.tipo_evento === 'visita' ? 'Visita Técnica' 
                      : alteracao?.tipo_evento === 'treinamento' ? 'Treinamento'
                      : alteracao?.tipo_evento === 'reuniao' ? 'Reunião'
                      : alteracao?.tipo_evento === 'interno' ? 'Interno'
                      : alteracao?.tipo_evento === 'folga' ? 'Folga'
                      : alteracao?.tipo_evento === 'ferias' ? 'Férias'
                      : alteracao?.tipo_evento === 'atestado' ? 'Atestado'
                      : alteracao?.tipo_evento || ''
                    
                    return (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-sm text-blue-800 bg-blue-100/50 rounded-md px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.tecnico_nome || 'Técnico'}</p>
                        <p className="text-xs text-blue-600 line-clamp-2 break-words">
                          {s.tipo_solicitacao === 'novo' ? 'Novo Agendamento' : s.tipo_solicitacao === 'alteracao' ? 'Alteração' : s.tipo_solicitacao === 'cancelamento' ? 'Cancelamento' : 'Outro'}
                          {s.descricao && `: ${s.descricao}`}
                        </p>
                        
                        {/* Mostrar detalhes da alteração */}
                        {isAlteracao && s.evento_data && alteracao?.data_sugerida && (
                          <p className="text-xs text-blue-500">
                            <span className="font-medium">Data:</span> {format(new Date(s.evento_data), "dd/MM/yyyy", { locale: ptBR })} → {format(new Date(alteracao.data_sugerida + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                        {isAlteracao && s.evento_local !== alteracao?.municipio && alteracao?.municipio && (
                          <p className="text-xs text-blue-500">
                            <span className="font-medium">Local:</span> {s.evento_local || '(vazio)'} → {alteracao.municipio}
                          </p>
                        )}
                        {isAlteracao && s.evento_tipo !== alteracao?.tipo_evento && alteracao?.tipo_evento && (
                          <p className="text-xs text-blue-500">
                            <span className="font-medium">Tipo:</span> {s.evento_tipo || '(vazio)'} → {tipoLabel}
                          </p>
                        )}
                        
                        {/* Para novos agendamentos */}
                        {s.tipo_solicitacao === 'novo' && (
                          <p className="text-xs text-blue-500">
                            {tipoLabel} - {alteracao?.municipio || 'Sem local'} - {alteracao?.data_sugerida ? format(new Date(alteracao.data_sugerida + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR }) : ''}
                          </p>
                        )}
                        
                        {/* Para cancelamentos e outros */}
                        {s.tipo_solicitacao !== 'novo' && s.tipo_solicitacao !== 'alteracao' && s.evento_titulo && (
                          <p className="text-xs text-blue-500">
                            {s.evento_titulo} - {s.evento_data ? format(new Date(s.evento_data), "dd/MM/yyyy", { locale: ptBR }) : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => handleSolicitacao(s.id, 'aprovar')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleSolicitacao(s.id, 'rejeitar')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStatCards.map((card) => {
          const Icon = card.icon
          const value = stats?.[card.key as keyof typeof stats] ?? 0
          
          return (
            <Link key={card.key} href={card.href}>
              <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {card.key === "agendaHoje" && !userIsGestor 
                          ? "Meus compromissos hoje" 
                          : card.description}
                      </p>
                    </div>
                    <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-200 group-hover:w-full" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-medium">
                {userIsGestor ? "Atividades Recentes" : "Minhas Atividades"}
              </CardTitle>
              <CardDescription className="text-sm">
                {userIsGestor ? "Últimos relatórios registrados" : "Meus últimos relatórios"}
              </CardDescription>
            </div>
            <Link 
              href="/dashboard/relatorios"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {!activities || activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity: Record<string, unknown>) => (
                  <div
                    key={String(activity.id)}
                    className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {String(activity.cliente || activity.municipio || "Nao informado")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.tipo_servico ? String(activity.tipo_servico) : "Visita tecnica"} - {new Date(String(activity.data)).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge 
                      variant={activity.status === "concluido" ? "default" : "secondary"}
                      className={
                        activity.status === "concluido"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }
                    >
                      {activity.status === "concluido" ? "Concluido" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-medium">
                {userIsGestor ? "Próximos Compromissos" : "Minha Agenda"}
              </CardTitle>
              <CardDescription className="text-sm">
                {userIsGestor ? "Agenda da semana" : "Meus próximos compromissos"}
              </CardDescription>
            </div>
            <Link 
              href="/dashboard/agenda"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver agenda
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {!schedule || schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhum compromisso agendado
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedule.map((item: Record<string, unknown>) => {
                  const date = new Date(String(item.data_inicio))
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={String(item.id)}
                      className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                        <span className="text-xs font-medium">
                          {date.toLocaleDateString("pt-BR", { day: "2-digit" })}
                        </span>
                        <span className="text-[10px] uppercase">
                          {date.toLocaleDateString("pt-BR", { month: "short" })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {String(item.titulo)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.tecnico_nome ? String(item.tecnico_nome) : "Sem tecnico"} 
                          {item.cliente_nome && ` - ${String(item.cliente_nome)}`}
                        </p>
                      </div>
                      {isToday && (
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                          Hoje
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
