"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, Check, ChevronsUpDown } from "lucide-react"
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TecnicoFormProps {
  tecnico?: TecnicoRarotec | null
  onSuccess: () => void
  onCancel: () => void
}

export function TecnicoForm({ tecnico, onSuccess, onCancel }: TecnicoFormProps) {
  const [loading, setLoading] = useState(false)
  const [openCargo, setOpenCargo] = useState(false)
  const [openDepartamento, setOpenDepartamento] = useState(false)
  const [openClientesFixos, setOpenClientesFixos] = useState(false)
  const [clientesFixos, setClientesFixos] = useState<number[]>([])

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
    cargos: tecnico?.cargos || [],
    data_admissao: tecnico?.data_admissao?.split("T")[0] || "",
    setores: tecnico?.setores || [],
    ativo: tecnico?.ativo ?? true,
  })

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
        data_nascimento: formData.data_nascimento || null,
        data_admissao: formData.data_admissao || null,
        clientes_fixos: clientesFixos,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Erro ao salvar")

      onSuccess()
    } catch (error) {
      console.error("Error saving tecnico:", error)
      alert("Erro ao salvar tecnico")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Dados Pessoais
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="mt-1.5"
            />
          </div>

          <div>
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

          <div>
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              value={formData.rg}
              onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
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

          <div>
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
        </div>
      </div>

      {/* Endereco */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Endereco
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="endereco">Endereco Completo</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
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

          <div>
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
          <div>
            <Label>Cargo(s)</Label>
            <Popover open={openCargo} onOpenChange={setOpenCargo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCargo}
                  className="w-full justify-between mt-1.5 font-normal h-auto min-h-10"
                >
                  <span className="text-muted-foreground">
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
                    <button
                      type="button"
                      onClick={() => removeCargo(cargo)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="data_admissao">Data de Admissao</Label>
            <Input
              id="data_admissao"
              type="date"
              value={formData.data_admissao}
              onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2">
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
                    <button
                      type="button"
                      onClick={() => removeDepartamento(depto)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
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
                    <button
                      type="button"
                      onClick={() => toggleClienteFixo(id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
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
