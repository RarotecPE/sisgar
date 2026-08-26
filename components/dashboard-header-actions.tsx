"use client"

import { useTheme } from "next-themes"
import {
  AppWindow,
  CheckCircle2,
  LogOut,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  cargo: string | null
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <HeaderIconButton title="Aplicativos">
          <AppWindow className="h-4 w-4" />
        </HeaderIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Aplicativos</p>
            <p className="text-xs font-normal text-muted-foreground">
              Sistemas integrados à sua conta
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Integração com RaroNexus em breve.
        </div>
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
  const role = user.cargo || "Usuário"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Perfil do usuário"
          title="Perfil do usuário"
        >
          <Avatar className="h-9 w-9 border border-border bg-secondary">
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
        <DropdownMenuItem disabled className="gap-2">
          <UserCircle className="h-4 w-4" />
          Perfil pelo RaroNexus em breve
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action="/api/auth/logout" method="POST">
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
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
