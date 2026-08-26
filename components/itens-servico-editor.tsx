"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { formatBRL, totalItensServico, type ApuracaoItemServico } from "@/lib/apuracao"

interface Props {
  itens: ApuracaoItemServico[]
  onChange: (itens: ApuracaoItemServico[]) => void
}

const UNIDADES = ["un", "mês", "hora", "serviço", "licença", "verba"]

export function ItensServicoEditor({ itens, onChange }: Props) {
  function add() {
    onChange([...itens, { descricao: "", quantidade: 1, unidade: "un", valor: 0 }])
  }
  function update(idx: number, patch: Partial<ApuracaoItemServico>) {
    onChange(itens.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  function remove(idx: number) {
    onChange(itens.filter((_, i) => i !== idx))
  }

  const total = totalItensServico(itens)

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Itens da prestação dos serviços</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="mr-1 h-4 w-4" />
          Adicionar item
        </Button>
      </div>

      {itens.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhum item. Clique em &quot;Adicionar item&quot; para incluir descrição, quantidade,
          unidade e valor.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Cabeçalho (apenas em telas médias) */}
          <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_72px_96px_120px_36px]">
            <span>Descrição</span>
            <span className="text-center">Qtd.</span>
            <span>Unidade</span>
            <span className="text-right">Valor total (R$)</span>
            <span className="sr-only">Ações</span>
          </div>

          {itens.map((it, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-2 rounded-md border p-2 sm:grid-cols-[1fr_72px_96px_120px_36px] sm:items-center sm:border-0 sm:p-0"
            >
              <Input
                placeholder="Ex.: Licenciamento do software de patrimônio"
                value={it.descricao}
                onChange={(e) => update(idx, { descricao: e.target.value })}
              />
              <Input
                type="number"
                min="0"
                step="1"
                className="sm:text-center"
                aria-label="Quantidade"
                value={it.quantidade}
                onChange={(e) => update(idx, { quantidade: Number(e.target.value) || 0 })}
              />
              <Input
                list="unidades-servico"
                placeholder="un"
                aria-label="Unidade"
                value={it.unidade}
                onChange={(e) => update(idx, { unidade: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                className="sm:text-right"
                aria-label="Valor total"
                value={it.valor}
                onChange={(e) => update(idx, { valor: Number(e.target.value) || 0 })}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="justify-self-end text-destructive"
                onClick={() => remove(idx)}
                aria-label="Remover item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <datalist id="unidades-servico">
            {UNIDADES.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>

          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span className="font-medium text-muted-foreground">Totalização mensal</span>
            <span className="text-base font-bold text-foreground">{formatBRL(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
