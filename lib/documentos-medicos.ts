// Helper compartilhado para documentos medicos (atestado, consulta, licencas)
// Regra central de cobertura usada por alerta, tela de anexos e batimento.

export interface DocumentoMedico {
  id: number
  tecnico_rarotec_id: number
  tipo: string
  data_inicio: string // YYYY-MM-DD
  data_fim: string // YYYY-MM-DD
  descricao?: string | null
  blob_pathname?: string | null
  nome_arquivo?: string | null
  tipo_arquivo?: string | null
  tamanho?: number | null
  agenda_evento_id?: number | null
  created_by?: number | null
  created_at?: string
  tecnico_nome?: string | null
  status_validacao?: string | null // 'pendente' | 'validado' | 'recusado'
  validado_por?: number | null
  validado_por_nome?: string | null
  validado_em?: string | null
  motivo_validacao?: string | null
}

// Rotulos e cores dos status de validacao
export const STATUS_VALIDACAO: Record<string, { label: string; badge: string }> = {
  pendente: { label: "Aguardando validação", badge: "bg-amber-100 text-amber-700 border-amber-200" },
  aguardando_tecnico: {
    label: "Correção solicitada",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  validado: { label: "Validado", badge: "bg-green-100 text-green-700 border-green-200" },
  recusado: { label: "Recusado", badge: "bg-red-100 text-red-700 border-red-200" },
}

// Tipos de evento considerados "medicos" (nao exigem relatorio de visita)
export const TIPOS_MEDICOS = [
  "atestado",
  "consulta_medica",
  "licenca_medica",
  "licenca_maternidade",
] as const

export type TipoMedico = (typeof TIPOS_MEDICOS)[number]

// Rotulos amigaveis para exibicao
export const LABEL_TIPO_MEDICO: Record<string, string> = {
  atestado: "Atestado Médico",
  consulta_medica: "Consulta Médica",
  licenca_medica: "Licença Médica",
  licenca_maternidade: "Licença Maternidade",
}

// Normaliza um tipo (aceita variacoes com espaco/acentos/hifen)
export function normalizarTipo(tipo: string | null | undefined): string {
  if (!tipo) return ""
  return tipo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_")
    .trim()
}

// Verifica se um tipo de evento e medico
export function isTipoMedico(tipo: string | null | undefined): boolean {
  const t = normalizarTipo(tipo)
  if (!t) return false
  // cobre variacoes como "licenca_medica", "lic._maternidade" etc.
  if ((TIPOS_MEDICOS as readonly string[]).includes(t)) return true
  if (t.includes("atestado")) return true
  if (t.includes("consulta")) return true
  if (t.includes("licenca") && (t.includes("medica") || t.includes("maternidade") || t.includes("paternidade"))) return true
  return false
}

// Extrai a data (YYYY-MM-DD) de um valor de data/timestamp
export function toYMD(value: string | Date | null | undefined): string {
  if (!value) return ""
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
  }
  return String(value).split("T")[0]
}

// Um documento COM anexo cobre a data se o periodo [inicio,fim] a contem
// e o documento NAO foi recusado (recusado volta a ser pendencia do tecnico).
export function documentoCobreData(doc: DocumentoMedico, dataISO: string): boolean {
  if (!doc.blob_pathname) return false // sem anexo nao cobre (fica pendente)
  if (doc.status_validacao === "recusado") return false // recusado nao cobre
  const inicio = toYMD(doc.data_inicio)
  const fim = toYMD(doc.data_fim)
  const d = toYMD(dataISO)
  if (!inicio || !fim || !d) return false
  return d >= inicio && d <= fim
}

// Existe algum documento com anexo do mesmo tecnico cobrindo a data?
export function eventoCobertoPorDocumento(
  tecnicoId: number,
  dataISO: string,
  documentos: DocumentoMedico[],
): boolean {
  return documentos.some(
    (doc) => doc.tecnico_rarotec_id === tecnicoId && documentoCobreData(doc, dataISO),
  )
}
