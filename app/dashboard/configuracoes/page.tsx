"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Settings, 
  Lock, 
  Save, 
  Info, 
  Building2, 
  Trash2, 
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Users,
  Database
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"
import { OuveConfigToggle } from "@/components/ouve-config-toggle"

const TABELAS_DISPONIVEIS = [
  { id: "relatorios", label: "Relatorios de Visita", description: "Todos os relatorios e anexos" },
  { id: "agenda", label: "Agenda", description: "Todos os agendamentos" },
  { id: "pesquisas", label: "Pesquisas", description: "Todas as pesquisas de satisfacao" },
  { id: "tecnicos_clientes", label: "Tecnicos dos Clientes", description: "Contatos dos clientes" },
  { id: "tecnicos_rarotec", label: "Tecnicos Rarotec", description: "Equipe (exceto voce)" },
  { id: "clientes", label: "Clientes", description: "Todos os clientes cadastrados" },
  { id: "usuarios", label: "Usuarios do Sistema", description: "Usuarios (exceto voce)" },
]

export default function ConfiguracoesPage() {
  const { user, isAdmin } = useSession()
  const userIsGestor = user?.nome ? isGestor(user.nome, user.cargo) : false
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Estados para limpeza de dados
  const [limparDialogOpen, setLimparDialogOpen] = useState(false)
  const [tabelasSelecionadas, setTabelasSelecionadas] = useState<string[]>([])
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("")
  const [limparLoading, setLimparLoading] = useState(false)
  const [limparResultado, setLimparResultado] = useState<{ 
    success: boolean; 
    message: string; 
    resultados?: { tabela: string; deletados: number }[] 
  } | null>(null)

  // Estados para seed de usuarios
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedResultado, setSeedResultado] = useState<{
    success: boolean;
    message: string;
    resultados?: {
      usuarios: { criados: number; existentes: number; erros: number };
      tecnicos: { criados: number; existentes: number; erros: number };
    }
  } | null>(null)

  const handleChangePassword = async () => {
    if (novaSenha !== confirmarSenha) {
      setMessage({ type: "error", text: "As senhas nao conferem" })
      return
    }

    if (novaSenha.length < 6) {
      setMessage({ type: "error", text: "A senha deve ter no minimo 6 caracteres" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/usuarios/alterar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: "Senha alterada com sucesso!" })
        setSenhaAtual("")
        setNovaSenha("")
        setConfirmarSenha("")
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao alterar senha" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor" })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTabela = (tabelaId: string) => {
    setTabelasSelecionadas(prev => 
      prev.includes(tabelaId) 
        ? prev.filter(t => t !== tabelaId)
        : [...prev, tabelaId]
    )
  }

  const handleSelectAll = () => {
    if (tabelasSelecionadas.length === TABELAS_DISPONIVEIS.length) {
      setTabelasSelecionadas([])
    } else {
      setTabelasSelecionadas(TABELAS_DISPONIVEIS.map(t => t.id))
    }
  }

  const handleLimparDados = async () => {
    if (confirmacaoTexto !== "LIMPAR DADOS") {
      return
    }

    setLimparLoading(true)
    setLimparResultado(null)

    try {
      const res = await fetch("/api/admin/limpar-dados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          confirmacao: confirmacaoTexto,
          tabelas: tabelasSelecionadas 
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setLimparResultado({ 
          success: true, 
          message: "Dados limpos com sucesso!",
          resultados: data.resultados 
        })
        setTabelasSelecionadas([])
        setConfirmacaoTexto("")
      } else {
        setLimparResultado({ success: false, message: data.error || "Erro ao limpar dados" })
      }
    } catch (error) {
      setLimparResultado({ success: false, message: "Erro ao conectar com o servidor" })
    } finally {
      setLimparLoading(false)
    }
  }

  const resetLimparDialog = () => {
    setTabelasSelecionadas([])
    setConfirmacaoTexto("")
    setLimparResultado(null)
    setLimparDialogOpen(false)
  }

  const handleSeedUsuarios = async () => {
    setSeedLoading(true)
    setSeedResultado(null)

    try {
      const res = await fetch("/api/admin/seed-usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (res.ok) {
        setSeedResultado({ 
          success: true, 
          message: data.message,
          resultados: data.resultados 
        })
      } else {
        setSeedResultado({ success: false, message: data.error || "Erro ao criar usuarios" })
      }
    } catch (error) {
      setSeedResultado({ success: false, message: "Erro ao conectar com o servidor" })
    } finally {
      setSeedLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Configuracoes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie suas preferencias e seguranca
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Sistema</p>
              <p className="text-xs text-muted-foreground">SISGAR v1.0.0</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Lock className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Seguranca</p>
              <p className="text-xs text-muted-foreground">Senha protegida</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Empresa</p>
              <p className="text-xs text-muted-foreground">Rarotec Tecnologia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OuveRarotec - apenas gestores */}
      {userIsGestor && <OuveConfigToggle />}

      {/* Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alterar Senha */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso ao sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <Input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>

            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>

            {message && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={loading || !senhaAtual || !novaSenha || !confirmarSenha}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </CardContent>
        </Card>

        {/* Zona de Perigo - Apenas para Administradores */}
        {isAdmin && (
          <Card className="border-red-200 border-2 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium text-red-700">Zona de Perigo</CardTitle>
                  <CardDescription className="text-red-600/80">
                    Acoes irreversiveis - Apenas para administradores
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atencao!</AlertTitle>
                <AlertDescription>
                  As acoes nesta secao sao permanentes e nao podem ser desfeitas. 
                  Use com extrema cautela.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-3">
                <Dialog open={limparDialogOpen} onOpenChange={setLimparDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Limpar Dados do Sistema
                    </Button>
                  </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Limpar Dados do Sistema
                  </DialogTitle>
                  <DialogDescription>
                    Selecione quais dados deseja apagar permanentemente.
                    Esta acao nao pode ser desfeita!
                  </DialogDescription>
                </DialogHeader>

                {limparResultado ? (
                  <div className="space-y-4">
                    <Alert variant={limparResultado.success ? "default" : "destructive"}>
                      <AlertTitle>
                        {limparResultado.success ? "Sucesso!" : "Erro"}
                      </AlertTitle>
                      <AlertDescription>
                        {limparResultado.message}
                      </AlertDescription>
                    </Alert>

                    {limparResultado.resultados && limparResultado.resultados.length > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <p className="text-sm font-medium">Resumo da limpeza:</p>
                        {limparResultado.resultados.map((r) => (
                          <div key={r.tabela} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{r.tabela}</span>
                            <span className="font-medium">{r.deletados} registro(s)</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={resetLimparDialog}>
                        Fechar
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selecao de tabelas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Selecione as tabelas:</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleSelectAll}
                          className="h-8 text-xs"
                        >
                          {tabelasSelecionadas.length === TABELAS_DISPONIVEIS.length 
                            ? "Desmarcar todos" 
                            : "Selecionar todos"
                          }
                        </Button>
                      </div>
                      <div className="grid gap-2 max-h-48 overflow-y-auto p-1">
                        {TABELAS_DISPONIVEIS.map((tabela) => (
                          <div 
                            key={tabela.id}
                            className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-muted/50"
                          >
                            <Checkbox
                              id={tabela.id}
                              checked={tabelasSelecionadas.includes(tabela.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTabelasSelecionadas([...tabelasSelecionadas, tabela.id])
                                } else {
                                  setTabelasSelecionadas(tabelasSelecionadas.filter(t => t !== tabela.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <Label htmlFor={tabela.id} className="text-sm font-medium cursor-pointer">
                                {tabela.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">{tabela.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confirmacao */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmacao" className="text-sm">
                        Digite <span className="font-bold text-red-600">LIMPAR DADOS</span> para confirmar:
                      </Label>
                      <Input
                        id="confirmacao"
                        value={confirmacaoTexto}
                        onChange={(e) => setConfirmacaoTexto(e.target.value)}
                        placeholder="LIMPAR DADOS"
                        className="font-mono"
                      />
                    </div>

                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={resetLimparDialog}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleLimparDados}
                        disabled={
                          limparLoading || 
                          tabelasSelecionadas.length === 0 || 
                          confirmacaoTexto !== "LIMPAR DADOS"
                        }
                      >
                        {limparLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Limpando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Limpar {tabelasSelecionadas.length} tabela(s)
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Botao Seed de Usuarios */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                  <Users className="mr-2 h-4 w-4" />
                  Popular Usuarios Rarotec
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Popular Usuarios do Sistema
                  </DialogTitle>
                  <DialogDescription>
                    Criar usuarios e tecnicos Rarotec no sistema com as credenciais padrao.
                  </DialogDescription>
                </DialogHeader>

                {seedResultado ? (
                  <div className="space-y-4">
                    <Alert variant={seedResultado.success ? "default" : "destructive"}>
                      <AlertTitle>
                        {seedResultado.success ? "Sucesso!" : "Erro"}
                      </AlertTitle>
                      <AlertDescription>
                        {seedResultado.message}
                      </AlertDescription>
                    </Alert>

                    {seedResultado.resultados && (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Usuarios:</p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center p-2 rounded bg-green-100 text-green-700">
                              <p className="font-bold">{seedResultado.resultados.usuarios.criados}</p>
                              <p className="text-xs">Criados</p>
                            </div>
                            <div className="text-center p-2 rounded bg-blue-100 text-blue-700">
                              <p className="font-bold">{seedResultado.resultados.usuarios.existentes}</p>
                              <p className="text-xs">Existentes</p>
                            </div>
                            <div className="text-center p-2 rounded bg-red-100 text-red-700">
                              <p className="font-bold">{seedResultado.resultados.usuarios.erros}</p>
                              <p className="text-xs">Erros</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Tecnicos Rarotec:</p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center p-2 rounded bg-green-100 text-green-700">
                              <p className="font-bold">{seedResultado.resultados.tecnicos.criados}</p>
                              <p className="text-xs">Criados</p>
                            </div>
                            <div className="text-center p-2 rounded bg-blue-100 text-blue-700">
                              <p className="font-bold">{seedResultado.resultados.tecnicos.existentes}</p>
                              <p className="text-xs">Existentes</p>
                            </div>
                            <div className="text-center p-2 rounded bg-red-100 text-red-700">
                              <p className="font-bold">{seedResultado.resultados.tecnicos.erros}</p>
                              <p className="text-xs">Erros</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSeedResultado(null)}>
                        Fechar
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-700">Informacao</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        Serao criados 25 usuarios e tecnicos da equipe Rarotec.
                        Usuarios ja existentes serao ignorados.
                      </AlertDescription>
                    </Alert>

                    <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                      <p className="font-medium">Senhas configuradas:</p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Administrador e Juan Gonzalez:</span>
                        <code className="bg-background px-2 py-0.5 rounded">88749860</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Demais usuarios:</span>
                        <code className="bg-background px-2 py-0.5 rounded">123456</code>
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button
                        onClick={handleSeedUsuarios}
                        disabled={seedLoading}
                        className="w-full sm:w-auto"
                      >
                        {seedLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando usuarios...
                          </>
                        ) : (
                          <>
                            <Users className="mr-2 h-4 w-4" />
                            Criar Usuarios
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
