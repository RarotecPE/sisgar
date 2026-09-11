"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { TecnicoCliente, Cliente } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TecnicoClienteFormProps {
  tecnico: TecnicoCliente | null
  onClose: () => void
  onSuccess?: (saved?: TecnicoCliente) => void
}

export function TecnicoClienteForm({ tecnico, onClose, onSuccess }: TecnicoClienteFormProps) {
  const { data: clientes } = useSWR<Cliente[]>("/api/clientes", fetcher)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cliente_id: tecnico?.cliente_id?.toString() || "",
    nome: tecnico?.nome || "",
    cpf: tecnico?.cpf || "",
    cargo: tecnico?.cargo || "",
    departamento: tecnico?.departamento || "",
    telefone: tecnico?.telefone || "",
    celular: tecnico?.celular || "",
    email: tecnico?.email || "",
    ativo: tecnico?.ativo !== false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = tecnico ? `/api/tecnicos-clientes/${tecnico.id}` : "/api/tecnicos-clientes"
      const method = tecnico ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cliente_id: parseInt(formData.cliente_id),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || "Erro ao salvar técnico")
      }

      const saved = await res.json().catch(() => null)
      if (saved) {
        const clienteObj = clientes?.find((c) => c.id === parseInt(formData.cliente_id))
        if (clienteObj) {
          saved.cliente_nome = clienteObj.nome_fantasia || clienteObj.razao_social
        }
      }

      if (onSuccess) {
        onSuccess(saved)
      } else {
        onClose()
      }
    } catch (error) {
      console.error("Erro ao salvar tecnico:", error)
      alert(error instanceof Error ? error.message : "Erro ao salvar técnico")
    } finally {
      setLoading(false)
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
    }
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Secao: Vinculo ao Cliente */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
          VINCULO
        </h3>
        <div>
          <Label htmlFor="cliente_id">Cliente *</Label>
          <Select
            value={formData.cliente_id}
            onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
            required
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes?.filter(c => c.ativo).map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id.toString()}>
                  {cliente.nome_fantasia || cliente.razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Secao: Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
          DADOS PESSOAIS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
              placeholder="000.000.000-00"
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
            <Label htmlFor="telefone">Telefone Fixo</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
              placeholder="(00) 0000-0000"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => setFormData({ ...formData, celular: formatPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Secao: Dados Profissionais */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
          DADOS PROFISSIONAIS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              placeholder="Ex: Contador, Analista, etc."
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="departamento">Departamento</Label>
            <Input
              id="departamento"
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              placeholder="Ex: Contabilidade, RH, etc."
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Tecnico ativo
            </Label>
          </div>
        </div>
      </div>

      {/* Botoes de Acao */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : tecnico ? "Salvar Alteracoes" : "Cadastrar Tecnico"}
        </Button>
      </div>
    </form>
  )
}
