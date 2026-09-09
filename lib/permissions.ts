// Sistema de permissões baseado em papéis do Sisgar.
// O perfil principal vem do RaroNexus; permissões complementares seguem a lógica local.

export type UserRole = "admin" | "diretor" | "gerente" | "coordenador" | "tecnico"

const DIRETORES = ["ronaldson", "rafaelle"]
const GERENTES = ["alan"]
const COORDENADORES = ["juan", "michaelly"]

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function getUserRole(userName: string, cargo?: string | null): UserRole {
  const cargoLower = normalize(cargo || "")

  if (cargoLower === "administrador" || cargoLower === "admin") return "admin"
  if (cargoLower.includes("diretor")) return "diretor"
  if (cargoLower.includes("gerente")) return "gerente"
  if (cargoLower.includes("coordenacao") || cargoLower.includes("coordenador")) return "coordenador"

  const nome = normalize(userName).trim()
  if (DIRETORES.some((item) => nome.includes(item))) return "diretor"
  if (GERENTES.some((item) => nome.includes(item))) return "gerente"
  if (COORDENADORES.some((item) => nome.includes(item))) return "coordenador"

  return "tecnico"
}

export function isGestor(userName: string, cargo?: string | null): boolean {
  const role = getUserRole(userName, cargo)
  return role === "admin" || role === "diretor" || role === "gerente" || role === "coordenador"
}

export function isDiretor(userName: string, cargo?: string | null): boolean {
  const role = getUserRole(userName, cargo)
  return role === "admin" || role === "diretor"
}

export function isAdmin(cargo?: string | null): boolean {
  const cargoLower = normalize(cargo || "")
  return cargoLower === "administrador" || cargoLower === "admin"
}

export function canApuracaoMensal(cargo?: string | null, apuracaoMensal?: boolean): boolean {
  return isAdmin(cargo) || !!apuracaoMensal
}

export const permissions = {
  cadastros: {
    clientes: {
      visualizar: () => true,
      gerenciar: () => true,
    },
    tecnicosClientes: {
      visualizar: () => true,
      gerenciar: () => true,
    },
    tecnicosRarotec: {
      visualizar: (userName: string) => isGestor(userName),
      gerenciar: (userName: string) => isGestor(userName),
    },
  },
  agenda: {
    visualizar: () => true,
    gerenciarTodos: (userName: string) => isGestor(userName),
    gerenciarPropria: () => true,
    solicitarAlteracao: () => true,
    aprovarSolicitacao: (userName: string) => isGestor(userName),
  },
  relatorios: {
    novoRelatorio: () => true,
    historico: {
      verTodos: (userName: string) => isGestor(userName),
      verProprios: () => true,
    },
    batimento: (userName: string) => isGestor(userName),
  },
  admin: {
    usuarios: (userName: string) => isGestor(userName),
    configuracoes: {
      verTudo: (userName: string) => isGestor(userName),
      alterarPropriaSenha: () => false,
    },
  },
}

export function hasPermission(
  userName: string,
  permission: (userName: string) => boolean
): boolean {
  return permission(userName)
}

export function getMenuItems(userName: string, cargo?: string | null, apuracaoMensal?: boolean) {
  const isUserGestor = isGestor(userName, cargo)
  const podeApuracao = canApuracaoMensal(cargo, apuracaoMensal)

  return {
    showClientes: true,
    showTecnicosClientes: true,
    showTecnicosRarotec: isUserGestor,
    showAgenda: true,
    showPlanejamento: isUserGestor,
    showNovoRelatorio: true,
    showHistorico: true,
    showBatimento: isUserGestor,
    showApuracao: podeApuracao,
    showApuracaoModelos: podeApuracao,
    showDocumentosMedicos: true,
    showBatimentoMedico: isUserGestor,
    showDocumentosInstitucionais: true,
    showAtas: true,
    showOuveRarotec: true,
    showUsuarios: isUserGestor,
    showConfiguracoes: true,
  }
}

export function canEditAgenda(userName: string, agendaTecnicoId: number, userTecnicoId: number, cargo?: string | null): boolean {
  if (isGestor(userName, cargo)) return true
  return agendaTecnicoId === userTecnicoId
}

export function canViewRelatorio(userName: string, relatorioTecnicoIds: number[], userTecnicoId: number, cargo?: string | null): boolean {
  if (isGestor(userName, cargo)) return true
  return relatorioTecnicoIds.includes(userTecnicoId)
}
