"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, X, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface ClienteOption {
  id: number
  nome_fantasia?: string
  razao_social?: string
  cidade?: string
}

interface Props {
  clientes: ClienteOption[]
  /** ids dos clientes selecionados */
  value: number[]
  /** municipio selecionado (cidade) */
  municipio: string
  onChange: (clienteIds: number[], municipio: string) => void
  disabled?: boolean
}

function nomeDe(c: ClienteOption) {
  return c.nome_fantasia || c.razao_social || `Cliente ${c.id}`
}

/** Remove acentos e normaliza para busca (ex.: "Câmara" -> "camara"). */
function normalizar(str: string) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function filtrarCommand(value: string, search: string) {
  return normalizar(value).includes(normalizar(search)) ? 1 : 0
}

const SEM_MUNICIPIO = "Sem municipio definido"

/** Chave de agrupamento: ignora acentos, caixa e espacos extras. */
function chaveMunicipio(cidade?: string) {
  const base = (cidade || "").trim()
  if (!base) return normalizar(SEM_MUNICIPIO)
  return normalizar(base).replace(/\s+/g, " ")
}

/**
 * Escolhe o melhor rotulo entre as variacoes de grafia de um mesmo municipio.
 * Evita ALL CAPS e all lowercase; em empate, usa a variacao mais frequente.
 */
function melhorRotulo(variacoes: { texto: string; qtd: number }[]) {
  const pontuacao = (t: string) => {
    const semEspaco = t.replace(/\s/g, "")
    if (!semEspaco) return 0
    const temMinuscula = /[a-zà-ÿ]/.test(t)
    const temMaiuscula = /[A-ZÀ-Þ]/.test(t)
    if (temMinuscula && temMaiuscula) return 3 // caixa mista (ideal)
    if (temMinuscula) return 2 // tudo minusculo
    return 1 // TUDO MAIUSCULO
  }
  return [...variacoes].sort(
    (a, b) => pontuacao(b.texto) - pontuacao(a.texto) || b.qtd - a.qtd,
  )[0].texto
}

export function MunicipioClientesSelect({
  clientes,
  value,
  municipio,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)

  // Lista de municipios distintos (agrupados por chave normalizada)
  const municipios = useMemo(() => {
    const grupos = new Map<string, { texto: string; qtd: number }[]>()
    for (const c of clientes) {
      const texto = c.cidade?.trim() || SEM_MUNICIPIO
      const chave = chaveMunicipio(c.cidade)
      const lista = grupos.get(chave) || []
      const existente = lista.find((v) => v.texto === texto)
      if (existente) existente.qtd += 1
      else lista.push({ texto, qtd: 1 })
      grupos.set(chave, lista)
    }
    return Array.from(grupos.values())
      .map((variacoes) => ({
        nome: melhorRotulo(variacoes),
        qtd: variacoes.reduce((s, v) => s + v.qtd, 0),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [clientes])

  // Clientes do municipio selecionado (comparacao normalizada)
  const clientesDoMunicipio = useMemo(() => {
    if (!municipio) return []
    const chaveSel = chaveMunicipio(municipio)
    return clientes
      .filter((c) => chaveMunicipio(c.cidade) === chaveSel)
      .sort((a, b) => nomeDe(a).localeCompare(nomeDe(b), "pt-BR"))
  }, [clientes, municipio])

  const selecionados = useMemo(
    () => clientes.filter((c) => value.includes(c.id)),
    [clientes, value],
  )

  function selecionarMunicipio(m: string) {
    setOpen(false)
    if (chaveMunicipio(m) === chaveMunicipio(municipio)) return
    // Ao trocar de municipio, limpa a selecao de clientes
    onChange([], m)
  }

  function toggleCliente(id: number) {
    if (value.includes(id)) {
      onChange(
        value.filter((v) => v !== id),
        municipio,
      )
    } else {
      onChange([...value, id], municipio)
    }
  }

  function selecionarTodos() {
    onChange(
      clientesDoMunicipio.map((c) => c.id),
      municipio,
    )
  }

  function limparClientes() {
    onChange([], municipio)
  }

  return (
    <div className="space-y-2">
      {/* Passo 1: municipio */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={cn("flex items-center gap-2 truncate", !municipio && "text-muted-foreground")}>
              <Building2 className="h-4 w-4 shrink-0 opacity-60" />
              {municipio || "Selecione o municipio"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command filter={filtrarCommand}>
            <CommandInput placeholder="Digite para pesquisar o municipio..." />
            <CommandList>
              <CommandEmpty>Nenhum municipio encontrado.</CommandEmpty>
              <CommandGroup>
                {municipios.map((m) => (
                  <CommandItem key={m.nome} value={m.nome} onSelect={() => selecionarMunicipio(m.nome)}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        chaveMunicipio(municipio) === chaveMunicipio(m.nome)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="flex-1">{m.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.qtd} {m.qtd === 1 ? "cliente" : "clientes"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Passo 2: clientes do municipio */}
      {municipio && (
        <div className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Clientes em {municipio} ({selecionados.length} selecionado
              {selecionados.length === 1 ? "" : "s"})
            </span>
            {!disabled && clientesDoMunicipio.length > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selecionarTodos}
                  className="text-xs text-primary hover:underline"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={limparClientes}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {clientesDoMunicipio.map((c) => {
              const ativo = value.includes(c.id)
              return (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
                    ativo ? "bg-primary/10" : "hover:bg-muted",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={ativo}
                    disabled={disabled}
                    onChange={() => toggleCliente(c.id)}
                    className="h-4 w-4"
                  />
                  <span className="flex-1">{nomeDe(c)}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Resumo dos selecionados */}
      {selecionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selecionados.map((c) => (
            <Badge key={c.id} variant="secondary" className="gap-1 font-normal">
              {nomeDe(c)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggleCliente(c.id)}
                  className="ml-0.5 rounded-full hover:bg-background/60"
                  aria-label={`Remover ${nomeDe(c)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
