import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"

// DELETE /api/capacitacoes/[id] - apenas gestor
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Apenas gestores podem excluir" }, { status: 403 })
  }

  const { id } = await params
  const regId = parseInt(id)

  try {
    const result = await sql`DELETE FROM capacitacoes WHERE id = ${regId} RETURNING id`
    if (result.length === 0) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting capacitacao:", error)
    return NextResponse.json({ error: "Erro ao excluir treinamento" }, { status: 500 })
  }
}
