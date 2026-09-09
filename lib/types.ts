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
  tecnico_cliente_nome?: string
  tecnico_cliente_email?: string
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
