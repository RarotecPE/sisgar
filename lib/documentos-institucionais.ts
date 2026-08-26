// Modelo e helpers do modulo de Documentos Institucionais e Atas.

export interface DocumentoInstitucional {
  id: number
  categoria: string
  titulo: string
  descricao?: string | null
  blob_pathname?: string | null
  nome_arquivo?: string | null
  tipo_arquivo?: string | null
  tamanho?: number | null
  setor?: string | null
  usuario_alvo_id?: number | null
  usuario_alvo_nome?: string | null
  data_documento?: string | null
  created_by?: number | null
  created_by_nome?: string | null
  created_at?: string
  // preenchido apenas para gestores
  total_notas?: number
}

export interface NotaInstitucional {
  id: number
  documento_id: number
  autor_id?: number | null
  autor_nome?: string | null
  nota: string
  created_at?: string
}

// Categorias de documentos institucionais (nao-atas)
export const CATEGORIAS_DOC = ["organograma", "atribuicoes", "regulamento", "demais"] as const
// Categorias de atas
export const CATEGORIAS_ATA = ["ata_geral", "ata_setor", "ata_individual"] as const

export const LABEL_CATEGORIA: Record<string, string> = {
  organograma: "Organograma",
  atribuicoes: "Atribuições",
  regulamento: "Regulamento da Empresa",
  demais: "Demais Documentos Internos",
  ata_geral: "Atas Gerais",
  ata_setor: "Atas por Setor/Departamento",
  ata_individual: "Atas Individuais",
}

export const DESCRICAO_CATEGORIA: Record<string, string> = {
  organograma: "Estrutura organizacional da empresa",
  atribuicoes: "Definição de funções e responsabilidades",
  regulamento: "Normas e regras internas da empresa",
  demais: "Outros documentos internos",
  ata_geral: "Reuniões gerais visíveis a todos",
  ata_setor: "Reuniões de setor, visíveis aos participantes do setor",
  ata_individual: "Registros individuais, visíveis apenas ao próprio usuário",
}

export function isCategoriaAta(categoria: string): boolean {
  return (CATEGORIAS_ATA as readonly string[]).includes(categoria)
}

export function isCategoriaValida(categoria: string): boolean {
  return (
    (CATEGORIAS_DOC as readonly string[]).includes(categoria) ||
    (CATEGORIAS_ATA as readonly string[]).includes(categoria)
  )
}
