import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import { syncAuthorizedNexusUsers } from "@/lib/nexus-sync"

async function requireGestor() {
  const user = await getSession()
  if (!user) return { response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) }
  if (!isGestor(user.nome, user.cargo)) return { response: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) }
  return { user }
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

export async function POST() {
  return NextResponse.json(
    { error: "O cadastro de novos usuários é gerenciado exclusivamente através do RaroNexus." },
    { status: 405 }
  )
}