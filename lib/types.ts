export interface TecnicoRarotec {
  id: number
  nome: string
  cpf: string | null
  rg: string | null
  data_nascimento: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  telefone: string | null
  celular: string | null
  email: string | null
  nexus_email?: string | null
  cargo?: string | null
  cargos: string[]
  data_admissao: string | null
  setores: string[]
  foto_url: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface AgendaItem {
  id: number
  titulo: string
  descricao?: string | null
  tecnico_rarotec_id?: number | null
  cliente_id?: number | null
  data_inicio: string
  data_fim?: string | null
  tipo?: string
  status?: string
  local?: string | null
  created_at?: string
  updated_at?: string
}

export interface Cliente {
  id: number
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  inscricao_estadual: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  telefone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface TecnicoCliente {
  id: number
  cliente_id: number
  nome: string
  cpf: string | null
  cargo: string | null
  departamento: string | null
  telefone: string | null
  celular: string | null
  email: string | null
  foto_url: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  cliente?: Cliente
  cliente_nome?: string // Campo calculado retornado pela API
}

export interface Contrato {
  id: number
  cliente_id: number
  orgao_id: number | null
  numero_contrato: string
  tipo: string
  data_inicio: string
  data_fim: string | null
  valor_total: number | null
  descricao: string | null
  arquivo_url: string | null
  status: string
  created_at: string
  updated_at: string
  cliente?: Cliente
}

export interface AditivoContrato {
  id: number
  contrato_id: number
  numero_aditivo: string
  data_aditivo: string
  descricao: string | null
  valor_adicional: number | null
  arquivo_url: string | null
  created_at: string
}

export interface AgendaTrabalhista {
  id: number
  tecnico_rarotec_id: number | null
  cliente_id: number | null
  titulo: string
  descricao: string | null
  data_inicio: string
  data_fim: string | null
  tipo: string | null
  status: string
  local: string | null
  created_at: string
  updated_at: string
  tecnico?: TecnicoRarotec
  cliente?: Cliente
}

export interface RelatorioVisita {
  id: number
  tecnico_rarotec_id: number | null
  cliente_id: number | null
  tecnico_cliente_id: number | null
  data_visita: string
  hora_inicio: string | null
  hora_fim: string | null
  tipo_servico: string | null
  descricao_servico: string | null
  observacoes: string | null
  status: string
  assinatura_url: string | null
  created_at: string
  updated_at: string
  tecnico?: TecnicoRarotec
  cliente?: Cliente
  tecnico_cliente?: TecnicoCliente
  // Novos campos conforme PDF
  estado: string | null
  municipio: string | null
  orgao_atendido: string | null
  modulos: string[] | null
  tecnicos_rarotec_ids: number[] | null
  tema: string | null
  data_relatorio: string | null
  historico: string | null
  numero_autenticacao: string | null
  // Campos calculados retornados pela API
  tecnico_nome?: string
  tecnico_email?: string
  cliente_nome?: string
  cliente_email?: string | null
  cliente_ou_municipio?: string
  tecnico_cliente_nome?: string
  tecnico_cliente_email?: string
  tecnicos_rarotec_nomes?: Array<{ id: number; nome: string; email?: string }>
  tecnicos_rarotec?: Array<{ id: number; nome: string; email?: string }>
  representantes_cliente?: Array<{ nome: string; email?: string; cpf?: string }>
  entidades?: Array<{ nome?: string } | string>
  orgao?: string | null
  criado_por_nome?: string | null
  data_fim?: string | null
}

export interface PesquisaSatisfacao {
  id: number
  relatorio_visita_id: number
  cliente_id: number
  nota_atendimento: number | null
  nota_qualidade: number | null
  nota_tempo: number | null
  comentarios: string | null
  data_resposta: string
}

export interface ResponsabilidadeModulo {
  id: number
  cliente_id: number
  cliente_nome: string
  cliente_cidade: string | null
  cliente_estado: string | null
  vinculado_municipio: boolean
  modulo: string
  orgao_id: number | null
  orgao_nome: string | null
  orgao_tipo: string | null
  tecnico_rarotec_id: number
  tecnico_nome: string
  tecnico_email: string | null
  observacoes: string | null
  nao_aplicavel: boolean
  tipo_atribuicao: "principal" | "excecao"
  orgaos_herdados: number
  created_at: string
  updated_at: string
}

export interface ChecklistModeloItem {
  id: number
  titulo: string
  descricao: string | null
  modulo: string | null
  ordem: number
  obrigatorio: boolean
  exige_observacao_negativa: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}

export type ChecklistItemStatus =
  | "pendente"
  | "atendido"
  | "nao_atendido"
  | "nao_se_aplica"
  | "pendencia_externa"

export interface ChecklistExecucaoItem {
  id: number
  modelo_item_id: number | null
  titulo: string
  descricao: string | null
  modulo: string | null
  ordem: number
  obrigatorio: boolean
  exige_observacao_negativa: boolean
  status: ChecklistItemStatus
  observacao: string | null
  respondido_em: string | null
}

export interface ChecklistExecucao {
  id: number
  responsabilidade_id: number
  competencia: string
  tecnico_rarotec_id: number
  tecnico_nome: string
  cliente_id: number
  cliente_nome: string
  cliente_cidade: string | null
  cliente_estado: string | null
  modulo: string
  orgao_id: number | null
  orgao_nome: string | null
  tipo_atribuicao: "principal" | "excecao"
  status: "pendente" | "em_andamento" | "concluido"
  observacao_geral: string | null
  finalizado_at: string | null
  itens: ChecklistExecucaoItem[]
}
