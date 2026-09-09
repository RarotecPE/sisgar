import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, mapRoleToCargo } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"

type NexusAuthorizedUser = {
  id: string
  nome: string
  email: string
  avatar_url?: string | null
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

async function requireGestor() {
  const user = await getSession()
  if (!user) return { response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) }
  if (!isGestor(user.nome, user.cargo)) return { response: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) }
  return { user }
}

async function syncAuthorizedNexusUsers() {
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

  const authorizedNexusIds = new Set<string>()
  const authorizedEmails = new Set<string>()

  for (const nexusUser of payload.data) {
    const nexusUserId = nexusUser.id
    const email = nexusUser.email?.trim().toLowerCase()
    const cargo = mapRoleToCargo({
      chave: nexusUser.role_chave || "",
      nome: nexusUser.role_nome || "",
    })

    if (!nexusUserId || !email || !cargo) continue

    authorizedNexusIds.add(nexusUserId)
    authorizedEmails.add(email)

    const nome = nexusUser.nome || email
    const existing = await sql`
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


    const senhaHash = `raronexus:${crypto.randomUUID()}`
    await sql`
      INSERT INTO usuarios (nexus_user_id, nexus_email, nome, email, senha_hash, cargo, ativo, apuracao_mensal)
      VALUES (${nexusUserId}::uuid, ${email}, ${nome}, ${email}, ${senhaHash}, ${cargo}, true, false)
    `
  }

  const localUsers = await sql`SELECT id, nexus_user_id, nexus_email, email FROM usuarios`
  for (const localUser of localUsers) {
    const nexusUserId = String(localUser.nexus_user_id || "")
    const nexusEmail = String(localUser.nexus_email || "").trim().toLowerCase()
    const email = String(localUser.email || "").trim().toLowerCase()
    const isAuthorized = nexusUserId
      ? authorizedNexusIds.has(nexusUserId)
      : Boolean((nexusEmail && authorizedEmails.has(nexusEmail)) || (!nexusEmail && email && authorizedEmails.has(email)))

    if (isAuthorized) continue

    await sql`
      UPDATE usuarios
      SET ativo = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${localUser.id}
    `
  }
}

export async function GET() {
  try {
    const auth = await requireGestor()
    if ("response" in auth) return auth.response

    await syncAuthorizedNexusUsers().catch((error) => {
      console.warn("raronexus_users_sync_failed", error)
    })

    const usuarios = await sql`
      SELECT id, nexus_user_id, nexus_email, nome, email, cargo, ativo, apuracao_mensal, created_at, updated_at
      FROM usuarios
      ORDER BY nome
    `
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireGestor()
    if ("response" in auth) return auth.response

    const body = await request.json()
    const { nome, email, nexus_email, ativo, apuracao_mensal } = body
    if (!nome || !email) {
      return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 })
    }

    const nexusEmail = typeof nexus_email === "string" && nexus_email.trim() ? nexus_email.trim().toLowerCase() : null
    const existente = await sql`SELECT id FROM usuarios WHERE LOWER(email) = LOWER(${email}) LIMIT 1`
    if (existente.length > 0) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 })
    }


    const senhaHash = `raronexus:${crypto.randomUUID()}`
    const result = await sql`
      INSERT INTO usuarios (nexus_email, nome, email, senha_hash, cargo, ativo, apuracao_mensal)
      VALUES (${nexusEmail}, ${nome}, ${email.toLowerCase()}, ${senhaHash}, ${"Pendente no RaroNexus"}, ${ativo ?? true}, ${apuracao_mensal ?? false})
      RETURNING id, nexus_user_id, nexus_email, nome, email, cargo, ativo, apuracao_mensal, created_at
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}