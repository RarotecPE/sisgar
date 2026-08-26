import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Função para normalizar string removendo acentos
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

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

    // Calcular pendências de batimento (eventos externos sem relatório) - só para gestores
    let pendenciasBatimento = 0
    
    if (isGestor) {
      // Buscar eventos até hoje que não são internos
      const eventos = await sql`
        SELECT 
          a.id,
          a.titulo,
          a.tipo,
          a.local,
          DATE(a.data_inicio) as data_evento,
          a.tecnico_rarotec_id
        FROM agenda_trabalhista a
        WHERE DATE(a.data_inicio) <= CURRENT_DATE
          -- Compara o tipo sem separadores (-, _, espaco) para reconhecer 'home_office',
          -- 'home-office' e 'homeoffice' como internos (nao exigem relatorio).
          AND REPLACE(REPLACE(REPLACE(LOWER(a.tipo), '_', ''), '-', ''), ' ', '') NOT IN (
            'interno', 'folga', 'ferias', 'atestado', 'consultamedica', 'licencamedica',
            'licencamaternidade', 'licencapaternidade', 'feriado', 'escritorio',
            'homeoffice', 'suspensao', 'indisponivel'
          )
          AND LOWER(a.titulo) NOT LIKE '%home-office%'
          AND LOWER(a.titulo) NOT LIKE '%home office%'
          AND LOWER(a.titulo) NOT LIKE '%homeoffice%'
          AND LOWER(a.titulo) NOT LIKE '%escritorio%'
          AND LOWER(a.titulo) NOT LIKE '%escritório%'
      `
      
      // Buscar relatórios
      const relatorios = await sql`
        SELECT 
          id,
          municipio,
          DATE(data_visita) as data_relatorio,
          tecnico_rarotec_id,
          tecnicos_rarotec_ids
        FROM relatorios_visitas
      `
      
      // Buscar abonos
      const abonos = await sql`
        SELECT agenda_evento_id, tecnico_id FROM agenda_abonos
      `
      const abonosSet = new Set(abonos.map((a: any) => `${a.agenda_evento_id}-${a.tecnico_id}`))
      
      // Contar pendências
      for (const evento of eventos) {
        const abonoKey = `${evento.id}-${evento.tecnico_rarotec_id}`
        if (abonosSet.has(abonoKey)) continue
        
        // Extrair município do evento
        let municipioEvento = ''
        if (evento.local) {
          municipioEvento = normalizeString(String(evento.local).split('/')[0])
        } else if (evento.titulo && evento.titulo.includes(' - ')) {
          const partes = evento.titulo.split(' - ')
          if (partes.length >= 2) {
            municipioEvento = normalizeString(partes.slice(1).join(' - ').split('/')[0])
          }
        }
        
        if (!municipioEvento) continue
        
        // Formatar data do evento
        const dataEvento = evento.data_evento instanceof Date 
          ? evento.data_evento.toISOString().split('T')[0]
          : String(evento.data_evento).split('T')[0]
        
        // Verificar se existe relatório correspondente
        const temRelatorio = relatorios.some((rel: any) => {
          const dataRelatorio = rel.data_relatorio instanceof Date
            ? rel.data_relatorio.toISOString().split('T')[0]
            : String(rel.data_relatorio).split('T')[0]
          
          if (dataRelatorio !== dataEvento) return false
          
          const municipioRelatorio = normalizeString((rel.municipio || '').split('/')[0])
          if (!municipioRelatorio.includes(municipioEvento) && !municipioEvento.includes(municipioRelatorio)) {
            return false
          }
          
          // Verificar se o técnico está no relatório
          let tecnicoIds: number[] = []
          if (rel.tecnicos_rarotec_ids) {
            try {
              tecnicoIds = typeof rel.tecnicos_rarotec_ids === 'string'
                ? JSON.parse(rel.tecnicos_rarotec_ids)
                : rel.tecnicos_rarotec_ids
            } catch { tecnicoIds = [] }
          }
          
          return tecnicoIds.includes(evento.tecnico_rarotec_id) || 
            rel.tecnico_rarotec_id === evento.tecnico_rarotec_id
        })
        
        if (!temRelatorio) {
          pendenciasBatimento++
        }
      }
    }

    return NextResponse.json({
      tecnicos: Number(tecnicos[0]?.count || 0),
      clientes: Number(clientes[0]?.count || 0),
      relatoriosPendentes: pendenciasBatimento,
      agendaHoje: Number(agendaHoje[0]?.count || 0),
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
  }
}
