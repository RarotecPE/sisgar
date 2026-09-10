"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEPARTAMENTOS_PADRAO } from "@/lib/constants"

interface Props {
  value: string[]
  onChange: (setores: string[]) => void
  placeholder?: string
  // Opcoes adicionais (ex.: setores vindos de /api/setores) unidas aos departamentos padrao.
  extraOptions?: string[]
}

// Multi-selecao de setores/departamentos, reutilizando os mesmos departamentos do
// cadastro dos tecnicos da Rarotec (DEPARTAMENTOS_PADRAO).
export function SetoresMultiselect({ value, onChange, placeholder, extraOptions = [] }: Props) {
  const [open, setOpen] = useState(false)

  const opcoes = Array.from(new Set([...DEPARTAMENTOS_PADRAO, ...extraOptions])).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  )

  function toggle(setor: string) {
    if (value.includes(setor)) onChange(value.filter((s) => s !== setor))
    else onChange([...value, setor])
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mt-1.5 font-normal h-auto min-h-10"
          >
            <span className="text-muted-foreground">
              {value.length === 0
                ? placeholder || "Selecione os setores/departamentos"
                : `${value.length} setor(es) selecionado(s)`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar setor..." />
            <CommandList>
              <CommandEmpty>Nenhum setor encontrado.</CommandEmpty>
              <CommandGroup>
                {opcoes.map((setor) => (
                  <CommandItem key={setor} value={setor} onSelect={() => toggle(setor)}>
                    <Check className={cn("mr-2 h-4 w-4", value.includes(setor) ? "opacity-100" : "opacity-0")} />
                    {setor}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((setor) => (
            <Badge key={setor} variant="secondary" className="text-xs">
              {setor}
              <button
                type="button"
                onClick={() => toggle(setor)}
                className="ml-1 hover:text-destructive"
                aria-label={`Remover ${setor}`}
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
