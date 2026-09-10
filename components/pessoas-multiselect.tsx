"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, X, Plus, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PessoaVinculada } from "@/lib/capacitacao"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  value: PessoaVinculada[]
  onChange: (pessoas: PessoaVinculada[]) => void
  placeholder?: string
}

// Multi-selecao de pessoas: escolhe tecnicos da Rarotec (de /api/tecnicos-rarotec) e/ou
// adiciona pessoas externas digitando o nome manualmente. Ambos sao selecionaveis/acumulativos.
export function PessoasMultiselect({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [externo, setExterno] = useState("")

  const { data: tecnicos } = useSWR<{ id: number; nome: string }[]>("/api/tecnicos-rarotec", fetcher)
  const nomesTecnicos = (tecnicos || []).map((t) => t.nome).filter(Boolean)

  function jaSelecionado(nome: string) {
    return value.some((p) => p.nome.toLowerCase() === nome.toLowerCase())
  }

  function toggleTecnico(nome: string) {
    if (jaSelecionado(nome)) {
      onChange(value.filter((p) => p.nome.toLowerCase() !== nome.toLowerCase()))
    } else {
      onChange([...value, { nome, externo: false }])
    }
  }

  function adicionarExterno() {
    const nome = externo.trim()
    if (!nome || jaSelecionado(nome)) {
      setExterno("")
      return
    }
    onChange([...value, { nome, externo: true }])
    setExterno("")
  }

  function remover(nome: string) {
    onChange(value.filter((p) => p.nome !== nome))
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row mt-1.5">
        {/* Combobox de tecnicos da Rarotec */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal h-auto min-h-10 sm:flex-1"
            >
              <span className="text-muted-foreground">
                {placeholder || "Selecionar técnicos da Rarotec"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar técnico..." />
              <CommandList>
                <CommandEmpty>Nenhum técnico encontrado.</CommandEmpty>
                <CommandGroup>
                  {nomesTecnicos.map((nome) => (
                    <CommandItem key={nome} value={nome} onSelect={() => toggleTecnico(nome)}>
                      <Check className={cn("mr-2 h-4 w-4", jaSelecionado(nome) ? "opacity-100" : "opacity-0")} />
                      {nome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Campo para adicionar pessoa externa */}
        <div className="flex gap-2 sm:flex-1">
          <Input
            value={externo}
            onChange={(e) => setExterno(e.target.value)}
            placeholder="Técnico externo"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                adicionarExterno()
              }
            }}
          />
          <Button type="button" variant="secondary" size="icon" onClick={adicionarExterno} aria-label="Adicionar externo">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((p) => (
            <Badge key={p.nome} variant={p.externo ? "outline" : "secondary"} className="text-xs">
              <UserRound className="mr-1 h-3 w-3" />
              {p.nome}
              {p.externo && <span className="ml-1 text-muted-foreground">(externo)</span>}
              <button
                type="button"
                onClick={() => remover(p.nome)}
                className="ml-1 hover:text-destructive"
                aria-label={`Remover ${p.nome}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
