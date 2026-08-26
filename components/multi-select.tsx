"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[] | string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  allowCustom?: boolean
  onAddCustom?: (value: string) => void
  onAddNew?: (value: string) => void // Alias for onAddCustom
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  allowCustom = false,
  onAddCustom,
  onAddNew,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [customValue, setCustomValue] = React.useState("")

  // Normalize options to always be {value, label}
  const normalizedOptions: Option[] = React.useMemo(() => {
    if (options.length === 0) return []
    if (typeof options[0] === "string") {
      return (options as string[]).map((opt) => ({ value: opt, label: opt }))
    }
    return options as Option[]
  }, [options])

  // Check if custom additions are allowed
  const canAddCustom = allowCustom || !!onAddNew || !!onAddCustom

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleAddCustom = () => {
    const trimmedValue = customValue.trim()
    if (trimmedValue && !normalizedOptions.some((opt) => opt.value === trimmedValue)) {
      // Call the appropriate callback
      if (onAddNew) {
        onAddNew(trimmedValue)
      } else if (onAddCustom) {
        onAddCustom(trimmedValue)
      }
      // Add to selected
      if (!selected.includes(trimmedValue)) {
        onChange([...selected, trimmedValue])
      }
      setCustomValue("")
    }
  }

  const getLabel = (value: string) => {
    const option = normalizedOptions.find((opt) => opt.value === value)
    return option?.label || value
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <span className="text-muted-foreground truncate">
              {selected.length > 0 ? `${selected.length} selecionado(s)` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {normalizedOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {canAddCustom && (
              <div className="p-2 border-t flex gap-2">
                <Input
                  placeholder="Adicionar novo..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCustom()
                    }
                  }}
                />
                <Button size="icon" variant="outline" onClick={handleAddCustom}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {getLabel(item)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleRemove(item)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
