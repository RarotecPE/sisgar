"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Key, 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  MoreHorizontal,
  Loader2,
  Shield,
  ShieldAlert
} from "lucide-react"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"

interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string | null
  ativo: boolean
  apuracao_mensal: boolean
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const CARGOS_USUARIO = [
  "Administrador",
  "Diretor",
  "Gerente",
  "Coordenação",
  "Operador",
  "Estagiário",
]

export default function UsuariosPage() {
  const { user } = useSession()
  const userIsGestor = user?.nome ? isGestor(user.nome, user.cargo) : false
  const userIsAdmin = user?.cargo?.toLowerCase() === 'administrador'
  
  const { data: usuarios, mutate, isLoading } = useSWR<Usuario[]>("/api/usuarios", fetcher)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "Operador",
    ativo: true,
    apuracao_mensal: false,
  })
  const [novaSenha, setNovaSenha] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Verificar acesso
  if (!userIsGestor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <ShieldAlert className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">Acesso Restrito</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Apenas coordenadores, gerentes e diretores podem acessar o gerenciamento de usuarios.
        </p>
      </div>
    )
  }

  const filteredUsuarios = usuarios?.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAtivos = usuarios?.filter((u) => u.ativo).length || 0
  const totalInativos = usuarios?.filter((u) => !u.ativo).length || 0

  // Funções para proteção do admin
  const isTargetAdmin = (usuario: Usuario) => usuario.cargo?.toLowerCase() === 'administrador'
  const canEditUser = (usuario: Usuario) => {
    // Só admin pode editar outro admin
    if (isTargetAdmin(usuario) && !userIsAdmin) return false
    return true
  }
  const canChangePassword = (usuario: Usuario) => {
    // Só admin pode alterar senha de admin
    if (isTargetAdmin(usuario) && !userIsAdmin) return false
    return true
  }
  const canSetAdminRole = () => {
    // Só admin pode definir alguém como admin
    return userIsAdmin
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      cargo: usuario.cargo || "Operador",
      ativo: usuario.ativo,
      apuracao_mensal: usuario.apuracao_mensal ?? false,
    })
    setIsFormOpen(true)
  }

  const handleNew = () => {
    setEditingUser(null)
    setFormData({
      nome: "",
      email: "",
      senha: "",
      cargo: "Operador",
      ativo: true,
      apuracao_mensal: false,
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    // Validações de proteção do admin
    if (formData.cargo === 'Administrador' && !userIsAdmin) {
      alert('Apenas administradores podem definir o cargo de Administrador.')
      return
    }
    if (editingUser && isTargetAdmin(editingUser) && !userIsAdmin) {
      alert('Apenas administradores podem editar outros administradores.')
      return
    }
    
    setLoading(true)
    try {
      if (editingUser) {
        await fetch(`/api/usuarios/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch("/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }
      mutate()
      setIsFormOpen(false)
    } catch (error) {
      console.error("Erro ao salvar usuario:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, usuario: Usuario) => {
    // Proteção do admin
    if (isTargetAdmin(usuario) && !userIsAdmin) {
      alert('Apenas administradores podem excluir outros administradores.')
      return
    }
    if (!confirm("Deseja realmente excluir este usuario?")) return
    try {
      await fetch(`/api/usuarios/${id}`, { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Erro ao excluir usuario:", error)
    }
  }

  const handleChangePassword = async () => {
    if (!selectedUser || !novaSenha) return
    
    // Validação de proteção do admin
    if (isTargetAdmin(selectedUser) && !userIsAdmin) {
      alert('Apenas administradores podem alterar a senha de outros administradores.')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch("/api/usuarios/alterar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, novaSenha }),
      })
      if (res.ok) {
        setIsPasswordOpen(false)
        setNovaSenha("")
        alert("Senha alterada com sucesso!")
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao alterar senha")
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os usuarios do sistema
          </p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{usuarios?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAtivos}</p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <UserX className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalInativos}</p>
              <p className="text-sm text-muted-foreground">Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Lista de Usuarios</CardTitle>
                <CardDescription>
                  {usuarios?.length || 0} usuario(s) cadastrado(s)
                </CardDescription>
              </div>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead className="font-medium hidden md:table-cell">Email</TableHead>
                  <TableHead className="font-medium">Cargo</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsuarios?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          {searchTerm ? "Nenhum usuario encontrado" : "Nenhum usuario cadastrado"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios?.map((usuario) => (
                    <TableRow key={usuario.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{usuario.nome}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{usuario.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {usuario.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {usuario.cargo || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            usuario.ativo 
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }
                        >
                          {usuario.ativo ? "Ativo" : "Inativo"}
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
                            <DropdownMenuItem 
                              onClick={() => handleEdit(usuario)}
                              disabled={!canEditUser(usuario)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                              {!canEditUser(usuario) && <Shield className="ml-2 h-3 w-3 text-muted-foreground" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(usuario)
                                setIsPasswordOpen(true)
                              }}
                              disabled={!canChangePassword(usuario)}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Alterar Senha
                              {!canChangePassword(usuario) && <Shield className="ml-2 h-3 w-3 text-muted-foreground" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(usuario.id, usuario)}
                              className="text-destructive focus:text-destructive"
                              disabled={!canEditUser(usuario)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                              {!canEditUser(usuario) && <Shield className="ml-2 h-3 w-3 text-muted-foreground" />}
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

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuario" : "Novo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Atualize os dados do usuario"
                : "Preencha os dados para criar um novo usuario"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Senha inicial"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select
                value={formData.cargo}
                onValueChange={(value) => setFormData({ ...formData, cargo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARGOS_USUARIO
                    .filter(cargo => cargo !== 'Administrador' || userIsAdmin)
                    .map((cargo) => (
                    <SelectItem key={cargo} value={cargo}>
                      {cargo}
                      {cargo === 'Administrador' && <span className="ml-2 text-muted-foreground">(Restrito)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                formData.apuracao_mensal ? "border-emerald-500/50 bg-emerald-50" : "border-border"
              }`}
            >
              <div className="leading-tight">
                <p className="text-sm font-medium text-foreground">Habilitar Apuracao Mensal</p>
                <p className="text-xs text-muted-foreground">
                  Libera o acesso aos menus de Apuracao Mensal e Modelos de Apuracao.
                </p>
              </div>
              <Switch
                checked={formData.apuracao_mensal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, apuracao_mensal: checked })
                }
                aria-label="Habilitar apuracao mensal"
              />
            </div>
            {editingUser && (
              <div className="flex items-center justify-between">
                <Label>Usuario Ativo</Label>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para {selectedUser?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={loading || !novaSenha}>
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
