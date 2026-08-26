"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import useSWR from "swr"

interface Estado {
  id: number
  sigla: string
  nome: string
}

interface Municipio {
  id: number
  nome: string
}

interface LocationSelectorProps {
  estado: string
  cidade: string
  onChange?: (estado: string, cidade: string) => void
  onEstadoChange?: (value: string) => void
  onMunicipioChange?: (value: string) => void
  estadoLabel?: string
  municipioLabel?: string
  defaultEstado?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LocationSelector({
  estado,
  cidade,
  onChange,
  onEstadoChange,
  onMunicipioChange,
  estadoLabel = "Estado",
  municipioLabel = "Municipio",
  defaultEstado = "PE",
}: LocationSelectorProps) {
  const { data: estados, isLoading: loadingEstados } = useSWR<Estado[]>(
    "/api/ibge?tipo=estados",
    fetcher
  )

  const { data: municipios, isLoading: loadingMunicipios } = useSWR<Municipio[]>(
    estado ? `/api/ibge?tipo=municipios&uf=${estado}` : null,
    fetcher
  )

  // Set default estado on mount
  React.useEffect(() => {
    if (!estado && estados && defaultEstado) {
      const defaultEst = estados.find((e) => e.sigla === defaultEstado)
      if (defaultEst) {
        handleEstadoChange(defaultEst.sigla)
      }
    }
  }, [estados, estado, defaultEstado])

  const handleEstadoChange = (value: string) => {
    if (onChange) {
      onChange(value, "")
    }
    if (onEstadoChange) {
      onEstadoChange(value)
    }
  }

  const handleMunicipioChange = (value: string) => {
    if (onChange) {
      onChange(estado, value)
    }
    if (onMunicipioChange) {
      onMunicipioChange(value)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{estadoLabel}</Label>
        <Select value={estado} onValueChange={handleEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione o estado"} />
          </SelectTrigger>
          <SelectContent>
            {estados?.map((e) => (
              <SelectItem key={e.sigla} value={e.sigla}>
                {e.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{municipioLabel}</Label>
        <Select value={cidade} onValueChange={handleMunicipioChange} disabled={!estado}>
          <SelectTrigger>
            <SelectValue 
              placeholder={
                !estado 
                  ? "Selecione o estado primeiro" 
                  : loadingMunicipios 
                    ? "Carregando..." 
                    : "Selecione o municipio"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {municipios?.map((m) => (
              <SelectItem key={m.id} value={m.nome}>
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
