import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"


export async function GET() {
  try {
    const usuarios = await sql`
      SELECT id, nome, email, cargo, ativo, apuracao_mensal, created_at, updated_at
      FROM usuarios
      ORDER BY nome
    `
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Erro ao buscar usuarios:", error)
    return NextResponse.json({ error: "Erro ao buscar usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, senha, cargo, apuracao_mensal } = body

    // Verificar se email ja existe
    const existente = await sql`SELECT id FROM usuarios WHERE email = ${email}`
    if (existente.length > 0) {
      return NextResponse.json({ error: "Email ja cadastrado" }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const result = await sql`
      INSERT INTO usuarios (nome, email, senha_hash, cargo, apuracao_mensal)
      VALUES (${nome}, ${email}, ${senhaHash}, ${cargo}, ${apuracao_mensal ?? false})
      RETURNING id, nome, email, cargo, ativo, apuracao_mensal, created_at
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao criar usuario:", error)
    return NextResponse.json({ error: "Erro ao criar usuario" }, { status: 500 })
  }
}
