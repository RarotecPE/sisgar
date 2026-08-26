import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tecnicoId = searchParams.get("tecnico_id")
    const isGestor = searchParams.get("is_gestor") === "true"

    // Se não é gestor e tem tecnicoId, filtra por técnico
    const filterByTecnico = !isGestor && tecnicoId

    const activities = filterByTecnico
      ? await sql`
          SELECT 
            'relatorio' as tipo,
            r.id,
            c.nome_fantasia as cliente,
            r.municipio,
            r.data_visita as data,
            r.status,
            r.tipo_servico
          FROM relatorios_visitas r
          LEFT JOIN clientes c ON r.cliente_id = c.id
          WHERE r.tecnicos_rarotec_ids @> ${JSON.stringify([parseInt(tecnicoId)])}::jsonb
             OR r.tecnico_rarotec_id = ${parseInt(tecnicoId)}
          ORDER BY r.created_at DESC
          LIMIT 5
        `
      : await sql`
          SELECT 
            'relatorio' as tipo,
            r.id,
            c.nome_fantasia as cliente,
            r.municipio,
            r.data_visita as data,
            r.status,
            r.tipo_servico
          FROM relatorios_visitas r
          LEFT JOIN clientes c ON r.cliente_id = c.id
          ORDER BY r.created_at DESC
          LIMIT 5
        `

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Erro ao buscar atividades:", error)
    return NextResponse.json([], { status: 500 })
  }
}
