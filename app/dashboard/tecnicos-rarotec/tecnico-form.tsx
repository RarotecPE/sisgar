"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, Check, ChevronsUpDown, Sparkles } from "lucide-react"
import { MaskedInput } from "@/components/masked-input"
import { CARGOS_RAROTEC, ESTADOS_BR, DEPARTAMENTOS_PADRAO } from "@/lib/constants"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { TecnicoRarotec } from "@/lib/types"

interface Cliente {
  id: number
  nome_fantasia?: string
  razao_social?: string
  cidade?: string
  estado?: string
  ativo?: boolean
}

export interface CandidatoNexus {
  nexus_id: string
  nome: string
  email: string
  nexus_email: string
  cpf: string | null
  telefone: string | null
  avatar_url: string | null
  cargo: string | null
  role_nome: string | null
  ja_cadastrado: boolean
  tecnico_id: number | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TecnicoFormProps {
  tecnico?: TecnicoRarotec | null
  onSuccess: (saved?: TecnicoRarotec) => void
  onCancel: () => void
}

export function TecnicoForm({ tecnico, onSuccess, onCancel }: TecnicoFormProps) {
  const [loading, setLoading] = useState(false)
  const [openCargo, setOpenCargo] = useState(false)
  const [openDepartamento, setOpenDepartamento] = useState(false)
  const [openClientesFixos, setOpenClientesFixos] = useState(false)
  const [clientesFixos, setClientesFixos] = useState<number[]>([])

  const [selectedNexusUser, setSelectedNexusUser] = useState<CandidatoNexus | null>(null)
  const [openNexusCombobox, setOpenNexusCombobox] = useState(false)

  // Candidatos autorizados do RaroNexus para vincular como técnico
  const { data: candidatos, isLoading: loadingCandidatos } = useSWR<CandidatoNexus[]>(
    !tecnico ? "/api/nexus/candidatos-tecnicos" : null,
    fetcher
  )

  // Lista de clientes ativos para o multiselect de relatorio semanal unico
  const { data: clientes } = useSWR<Cliente[]>("/api/clientes", fetcher)
  const clientesAtivos = (clientes || []).filter((c) => c.ativo !== false)

  // Ao editar, carregar os vinculos fixos existentes do tecnico
  const { data: tecnicoDetalhe } = useSWR<{ clientes_fixos?: number[] }>(
    tecnico ? `/api/tecnicos-rarotec/${tecnico.id}` : null,
    fetcher
  )
  useEffect(() => {
    if (tecnicoDetalhe?.clientes_fixos) {
      setClientesFixos(tecnicoDetalhe.clientes_fixos)
    }
  }, [tecnicoDetalhe])

  const nomeCliente = (c: Cliente) => c.nome_fantasia || c.razao_social || `Cliente ${c.id}`

  const toggleClienteFixo = (id: number) => {
    setClientesFixos((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }
  const [formData, setFormData] = useState({
    nome: tecnico?.nome || "",
    cpf: tecnico?.cpf || "",
    rg: tecnico?.rg || "",
    data_nascimento: tecnico?.data_nascimento?.split("T")[0] || "",
    endereco: tecnico?.endereco || "",
    cidade: tecnico?.cidade || "",
    estado: tecnico?.estado || "",
    cep: tecnico?.cep || "",
    telefone: tecnico?.telefone || "",
    celular: tecnico?.celular || "",
    email: tecnico?.email || "",
    nexus_email: tecnico?.nexus_email || "",
    cargo: tecnico?.cargo || "",
    cargos: tecnico?.cargos || [],
    data_admissao: tecnico?.data_admissao?.split("T")[0] || "",
    setores: tecnico?.setores || [],
    foto_url: tecnico?.foto_url || "",
    ativo: tecnico?.ativo ?? true,
  })

  const handleSelectNexusUser = (candidato: CandidatoNexus) => {
    setSelectedNexusUser(candidato)
    setFormData((prev) => ({
      ...prev,
      nome: candidato.nome,
      email: candidato.email,
      nexus_email: candidato.email,
      cpf: candidato.cpf || prev.cpf,
      telefone: candidato.telefone || prev.telefone,
      foto_url: candidato.avatar_url || prev.foto_url,
    }))
  }

  const toggleCargo = (cargo: string) => {
    if (formData.cargos.includes(cargo)) {
      setFormData({ ...formData, cargos: formData.cargos.filter((c) => c !== cargo) })
    } else {
      setFormData({ ...formData, cargos: [...formData.cargos, cargo] })
    }
  }

  const removeCargo = (cargo: string) => {
    setFormData({ ...formData, cargos: formData.cargos.filter((c) => c !== cargo) })
  }

  const toggleDepartamento = (depto: string) => {
    if (formData.setores.includes(depto)) {
      setFormData({ ...formData, setores: formData.setores.filter((s) => s !== depto) })
    } else {
      setFormData({ ...formData, setores: [...formData.setores, depto] })
    }
  }

  const removeDepartamento = (depto: string) => {
    setFormData({ ...formData, setores: formData.setores.filter((s) => s !== depto) })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const url = tecnico
        ? `/api/tecnicos-rarotec/${tecnico.id}`
        : "/api/tecnicos-rarotec"
      const method = tecnico ? "PUT" : "POST"

      const payload = {
        ...formData,
        foto_url: formData.foto_url || null,
        email: formData.email ? formData.email.trim() : null,
        nexus_email: formData.nexus_email ? formData.nexus_email.trim() : null,
        data_nascimento: formData.data_nascimento || null,
        data_admissao: formData.data_admissao || null,
        clientes_fixos: clientesFixos,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || "Erro ao salvar")
      }

      const savedData = await res.json().catch(() => null)
      onSuccess(savedData)
    } catch (error: any) {
      console.error("Error saving tecnico:", error)
      alert(error.message || "Erro ao salvar tecnico")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seleção de Usuário do RaroNexus para novo cadastro */}
      {!tecnico && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <Label className="font-semibold text-base text-foreground truncate">
                Vincular Usuário do RaroNexus *
              </Label>
            </div>
            {selectedNexusUser && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                Sincronizado
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Selecione o usuário autorizado no RaroNexus para carregar automaticamente nome, e-mail, cargo, foto, CPF e telefone.
          </p>

          <Popover open={openNexusCombobox} onOpenChange={setOpenNexusCombobox}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openNexusCombobox}
                className="w-full justify-between bg-background h-auto min-h-10 py-2 px-3 text-left"
                disabled={loadingCandidatos}
              >
                {selectedNexusUser ? (
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {selectedNexusUser.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 min-w-0 flex-1">
                      <span className="font-medium truncate">{selectedNexusUser.nome}</span>
                      <span className="text-xs text-muted-foreground truncate">({selectedNexusUser.email})</span>
                    </div>
                  </div>
                ) : loadingCandidatos ? (
                  <span className="truncate">Carregando usuários do RaroNexus...</span>
                ) : (
                  <span className="truncate">Clique para selecionar um usuário do RaroNexus...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar por nome ou e-mail..." />
                <CommandList>
                  <CommandEmpty>Nenhum usuário encontrado no RaroNexus.</CommandEmpty>
                  <CommandGroup>
                    {(candidatos || []).map((cand) => (
                      <CommandItem
                        key={cand.nexus_id}
                        value={`${cand.nome} ${cand.email}`}
                        onSelect={() => {
                          handleSelectNexusUser(cand)
                          setOpenNexusCombobox(false)
                        }}
                        className="flex items-center justify-between py-2 cursor-pointer gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              selectedNexusUser?.nexus_id === cand.nexus_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium truncate">{cand.nome}</span>
                            <span className="text-xs text-muted-foreground truncate">{cand.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cand.ja_cadastrado ? (
                            <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-800 hover:bg-amber-500/20 dark:text-amber-300">
                              Já cadastrado
                            </Badge>
                          ) : cand.cargo ? (
                            <Badge variant="outline" className="text-[10px]">
                              {cand.cargo}
                            </Badge>
                          ) : null}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedNexusUser && (
            <div className="rounded-lg border bg-background/80 p-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {selectedNexusUser.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedNexusUser.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedNexusUser.email}</p>
              </div>
              {selectedNexusUser.cargo && (
                <Badge variant="secondary" className="shrink-0">
                  {selectedNexusUser.cargo}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Dados Pessoais
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 min-w-0">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="cpf">CPF</Label>
            <MaskedInput
              mask="cpf"
              id="cpf"
              value={formData.cpf}
              onChange={(value) => setFormData({ ...formData, cpf: value })}
              placeholder="000.000.000-00"
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              value={formData.rg}
              onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="telefone">Telefone</Label>
            <MaskedInput
              mask="telefone"
              id="telefone"
              value={formData.telefone}
              onChange={(value) => setFormData({ ...formData, telefone: value })}
              placeholder="(00) 0000-0000"
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="celular">Celular/WhatsApp</Label>
            <MaskedInput
              mask="celular"
              id="celular"
              value={formData.celular}
              onChange={(value) => setFormData({ ...formData, celular: value })}
              placeholder="(00) 00000-0000"
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2 min-w-0">
            <Label htmlFor="nexus_email">E-mail do Nexus</Label>
            <Input
              id="nexus_email"
              type="email"
              value={formData.nexus_email}
              onChange={(e) => setFormData({ ...formData, nexus_email: e.target.value })}
              placeholder="Preencha apenas se for diferente do e-mail local"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Se ficar vazio, o Sisgar usa o e-mail local para vincular com o RaroNexus.
            </p>
          </div>
        </div>
      </div>

      {/* Endereco */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Endereco
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 min-w-0">
            <Label htmlFor="endereco">Endereco Completo</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="min-w-0">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData({ ...formData, estado: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BR.map((estado) => (
                  <SelectItem key={estado.sigla} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">
            <Label htmlFor="cep">CEP</Label>
            <MaskedInput
              mask="cep"
              id="cep"
              value={formData.cep}
              onChange={(value) => setFormData({ ...formData, cep: value })}
              placeholder="00000-000"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Dados Profissionais */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Dados Profissionais
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <Label>Cargo(s)</Label>
            <Popover open={openCargo} onOpenChange={setOpenCargo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCargo}
                  className="w-full justify-between mt-1.5 font-normal h-auto min-h-10"
                >
                  <span className="text-muted-foreground truncate">
                    {formData.cargos.length === 0
                      ? "Selecione o(s) cargo(s)"
                      : `${formData.cargos.length} cargo(s) selecionado(s)`}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar cargo..." />
                  <CommandList>
                    <CommandEmpty>Nenhum cargo encontrado.</CommandEmpty>
                    <CommandGroup>
                      {CARGOS_RAROTEC.map((cargo) => (
                        <CommandItem
                          key={cargo}
                          value={cargo}
                          onSelect={() => toggleCargo(cargo)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.cargos.includes(cargo) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cargo}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {formData.cargos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.cargos.map((cargo) => (
                  <Badge key={cargo} variant="secondary" className="text-xs">
                    {cargo}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => removeCargo(cargo)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          removeCargo(cargo)
                        }
                      }}
                      className="ml-1 hover:text-destructive cursor-pointer inline-flex items-center"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <Label htmlFor="data_admissao">Data de Admissao</Label>
            <Input
              id="data_admissao"
              type="date"
              value={formData.data_admissao}
              onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2 min-w-0">
            <Label>Setor/Departamento</Label>
            <Popover open={openDepartamento} onOpenChange={setOpenDepartamento}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDepartamento}
                  className="w-full justify-between mt-1.5 font-normal h-auto min-h-10"
                >
                  <span className="text-muted-foreground">
                    {formData.setores.length === 0
                      ? "Selecione os departamentos"
                      : `${formData.setores.length} departamento(s) selecionado(s)`}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar departamento..." />
                  <CommandList>
                    <CommandEmpty>Nenhum departamento encontrado.</CommandEmpty>
                    <CommandGroup>
                      {DEPARTAMENTOS_PADRAO.map((depto) => (
                        <CommandItem
                          key={depto}
                          value={depto}
                          onSelect={() => toggleDepartamento(depto)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.setores.includes(depto) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {depto}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {formData.setores.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.setores.map((depto) => (
                  <Badge key={depto} variant="secondary" className="text-xs">
                    {depto}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => removeDepartamento(depto)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          removeDepartamento(depto)
                        }
                      }}
                      className="ml-1 hover:text-destructive cursor-pointer inline-flex items-center"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Tecnico Ativo
            </Label>
          </div>
        </div>
      </div>

      {/* Relatorio semanal unico */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Relatorio Semanal Unico
        </h3>
        <div>
          <Label>Clientes com relatorio semanal unico</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Para os clientes selecionados, este tecnico entrega apenas 1 relatorio por semana (Seg-Sex),
            cobrado no ultimo dia de presenca, em vez de um relatorio por visita.
          </p>
          <Popover open={openClientesFixos} onOpenChange={setOpenClientesFixos}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openClientesFixos}
                className="w-full justify-between mt-1.5 font-normal h-auto min-h-10"
              >
                <span className="text-muted-foreground">
                  {clientesFixos.length === 0
                    ? "Selecione o(s) cliente(s)"
                    : `${clientesFixos.length} cliente(s) selecionado(s)`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {clientesAtivos.map((cliente) => (
                      <CommandItem
                        key={cliente.id}
                        value={nomeCliente(cliente)}
                        onSelect={() => toggleClienteFixo(cliente.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            clientesFixos.includes(cliente.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {nomeCliente(cliente)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {clientesFixos.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {clientesFixos.map((id) => {
                const cliente = clientesAtivos.find((c) => c.id === id)
                return (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {cliente ? nomeCliente(cliente) : `Cliente ${id}`}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleClienteFixo(id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          toggleClienteFixo(id)
                        }
                      }}
                      className="ml-1 hover:text-destructive cursor-pointer inline-flex items-center"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tecnico ? "Salvar Alteracoes" : "Cadastrar Tecnico"}
        </Button>
      </div>
    </form>
  )
}
