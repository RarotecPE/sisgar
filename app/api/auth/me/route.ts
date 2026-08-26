import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Buscar dados completos do usuário na tabela usuarios
    const usuarios = await sql`
      SELECT id, nome, email, cargo, ativo, apuracao_mensal
      FROM usuarios
      WHERE id = ${parseInt(userId)} AND ativo = true
    `

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const usuario = usuarios[0]
    
    // Buscar vinculo com tecnico_rarotec se existir
    let tecnicoRarotecId = null
    try {
      // 1) Match preferencial por email (único e confiável)
      let tecnicos = await sql`
        SELECT id FROM tecnicos_rarotec 
        WHERE LOWER(email) = LOWER(${usuario.email})
        LIMIT 1
      `
      // 2) Fallback: match por nome completo exato
      if (tecnicos.length === 0) {
        tecnicos = await sql`
          SELECT id FROM tecnicos_rarotec 
          WHERE LOWER(nome) = LOWER(${usuario.nome})
          LIMIT 1
        `
      }
      if (tecnicos.length > 0) {
        tecnicoRarotecId = tecnicos[0].id
      }
    } catch (e) {
      // Se falhar, continua sem o tecnico_rarotec_id
    }

    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      cargos: usuario.cargo ? [usuario.cargo] : [],
      apuracao_mensal: usuario.apuracao_mensal ?? false,
      tecnico_rarotec_id: tecnicoRarotecId
    })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
