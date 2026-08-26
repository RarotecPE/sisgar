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
  valor?: number // usado quando modo_valor === 'por_modulo'
}

// Item da prestacao de servicos (usado quando modo_valor === 'por_item')
export interface ApuracaoItemServico {
  descricao: string
  quantidade: number
  unidade: string
  valor: number // valor total do item na competencia
}

export type ApuracaoModoValor = "global" | "por_modulo" | "por_item"

// Soma o valor total de uma lista de itens de servico
export function totalItensServico(itens?: ApuracaoItemServico[] | null): number {
  if (!Array.isArray(itens)) return 0
  return itens.reduce((s, i) => s + (Number(i.valor) || 0), 0)
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
  valor_global: number | null
  texto_padrao: string | null
  observacoes_padrao: string | null
  modalidade_remoto: boolean
  modalidade_presencial: boolean
  ultimo_numero: number
  ativo: boolean
  emissao_automatica: boolean
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
  valor_global: number | null
  valor_total: number | null
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
