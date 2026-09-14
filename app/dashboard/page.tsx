"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, FileText, Calendar, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"
import { CentralAvisos } from "@/components/central-avisos"

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || "Erro ao carregar dados")
  return data
}

const dashboardSWRConfig = {
  dedupingInterval: 10000,
  revalidateOnFocus: false,
  shouldRetryOnError: false,
}

// Definição das estatísticas e cards de acesso rápido
const statCards = [
  {
    title: "Tecnicos Ativos",
    description: "Profissionais em campo",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
    key: "tecnicos",
    href: "/dashboard/tecnicos-rarotec",
    gestorOnly: true,
  },
  {
    title: "Clientes",
    description: "Bases atendidas",
    icon: Building2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
    key: "clientes",
    href: "/dashboard/clientes",
  },
  {
    title: "Agenda Hoje",
    description: "Compromissos do dia",
    icon: Calendar,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-500/10 dark:bg-violet-500/15",
    key: "agendaHoje",
    href: "/dashboard/agenda",
  },
]

export default function DashboardPage() {
  const { user, loading } = useSession()
  const userIsGestor = user?.nome ? isGestor(user.nome, user.cargo) : false
  const tecnicoId = user?.tecnico_rarotec_id

  // Construir URLs com parâmetros de filtro somente quando houver usuário verificado
  const statsUrl = user ? `/api/dashboard/stats?is_gestor=${userIsGestor}${tecnicoId ? `&tecnico_id=${tecnicoId}` : ''}` : null
  const activitiesUrl = user ? `/api/dashboard/activities?is_gestor=${userIsGestor}${tecnicoId ? `&tecnico_id=${tecnicoId}` : ''}` : null
  const scheduleUrl = user ? `/api/dashboard/schedule?is_gestor=${userIsGestor}${tecnicoId ? `&tecnico_id=${tecnicoId}` : ''}` : null

  const { data: stats } = useSWR(statsUrl, fetcher, dashboardSWRConfig)
  const { data: activities } = useSWR(activitiesUrl, fetcher, dashboardSWRConfig)
  const { data: schedule } = useSWR(scheduleUrl, fetcher, dashboardSWRConfig)

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando painel...</p>
      </div>
    )
  }

  // Filtrar cards baseado em permissões
  const visibleStatCards = statCards.filter(card => {
    if (card.gestorOnly && !userIsGestor) return false
    return true
  })

  // Grade dinâmica: os cards preenchem toda a largura independentemente da quantidade.
  // Strings literais completas para o JIT do Tailwind detectar.
  const statsGridCols =
    visibleStatCards.length >= 4
      ? "lg:grid-cols-4"
      : visibleStatCards.length === 3
        ? "lg:grid-cols-3"
        : visibleStatCards.length === 2
          ? "lg:grid-cols-2"
          : "lg:grid-cols-1"

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visao geral do Sistema de Gestao Administrativa
        </p>
      </div>

      {/* Central de avisos: consolida todos os alertas em quadros compactos e expansíveis */}
      <CentralAvisos />

      {/* Stats Grid */}
      <div className={`mb-8 grid gap-4 sm:grid-cols-2 ${statsGridCols}`}>
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
                          ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
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
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
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
                          {item.cliente_nome ? ` - ${String(item.cliente_nome)}` : ""}
                        </p>
                      </div>
                      {isToday && (
                        <Badge className="bg-violet-500/15 text-violet-700 hover:bg-violet-500/20 dark:text-violet-300">
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
