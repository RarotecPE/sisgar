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

async function isTargetAdmin(id: number) {
  const rows = await sql`SELECT cargo FROM usuarios WHERE id = ${id} LIMIT 1`
  return rows[0]?.cargo?.toLowerCase() === "administrador"
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireGestor()
    if ("response" in auth) return auth.response

    const { id } = await params
    const usuarios = await sql`
      SELECT id, nome, email, cargo, ativo, apuracao_mensal, created_at, updated_at
      FROM usuarios
      WHERE id = ${parseInt(id)}
    `
    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    return NextResponse.json(usuarios[0])
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireGestor()
    if ("response" in auth) return auth.response

    const { id } = await params
    const parsedId = parseInt(id)
    const body = await request.json()
    const { nome, email, ativo, apuracao_mensal } = body
    if (!nome || !email) {
      return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 })
    }
    if ((await isTargetAdmin(parsedId)) && !isAdmin(auth.user.cargo)) {
      return NextResponse.json({ error: "Apenas administradores podem editar administradores." }, { status: 403 })
    }

    const result = await sql`
      UPDATE usuarios
      SET nome = ${nome}, email = ${email.toLowerCase()}, ativo = ${ativo},
          apuracao_mensal = COALESCE(${apuracao_mensal ?? null}, apuracao_mensal),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parsedId}
      RETURNING id, nome, email, cargo, ativo, apuracao_mensal, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireGestor()
    if ("response" in auth) return auth.response

    const { id } = await params
    const parsedId = parseInt(id)
    if (await isTargetAdmin(parsedId) && !isAdmin(auth.user.cargo)) {
      return NextResponse.json({ error: "Apenas administradores podem excluir administradores." }, { status: 403 })
    }
    if (auth.user.id === parsedId) {
      return NextResponse.json({ error: "Você não pode excluir sua própria configuração local." }, { status: 400 })
    }

    await sql`DELETE FROM usuarios WHERE id = ${parsedId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
  }
}
