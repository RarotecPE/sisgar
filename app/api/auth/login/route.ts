import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const users = await sql`
      SELECT id, nome, email, senha_hash, cargo, ativo 
      FROM usuarios 
      WHERE email = ${email}
    `

    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 }
      )
    }

    if (!user.ativo) {
      return NextResponse.json(
        { error: "Usuário inativo. Entre em contato com o administrador." },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(senha, user.senha_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 }
      )
    }

    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
