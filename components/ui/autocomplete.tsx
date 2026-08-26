"use client"

import * as React from "react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface AutocompleteOption {
  value: string
  label: string
  description?: string
}

interface AutocompleteProps {
  options: AutocompleteOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
  minChars?: number
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Digite para buscar...",
  emptyMessage = "Nenhum resultado encontrado",
  className,
  inputClassName,
  disabled = false,
  minChars = 0,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sincroniza o inputValue com o value selecionado
  React.useEffect(() => {
    if (value) {
      const option = options.find(o => o.value === value)
      if (option) {
        setInputValue(option.label)
      }
    } else {
      setInputValue("")
    }
  }, [value, options])

  const filteredOptions = React.useMemo(() => {
    if (inputValue.length < minChars) return []
    const search = inputValue.toLowerCase()
    return options.filter(option => 
      option.label.toLowerCase().includes(search) ||
      option.description?.toLowerCase().includes(search)
    ).slice(0, 50)
  }, [options, inputValue, minChars])

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    const option = options.find(o => o.value === selectedValue)
    if (option) {
      setInputValue(option.label)
    }
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (newValue.length >= minChars) {
      setOpen(true)
    }
    // Se limpar o input, limpa a seleção
    if (!newValue) {
      onValueChange("")
    }
  }

  const handleFocus = () => {
    if (inputValue.length >= minChars && filteredOptions.length > 0) {
      setOpen(true)
    }
  }

  const handleBlur = () => {
    // Delay para permitir click no item
    setTimeout(() => setOpen(false), 200)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("h-12", inputClassName)}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent 
        className="p-0 w-[var(--radix-popover-trigger-width)]" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {inputValue.length < minChars ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Digite pelo menos {minChars} letras para buscar
              </div>
            ) : filteredOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
