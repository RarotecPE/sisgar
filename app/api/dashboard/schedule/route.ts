import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tecnicoId = searchParams.get("tecnico_id")
    const isGestor = searchParams.get("is_gestor") === "true"

    // Se não é gestor e tem tecnicoId, filtra por técnico
    const filterByTecnico = !isGestor && tecnicoId

    const schedule = filterByTecnico
      ? await sql`
          SELECT 
            a.id,
            a.titulo,
            a.data_inicio,
            a.status,
            a.local,
            t.nome as tecnico_nome,
            c.nome_fantasia as cliente_nome
          FROM agenda_trabalhista a
          LEFT JOIN tecnicos_rarotec t ON a.tecnico_rarotec_id = t.id
          LEFT JOIN clientes c ON a.cliente_id = c.id
          WHERE a.data_inicio >= CURRENT_DATE
            AND a.tecnico_rarotec_id = ${tecnicoId}
          ORDER BY a.data_inicio ASC
          LIMIT 5
        `
      : await sql`
          SELECT 
            a.id,
            a.titulo,
            a.data_inicio,
            a.status,
            a.local,
            t.nome as tecnico_nome,
            c.nome_fantasia as cliente_nome
          FROM agenda_trabalhista a
          LEFT JOIN tecnicos_rarotec t ON a.tecnico_rarotec_id = t.id
          LEFT JOIN clientes c ON a.cliente_id = c.id
          WHERE a.data_inicio >= CURRENT_DATE
          ORDER BY a.data_inicio ASC
          LIMIT 5
        `

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Erro ao buscar agenda:", error)
    return NextResponse.json([], { status: 500 })
  }
}
