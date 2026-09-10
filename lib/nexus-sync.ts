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

/**
 * Consulta a lista de usuários autorizados para o SISGAR no RaroNexus.
 */
export async function fetchAuthorizedNexusUsers(): Promise<NexusAuthorizedUser[]> {
  const nexusBaseUrl = getEnv("RARONEXUS_BASE_URL", "http://localhost:3001")
  const clientId = getEnv("RARONEXUS_CLIENT_ID", "sisgar")
  const clientSecret = getEnv("RARONEXUS_CLIENT_SECRET")

  const response = await fetch(new URL("/api/v1/applications/authorized-users", nexusBaseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => null)) as NexusAuthorizedUsersPayload | null
  if (!response.ok || !payload?.success || !Array.isArray(payload.data)) {
    throw new Error(payload?.message || "Não foi possível sincronizar usuários do RaroNexus.")
  }

  return payload.data
}

type UsuarioRow = {
  id: number
  nexus_user_id?: string | null
  nexus_email?: string | null
  email?: string | null
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

/**
 * Sincroniza a tabela local de usuários (`usuarios`) com os autorizados do RaroNexus.
 */
export async function syncAuthorizedNexusUsers(): Promise<void> {
  const nexusUsers = await fetchAuthorizedNexusUsers()

  const authorizedNexusIds = new Set<string>()
  const authorizedEmails = new Set<string>()

  for (const nexusUser of nexusUsers) {
    const nexusUserId = nexusUser.id
    const email = nexusUser.email?.trim().toLowerCase()
    const cargo = mapRoleToCargo({
      chave: nexusUser.role_chave || "",
      nome: nexusUser.role_nome || "",
    })

    if (!nexusUserId || !email || !cargo) continue

    authorizedNexusIds.add(nexusUserId)
    authorizedEmails.add(email)

    const nome = (nexusUser.nome || email).trim()
    const existing = await sql<UsuarioRow>`
      SELECT id
      FROM usuarios
      WHERE nexus_user_id = ${nexusUserId}::uuid OR LOWER(nexus_email) = ${email} OR LOWER(email) = ${email}
      ORDER BY CASE WHEN nexus_user_id = ${nexusUserId}::uuid THEN 0 ELSE 1 END
      LIMIT 1
    `

    if (existing.length > 0) {
      await sql`
        UPDATE usuarios
        SET nexus_user_id = ${nexusUserId}::uuid,
            nexus_email = ${email},
            nome = ${nome},
            cargo = ${cargo},
            ativo = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `
      continue
    }

    await sql`
      INSERT INTO usuarios (nexus_user_id, nexus_email, nome, email, cargo, ativo, apuracao_mensal)
      VALUES (${nexusUserId}::uuid, ${email}, ${nome}, ${email}, ${cargo}, true, false)
    `
  }

  const localUsers = await sql<UsuarioRow>`SELECT id, nexus_user_id, nexus_email, email FROM usuarios`
  for (const localUser of localUsers) {
    const nexusUserId = localUser.nexus_user_id ? String(localUser.nexus_user_id).trim() : ""
    const nexusEmail = localUser.nexus_email ? String(localUser.nexus_email).trim().toLowerCase() : ""
    const email = localUser.email ? String(localUser.email).trim().toLowerCase() : ""
    const isAuthorized = nexusUserId
      ? authorizedNexusIds.has(nexusUserId)
      : Boolean((nexusEmail && authorizedEmails.has(nexusEmail)) || (!nexusEmail && email && authorizedEmails.has(email)))

    if (isAuthorized) continue

    await sql`
      UPDATE usuarios
      SET ativo = false,
          cargo = 'Inativo',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${localUser.id}
    `
  }
}

/**
 * Sincroniza a tabela de técnicos da Rarotec (`tecnicos_rarotec`) com os autorizados do RaroNexus.
 */
export async function syncTecnicosRarotecWithNexus(): Promise<void> {
  const nexusUsers = await fetchAuthorizedNexusUsers()

  const authorizedEmails = new Set<string>()

  for (const nexusUser of nexusUsers) {
    const email = nexusUser.email?.trim().toLowerCase()
    const nome = (nexusUser.nome || email).trim()
    const cargo = mapRoleToCargo({
      chave: nexusUser.role_chave || "",
      nome: nexusUser.role_nome || "",
    })

    if (!email || !cargo) continue

    authorizedEmails.add(email)

    // Localizar técnico existente por nexus_email, e-mail ou nome
    const existing = await sql<TecnicoRow>`
      SELECT id, nome, email, nexus_email, cargo, cargos, foto_url, ativo
      FROM tecnicos_rarotec
      WHERE LOWER(nexus_email) = ${email} OR LOWER(email) = ${email} OR LOWER(nome) = ${nome.toLowerCase()}
      ORDER BY 
        CASE 
          WHEN LOWER(nexus_email) = ${email} THEN 0 
          WHEN LOWER(email) = ${email} THEN 1 
          ELSE 2 
        END
      LIMIT 1
    `

    if (existing.length > 0) {
      const tec = existing[0]
      const fotoUrl = tec.foto_url || nexusUser.avatar_url || null

      await sql`
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
    } else {
      const fotoUrl = nexusUser.avatar_url || null
      await sql`
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
    }
  }

  // Inativa técnicos locais que não constam na lista de autorizados do RaroNexus
  const localTecnicos = await sql<TecnicoRow>`
    SELECT id, email, nexus_email, nome
    FROM tecnicos_rarotec
  `

  for (const localTec of localTecnicos) {
    const nexusEmail = localTec.nexus_email ? String(localTec.nexus_email).trim().toLowerCase() : ""
    const tecEmail = localTec.email ? String(localTec.email).trim().toLowerCase() : ""
    const isAuthorized = Boolean(
      (nexusEmail && authorizedEmails.has(nexusEmail)) ||
      (!nexusEmail && tecEmail && authorizedEmails.has(tecEmail))
    )

    if (!isAuthorized) {
      await sql`
        UPDATE tecnicos_rarotec
        SET ativo = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${localTec.id}
      `
    }
  }
}

