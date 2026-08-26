import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"

// GET /api/dashboard/documentos-analise
// Documentos medicos COM anexo aguardando validacao/analise por um gestor.
// Restrito a gestores (coordenador, gerente, diretor, admin).
export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const userIsGestor = isGestor(user.nome, user.cargo)
  if (!userIsGestor) {
    // Nao-gestor nao analisa documentos de terceiros
    return NextResponse.json([])
  }

  try {
    const rows = await sql`
      SELECT
        d.id,
        d.tipo,
        d.data_inicio,
        d.data_fim,
        d.descricao,
        d.created_at,
        d.tecnico_rarotec_id,
        t.nome AS tecnico_nome
      FROM documentos_medicos d
      LEFT JOIN tecnicos_rarotec t ON t.id = d.tecnico_rarotec_id
      WHERE d.blob_pathname IS NOT NULL
        AND COALESCE(d.status_validacao, 'pendente') = 'pendente'
      ORDER BY d.created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching documentos-analise:", error)
    return NextResponse.json({ error: "Erro ao buscar documentos para analise" }, { status: 500 })
  }
}
