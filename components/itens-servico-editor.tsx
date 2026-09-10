"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, RotateCcw, Shuffle } from "lucide-react"
import {
  formatBRL,
  totalItensServico,
  totalAnualItensServico,
  valorMensalItemServico,
  valorUnitarioItemServico,
  valorTotalAnualItem,
  quantidadeDisponivelItem,
  valorConsumidoItem,
  valorConsumidoItens,
  gerarDistribuicaoMensal,
  reconciliarDistribuicao,
  somaDistribuicao,
  quantidadeDaEmissao,
  type ApuracaoItemServico,
} from "@/lib/apuracao"

interface Props {
  itens: ApuracaoItemServico[]
  onChange: (itens: ApuracaoItemServico[]) => void
  mesesContrato?: number
  controleConsumo?: boolean
  // Quando definido (contexto de EMISSAO), o editor entra em modo PREVIEW: em vez de configurar
  // a distribuicao, mostra a quantidade projetada para esta emissao (indice 0-based = nº ja emitidos).
  previewIndice?: number
}

const UNIDADES = ["un", "mês", "hora", "serviço", "licença", "verba"]

// Formata quantidade permitindo fração (ex.: 1,7) sem casas desnecessárias.
function fmtQtd(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "")
}

export function ItensServicoEditor({
  itens,
  onChange,
  mesesContrato = 12,
  controleConsumo = false,
  previewIndice,
}: Props) {
  const modoPreview = previewIndice != null
  function add() {
    onChange([
      ...itens,
      { descricao: "", quantidade: 1, unidade: "un", valor_unitario: 0, valor: 0, quantidade_contrato: undefined, valor_total: undefined },
    ])
  }
  function update(idx: number, patch: Partial<ApuracaoItemServico>) {
    onChange(
      itens.map((it, i) => {
        if (i !== idx) return it
        const next = { ...it, ...patch }
        // Recalcula o valor mensal sempre que quantidade ou valor unitario mudarem.
        if ("quantidade" in patch || "valor_unitario" in patch) {
          next.valor = valorMensalItemServico(next)
        }
        return next
      }),
    )
  }
  function remove(idx: number) {
    onChange(itens.filter((_, i) => i !== idx))
  }

  // --- Distribuicao mensal variavel por item ------------------------------------------------
  const VARIACAO_PADRAO = 0.3

  function toggleDistribuir(idx: number, on: boolean) {
    const it = itens[idx]
    if (on) {
      const total = Number(it.quantidade_contrato) || 0
      const pct = it.distribuicao_variacao_pct ?? VARIACAO_PADRAO
      // Reaproveita a distribuicao existente se ainda casar com os meses; senao gera nova.
      const dist =
        Array.isArray(it.distribuicao_mensal) && it.distribuicao_mensal.length === mesesContrato
          ? it.distribuicao_mensal
          : gerarDistribuicaoMensal(total, mesesContrato, pct)
      update(idx, { distribuir_mensal: true, distribuicao_variacao_pct: pct, distribuicao_mensal: dist })
    } else {
      update(idx, { distribuir_mensal: false })
    }
  }

  function regenerarDistribuicao(idx: number) {
    const it = itens[idx]
    const total = Number(it.quantidade_contrato) || 0
    const pct = it.distribuicao_variacao_pct ?? VARIACAO_PADRAO
    // Seed nova a cada clique => distribuicao diferente, mas sempre fechando o total.
    update(idx, { distribuicao_mensal: gerarDistribuicaoMensal(total, mesesContrato, pct, Date.now() % 2147483647) })
  }

  function setVariacao(idx: number, pct: number) {
    update(idx, { distribuicao_variacao_pct: Math.min(Math.max(pct, 0), 0.95) })
  }

  function setMesDistribuicao(idx: number, mesIdx: number, valor: number) {
    const it = itens[idx]
    const arr = Array.from({ length: mesesContrato }, (_, k) => Number(it.distribuicao_mensal?.[k]) || 0)
    arr[mesIdx] = Math.max(0, Math.round(Number(valor) || 0))
    update(idx, { distribuicao_mensal: arr })
  }

  function distribuirResto(idx: number) {
    const it = itens[idx]
    const total = Number(it.quantidade_contrato) || 0
    const arr = Array.from({ length: mesesContrato }, (_, k) => Number(it.distribuicao_mensal?.[k]) || 0)
    update(idx, { distribuicao_mensal: reconciliarDistribuicao(arr, total) })
  }

  const totalMensal = totalItensServico(itens)
  const totalAnual = totalAnualItensServico(itens)
  const totalConsumido = valorConsumidoItens(itens)

  // Colunas de consumo (em quantidade) só aparecem quando o controle está ligado.
  // OBS: classes do Tailwind precisam ser strings estáticas completas (JIT não lê template literals).
  const GRID = controleConsumo
    ? "sm:grid-cols-[1fr_60px_78px_104px_104px_84px_120px_92px_92px_92px_116px_32px]"
    : "sm:grid-cols-[1fr_60px_78px_104px_104px_84px_120px_32px]"
  const MIN_W = controleConsumo ? "sm:min-w-[1260px]" : "sm:min-w-[840px]"

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
          unidade e valores.
        </p>
      ) : (
        <div className="space-y-2 overflow-x-auto">
          <div className={MIN_W}>
            <div className="space-y-2">
              {/* Cabeçalho (apenas em telas médias) */}
              <div className={`hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid ${GRID}`}>
                <span>Descrição</span>
                <span className="text-center">Qtd./mês</span>
                <span>Unidade</span>
                <span className="text-right">Vlr. unit. (R$)</span>
                <span className="text-right">Vlr. mensal (R$)</span>
                <span className="text-center">Qtd. contrato</span>
                <span className="text-right">Vlr. total anual (R$)</span>
                {controleConsumo && (
                  <>
                    <span className="text-center">Consumida Manual</span>
                    <span className="text-center">Autom.</span>
                    <span className="text-center">Disponível</span>
                    <span className="text-right">Consumido (R$)</span>
                  </>
                )}
                <span className="sr-only">Ações</span>
              </div>

              {itens.map((it, idx) => {
                const unit = valorUnitarioItemServico(it)
                const mensal = valorMensalItemServico(it)
                const anualOverride = it.valor_total != null
                // Valor total do item = unitário × quantidade prevista em contrato.
                const anualValor = valorTotalAnualItem(it)
                const consumidaAuto = Number(it.quantidade_consumida_auto) || 0
                const disponivel = quantidadeDisponivelItem(it)
                const negativo = disponivel != null && disponivel < 0
                const total = Number(it.quantidade_contrato) || 0
                const podeDistribuir = it.quantidade_contrato != null && total > 0
                const somaDist = somaDistribuicao(it.distribuicao_mensal)
                const somaOk = somaDist === Math.round(total)
                const pct = it.distribuicao_variacao_pct ?? VARIACAO_PADRAO
                return (
                  <div key={idx} className="space-y-2">
                  <div
                    className={`grid grid-cols-1 gap-2 rounded-md border p-2 sm:items-center sm:border-0 sm:p-0 ${GRID}`}
                  >
                    <Input
                      placeholder="Ex.: Licenciamento do software de patrimônio"
                      value={it.descricao}
                      onChange={(e) => update(idx, { descricao: e.target.value })}
                    />
                    {it.distribuir_mensal ? (
                      <Input
                        readOnly
                        tabIndex={-1}
                        className="sm:text-center bg-muted/50 text-muted-foreground text-xs italic"
                        aria-label="Quantidade mensal (distribuída)"
                        title={
                          modoPreview
                            ? `Projeção desta emissão (nº ${(previewIndice ?? 0) + 1})`
                            : "A quantidade varia por emissão — veja a distribuição abaixo"
                        }
                        value={modoPreview ? fmtQtd(quantidadeDaEmissao(it, previewIndice ?? 0)) : "varia"}
                      />
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        className="sm:text-center"
                        aria-label="Quantidade mensal"
                        value={it.quantidade}
                        onChange={(e) => update(idx, { quantidade: Number(e.target.value) || 0 })}
                      />
                    )}
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
                      min="0"
                      className="sm:text-right"
                      aria-label="Valor unitário"
                      value={unit}
                      onChange={(e) => update(idx, { valor_unitario: Number(e.target.value) || 0 })}
                    />
                    {/* Valor mensal: somente leitura (quantidade x unitário) */}
                    <Input
                      readOnly
                      tabIndex={-1}
                      className="sm:text-right bg-muted/50 text-muted-foreground"
                      aria-label="Valor mensal (calculado)"
                      value={mensal.toFixed(2)}
                    />
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      className="sm:text-center"
                      aria-label="Quantidade prevista em contrato"
                      placeholder="—"
                      value={it.quantidade_contrato ?? ""}
                      onChange={(e) =>
                        update(idx, { quantidade_contrato: e.target.value === "" ? undefined : Number(e.target.value) || 0 })
                      }
                    />
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`sm:text-right ${anualOverride ? "" : "text-muted-foreground"}`}
                        aria-label="Valor total anual"
                        title={anualOverride ? "Valor manual (override)" : "Automático = valor unitário × quantidade em contrato"}
                        value={anualValor.toFixed(2)}
                        onChange={(e) => update(idx, { valor_total: Number(e.target.value) || 0 })}
                      />
                      {anualOverride && (
                        <button
                          type="button"
                          onClick={() => update(idx, { valor_total: undefined })}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label="Voltar ao cálculo automático"
                          title="Voltar ao cálculo automático"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {controleConsumo && (
                      <>
                        {/* Consumida (semente manual, aceita fração) */}
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="sm:text-center"
                          aria-label="Quantidade consumida (manual)"
                          title="Consumo inicial informado manualmente (aceita fração, ex.: 1,7)"
                          placeholder="0"
                          value={it.quantidade_consumida_inicial ?? ""}
                          onChange={(e) =>
                            update(idx, {
                              quantidade_consumida_inicial: e.target.value === "" ? undefined : Number(e.target.value) || 0,
                            })
                          }
                        />
                        {/* Consumida automática (gerada pelas apurações) — somente leitura */}
                        <Input
                          readOnly
                          tabIndex={-1}
                          className="sm:text-center bg-muted/50 text-muted-foreground"
                          aria-label="Quantidade consumida automaticamente"
                          title="Gerada automaticamente pelas apurações emitidas"
                          value={fmtQtd(consumidaAuto)}
                        />
                        {/* Disponível para utilização — calculado */}
                        <Input
                          readOnly
                          tabIndex={-1}
                          className={`sm:text-center bg-muted/50 ${negativo ? "text-destructive font-medium" : "text-muted-foreground"}`}
                          aria-label="Quantidade disponível para utilização"
                          title="Prevista em contrato − consumida (manual + automática)"
                          value={disponivel == null ? "—" : fmtQtd(disponivel)}
                        />
                        {/* Valor consumido em R$ — calculado (qtd consumida × unitário) */}
                        <Input
                          readOnly
                          tabIndex={-1}
                          className="sm:text-right bg-muted/50 text-muted-foreground"
                          aria-label="Valor consumido em reais"
                          title="Consumido até o momento = quantidade consumida × valor unitário"
                          value={valorConsumidoItem(it).toFixed(2)}
                        />
                      </>
                    )}

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

                  {/* Modo PREVIEW (emissao): linha compacta com a projecao desta emissao */}
                  {modoPreview && it.distribuir_mensal && (
                    <div className="rounded-md border border-dashed bg-muted/20 p-2 text-xs text-muted-foreground sm:ml-1">
                      Distribuição por emissão ativa · esta emissão (nº {(previewIndice ?? 0) + 1}):{" "}
                      <strong className="text-foreground">
                        {fmtQtd(quantidadeDaEmissao(it, previewIndice ?? 0))} {it.unidade || "un"}
                      </strong>{" "}
                      · total do contrato: {fmtQtd(total)} {it.unidade || "un"}
                    </div>
                  )}

                  {/* Distribuicao mensal variavel — configuracao (so no editor do modelo) */}
                  {!modoPreview && podeDistribuir && (
                    <div className="rounded-md border border-dashed bg-muted/20 p-2 sm:ml-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch
                            checked={!!it.distribuir_mensal}
                            onCheckedChange={(v) => toggleDistribuir(idx, v)}
                            aria-label={`Distribuir ${it.descricao || "item"} ao longo dos meses`}
                          />
                          <span>
                            Distribuir <strong className="text-foreground">{fmtQtd(total)}</strong>{" "}
                            {it.unidade || "un"} ao longo de {mesesContrato}{" "}
                            {mesesContrato === 1 ? "mês" : "meses"}{" "}
                            <span className="italic">(varia por ordem de emissão)</span>
                          </span>
                        </label>
                        {it.distribuir_mensal && (
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              somaOk
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            Soma: {fmtQtd(somaDist)} / {fmtQtd(total)}
                          </span>
                        )}
                      </div>

                      {it.distribuir_mensal && (
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              Variação
                              <Input
                                type="number"
                                min="0"
                                max="95"
                                step="5"
                                className="h-7 w-16 text-center"
                                aria-label="Variação percentual"
                                value={Math.round(pct * 100)}
                                onChange={(e) => setVariacao(idx, (Number(e.target.value) || 0) / 100)}
                              />
                              %
                            </label>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="h-7"
                              onClick={() => regenerarDistribuicao(idx)}
                            >
                              <Shuffle className="mr-1 h-3.5 w-3.5" />
                              Gerar automaticamente
                            </Button>
                            {!somaOk && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7"
                                onClick={() => distribuirResto(idx)}
                              >
                                Distribuir resto
                              </Button>
                            )}
                          </div>

                          {/* Grade de meses por ORDEM DE EMISSAO (Emissão 1..N), editaveis */}
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {Array.from({ length: mesesContrato }, (_, k) => {
                              const v = Number(it.distribuicao_mensal?.[k]) || 0
                              return (
                                <div key={k} className="flex flex-col gap-0.5">
                                  <span className="text-[10px] uppercase text-muted-foreground">
                                    Emissão {k + 1}
                                  </span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="h-8 text-center"
                                    aria-label={`Quantidade da emissão ${k + 1}`}
                                    value={v}
                                    onChange={(e) => setMesDistribuicao(idx, k, Number(e.target.value))}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                )
              })}

              <datalist id="unidades-servico">
                {UNIDADES.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-1 border-t pt-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Totalização mensal</span>
                <span className="text-xs text-muted-foreground">Soma dos valores mensais &middot; consta no relatório de apuração</span>
              </div>
              <span className="text-base font-bold text-foreground">{formatBRL(totalMensal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-muted-foreground">Valor global do contrato</span>
                <span className="text-xs text-muted-foreground">Soma de (valor unitário &times; qtd. contrato) &middot; uso interno, não sai no relatório</span>
              </div>
              <span className="text-base font-semibold text-muted-foreground">{formatBRL(totalAnual)}</span>
            </div>
            {controleConsumo && (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-muted-foreground">Consumido até o momento</span>
                  <span className="text-xs text-muted-foreground">Soma de (qtd. consumida &times; valor unitário) de todos os itens</span>
                </div>
                <span className="text-base font-semibold text-muted-foreground">{formatBRL(totalConsumido)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
