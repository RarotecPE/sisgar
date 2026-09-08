"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  ChevronRight,
  FileText,
  FolderArchive,
  HeartPulse,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Shield,
  Users,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { DashboardHeaderActions } from "@/components/dashboard-header-actions"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getMenuItems, getUserRole } from "@/lib/permissions"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  items?: { title: string; href: string; key?: string }[]
  key?: string
  requiresOuveAtivo?: boolean
}

interface AppSidebarProps {
  user: {
    nome: string
    email: string
    cargo: string | null
    apuracao_mensal?: boolean
  }
}

const swrFetcher = (url: string) => fetch(url).then((r) => r.json())

const baseNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cadastros",
    icon: Users,
    items: [
      { title: "Técnicos Rarotec", href: "/dashboard/tecnicos-rarotec", key: "showTecnicosRarotec" },
      { title: "Clientes", href: "/dashboard/clientes", key: "showClientes" },
      { title: "Técnicos-Clientes", href: "/dashboard/tecnicos-clientes", key: "showTecnicosClientes" },
    ],
  },
  {
    title: "Agenda",
    href: "/dashboard/agenda",
    icon: Calendar,
  },
  {
    title: "Relatórios",
    icon: FileText,
    items: [
      { title: "Novo Relatório", href: "/dashboard/relatorios/novo", key: "showNovoRelatorio" },
      { title: "Histórico", href: "/dashboard/relatorios", key: "showHistorico" },
      { title: "Batimento", href: "/dashboard/relatorios/batimento", key: "showBatimento" },
      { title: "Apuração Mensal", href: "/dashboard/relatorios/apuracao", key: "showApuracao" },
      { title: "Modelos de Apuração", href: "/dashboard/relatorios/apuracao/modelos", key: "showApuracaoModelos" },
    ],
  },
  {
    title: "Documentos Médicos",
    icon: HeartPulse,
    items: [
      { title: "Anexos", href: "/dashboard/documentos-medicos/anexos", key: "showDocumentosMedicos" },
      { title: "Batimento", href: "/dashboard/documentos-medicos/batimento", key: "showBatimentoMedico" },
    ],
  },
  {
    title: "Documentos Institucionais",
    icon: FolderArchive,
    items: [
      { title: "Documentos", href: "/dashboard/documentos-institucionais", key: "showDocumentosInstitucionais" },
      { title: "Atas", href: "/dashboard/documentos-institucionais/atas", key: "showAtas" },
    ],
  },
  {
    title: "OuveRarotec",
    href: "/dashboard/ouve-rarotec",
    icon: MessagesSquare,
    key: "showOuveRarotec",
    requiresOuveAtivo: true,
  },
  {
    title: "Administração",
    icon: Shield,
    items: [
      { title: "Usuários", href: "/dashboard/usuarios", key: "showUsuarios" },
      { title: "Configurações", href: "/dashboard/configuracoes", key: "showConfiguracoes" },
    ],
  },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuPermissions = useMemo(
    () => getMenuItems(user.nome, user.cargo, user.apuracao_mensal),
    [user.nome, user.cargo, user.apuracao_mensal],
  )
  const userRole = useMemo(() => getUserRole(user.nome, user.cargo), [user.nome, user.cargo])

  const { data: ouveConfig } = useSWR<{ ativo: boolean }>("/api/ouve/config", swrFetcher, {
    refreshInterval: 30000,
  })
  const ouveAtivo = ouveConfig?.ativo ?? false

  const navItems = useMemo(() => {
    return baseNavItems
      .map((item) => {
        if (!item.items) return item

        const filteredItems = item.items.filter((subItem) => {
          if (!subItem.key) return true
          return menuPermissions[subItem.key as keyof typeof menuPermissions]
        })

        return { ...item, items: filteredItems }
      })
      .filter((item) => {
        if (item.requiresOuveAtivo && !ouveAtivo) return false
        if (!item.items && item.key) {
          if (!menuPermissions[item.key as keyof typeof menuPermissions]) return false
        }
        if (item.items) return item.items.length > 0
        return true
      })
  }, [menuPermissions, ouveAtivo])

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.items?.some((sub) => pathname.startsWith(sub.href))) {
        setOpenItems((prev) => (prev.includes(item.title) ? prev : [...prev, item.title]))
      }
    })
  }, [pathname, navItems])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    )
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (pathname === href) return true
    if (href === "/dashboard/relatorios" && pathname.startsWith("/dashboard/relatorios/")) return false
    if (href === "/dashboard/relatorios/apuracao" && pathname.startsWith("/dashboard/relatorios/apuracao/")) return false
    if (href === "/dashboard/documentos-institucionais" && pathname.startsWith("/dashboard/documentos-institucionais/")) return false
    return pathname.startsWith(`${href}/`)
  }

  const roleLabel =
    user.cargo ||
    (userRole === "diretor"
      ? "Diretor"
      : userRole === "gerente"
        ? "Gerente"
        : userRole === "coordenador"
          ? "Coordenador"
          : "Técnico")

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white p-0.5 shadow-sm ring-1 ring-white/10">
          <Image
            src="/logo.png"
            alt="SISGAR"
            width={34}
            height={34}
            className="h-[34px] w-[34px] object-contain"
          />
        </div>
        <div>
          <h1 className="text-base font-semibold text-sidebar-foreground">SISGAR</h1>
          <p className="text-xs text-sidebar-foreground/50">Rarotec</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const hasSubmenu = item.items && item.items.length > 0
            const isOpen = openItems.includes(item.title)
            const groupActive = item.items?.some((sub) => isActive(sub.href))

            if (hasSubmenu) {
              return (
                <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      groupActive && "text-sidebar-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-sidebar-foreground/40 transition-transform duration-200",
                        isOpen && "rotate-90",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                      {item.items?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
                            isActive(subItem.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full transition-colors",
                              isActive(subItem.href) ? "bg-sidebar-primary-foreground" : "bg-sidebar-foreground/30",
                            )}
                          />
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Link
                key={item.title}
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive(item.href!)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="shrink-0 border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/45">
        {roleLabel}
      </div>
    </>
  )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-xl lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
            <div className="flex h-full flex-col">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-0.5 shadow-sm ring-1 ring-white/10">
              <Image
                src="/logo.png"
                alt="SISGAR"
                width={30}
                height={30}
                className="h-[30px] w-[30px] object-contain"
              />
            </div>
            <span className="truncate font-semibold">SISGAR</span>
          </div>
          <DashboardHeaderActions user={user} />
        </div>
      </header>

      <div className="h-14 lg:hidden" />

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
