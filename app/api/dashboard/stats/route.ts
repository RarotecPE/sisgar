import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tecnicoId = searchParams.get("tecnico_id")
    const isGestor = searchParams.get("is_gestor") === "true"

    // Se não é gestor e tem tecnicoId, filtra por técnico
    const filterByTecnico = !isGestor && tecnicoId

    const [tecnicos, clientes, agendaHoje] = await Promise.all([
      // Técnicos ativos - só mostra para gestores
      isGestor 
        ? sql`SELECT COUNT(*) as count FROM tecnicos_rarotec WHERE ativo = true`
        : Promise.resolve([{ count: 0 }]),
      
      // Clientes ativos
      sql`SELECT COUNT(*) as count FROM clientes WHERE ativo = true`,
      
      // Agenda hoje - filtra por técnico se não for gestor
      filterByTecnico
        ? sql`SELECT COUNT(*) as count FROM agenda_trabalhista WHERE DATE(data_inicio) = CURRENT_DATE AND tecnico_rarotec_id = ${tecnicoId}`
        : sql`SELECT COUNT(*) as count FROM agenda_trabalhista WHERE DATE(data_inicio) = CURRENT_DATE`,
    ])

    // As pendências de batimento (relatórios) agora vivem na Central de avisos,
    // que consome /api/dashboard/pendencias (mesma lógica da página de Batimento:
    // cobertura por município/dia + agrupamento semanal). Não são mais calculadas aqui.
    return NextResponse.json({
      tecnicos: Number(tecnicos[0]?.count || 0),
      clientes: Number(clientes[0]?.count || 0),
      agendaHoje: Number(agendaHoje[0]?.count || 0),
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
  }
}
