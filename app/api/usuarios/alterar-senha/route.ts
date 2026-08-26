import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { getSession } from "@/lib/auth"


export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { senhaAtual, novaSenha, userId } = body

    // Se for admin alterando de outro usuario, nao precisa da senha atual
    const targetUserId = userId || user.id

    if (targetUserId !== user.id) {
      // Verificar se tem permissao (Administrador, Gerente ou Coordenação)
      const cargosComPermissao = ["Administrador", "Gerente", "Coordenação"]
      if (!cargosComPermissao.includes(user.cargo)) {
        return NextResponse.json({ error: "Sem permissao" }, { status: 403 })
      }
    } else {
      // Verificar senha atual
      const usuarios = await sql`
        SELECT senha_hash FROM usuarios WHERE id = ${user.id}
      `
      if (usuarios.length === 0) {
        return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })
      }

      const senhaValida = await bcrypt.compare(senhaAtual, usuarios[0].senha_hash)
      if (!senhaValida) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
      }
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10)

    await sql`
      UPDATE usuarios
      SET senha_hash = ${novaSenhaHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${targetUserId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 })
  }
}
