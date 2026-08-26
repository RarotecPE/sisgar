import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  return POST()
}

export async function POST() {
  try {
    // Check if admin user exists
    const existingAdmin = await sql`
      SELECT id FROM usuarios WHERE email = 'admin@rarotec.com.br'
    `

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { message: "Usuario admin ja existe" },
        { status: 200 }
      )
    }

    // Create admin user
    const senhaHash = await hashPassword("admin123")
    
    await sql`
      INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo)
      VALUES ('Administrador', 'admin@rarotec.com.br', ${senhaHash}, 'Administrador', true)
    `

    return NextResponse.json({
      success: true,
      message: "Usuario admin criado com sucesso",
      credentials: {
        email: "admin@rarotec.com.br",
        senha: "admin123"
      }
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuario admin" },
      { status: 500 }
    )
  }
}
