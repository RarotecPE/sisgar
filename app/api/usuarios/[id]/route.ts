import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const usuarios = await sql`
      SELECT id, nome, email, cargo, ativo, apuracao_mensal, created_at, updated_at
      FROM usuarios
      WHERE id = ${parseInt(id)}
    `
    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })
    }
    return NextResponse.json(usuarios[0])
  } catch (error) {
    console.error("Erro ao buscar usuario:", error)
    return NextResponse.json({ error: "Erro ao buscar usuario" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nome, email, cargo, ativo, apuracao_mensal } = body

    const result = await sql`
      UPDATE usuarios
      SET nome = ${nome}, email = ${email}, cargo = ${cargo}, ativo = ${ativo},
          apuracao_mensal = COALESCE(${apuracao_mensal ?? null}, apuracao_mensal),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
      RETURNING id, nome, email, cargo, ativo, apuracao_mensal, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao atualizar usuario:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM usuarios WHERE id = ${parseInt(id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir usuario:", error)
    return NextResponse.json({ error: "Erro ao excluir usuario" }, { status: 500 })
  }
}
