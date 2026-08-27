import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isAdmin, isGestor } from "@/lib/permissions"

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

    const usuarios = await sql`
      SELECT id, nome, email, cargo, ativo, apuracao_mensal, created_at, updated_at
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
    const { nome, email, cargo, ativo, apuracao_mensal } = body

    if (!nome || !email || !cargo) {
      return NextResponse.json({ error: "Nome, e-mail e cargo são obrigatórios." }, { status: 400 })
    }
    if (cargo === "Administrador" && !isAdmin(auth.user.cargo)) {
      return NextResponse.json({ error: "Apenas administradores podem definir o cargo de Administrador." }, { status: 403 })
    }

    const existente = await sql`SELECT id FROM usuarios WHERE LOWER(email) = LOWER(${email}) LIMIT 1`
    if (existente.length > 0) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 })
    }

    const senhaHash = `raronexus:${crypto.randomUUID()}`
    const result = await sql`
      INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo, apuracao_mensal)
      VALUES (${nome}, ${email.toLowerCase()}, ${senhaHash}, ${cargo}, ${ativo ?? true}, ${apuracao_mensal ?? false})
      RETURNING id, nome, email, cargo, ativo, apuracao_mensal, created_at
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
