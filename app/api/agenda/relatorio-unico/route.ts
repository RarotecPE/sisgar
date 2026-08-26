import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// Habilita ou desabilita o "relatorio unico" (esporadico) para um conjunto de eventos da agenda.
// body: { eventoIds: number[], acao: "set" | "clear", grupoId?: string }
export async function PATCH(request: NextRequest) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const { eventoIds, acao, grupoId } = await request.json()

    if (!Array.isArray(eventoIds) || eventoIds.length === 0) {
      return NextResponse.json({ error: "Nenhum evento informado" }, { status: 400 })
    }

    const ids = eventoIds.map((id: any) => Number(id)).filter((n) => Number.isFinite(n))
    if (ids.length === 0) {
      return NextResponse.json({ error: "IDs invalidos" }, { status: 400 })
    }

    if (acao === "clear") {
      await sql`
        UPDATE agenda_trabalhista
        SET relatorio_grupo_id = NULL
        WHERE id = ANY(${ids})
      `
      return NextResponse.json({ success: true, grupoId: null })
    }

    // acao === "set" (padrao): gera um id de grupo se nao vier um
    const novoGrupoId = grupoId || `grp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    await sql`
      UPDATE agenda_trabalhista
      SET relatorio_grupo_id = ${novoGrupoId}
      WHERE id = ANY(${ids})
    `
    return NextResponse.json({ success: true, grupoId: novoGrupoId })
  } catch (error) {
    console.error("Erro ao atualizar relatorio unico:", error)
    return NextResponse.json({ error: "Erro ao atualizar relatorio unico" }, { status: 500 })
  }
}
