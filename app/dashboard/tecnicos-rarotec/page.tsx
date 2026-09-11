"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Loader2, 
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  ShieldAlert
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TecnicoForm } from "./tecnico-form"
import { ExportButton } from "@/components/export-button"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"
import type { TecnicoRarotec } from "@/lib/types"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || "Erro ao carregar técnicos")
  return Array.isArray(data) ? data : []
}

export default function TecnicosRarotecPage() {
  const { user } = useSession()
  const userIsGestor = user?.nome ? isGestor(user.nome, user.cargo) : false

  const { data, mutate, isLoading } = useSWR<TecnicoRarotec[]>(
    userIsGestor ? "/api/tecnicos-rarotec" : null,
    fetcher,
    { revalidateOnFocus: true }
  )
  const tecnicos = data ?? []

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTecnico, setEditingTecnico] = useState<TecnicoRarotec | null>(null)

  // Verificar acesso
  if (!userIsGestor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <ShieldAlert className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">Acesso Restrito</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Apenas coordenadores, gerentes e diretores podem acessar o cadastro de Técnicos Rarotec.
        </p>
      </div>
    )
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este técnico?")) return

    try {
      await fetch(`/api/tecnicos-rarotec/${id}`, { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Error deleting tecnico:", error)
    }
  }

  const getCargoDisplay = (t: TecnicoRarotec) => {
    if (t.cargos && t.cargos.length > 0) {
      return t.cargos.join(", ")
    }
    return t.cargo || "-"
  }

  // Funções de exportação
  const handleExportExcel = () => {
    exportToExcel({
      filename: "tecnicos-rarotec",
      title: "Lista de Técnicos Rarotec",
      columns: [
        { header: "Nome", key: "nome", width: 30 },
        { header: "Cargo", key: "cargo", width: 20 },
        { header: "E-mail", key: "email", width: 35 },
        { header: "Celular", key: "celular", width: 18 },
        { header: "Status", key: "status", width: 10 },
      ],
      data: filteredTecnicos.map(t => ({
        ...t,
        cargo: getCargoDisplay(t),
        status: t.ativo ? "Ativo" : "Inativo"
      }))
    })
  }

  const handleExportPDF = () => {
    exportToPDF({
      filename: "tecnicos-rarotec",
      title: "Lista de Técnicos Rarotec",
      columns: [
        { header: "Nome", key: "nome" },
        { header: "Cargo", key: "cargo" },
        { header: "E-mail", key: "email" },
        { header: "Celular", key: "celular" },
        { header: "Status", key: "status" },
      ],
      data: filteredTecnicos.map(t => ({
        ...t,
        cargo: getCargoDisplay(t),
        status: t.ativo ? "Ativo" : "Inativo"
      }))
    })
  }

  async function handleToggleStatus(tecnico: TecnicoRarotec) {
    try {
      await fetch(`/api/tecnicos-rarotec/${tecnico.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tecnico, ativo: !tecnico.ativo }),
      })
      mutate()
    } catch (error) {
      console.error("Error updating tecnico:", error)
    }
  }

  function handleEdit(tecnico: TecnicoRarotec) {
    setEditingTecnico(tecnico)
    setDialogOpen(true)
  }

  function handleNew() {
    setEditingTecnico(null)
    setDialogOpen(true)
  }

  function handleSuccess() {
    setDialogOpen(false)
    setEditingTecnico(null)
    mutate()
  }

  const filteredTecnicos = tecnicos.filter((t) => {
    const cargoDisplay = getCargoDisplay(t)
    const term = search.toLowerCase()
    return (
      t.nome.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.nexus_email?.toLowerCase().includes(term) ||
      cargoDisplay.toLowerCase().includes(term)
    )
  })

  const totalAtivos = tecnicos.filter((t) => t.ativo).length
  const totalInativos = tecnicos.filter((t) => !t.ativo).length

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Técnicos Rarotec</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os profissionais da equipe. Usuários autorizados no RaroNexus são sincronizados automaticamente.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <ExportButton
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            disabled={filteredTecnicos.length === 0}
          />
          <Button onClick={handleNew} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Novo Tecnico
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tecnicos.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15">
              <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAtivos}</p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/10 dark:bg-slate-500/15">
              <UserX className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalInativos}</p>
              <p className="text-sm text-muted-foreground">Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Lista de Tecnicos</CardTitle>
                <p className="text-sm text-muted-foreground">{filteredTecnicos.length} resultado(s)</p>
              </div>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cargo ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Cargo</TableHead>
                  <TableHead className="font-medium hidden md:table-cell">E-mail</TableHead>
                  <TableHead className="font-medium hidden lg:table-cell">Celular</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredTecnicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          {search ? "Nenhum tecnico encontrado" : "Nenhum tecnico cadastrado"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTecnicos.map((tecnico) => (
                    <TableRow key={tecnico.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {tecnico.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{tecnico.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCargoDisplay(tecnico)}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        <div>{tecnico.email || "-"}</div>
                        {tecnico.nexus_email && tecnico.nexus_email.toLowerCase() !== tecnico.email?.toLowerCase() && (
                          <div className="text-xs text-muted-foreground/80 font-mono">Nexus: {tecnico.nexus_email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {tecnico.celular || tecnico.telefone || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            tecnico.ativo 
                              ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300" 
                              : "bg-slate-500/15 text-slate-700 hover:bg-slate-500/20 dark:text-slate-300"
                          }
                        >
                          {tecnico.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(tecnico)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(tecnico)}>
                              {tecnico.ativo ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(tecnico.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingTecnico ? "Editar Tecnico" : "Novo Tecnico"}
            </DialogTitle>
            <DialogDescription>
              {editingTecnico
                ? "Atualize as informacoes do tecnico"
                : "Preencha os dados do novo tecnico"}
            </DialogDescription>
          </DialogHeader>
          <TecnicoForm
            tecnico={editingTecnico}
            onSuccess={handleSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
