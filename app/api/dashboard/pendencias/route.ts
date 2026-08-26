import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { calcularGruposRelatorio, chaveParFixo, type EventoAgrupavel } from "@/lib/relatorio-grupos"

// Função para normalizar string removendo acentos e convertendo para minúsculo
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim()
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tecnicoId = searchParams.get('tecnico_id')
    
    if (!tecnicoId) {
      return NextResponse.json([])
    }

    const tecnicoIdNum = parseInt(tecnicoId)
    
    // Data de hoje no formato YYYY-MM-DD
    const hoje = new Date()
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
    
    // Buscar TODOS os eventos da agenda do técnico (inclui futuros, para calcular
    // corretamente o dia de cobranca do grupo de relatorio unico)
    const eventosAgenda = await sql`
      SELECT 
        a.id,
        a.titulo,
        a.data_inicio,
        a.local,
        a.tipo,
        a.cliente_id,
        a.relatorio_grupo_id,
        a.tecnico_rarotec_id,
        c.cidade AS cliente_cidade
      FROM agenda_trabalhista a
      LEFT JOIN clientes c ON c.id = a.cliente_id
      WHERE a.tecnico_rarotec_id = ${tecnicoIdNum}
      ORDER BY a.data_inicio DESC
    `
    
    // Buscar abonos do técnico
    const abonos = await sql`
      SELECT agenda_evento_id, tecnico_id
      FROM agenda_abonos
      WHERE tecnico_id = ${tecnicoIdNum}
    `
    const abonosSet = new Set(abonos.map(a => `${a.agenda_evento_id}-${a.tecnico_id}`))

    // Pares fixos (tecnico <-> cliente) para relatorio semanal unico
    const paresFixosRows = await sql`
      SELECT cliente_id FROM tecnico_clientes_fixos WHERE tecnico_rarotec_id = ${tecnicoIdNum}
    `
    const paresFixosSet = new Set<string>(
      paresFixosRows.map((p: any) => chaveParFixo(tecnicoIdNum, p.cliente_id))
    )
    
    // Buscar relatórios onde o técnico participou
    const relatorios = await sql`
      SELECT 
        r.id,
        r.data_visita,
        r.data_relatorio,
        r.municipio,
        r.tecnicos_rarotec_ids,
        r.tecnico_rarotec_id
      FROM relatorios_visitas r
      WHERE r.tecnico_rarotec_id = ${tecnicoIdNum}
        OR r.tecnicos_rarotec_ids::text LIKE ${'%' + tecnicoId + '%'}
    `

    // Helper: normaliza a data de um registro para YYYY-MM-DD
    const toYMD = (value: any): string => {
      if (!value) return ''
      const d = new Date(value)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    // Helper: municipio normalizado de um evento
    // Prioriza a cidade do cliente vinculado (fonte confiavel), depois local, depois titulo
    const municipioDoEvento = (evento: any): string => {
      if (evento.cliente_cidade) return normalizeString(String(evento.cliente_cidade).split('/')[0])
      if (evento.local) return normalizeString(String(evento.local).split('/')[0])
      if (evento.titulo && evento.titulo.includes(' - ')) {
        const partes = evento.titulo.split(' - ')
        if (partes.length >= 2) return normalizeString(partes.slice(1).join(' - ').split('/')[0])
      }
      return ''
    }

    // Predicado: evento exige relatorio?
    // Remove separadores (-, _, espaco, ponto) e acentos para comparar tipos de forma robusta.
    // O tipo gravado no banco pode vir como 'home_office', 'home-office' ou 'homeoffice';
    // todos devem ser reconhecidos como internos (nao exigem relatorio).
    const normalizarTipo = (s: string) =>
      String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s_.-]/g, '')

    const exigeRelatorio = (evento: any): boolean => {
      const tipoNorm = normalizarTipo(evento.tipo || '')
      const tituloEvento = (evento.titulo || '').toLowerCase()
      const tiposInternos = ['interno', 'folga', 'ferias', 'atestado', 'consulta_medica', 'licenca_medica', 'licenca_maternidade', 'licenca_paternidade', 'feriado', 'escritorio', 'home-office', 'homeoffice', 'suspensao', 'indisponivel']
      if (tiposInternos.some(t => normalizarTipo(t) === tipoNorm)) return false
      const titulosInternos = ['home-office', 'home office', 'homeoffice', 'escritorio', 'escritório', 'folga', 'férias', 'ferias', 'atestado', 'consulta médica', 'consulta medica', 'feriado', 'suspensao', 'indisponivel']
      if (titulosInternos.some(t => tituloEvento.includes(t))) return false
      // Precisa ter municipio identificavel
      if (!municipioDoEvento(evento)) return false
      return true
    }

    // Existe relatorio correspondente ao evento?
    const temRelatorio = (evento: any): boolean => {
      const dataEvento = toYMD(evento.data_inicio)
      const municipioEvento = municipioDoEvento(evento)
      return relatorios.some(rel => {
        const dataRelatorio = toYMD(rel.data_visita || rel.data_relatorio)
        if (dataRelatorio !== dataEvento) return false
        const municipioRelatorio = normalizeString((rel.municipio || '').split('/')[0])
        if (!municipioRelatorio.includes(municipioEvento) && !municipioEvento.includes(municipioRelatorio)) {
          return false
        }
        let tecnicoIds: number[] = []
        if (rel.tecnicos_rarotec_ids) {
          try {
            tecnicoIds = typeof rel.tecnicos_rarotec_ids === 'string'
              ? JSON.parse(rel.tecnicos_rarotec_ids)
              : rel.tecnicos_rarotec_ids
          } catch { tecnicoIds = [] }
        }
        return tecnicoIds.includes(tecnicoIdNum) || rel.tecnico_rarotec_id === tecnicoIdNum
      })
    }

    // Eventos que exigem relatorio (todos, inclusive futuros, para calcular o grupo)
    const eventosComRelatorio = eventosAgenda.filter(exigeRelatorio)

    // Mapa eventoId -> tem relatorio?
    const relatorioPorEvento = new Map<number, boolean>()
    eventosComRelatorio.forEach(ev => relatorioPorEvento.set(ev.id, temRelatorio(ev)))

    // Cobertura por municipio: se UMA visita do mesmo municipio/dia tem relatorio,
    // todas as visitas daquele municipio no mesmo dia estao cobertas (1 relatorio serve).
    const chaveMunicipioDia = (ev: any) => `${toYMD(ev.data_inicio)}__${municipioDoEvento(ev)}`
    const municipiosCobertos = new Set<string>()
    eventosComRelatorio.forEach(ev => {
      if (relatorioPorEvento.get(ev.id) && municipioDoEvento(ev)) {
        municipiosCobertos.add(chaveMunicipioDia(ev))
      }
    })

    // Calcular grupos (fixo/esporadico/individual) e status
    const eventosAgrupaveis: EventoAgrupavel[] = eventosComRelatorio.map(ev => ({
      id: ev.id,
      tecnicoId: ev.tecnico_rarotec_id,
      clienteId: ev.cliente_id ?? null,
      data: toYMD(ev.data_inicio),
      relatorioGrupoId: ev.relatorio_grupo_id ?? null,
    }))
    // Evento satisfeito = relatorio proprio OU coberto pelo municipio/dia
    const idsSatisfeitos = new Set<number>()
    eventosComRelatorio.forEach(ev => {
      if (relatorioPorEvento.get(ev.id) || municipiosCobertos.has(chaveMunicipioDia(ev))) {
        idsSatisfeitos.add(ev.id)
      }
    })

    const gruposMap = calcularGruposRelatorio({
      eventos: eventosAgrupaveis,
      paresFixos: paresFixosSet,
      temRelatorio: (id) => idsSatisfeitos.has(id),
      hojeStr,
    })

    // Montar pendencias: apenas eventos ja vencidos (data <= hoje), nao abonados,
    // sem relatorio e cujo status de grupo seja 'pendente'
    const pendencias = []
    for (const evento of eventosComRelatorio) {
      const dataEvento = toYMD(evento.data_inicio)
      if (dataEvento > hojeStr) continue // futuro nao e pendencia

      const abonoKey = `${evento.id}-${evento.tecnico_rarotec_id}`
      if (abonosSet.has(abonoKey)) continue

      if (relatorioPorEvento.get(evento.id)) continue // ja tem relatorio

      // Coberto por outra visita do mesmo municipio/dia (1 relatorio serve p/ o municipio)
      if (municipiosCobertos.has(chaveMunicipioDia(evento))) continue

      const grupo = gruposMap.get(evento.id)
      // So e pendencia se for o dia de cobranca vencido (status 'pendente').
      // Dias agrupados/aguardando nao contam.
      if (grupo && grupo.status !== 'pendente') continue

      pendencias.push(evento)
    }
    
    return NextResponse.json(pendencias)
  } catch (error) {
    console.error("Erro ao buscar pendências:", error)
    return NextResponse.json([], { status: 500 })
  }
}
