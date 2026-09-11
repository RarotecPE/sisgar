import { sql } from "@/lib/db"
import { mapRoleToCargo } from "@/lib/auth"

export type NexusAuthorizedUser = {
  id: string
  nome: string
  email: string
  avatar_url?: string | null
  cpf?: string | null
  telefone?: string | null
  role_nome?: string | null
  role_chave?: string | null
}

type NexusAuthorizedUsersPayload = {
  success?: boolean
  data?: NexusAuthorizedUser[]
  message?: string
}

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] || fallback
  if (!value) throw new Error(`${name} is required`)
  return value
}

let inFlightNexusFetch: Promise<NexusAuthorizedUser[]> | null = null

/**
 * Consulta a lista de usuários autorizados para o SISGAR no RaroNexus.
 * Inclui timeout de 6s e compartilhamento de chamada em andamento (deduplicação).
 */
export async function fetchAuthorizedNexusUsers(): Promise<NexusAuthorizedUser[]> {
  if (inFlightNexusFetch) return inFlightNexusFetch

  inFlightNexusFetch = (async () => {
    const nexusBaseUrl = getEnv("RARONEXUS_BASE_URL", "http://localhost:3001")
    const clientId = getEnv("RARONEXUS_CLIENT_ID", "sisgar")
    const clientSecret = getEnv("RARONEXUS_CLIENT_SECRET")

    const response = await fetch(new URL("/api/v1/applications/authorized-users", nexusBaseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    })

    const payload = (await response.json().catch(() => null)) as NexusAuthorizedUsersPayload | null
    if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
      throw new Error(payload?.message || "Não foi possível sincronizar usuários do RaroNexus.")
    }

    return payload.data
  })().finally(() => {
    inFlightNexusFetch = null
  })

  return inFlightNexusFetch
}

type UsuarioRow = {
  id: number
  nexus_user_id?: string | null
  nexus_email?: string | null
  email?: string | null
  nome?: string | null
  cargo?: string | null
  ativo?: boolean | null
}

type TecnicoRow = {
  id: number
  nome?: string | null
  email?: string | null
  nexus_email?: string | null
  cargo?: string | null
  cargos?: string[] | null
  foto_url?: string | null
  ativo?: boolean | null
}

let usuariosSyncPromise: Promise<void> | null = null

/**
 * Sincroniza a tabela local de usuários (`usuarios`) com os autorizados do RaroNexus.
 * Executa em O(1) queries eliminando o N+1 e atualizando apenas registros alterados.
 */
export async function syncAuthorizedNexusUsers(): Promise<void> {
  if (usuariosSyncPromise) return usuariosSyncPromise

  usuariosSyncPromise = (async () => {
    const nexusUsers = await fetchAuthorizedNexusUsers()

    const authorizedNexusIds = new Set<string>()
    const authorizedEmails = new Set<string>()

    // 1. Busca todos os usuários locais em uma única query
    const localUsers = await sql<UsuarioRow>`
      SELECT id, nexus_user_id, nexus_email, email, nome, cargo, ativo
      FROM usuarios
    `

    // Mapeamentos em memória O(1)
    const byNexusId = new Map<string, UsuarioRow>()
    const byNexusEmail = new Map<string, UsuarioRow>()
    const byEmail = new Map<string, UsuarioRow>()

    for (const u of localUsers) {
      if (u.nexus_user_id) byNexusId.set(String(u.nexus_user_id).trim().toLowerCase(), u)
      if (u.nexus_email) byNexusEmail.set(String(u.nexus_email).trim().toLowerCase(), u)
      if (u.email) byEmail.set(String(u.email).trim().toLowerCase(), u)
    }

    const operations: Promise<unknown>[] = []

    for (const nexusUser of nexusUsers) {
      const nexusUserId = nexusUser.id?.trim()
      const email = nexusUser.email?.trim().toLowerCase()
      const cargo = mapRoleToCargo({
        chave: nexusUser.role_chave || "",
        nome: nexusUser.role_nome || "",
      })

      if (!nexusUserId || !email || !cargo) continue

      authorizedNexusIds.add(nexusUserId)
      authorizedEmails.add(email)

      const nome = (nexusUser.nome || email).trim()

      const existing =
        byNexusId.get(nexusUserId.toLowerCase()) ||
        byNexusEmail.get(email) ||
        byEmail.get(email)

      if (existing) {
        // Atualiza apenas se houve alteração real
        const needsUpdate =
          existing.nexus_user_id !== nexusUserId ||
          (existing.nexus_email?.trim().toLowerCase() ?? "") !== email ||
          (existing.nome?.trim() ?? "") !== nome ||
          (existing.cargo?.trim() ?? "") !== cargo ||
          existing.ativo !== true

        if (needsUpdate) {
          operations.push(
            sql`
              UPDATE usuarios
              SET nexus_user_id = ${nexusUserId}::uuid,
                  nexus_email = ${email},
                  nome = ${nome},
                  cargo = ${cargo},
                  ativo = true,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ${existing.id}
            `
          )
        }
      } else {
        operations.push(
          sql`
            INSERT INTO usuarios (nexus_user_id, nexus_email, nome, email, cargo, ativo, apuracao_mensal)
            VALUES (${nexusUserId}::uuid, ${email}, ${nome}, ${email}, ${cargo}, true, false)
          `
        )
      }
    }

    // Inativa usuários locais que não estão mais autorizados no Nexus
    const toInactivateIds = localUsers
      .filter((localUser) => {
        const nexusUserId = localUser.nexus_user_id ? String(localUser.nexus_user_id).trim() : ""
        const nexusEmail = localUser.nexus_email ? String(localUser.nexus_email).trim().toLowerCase() : ""
        const email = localUser.email ? String(localUser.email).trim().toLowerCase() : ""
        const isAuthorized = nexusUserId
          ? authorizedNexusIds.has(nexusUserId)
          : Boolean((nexusEmail && authorizedEmails.has(nexusEmail)) || (!nexusEmail && email && authorizedEmails.has(email)))

        return !isAuthorized && (localUser.ativo !== false || localUser.cargo !== "Inativo")
      })
      .map((u) => u.id)

    if (toInactivateIds.length > 0) {
      operations.push(
        sql`
          UPDATE usuarios
          SET ativo = false,
              cargo = 'Inativo',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ANY(${toInactivateIds})
        `
      )
    }

    if (operations.length > 0) {
      await Promise.all(operations)
    }
  })().finally(() => {
    usuariosSyncPromise = null
  })

  return usuariosSyncPromise
}

let tecnicosSyncPromise: Promise<void> | null = null

/**
 * Sincroniza a tabela de técnicos da Rarotec (`tecnicos_rarotec`) com os autorizados do RaroNexus.
 * Executa em O(1) queries eliminando o N+1 e atualizando apenas registros alterados.
 */
export async function syncTecnicosRarotecWithNexus(): Promise<void> {
  if (tecnicosSyncPromise) return tecnicosSyncPromise

  tecnicosSyncPromise = (async () => {
    const nexusUsers = await fetchAuthorizedNexusUsers()

    const authorizedEmails = new Set<string>()

    // 1. Busca todos os técnicos locais em uma única query
    const localTecnicos = await sql<TecnicoRow>`
      SELECT id, nome, email, nexus_email, cargo, cargos, foto_url, ativo
      FROM tecnicos_rarotec
    `

    const byNexusEmail = new Map<string, TecnicoRow>()
    const byEmail = new Map<string, TecnicoRow>()
    const byNome = new Map<string, TecnicoRow>()

    for (const tec of localTecnicos) {
      if (tec.nexus_email) byNexusEmail.set(String(tec.nexus_email).trim().toLowerCase(), tec)
      if (tec.email) byEmail.set(String(tec.email).trim().toLowerCase(), tec)
      if (tec.nome) byNome.set(String(tec.nome).trim().toLowerCase(), tec)
    }

    const operations: Promise<unknown>[] = []

    for (const nexusUser of nexusUsers) {
      const email = nexusUser.email?.trim().toLowerCase()
      const nome = (nexusUser.nome || email).trim()
      const cargo = mapRoleToCargo({
        chave: nexusUser.role_chave || "",
        nome: nexusUser.role_nome || "",
      })

      if (!email || !cargo) continue

      authorizedEmails.add(email)

      // Localizar técnico existente em memória (ordem de prioridade: nexus_email -> email -> nome)
      const tec =
        byNexusEmail.get(email) ||
        byEmail.get(email) ||
        byNome.get(nome.toLowerCase())

      if (tec) {
        const fotoUrl = tec.foto_url || nexusUser.avatar_url || null
        const targetNome = nome || tec.nome
        const targetEmail = tec.email || email
        const targetNexusEmail =
          tec.nexus_email && tec.nexus_email.toLowerCase() === email
            ? tec.nexus_email
            : tec.email && tec.email.toLowerCase() === email && tec.nexus_email
            ? tec.nexus_email
            : tec.nexus_email || email

        const needsUpdate =
          tec.ativo !== true ||
          (nome && tec.nome !== targetNome) ||
          (!tec.email && targetEmail !== tec.email) ||
          (!tec.nexus_email && targetNexusEmail !== tec.nexus_email) ||
          (!tec.foto_url && nexusUser.avatar_url && tec.foto_url !== fotoUrl)

        if (needsUpdate) {
          operations.push(
            sql`
              UPDATE tecnicos_rarotec
              SET nome = COALESCE(NULLIF(${nome}, ''), nome),
                  email = COALESCE(email, ${email}),
                  nexus_email = CASE 
                    WHEN LOWER(COALESCE(nexus_email, '')) = ${email} THEN nexus_email
                    WHEN LOWER(COALESCE(email, '')) = ${email} THEN nexus_email
                    ELSE COALESCE(nexus_email, ${email})
                  END,
                  foto_url = COALESCE(${fotoUrl}, foto_url),
                  ativo = true,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ${tec.id}
            `
          )
        }
      } else {
        const fotoUrl = nexusUser.avatar_url || null
        operations.push(
          sql`
            INSERT INTO tecnicos_rarotec (
              nome, email, nexus_email, cargo, cargos, setores, departamentos, foto_url, ativo
            ) VALUES (
              ${nome},
              ${email},
              ${email},
              ${null},
              ${[]},
              ${[]},
              ${[]},
              ${fotoUrl},
              true
            )
          `
        )
      }
    }

    // Inativa técnicos locais que não constam na lista de autorizados do RaroNexus
    const toInactivateTecIds = localTecnicos
      .filter((localTec) => {
        const nexusEmail = localTec.nexus_email ? String(localTec.nexus_email).trim().toLowerCase() : ""
        const tecEmail = localTec.email ? String(localTec.email).trim().toLowerCase() : ""
        const isAuthorized = Boolean(
          (nexusEmail && authorizedEmails.has(nexusEmail)) ||
          (!nexusEmail && tecEmail && authorizedEmails.has(tecEmail))
        )
        return !isAuthorized && localTec.ativo !== false
      })
      .map((t) => t.id)

    if (toInactivateTecIds.length > 0) {
      operations.push(
        sql`
          UPDATE tecnicos_rarotec
          SET ativo = false,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ANY(${toInactivateTecIds})
        `
      )
    }

    if (operations.length > 0) {
      await Promise.all(operations)
    }
  })().finally(() => {
    tecnicosSyncPromise = null
  })

  return tecnicosSyncPromise
}

