"use client"

import { useEffect, useState } from "react"
import { CalendarDays, CalendarRange } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export type Periodo =
  | { modo: "mes"; ano: string; mes: string }
  | { modo: "intervalo"; inicio: string; fim: string }

// Constrói os parâmetros de query para as rotas a partir do período selecionado.
export function periodoParaQuery(periodo: Periodo): Record<string, string> {
  if (periodo.modo === "intervalo") {
    return { inicio: periodo.inicio, fim: periodo.fim }
  }
  return { ano: periodo.ano, mes: periodo.mes }
}

// "YYYY-MM" a partir de uma data.
function competenciaDeData(data: Date): string {
  return format(data, "yyyy-MM")
}

// "YYYY-MM" -> "MM/AAAA" para exibição nos campos digitáveis.
function competenciaParaTexto(valor: string): string {
  const [ano, mes] = valor.split("-")
  return `${mes}/${ano}`
}

// Interpreta o que o usuário digitou (aceita "MM/AAAA", "MMAAAA", "M/AAAA") e devolve "YYYY-MM" ou null.
function textoParaCompetencia(texto: string): string | null {
  const digitos = texto.replace(/\D/g, "")
  if (digitos.length !== 5 && digitos.length !== 6) return null
  const mes = Number(digitos.slice(0, digitos.length - 4))
  const ano = Number(digitos.slice(-4))
  if (mes < 1 || mes > 12 || ano < 1900 || ano > 3000) return null
  return `${ano}-${String(mes).padStart(2, "0")}`
}

// Aplica máscara MM/AAAA enquanto digita.
function mascararTexto(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 6)
  if (digitos.length <= 2) return digitos
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
}

interface FiltroCompetenciaProps {
  periodo: Periodo
  onChange: (periodo: Periodo) => void
  anos: string[]
}

export function FiltroCompetencia({ periodo, onChange, anos }: FiltroCompetenciaProps) {
  const [aberto, setAberto] = useState(false)
  const [textoInicio, setTextoInicio] = useState("")
  const [textoFim, setTextoFim] = useState("")

  // Sincroniza os campos digitáveis quando o período muda (troca de modo, calendário, etc.).
  useEffect(() => {
    if (periodo.modo === "intervalo") {
      setTextoInicio(competenciaParaTexto(periodo.inicio))
      setTextoFim(competenciaParaTexto(periodo.fim))
    }
  }, [periodo])

  // Estado do calendário de intervalo (Date), derivado do período atual quando aplicável.
  const rangeAtual: DateRange | undefined =
    periodo.modo === "intervalo"
      ? {
          from: new Date(`${periodo.inicio}-01T00:00:00`),
          to: new Date(`${periodo.fim}-01T00:00:00`),
        }
      : undefined

  function trocarModo(modo: string) {
    if (!modo || modo === periodo.modo) return
    if (modo === "mes") {
      const agora = new Date()
      onChange({ modo: "mes", ano: String(agora.getFullYear()), mes: String(agora.getMonth() + 1) })
    } else {
      const base = periodo.modo === "mes" ? new Date(Number(periodo.ano), Number(periodo.mes) - 1, 1) : new Date()
      onChange({ modo: "intervalo", inicio: competenciaDeData(base), fim: competenciaDeData(new Date()) })
    }
  }

  function selecionarRange(range: DateRange | undefined) {
    if (!range?.from) return
    const inicio = competenciaDeData(range.from)
    const fim = competenciaDeData(range.to ?? range.from)
    onChange({ modo: "intervalo", inicio, fim })
  }

  // Confirma o que foi digitado em "De" / "Até"; ordena as competências e restaura texto válido.
  function confirmarDigitacao() {
    if (periodo.modo !== "intervalo") return
    let inicio = textoParaCompetencia(textoInicio) ?? periodo.inicio
    let fim = textoParaCompetencia(textoFim) ?? periodo.fim
    if (inicio > fim) [inicio, fim] = [fim, inicio]
    onChange({ modo: "intervalo", inicio, fim })
  }

  function aoTeclar(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      confirmarDigitacao()
      ;(event.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        value={periodo.modo}
        onValueChange={trocarModo}
        variant="outline"
        size="sm"
        className="shrink-0"
      >
        <ToggleGroupItem value="mes" aria-label="Filtrar por mês único" className="gap-1.5 px-3">
          <CalendarDays className="h-4 w-4" />
          Mês
        </ToggleGroupItem>
        <ToggleGroupItem value="intervalo" aria-label="Filtrar por período" className="gap-1.5 px-3">
          <CalendarRange className="h-4 w-4" />
          Período
        </ToggleGroupItem>
      </ToggleGroup>

      {periodo.modo === "mes" ? (
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={periodo.mes} onValueChange={(mes) => onChange({ ...periodo, mes })}>
            <SelectTrigger className="w-full min-w-40 sm:w-44">
              <CalendarDays className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((nome, index) => (
                <SelectItem key={nome} value={String(index + 1)}>
                  {nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={periodo.ano} onValueChange={(ano) => onChange({ ...periodo, ano })}>
            <SelectTrigger className="w-full min-w-28 sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">De</span>
            <Input
              value={textoInicio}
              onChange={(e) => setTextoInicio(mascararTexto(e.target.value))}
              onBlur={confirmarDigitacao}
              onKeyDown={aoTeclar}
              placeholder="MM/AAAA"
              inputMode="numeric"
              aria-label="Competência inicial (mês e ano)"
              className="w-28 tabular-nums"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">até</span>
            <Input
              value={textoFim}
              onChange={(e) => setTextoFim(mascararTexto(e.target.value))}
              onBlur={confirmarDigitacao}
              onKeyDown={aoTeclar}
              placeholder="MM/AAAA"
              inputMode="numeric"
              aria-label="Competência final (mês e ano)"
              className="w-28 tabular-nums"
            />
          </div>
          <Popover open={aberto} onOpenChange={setAberto}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Escolher período no calendário">
                <CalendarRange className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={rangeAtual}
                onSelect={selecionarRange}
                numberOfMonths={2}
                locale={ptBR}
                defaultMonth={rangeAtual?.from}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
