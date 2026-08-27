"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  AppWindow,
  CheckCircle2,
  ExternalLink,
  Loader2,
  LogOut,
  Moon,
  RefreshCw,
  Sun,
  UserCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type HeaderUser = {
  nome: string
  email: string
  avatar_url?: string | null
  cargo: string | null
}

type HeaderApplication = {
  nome: string
  client_id: string
  logo_url: string | null
  homepage_url: string
}

type ApplicationsPayload = {
  applications: HeaderApplication[]
  nexusProfileUrl?: string
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S"

function HeaderIconButton({
  children,
  className,
  onClick,
  title,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  title: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-lg border border-border/70 bg-card/70 text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
      aria-label={title}
      title={title}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ApplicationsMenu() {
  const [payload, setPayload] = useState<ApplicationsPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/applications", { cache: "no-store" })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Não foi possível carregar os aplicativos.")
      setPayload(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os aplicativos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (open && !payload && !loading) void load() }}>
      <DropdownMenuTrigger asChild>
        <HeaderIconButton title="Aplicativos">
          <AppWindow className="h-4 w-4" />
        </HeaderIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Aplicativos</p>
            <p className="text-xs font-normal text-muted-foreground">
              Sistemas integrados à sua conta
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando aplicativos...
          </div>
        ) : error ? (
          <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" />
              Tentar novamente
            </Button>
          </div>
        ) : payload?.applications?.length ? (
          <div className="space-y-1">
            {payload.applications.map((application) => (
              <DropdownMenuItem key={application.client_id} asChild>
                <a
                  href={application.homepage_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                    {application.logo_url ? (
                      <img src={application.logo_url} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <AppWindow className="h-4 w-4 text-slate-700" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{application.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">{application.client_id}</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Nenhum outro aplicativo disponível.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme !== "light"
  const nextTheme = isDark ? "light" : "dark"
  const title = isDark ? "Ativar modo claro" : "Ativar modo escuro"

  return (
    <HeaderIconButton
      title={title}
      className="hidden sm:inline-flex"
      onClick={() => setTheme(nextTheme)}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </HeaderIconButton>
  )
}

function AccountMenu({ user }: { user: HeaderUser }) {
  const router = useRouter()
  const [nexusProfileUrl, setNexusProfileUrl] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const role = user.cargo || "Usuário"

  useEffect(() => {
    fetch("/api/auth/applications", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setNexusProfileUrl(data.nexusProfileUrl || null))
      .catch(() => setNexusProfileUrl(null))
  }, [])

  const logout = async () => {
    setLoggingOut(true)
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Accept: "application/json" },
    }).catch(() => null)
    router.replace("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Perfil do usuário"
          title="Perfil do usuário"
        >
          <Avatar className="h-9 w-9 bg-secondary">
            {user.avatar_url ? <AvatarImage src={user.avatar_url} alt={user.nome} /> : null}
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
              {getInitials(user.nome)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-secondary">
              {user.avatar_url ? <AvatarImage src={user.avatar_url} alt={user.nome} /> : null}
              <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                {getInitials(user.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.nome}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <div className="mx-2 mb-2 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
          {role}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild disabled={!nexusProfileUrl}>
          <a href={nexusProfileUrl || "#"} target="_blank" rel="noreferrer" className="gap-2">
            <UserCircle className="h-4 w-4" />
            Editar perfil no RaroNexus
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={loggingOut} onClick={logout} className="gap-2">
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DashboardHeaderActions({ user }: { user: HeaderUser }) {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <ApplicationsMenu />
      <AccountMenu user={user} />
    </div>
  )
}
