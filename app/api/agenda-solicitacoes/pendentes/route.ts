import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const solicitacoes = await sql`
      SELECT 
        s.id,
        s.agenda_evento_id,
        s.tecnico_solicitante_id,
        s.tipo_solicitacao,
        s.descricao,
        s.dados_alteracao,
        s.status,
        s.created_at,
        a.titulo as evento_titulo,
        a.data_inicio as evento_data,
        a.local as evento_local,
        a.tipo as evento_tipo,
        t.nome as tecnico_nome
      FROM agenda_solicitacoes s
      LEFT JOIN agenda_trabalhista a ON s.agenda_evento_id = a.id
      LEFT JOIN tecnicos_rarotec t ON s.tecnico_solicitante_id = t.id
      WHERE s.status = 'pendente'
      ORDER BY s.created_at DESC
      LIMIT 20
    `
    return NextResponse.json(solicitacoes)
  } catch (error) {
    console.error("Erro ao buscar solicitacoes pendentes:", error)
    return NextResponse.json([], { status: 500 })
  }
}
