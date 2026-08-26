"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, X, Clock, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
import { MODULOS_SISTEMA } from "@/lib/constants"

// Usar os módulos do sistema (mesmos dos relatórios)
const MODULOS_DISPONIVEIS = MODULOS_SISTEMA

interface ModuloVinculado {
  id: number
  modulo: string
  adicionado_por: number | null
  adicionado_por_nome: string | null
  created_at: string
}

interface ModulosSelectorProps {
  tipo: "cliente" | "orgao"
  entidadeId: number | null
  disabled?: boolean
  label?: string
  className?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ModulosSelector({ 
  tipo, 
  entidadeId, 
  disabled = false,
  label = "Módulos Vinculados",
  className
}: ModulosSelectorProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const apiUrl = tipo === "cliente" 
    ? `/api/clientes/${entidadeId}/modulos`
    : `/api/orgaos/${entidadeId}/modulos`
  
  const { data: modulosVinculados, mutate } = useSWR<ModuloVinculado[]>(
    entidadeId ? apiUrl : null,
    fetcher
  )
  
  const modulosSelecionados = modulosVinculados?.map(m => m.modulo) || []
  
  const handleToggleModulo = async (modulo: string) => {
    if (!entidadeId || saving) return
    
    setSaving(true)
    const isSelected = modulosSelecionados.includes(modulo)
    
    try {
      if (isSelected) {
        // Remover módulo
        await fetch(apiUrl, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modulo })
        })
      } else {
        // Adicionar módulo
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modulos: [modulo] })
        })
      }
      mutate()
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error)
    } finally {
      setSaving(false)
    }
  }
  
  const getModuloInfo = (moduloNome: string): ModuloVinculado | undefined => {
    return modulosVinculados?.find(m => m.modulo === moduloNome)
  }
  
  if (!entidadeId) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-muted-foreground">{label}</Label>
        <p className="text-sm text-muted-foreground italic">
          Salve o {tipo === "cliente" ? "cliente" : "órgão"} primeiro para gerenciar os módulos vinculados.
        </p>
      </div>
    )
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {modulosSelecionados.length} módulo(s)
        </span>
      </div>
      
      {/* Seletor de módulos */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {modulosSelecionados.length > 0
                ? `${modulosSelecionados.length} módulo(s) selecionado(s)`
                : "Selecionar módulos..."}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar módulo..." />
            <CommandList>
              <CommandEmpty>Nenhum módulo encontrado.</CommandEmpty>
              <CommandGroup>
                {MODULOS_DISPONIVEIS.map((modulo) => {
                  const isSelected = modulosSelecionados.includes(modulo)
                  return (
                    <CommandItem
                      key={modulo}
                      value={modulo}
                      onSelect={() => handleToggleModulo(modulo)}
                      disabled={saving}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      {modulo}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Lista de módulos vinculados com informações de auditoria */}
      {modulosVinculados && modulosVinculados.length > 0 && (
        <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Histórico de vinculação
          </p>
          <div className="space-y-2">
            {modulosVinculados.map((modulo) => (
              <div 
                key={modulo.id} 
                className="flex items-center justify-between p-2 rounded-md bg-background border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{modulo.modulo}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {modulo.adicionado_por_nome || "Sistema"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(modulo.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleToggleModulo(modulo.modulo)}
                  disabled={saving || disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
