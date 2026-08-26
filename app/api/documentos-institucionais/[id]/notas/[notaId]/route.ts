import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"

// DELETE /api/documentos-institucionais/[id]/notas/[notaId]
// Gestor pode remover a propria nota.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; notaId: string }> },
) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Acesso restrito a gestores" }, { status: 403 })
  }

  const { notaId } = await params
  const id = parseInt(notaId)

  try {
    // Autor remove a propria nota
    const result = await sql`
      DELETE FROM documentos_institucionais_notas
      WHERE id = ${id} AND autor_id = ${user.id}
      RETURNING id
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "Nota nao encontrada ou sem permissao" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting nota:", error)
    return NextResponse.json({ error: "Erro ao excluir nota" }, { status: 500 })
  }
}
