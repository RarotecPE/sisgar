import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import {
  isTipoMedico,
  eventoCobertoPorDocumento,
  toYMD,
  type DocumentoMedico,
} from "@/lib/documentos-medicos"

// GET /api/dashboard/pendencias-medicas?tecnico_id=
// Eventos medicos na agenda SEM documento com anexo cobrindo a data.
// Gestor: de todos; tecnico: apenas os proprios.
export async function GET(request: Request) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tecnicoIdParam = searchParams.get("tecnico_id")
  const userIsGestor = isGestor(user.nome, user.cargo)

  try {
    // Eventos medicos: filtramos por tecnico quando nao for gestor (ou quando informado)
    const tecnicoId = tecnicoIdParam ? parseInt(tecnicoIdParam) : null
    const filtrarPorTecnico = !userIsGestor || !!tecnicoId

    if (filtrarPorTecnico && !tecnicoId) {
      // tecnico sem vinculo -> sem pendencias
      return NextResponse.json([])
    }

    const eventos = filtrarPorTecnico
      ? await sql`
          SELECT a.id, a.titulo, a.tipo, a.data_inicio, a.tecnico_rarotec_id, t.nome AS tecnico_nome
          FROM agenda_trabalhista a
          LEFT JOIN tecnicos_rarotec t ON t.id = a.tecnico_rarotec_id
          WHERE a.tecnico_rarotec_id = ${tecnicoId}
          ORDER BY a.data_inicio DESC
        `
      : await sql`
          SELECT a.id, a.titulo, a.tipo, a.data_inicio, a.tecnico_rarotec_id, t.nome AS tecnico_nome
          FROM agenda_trabalhista a
          LEFT JOIN tecnicos_rarotec t ON t.id = a.tecnico_rarotec_id
          ORDER BY a.data_inicio DESC
        `

    // Documentos existentes (com anexo)
    const documentos = (filtrarPorTecnico
      ? await sql`SELECT * FROM documentos_medicos WHERE tecnico_rarotec_id = ${tecnicoId}`
      : await sql`SELECT * FROM documentos_medicos`) as unknown as DocumentoMedico[]

    // Filtra eventos medicos sem cobertura (independente da data: licenca/atestado
    // futuro tambem exige documento anexado).
    const pendencias = eventos
      .filter((ev: any) => isTipoMedico(ev.tipo))
      .filter((ev: any) => {
        const coberto = eventoCobertoPorDocumento(
          ev.tecnico_rarotec_id,
          toYMD(ev.data_inicio),
          documentos,
        )
        return !coberto
      })
      .map((ev: any) => ({
        id: ev.id,
        titulo: ev.titulo,
        tipo: ev.tipo,
        data_inicio: ev.data_inicio,
        tecnico_rarotec_id: ev.tecnico_rarotec_id,
        tecnico_nome: ev.tecnico_nome,
      }))

    return NextResponse.json(pendencias)
  } catch (error) {
    console.error("Error fetching pendencias-medicas:", error)
    return NextResponse.json({ error: "Erro ao buscar pendencias medicas" }, { status: 500 })
  }
}
