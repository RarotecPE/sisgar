"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AgendaItem, TecnicoRarotec, Cliente } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AgendaFormProps {
  evento: AgendaItem | null
  defaultDate: Date | null
  onClose: () => void
}

export function AgendaForm({ evento, defaultDate, onClose }: AgendaFormProps) {
  const { data: tecnicos } = useSWR<TecnicoRarotec[]>("/api/tecnicos-rarotec", fetcher)
  const { data: clientes } = useSWR<Cliente[]>("/api/clientes", fetcher)
  const [loading, setLoading] = useState(false)

  const getDefaultDateTime = () => {
    if (evento?.data_inicio) {
      return format(new Date(evento.data_inicio), "yyyy-MM-dd'T'HH:mm")
    }
    if (defaultDate) {
      return format(defaultDate, "yyyy-MM-dd'T'09:00")
    }
    return format(new Date(), "yyyy-MM-dd'T'09:00")
  }

  const getDefaultEndDateTime = () => {
    if (evento?.data_fim) {
      return format(new Date(evento.data_fim), "yyyy-MM-dd'T'HH:mm")
    }
    return ""
  }

  const [formData, setFormData] = useState({
    titulo: evento?.titulo || "",
    descricao: evento?.descricao || "",
    tecnico_rarotec_id: evento?.tecnico_rarotec_id?.toString() || "",
    cliente_id: evento?.cliente_id?.toString() || "",
    data_inicio: getDefaultDateTime(),
    data_fim: getDefaultEndDateTime(),
    tipo: evento?.tipo || "visita",
    status: evento?.status || "agendado",
    local: evento?.local || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = evento ? `/api/agenda/${evento.id}` : "/api/agenda"
      const method = evento ? "PUT" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tecnico_rarotec_id: formData.tecnico_rarotec_id ? parseInt(formData.tecnico_rarotec_id) : null,
          cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
          data_fim: formData.data_fim || null,
        }),
      })

      onClose()
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!evento || !confirm("Tem certeza que deseja excluir este evento?")) return
    
    setLoading(true)
    try {
      await fetch(`/api/agenda/${evento.id}`, { method: "DELETE" })
      onClose()
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="titulo">Titulo *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <select
            id="tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="visita">Visita</option>
            <option value="manutencao">Manutencao</option>
            <option value="instalacao">Instalacao</option>
            <option value="suporte">Suporte</option>
            <option value="reuniao">Reuniao</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="agendado">Agendado</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <Label htmlFor="tecnico_rarotec_id">Tecnico Responsavel</Label>
          <select
            id="tecnico_rarotec_id"
            value={formData.tecnico_rarotec_id}
            onChange={(e) => setFormData({ ...formData, tecnico_rarotec_id: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Selecione...</option>
            {tecnicos?.filter(t => t.ativo).map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="cliente_id">Cliente</Label>
          <select
            id="cliente_id"
            value={formData.cliente_id}
            onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Selecione...</option>
            {clientes?.filter(c => c.ativo).map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome_fantasia || cliente.razao_social}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="data_inicio">Data/Hora Inicio *</Label>
          <Input
            id="data_inicio"
            type="datetime-local"
            value={formData.data_inicio}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="data_fim">Data/Hora Fim</Label>
          <Input
            id="data_fim"
            type="datetime-local"
            value={formData.data_fim}
            onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="local">Local</Label>
          <Input
            id="local"
            value={formData.local}
            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            placeholder="Endereco ou local do evento"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="descricao">Descricao</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div>
          {evento && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              Excluir
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  )
}
