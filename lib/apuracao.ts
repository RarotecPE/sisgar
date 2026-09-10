// Tipos e utilitarios compartilhados do modulo de Apuracao Mensal (RMPS)

/**
 * Converte um valor guardado (pathname de blob privado ou URL completa legada)
 * em uma URL servivel pelo navegador. Blobs privados sao servidos via /api/file.
 */
export function fileUrl(value?: string | null): string {
  if (!value) return ""
  if (/^(https?:|data:|blob:)/.test(value)) return value
  return `/api/file?pathname=${encodeURIComponent(value)}`
}

export interface ApuracaoItem {
  nome: string // modulo/sistema aferido
  valor?: number // valor MENSAL, usado quando modo_valor === 'por_modulo'
  valor_total?: number // valor total (anual) do modulo no contrato; auto = mensal x meses, editavel
  quantidade_contrato?: number // quantidade prevista em contrato (total no periodo, ex.: meses)
  // --- Controle de consumo por modulo (em QUANTIDADE; cada emissao consome 1 mes do modulo) ---
  quantidade_consumida_inicial?: number // semente manual na 1a config; pode ser fracionada
  quantidade_consumida_auto?: number // gerada automaticamente pelas apuracoes (dinamica; nao persistida)
}

// Item da prestacao de servicos (usado quando modo_valor === 'por_item')
export interface ApuracaoItemServico {
  descricao: string
  quantidade: number // quantidade mensal
  unidade: string
  valor_unitario?: number // valor unitario; quando ausente, deriva de valor/quantidade
  valor: number // valor MENSAL do item (= quantidade x valor_unitario)
  valor_total?: number // valor total (anual) do item no contrato; auto = mensal x meses, editavel
  // --- Controle de consumo por item (em QUANTIDADE; funciona p/ unidades por mes ou por item) ---
  quantidade_contrato?: number // quantidade prevista em contrato (ou na renovacao do aditivo)
  quantidade_consumida_inicial?: number // semente manual na 1a config; pode ser fracionada (0,5 / 1,7)
  quantidade_consumida_auto?: number // gerada automaticamente pelas apuracoes (dinamica; Fase 2)
  // --- Distribuicao mensal variavel (rateio "aleatorio" plausivel) ------------------------
  // Quando ligado, a quantidade emitida NAO e fixa: varia por ordem de emissao seguindo
  // `distribuicao_mensal` (N inteiros que somam `quantidade_contrato`). Ex.: horas tecnicas
  // acordadas por total de contrato, distribuidas mes a mes sem fracionar e sem picos absurdos.
  distribuir_mensal?: boolean
  distribuicao_mensal?: number[] // N inteiros (N = meses do contrato); indice = ordem de emissao (0-based)
  distribuicao_variacao_pct?: number // variacao usada na geracao (0..1; ex.: 0.3 = +-30%)
}

export type ApuracaoModoValor = "global" | "por_modulo" | "por_item"

// Valor unitario efetivo de um item de servico. Compatibilidade: itens antigos nao tem
// `valor_unitario`, entao derivamos de valor/quantidade.
export function valorUnitarioItemServico(item: Pick<ApuracaoItemServico, "valor" | "valor_unitario" | "quantidade">): number {
  if (item.valor_unitario != null && !Number.isNaN(Number(item.valor_unitario))) {
    return Number(item.valor_unitario) || 0
  }
  const qtd = Number(item.quantidade) || 0
  const valor = Number(item.valor) || 0
  return qtd > 0 ? valor / qtd : valor
}

// Valor MENSAL de um item de servico aplicando o fator matematico (quantidade x valor unitario).
// O valor unitario e a FONTE DA VERDADE: o mensal e sempre unitario x quantidade.
// Para itens legados (sem valor_unitario) mantemos o valor cru na leitura, evitando zerar dados.
export function valorMensalItemServico(item: Pick<ApuracaoItemServico, "valor" | "valor_unitario" | "quantidade">): number {
  const qtd = Number(item.quantidade) || 0
  if (item.valor_unitario != null && !Number.isNaN(Number(item.valor_unitario))) {
    return (Number(item.valor_unitario) || 0) * qtd
  }
  return Number(item.valor) || 0
}

// Normaliza um item de servico garantindo que `valor_unitario` exista (fonte da verdade).
// Itens legados foram salvos apenas com `valor` (mensal); aqui derivamos o unitario UMA vez
// (valor / quantidade) para que, dai em diante, alterar a quantidade recalcule o mensal
// e nao o unitario. O `valor` (mensal) e reescrito como unitario x quantidade.
export function normalizarItemServico(item: ApuracaoItemServico): ApuracaoItemServico {
  const qtd = Number(item.quantidade) || 0
  let unit = Number(item.valor_unitario)
  if (item.valor_unitario == null || Number.isNaN(unit)) {
    const valor = Number(item.valor) || 0
    unit = qtd > 0 ? valor / qtd : valor
  }
  return { ...item, valor_unitario: unit, valor: unit * qtd }
}

export function normalizarItensServico(itens?: ApuracaoItemServico[] | null): ApuracaoItemServico[] {
  if (!Array.isArray(itens)) return []
  return itens.map(normalizarItemServico)
}

// Valor total (anual) a partir do mensal e do numero de meses do contrato.
// (Mantido para o "Valor global do contrato" = soma dos mensais x meses.)
export function valorTotalAnual(mensal?: number | null, meses?: number | null): number {
  const m = Number(mensal) || 0
  const n = Number(meses) || 0
  return m * n
}

// Valor TOTAL (anual/de contrato) de UM item = valor unitario x quantidade PREVISTA em contrato.
// Regra do negocio: o total do item deriva da quantidade contratada, nao dos meses.
// Precedencia: override manual (valor_total) > unitario x quantidade_contrato > 0 (sem contrato).
export function valorTotalAnualItem(
  item: Pick<ApuracaoItemServico, "valor" | "valor_unitario" | "quantidade" | "quantidade_contrato" | "valor_total">,
): number {
  if (item.valor_total != null && !Number.isNaN(Number(item.valor_total))) {
    return Number(item.valor_total) || 0
  }
  if (item.quantidade_contrato == null) return 0
  return valorUnitarioItemServico(item) * (Number(item.quantidade_contrato) || 0)
}

// Saldo restante do contrato: total - (consumido inicial + emitido acumulado pelo sistema).
export function saldoContrato(total?: number | null, consumidoInicial?: number | null, emitidoAcumulado?: number | null): number {
  return (Number(total) || 0) - (Number(consumidoInicial) || 0) - (Number(emitidoAcumulado) || 0)
}

// Quantidade total ja consumida de um item (semente manual + gerado pelas apuracoes).
export function quantidadeConsumidaItem(item: Pick<ApuracaoItemServico, "quantidade_consumida_inicial" | "quantidade_consumida_auto">): number {
  return (Number(item.quantidade_consumida_inicial) || 0) + (Number(item.quantidade_consumida_auto) || 0)
}

// Valor (R$) ja consumido de UM item = quantidade consumida x valor unitario.
export function valorConsumidoItem(
  item: Pick<ApuracaoItemServico, "valor" | "valor_unitario" | "quantidade" | "quantidade_consumida_inicial" | "quantidade_consumida_auto">,
): number {
  return quantidadeConsumidaItem(item) * valorUnitarioItemServico(item)
}

// Quantidade ainda disponivel de um item = prevista em contrato - ja consumida.
// Retorna null quando nao ha quantidade de contrato definida (sem controle p/ o item).
export function quantidadeDisponivelItem(
  item: Pick<ApuracaoItemServico, "quantidade_contrato" | "quantidade_consumida_inicial" | "quantidade_consumida_auto">,
): number | null {
  if (item.quantidade_contrato == null) return null
  return (Number(item.quantidade_contrato) || 0) - quantidadeConsumidaItem(item)
}

// Valor total ja consumido do contrato = soma de (quantidade consumida x valor unitario) de cada item.
// Unidade-agnostico: itens por mes e por item (ex.: horas tecnicas) somam corretamente em R$.
export function valorConsumidoItens(itens?: ApuracaoItemServico[] | null): number {
  if (!Array.isArray(itens)) return 0
  return itens.reduce((s, i) => s + quantidadeConsumidaItem(i) * valorUnitarioItemServico(i), 0)
}

// Limiar padrao para o alerta de contrato (80% do valor total consumido).
export const LIMIAR_ALERTA_CONTRATO = 0.8

export interface ResumoConsumoContrato {
  controlado: boolean // o contrato tem controle de consumo (ha itens com quantidade_contrato)
  total: number // valor total do contrato (R$)
  consumido: number // valor ja consumido (R$)
  percentual: number // consumido / total (0..1+)
  emAlerta: boolean // atingiu ou passou do limiar
  esgotado: boolean // consumiu 100% ou mais
}

// Avalia consumo a partir de valores JA calculados (total e consumido em R$).
// Base comum dos tres modos de valor: por_item deriva de itens; modulo/global usam o
// somatorio dos valores emitidos. `controlado` indica se ha contrato a acompanhar.
export function avaliarConsumo(
  total: number,
  consumido: number,
  opts?: { controlado?: boolean; limiar?: number },
): ResumoConsumoContrato {
  const limiar = opts?.limiar ?? LIMIAR_ALERTA_CONTRATO
  const controlado = opts?.controlado ?? true
  const t = Number(total) || 0
  const c = Number(consumido) || 0
  const percentual = t > 0 ? c / t : 0
  return {
    controlado,
    total: t,
    consumido: c,
    percentual,
    emAlerta: controlado && t > 0 && percentual >= limiar,
    esgotado: controlado && t > 0 && percentual >= 1,
  }
}

// Resumo financeiro do consumo de um contrato a partir dos itens de servico (modo por_item).
// - `valorTotalContrato`: override manual do total; se ausente, usa Sum(unitario x qtd contrato).
// - `consumoAdicional`: valor extra a somar ao consumido (ex.: projecao da emissao atual em R$).
export function resumoConsumoContrato(
  itens?: ApuracaoItemServico[] | null,
  opts?: { valorTotalContrato?: number | null; consumoAdicional?: number; limiar?: number },
): ResumoConsumoContrato {
  const arr = Array.isArray(itens) ? itens : []
  const controlado = arr.some((i) => i.quantidade_contrato != null)
  const totalOverride = Number(opts?.valorTotalContrato)
  const total = opts?.valorTotalContrato != null && !Number.isNaN(totalOverride) && totalOverride > 0
    ? totalOverride
    : totalAnualItensServico(arr)
  const consumido = valorConsumidoItens(arr) + (Number(opts?.consumoAdicional) || 0)
  return avaliarConsumo(total, consumido, { controlado, limiar: opts?.limiar })
}

// Formata o percentual de consumo (ex.: 0.8342 -> "83,4%").
export function formatPercentual(v: number): string {
  return `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

// --- Consumo AUTOMATICO (derivado das apuracoes emitidas) --------------------------------
// O consumo automatico NUNCA e armazenado como contador: e recalculado a partir dos
// relatorios emitidos. Assim, excluir/adicionar/editar uma apuracao ajusta o valor sozinho.

// Chave de casamento entre um item do modelo e os itens dos relatorios (descricao normalizada).
export function chaveItemServico(descricao?: string | null): string {
  return String(descricao || "").trim().toLowerCase()
}

// Soma, por item (descricao), a quantidade consumida em todos os relatorios EMITIDOS.
// Aceita objetos parciais de relatorio ({ status, itens_servico }).
export function calcularConsumoAuto(
  relatorios?: { status?: string; itens_servico?: ApuracaoItemServico[] | string | null }[] | null,
): Record<string, number> {
  const acc: Record<string, number> = {}
  if (!Array.isArray(relatorios)) return acc
  for (const r of relatorios) {
    if (r?.status && r.status !== "emitido") continue
    let itens: ApuracaoItemServico[] = []
    try {
      itens = typeof r?.itens_servico === "string" ? JSON.parse(r.itens_servico) : r?.itens_servico || []
    } catch {
      itens = []
    }
    for (const it of itens) {
      const key = chaveItemServico(it?.descricao)
      if (!key) continue
      acc[key] = (acc[key] || 0) + (Number(it?.quantidade) || 0)
    }
  }
  return acc
}

// Injeta o `quantidade_consumida_auto` em cada item do modelo a partir do mapa calculado.
export function aplicarConsumoAuto(
  itens?: ApuracaoItemServico[] | null,
  mapa?: Record<string, number> | null,
): ApuracaoItemServico[] {
  if (!Array.isArray(itens)) return []
  const m = mapa || {}
  return itens.map((i) => ({ ...i, quantidade_consumida_auto: m[chaveItemServico(i.descricao)] || 0 }))
}

// Remove o consumo automatico de itens antes de persistir o MODELO (valor sempre derivado).
// Preserva os campos de distribuicao mensal (distribuir_mensal / distribuicao_mensal / pct).
export function limparConsumoAuto(itens?: ApuracaoItemServico[] | null): ApuracaoItemServico[] {
  if (!Array.isArray(itens)) return []
  return itens.map(({ quantidade_consumida_auto, ...resto }) => resto)
}

// --- Distribuicao mensal variavel (rateio "aleatorio" plausivel) --------------------------
// Distribui um TOTAL inteiro ao longo de N meses de forma variavel mas plausivel: cada mes
// recebe um inteiro dentro de uma banda +-p em torno da media, e o residuo e reconciliado
// para a soma fechar EXATAMENTE o total. Unidade-agnostico (horas, itens, etc.).

const DISTRIBUICAO_VARIACAO_PADRAO = 0.3

// PRNG deterministico (mulberry32) — mesma seed => mesma distribuicao (regeneracao estavel).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Soma de uma distribuicao (ignora valores nao numericos).
export function somaDistribuicao(arr?: number[] | null): number {
  if (!Array.isArray(arr)) return 0
  return arr.reduce((s, x) => s + (Number(x) || 0), 0)
}

// Valida se a distribuicao fecha o total (todos inteiros >= 0 e soma == total).
export function distribuicaoValida(arr: number[] | null | undefined, total: number): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false
  if (!arr.every((x) => Number.isInteger(x) && x >= 0)) return false
  return somaDistribuicao(arr) === (Math.round(Number(total)) || 0)
}

// Gera N inteiros >= 0 que somam `total`, cada um dentro de +-p da media (quando possivel).
// `seed` torna a geracao reproduzivel; sem seed usa um valor derivado do relogio.
export function gerarDistribuicaoMensal(
  total: number,
  meses: number,
  variacaoPct = DISTRIBUICAO_VARIACAO_PADRAO,
  seed?: number,
): number[] {
  const n = Math.max(0, Math.floor(Number(meses) || 0))
  const alvo = Math.max(0, Math.round(Number(total) || 0))
  if (n === 0) return []
  if (n === 1) return [alvo]

  const p = Math.min(Math.max(Number(variacaoPct) || 0, 0), 0.95)
  const media = alvo / n
  let lower = Math.max(0, Math.floor(media * (1 - p)))
  let upper = Math.ceil(media * (1 + p))
  if (upper < lower) upper = lower

  const rng = mulberry32(seed ?? (Date.now() % 2147483647) + 1)

  const arr: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const peso = 1 + (rng() * 2 - 1) * p // 1 +- p
    let v = Math.round(media * peso)
    if (v < lower) v = lower
    if (v > upper) v = upper
    if (v < 0) v = 0
    arr[i] = v
  }

  // Reconcilia o residuo (+/-1 por vez) respeitando a banda; relaxa a banda se travar,
  // garantindo o fechamento exato do total sem loop infinito.
  let diff = alvo - somaDistribuicao(arr)
  let guarda = 0
  while (diff !== 0 && guarda < 1_000_000) {
    let progrediu = false
    for (let k = 0; k < n && diff !== 0; k++) {
      const i = Math.floor(rng() * n)
      if (diff > 0) {
        if (arr[i] < upper) {
          arr[i]++
          diff--
          progrediu = true
        }
      } else if (arr[i] > lower && arr[i] > 0) {
        arr[i]--
        diff++
        progrediu = true
      }
    }
    if (!progrediu) {
      if (diff > 0) upper = Number.POSITIVE_INFINITY
      else lower = 0
    }
    guarda++
  }

  return arr
}

// Redistribui o residuo (total - soma atual) mantendo os valores editados manualmente o mais
// possivel: aplica +/-1 nos meses variando de forma equilibrada ate fechar o total.
export function reconciliarDistribuicao(arr: number[], total: number, seed?: number): number[] {
  const n = Array.isArray(arr) ? arr.length : 0
  if (n === 0) return []
  const alvo = Math.max(0, Math.round(Number(total) || 0))
  const out = arr.map((x) => Math.max(0, Math.round(Number(x) || 0)))
  const rng = mulberry32(seed ?? (Date.now() % 2147483647) + 1)
  let diff = alvo - somaDistribuicao(out)
  let guarda = 0
  while (diff !== 0 && guarda < 1_000_000) {
    const i = Math.floor(rng() * n)
    if (diff > 0) {
      out[i]++
      diff--
    } else if (out[i] > 0) {
      out[i]--
      diff++
    }
    guarda++
  }
  return out
}

// Quantidade a emitir de um item na N-esima emissao (0-based). Itens sem distribuicao usam a
// quantidade fixa; com distribuicao, usam o valor do mes correspondente (0 alem do contrato).
export function quantidadeDaEmissao(
  item: Pick<ApuracaoItemServico, "quantidade" | "distribuir_mensal" | "distribuicao_mensal">,
  indice: number,
): number {
  if (!item?.distribuir_mensal || !Array.isArray(item.distribuicao_mensal)) {
    return Number(item?.quantidade) || 0
  }
  const i = Math.floor(Number(indice) || 0)
  if (i < 0 || i >= item.distribuicao_mensal.length) return 0
  return Number(item.distribuicao_mensal[i]) || 0
}

// Aplica a distribuicao a um snapshot de itens para uma emissao especifica (fonte da verdade
// no servidor): sobrescreve `quantidade` pelo valor do mes e recalcula `valor` mensal.
export function aplicarDistribuicaoEmissao(
  itens: ApuracaoItemServico[] | null | undefined,
  indice: number,
): ApuracaoItemServico[] {
  if (!Array.isArray(itens)) return []
  return itens.map((i) => {
    if (!i?.distribuir_mensal || !Array.isArray(i.distribuicao_mensal)) return i
    const qtd = quantidadeDaEmissao(i, indice)
    const unit = valorUnitarioItemServico(i)
    return { ...i, quantidade: qtd, valor: unit * qtd }
  })
}

// Sugestao de fracao para a emissao de um item quando o saldo disponivel e menor que a
// quantidade mensal cheia (ex.: contrato acaba no meio do mes). Retorna a quantidade que
// ainda cabe (pode ser fracionada) e se ha necessidade de fracionar.
export function sugestaoFracaoItem(
  item: Pick<
    ApuracaoItemServico,
    "quantidade" | "quantidade_contrato" | "quantidade_consumida_inicial" | "quantidade_consumida_auto"
  >,
): { controlado: boolean; disponivel: number; mensalCheio: number; deveFracionar: boolean; quantidadeSugerida: number; esgotado: boolean } {
  const mensalCheio = Number(item.quantidade) || 0
  const disp = quantidadeDisponivelItem(item)
  if (disp == null) {
    return { controlado: false, disponivel: 0, mensalCheio, deveFracionar: false, quantidadeSugerida: mensalCheio, esgotado: false }
  }
  const disponivel = disp
  const esgotado = disponivel <= 0
  // So sugere fracionar quando ainda ha saldo, mas menor que um mes cheio.
  const deveFracionar = !esgotado && mensalCheio > 0 && disponivel < mensalCheio
  const quantidadeSugerida = esgotado ? 0 : Math.min(mensalCheio || disponivel, disponivel)
  return { controlado: true, disponivel, mensalCheio, deveFracionar, quantidadeSugerida, esgotado }
}

// Soma o valor MENSAL de uma lista de itens de servico (aplica o fator quantidade x unitario)
export function totalItensServico(itens?: ApuracaoItemServico[] | null): number {
  if (!Array.isArray(itens)) return 0
  return itens.reduce((s, i) => s + valorMensalItemServico(i), 0)
}

// Soma o valor TOTAL (de contrato) de uma lista de itens = Sum(unitario x quantidade_contrato).
export function totalAnualItensServico(itens?: ApuracaoItemServico[] | null): number {
  if (!Array.isArray(itens)) return 0
  return itens.reduce((s, i) => s + valorTotalAnualItem(i), 0)
}

// --- Consumo por MODULO (modo 'por_modulo') -----------------------------------------------
// Um modulo funciona como um item cujo "valor unitario" e o valor MENSAL e a quantidade
// mensal e 1 (cada emissao consome 1 mes do modulo). A quantidade de contrato e, tipicamente,
// o numero de meses previstos. Espelha a mecanica dos itens de servico, mas em unidades de mes.

// Quantidade total ja consumida de um modulo (semente manual + gerado pelas apuracoes).
// Com `excluirManual`, ignora a semente manual (usado quando ha reinicio: o consumo
// pre-sistema vira historico e nao entra no consumo ATIVO).
export function quantidadeConsumidaModulo(
  item: Pick<ApuracaoItem, "quantidade_consumida_inicial" | "quantidade_consumida_auto">,
  excluirManual = false,
): number {
  const manual = excluirManual ? 0 : Number(item.quantidade_consumida_inicial) || 0
  return manual + (Number(item.quantidade_consumida_auto) || 0)
}

// Quantidade ainda disponivel de um modulo = prevista em contrato - ja consumida.
// Retorna null quando nao ha quantidade de contrato definida (sem controle p/ o modulo).
export function quantidadeDisponivelModulo(
  item: Pick<ApuracaoItem, "quantidade_contrato" | "quantidade_consumida_inicial" | "quantidade_consumida_auto">,
  excluirManual = false,
): number | null {
  if (item.quantidade_contrato == null) return null
  return (Number(item.quantidade_contrato) || 0) - quantidadeConsumidaModulo(item, excluirManual)
}

// Valor (R$) ja consumido de UM modulo = quantidade consumida (meses) x valor mensal.
export function valorConsumidoModulo(
  item: Pick<ApuracaoItem, "valor" | "quantidade_consumida_inicial" | "quantidade_consumida_auto">,
  excluirManual = false,
): number {
  return quantidadeConsumidaModulo(item, excluirManual) * (Number(item.valor) || 0)
}

// Valor total ja consumido do contrato (modo por_modulo) = soma de (meses consumidos x valor mensal).
export function valorConsumidoModulos(itens?: ApuracaoItem[] | null, excluirManual = false): number {
  if (!Array.isArray(itens)) return 0
  return itens.reduce((s, i) => s + valorConsumidoModulo(i, excluirManual), 0)
}

// Chave de casamento entre um modulo do modelo e os modulos dos relatorios (nome normalizado).
export function chaveModulo(nome?: string | null): string {
  return String(nome || "").trim().toLowerCase()
}

// Soma, por modulo (nome), quantos relatorios EMITIDOS incluiram aquele modulo.
// Cada emissao equivale a 1 mes consumido do modulo. Aceita objetos parciais ({ status, itens }).
export function calcularConsumoAutoModulos(
  relatorios?: { status?: string; itens?: ApuracaoItem[] | string | null }[] | null,
): Record<string, number> {
  const acc: Record<string, number> = {}
  if (!Array.isArray(relatorios)) return acc
  for (const r of relatorios) {
    if (r?.status && r.status !== "emitido") continue
    let itens: ApuracaoItem[] = []
    try {
      itens = typeof r?.itens === "string" ? JSON.parse(r.itens) : r?.itens || []
    } catch {
      itens = []
    }
    for (const it of itens) {
      const key = chaveModulo(it?.nome)
      if (!key) continue
      acc[key] = (acc[key] || 0) + 1
    }
  }
  return acc
}

// Injeta o `quantidade_consumida_auto` em cada modulo do modelo a partir do mapa calculado.
export function aplicarConsumoAutoModulos(
  itens?: ApuracaoItem[] | null,
  mapa?: Record<string, number> | null,
): ApuracaoItem[] {
  if (!Array.isArray(itens)) return []
  const m = mapa || {}
  return itens.map((i) => ({ ...i, quantidade_consumida_auto: m[chaveModulo(i.nome)] || 0 }))
}

// Remove o consumo automatico dos modulos antes de persistir o MODELO (valor sempre derivado).
export function limparConsumoAutoModulos(itens?: ApuracaoItem[] | null): ApuracaoItem[] {
  if (!Array.isArray(itens)) return []
  return itens.map(({ quantidade_consumida_auto, ...resto }) => resto)
}

// --- Reinicio da contagem por competencia (aditivos que prorrogam o prazo) ----------------
// Valida se uma string e uma competencia no formato YYYY-MM.
export function isCompetenciaValida(v?: string | null): boolean {
  return typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)
}

// Separa relatorios em "ativos" e "anteriores" ao reinicio. Dois criterios de corte:
//  1. reinicioEm (TIMESTAMP) — usado pelo botao "Reiniciar agora". Corte no INSTANTE exato:
//     created_at >= reinicioEm -> ativo. Distingue emissoes novas de antigas no MESMO mes.
//  2. reinicioCompetencia (YYYY-MM) — usado para aditivos. Corte por MES: competencia < corte
//     -> anterior. Comparacao lexicografica equivale a cronologica.
// O timestamp tem prioridade sobre a competencia. Sem corte valido, tudo e ativo.
export function particionarRelatorios<
  T extends { competencia?: string | null; created_at?: string | Date | null },
>(
  relatorios: T[],
  opts: { reinicioEm?: string | Date | null; reinicioCompetencia?: string | null },
): { ativos: T[]; anteriores: T[] } {
  const arr = Array.isArray(relatorios) ? relatorios : []
  const ativos: T[] = []
  const anteriores: T[] = []

  // Criterio 1: corte por instante (Reiniciar agora).
  const corteMs = opts.reinicioEm ? new Date(opts.reinicioEm).getTime() : NaN
  if (!Number.isNaN(corteMs)) {
    for (const r of arr) {
      const ts = r?.created_at ? new Date(r.created_at).getTime() : NaN
      // Sem timestamp valido, mantem como ativo (nao descarta emissao por falta de metadado).
      if (!Number.isNaN(ts) && ts < corteMs) anteriores.push(r)
      else ativos.push(r)
    }
    return { ativos, anteriores }
  }

  // Criterio 2: corte por competencia (aditivo).
  if (!isCompetenciaValida(opts.reinicioCompetencia)) return { ativos: arr, anteriores: [] }
  const corte = opts.reinicioCompetencia as string
  for (const r of arr) {
    const comp = r?.competencia
    if (typeof comp === "string" && comp < corte) anteriores.push(r)
    else ativos.push(r)
  }
  return { ativos, anteriores }
}

export interface ApuracaoImagem {
  url: string
  legenda?: string
}

export interface ApuracaoAnexoPdf {
  url: string
  nome: string
  visita_id?: number
}

export interface ApuracaoModelo {
  id: number
  cliente_id: number
  cliente_ids: number[]
  municipio: string | null
  contrato_id: number | null
  nome: string
  sigla_orgao: string | null
  numero_contrato_texto: string | null
  destinatario_nome: string | null
  destinatario_cargo: string | null
  itens: ApuracaoItem[]
  itens_servico: ApuracaoItemServico[]
  modo_valor: ApuracaoModoValor
  valor_global: number | null // valor MENSAL global (modo 'global')
  // Controle de contrato
  meses_contrato: number // nº de meses do contrato (base do valor total anual)
  valor_total_contrato: number | null // total do contrato (auto = mensal x meses, editavel)
  controle_consumo: boolean // liga/desliga o acompanhamento de consumo
  valor_consumido_inicial: number | null // semente: valor ja consumido antes do sistema
  meses_consumidos_inicial: number | null // semente: meses ja consumidos antes do sistema
  // Competencia (YYYY-MM) do reinicio da contagem automatica (ex.: aditivo que prorroga o
  // prazo). Apuracoes ANTERIORES a este mes viram historico e nao contam no consumo ativo.
  reinicio_competencia: string | null
  // Instante exato do reinicio (botao "Reiniciar agora"). Tem prioridade sobre a competencia:
  // apuracoes criadas ANTES deste instante viram historico. Permite reiniciar no meio do mes.
  reinicio_em: string | null
  texto_padrao: string | null
  observacoes_padrao: string | null
  modalidade_remoto: boolean
  modalidade_presencial: boolean
  ultimo_numero: number
  ativo: boolean
  emissao_automatica: boolean
  // Σ dos valores emitidos (relatorios com status 'emitido'). Preenchido pelo GET;
  // e a base de consumo dos modos 'global' e 'por_modulo'. Dinamico (nao persistido).
  consumido_emitido?: number
  // Nº de relatorios emitidos ATIVOS (a partir do reinicio, se houver). Base da quantidade
  // consumida no modo 'global' (cada emissao = 1 mes). Dinamico (nao persistido).
  emitidos_count?: number
  // --- Historico anterior ao reinicio (dinamico; so quando ha reinicio_competencia) --------
  // Consumo acumulado ANTES do corte, para exibir lado a lado com o periodo ativo.
  historico?: {
    consumido_emitido: number // Σ dos valores emitidos antes do corte (R$)
    emitidos_count: number // nº de apuracoes antes do corte
    // Mapa por chave normalizada -> meses consumidos antes do corte (item de servico / modulo)
    consumo_itens: Record<string, number>
    consumo_modulos: Record<string, number>
  }
  cliente_nome?: string
  cliente_cidade?: string
  cliente_estado?: string
  cliente_cnpj?: string
}

export interface ApuracaoRelatorio {
  id: number
  modelo_id: number | null
  cliente_id: number
  cliente_ids: number[]
  municipio: string | null
  numero: number
  numero_texto: string | null
  competencia: string // YYYY-MM
  exercicio: number
  data_emissao: string
  sigla_orgao: string | null
  numero_contrato_texto: string | null
  destinatario_nome: string | null
  destinatario_cargo: string | null
  itens: ApuracaoItem[]
  itens_servico: ApuracaoItemServico[]
  modo_valor: ApuracaoModoValor
  valor_global: number | null // valor MENSAL global (modo 'global')
  valor_total: number | null // total da competencia emitida (snapshot)
  // Controle de contrato (snapshot na emissao; usado nas fases 2-3)
  meses_contrato?: number
  valor_total_contrato?: number | null
  controle_consumo?: boolean
  valor_consumido_inicial?: number | null
  meses_consumidos_inicial?: number | null
  texto: string | null
  observacoes: string | null
  modalidade_remoto: boolean
  modalidade_presencial: boolean
  origem: "padrao" | "consolidado" | "automatica"
  visitas_ids: number[]
  imagens: ApuracaoImagem[]
  anexos_pdf: ApuracaoAnexoPdf[]
  status: "rascunho" | "emitido"
  cliente_nome?: string
  clientes?: { id: number; nome_fantasia?: string; razao_social?: string; cnpj?: string }[]
  clientes_nomes?: string[]
  modelo_nome?: string
}

// Modulos/Sistemas (mesma lista dos relatorios de visita)
export const MODULOS_SISTEMAS = [
  "Contabilidade",
  "Controle Interno",
  "Assinatura Digital",
  "Recursos Humanos",
  "Portal do Servidor",
  "Patrimonio",
  "Almoxarifado",
  "Contratos e Convenios",
  "Plano de Contratacoes Anuais",
  "Licitacao e Pregao Gerencial",
  "Frota de Veiculos",
  "Protocolo",
  "Processos e Documentos Digitais",
  "Gerenciador Eletronico de Documentos",
  "Business Intelligence",
  "Tributos",
  "Nota Fiscal Eletronica",
  "Rimob",
  "PagTributos",
  "Portal da Transparencia",
  "ERP",
]

export const MESES_PT = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

// "2026-07" -> "Julho/2026"
export function competenciaLabel(comp?: string | null): string {
  if (!comp) return "-"
  const [ano, mes] = comp.split("-").map(Number)
  if (!ano || !mes) return comp
  return `${MESES_PT[mes - 1]}/${ano}`
}

export function formatBRL(v?: number | null): string {
  const n = Number(v || 0)
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// "2026-07" da competencia anterior a uma data (default: hoje).
// Ex.: no 1o dia util de Agosto/2026 -> "2026-07"
export function competenciaAnterior(ref: Date = new Date()): string {
  const ano = ref.getFullYear()
  const mes = ref.getMonth() // 0-11 (mes atual)
  // mes atual (0-index) equivale a "mes anterior" no calendario 1-index
  const d = new Date(ano, mes - 1, 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

// Verifica se a data e o primeiro dia util (seg-sex) do mes.
// Sabado/domingo do inicio do mes sao pulados; a checagem passa a valer
// no primeiro dia de semana do mes.
export function ehPrimeiroDiaUtil(ref: Date = new Date()): boolean {
  const dia = ref.getDate()
  const diaSemana = ref.getDay() // 0=domingo, 6=sabado
  if (diaSemana === 0 || diaSemana === 6) return false // fim de semana nunca conta
  // Descobre qual e o primeiro dia util do mes
  const primeiro = new Date(ref.getFullYear(), ref.getMonth(), 1)
  while (primeiro.getDay() === 0 || primeiro.getDay() === 6) {
    primeiro.setDate(primeiro.getDate() + 1)
  }
  return dia === primeiro.getDate()
}

// Texto padrao sugerido para um novo modelo/relatorio
export function textoPadraoSugerido(cliente: string, modulos: string[]): string {
  const lista = modulos.length ? modulos.join(", ") : "os modulos contratados"
  return (
    `Declaramos, para os devidos fins, que a RAROTEC prestou os servicos de suporte tecnico, ` +
    `manutencao e atualizacao dos sistemas de gestao publica ao ${cliente}, referentes a ${lista}, ` +
    `durante a competencia em referencia, conforme contrato vigente. Os atendimentos foram realizados ` +
    `de forma remota e/ou presencial, garantindo o pleno funcionamento das rotinas dos setores atendidos.`
  )
}
