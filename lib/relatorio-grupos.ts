// Helper puro para agrupamento de eventos da agenda em "relatorios unicos".
//
// Duas situacoes de agrupamento (ambas cobertas por 1 unico relatorio):
//  - fixo:       vinculo tecnico <-> cliente (1 relatorio por semana util Seg-Sex por cliente)
//  - esporadico: selecao manual na agenda (relatorio_grupo_id compartilhado, pode atravessar semanas)
//  - individual: comportamento atual (1 relatorio por dia/evento)
//
// Dia de cobranca (dueDate):
//  - fixo:       SEMPRE a sexta-feira da semana util (fim da semana Seg-Sex), mesmo que a
//                ultima visita tenha sido antes. Assim, dias intermediarios (incl. a ultima
//                visita da semana) ficam 'agrupado' ate o fim da semana.
//  - esporadico/individual: o ultimo dia com evento do grupo.
//
// Regra de status:
//  - Se o grupo tem relatorio -> todos os dias 'ok'
//  - Sem relatorio: dias que nao sao o dia de cobranca -> 'agrupado' (nao e pendencia)
//  - Dia de cobranca: 'pendente' se ja venceu (hoje >= dueDate), senao 'aguardando'
//
// Usado tanto no batimento (client) quanto na rota de pendencias (server).

export type StatusGrupo = "ok" | "pendente" | "aguardando" | "agrupado"
export type TipoGrupo = "fixo" | "esporadico" | "individual"

export interface EventoAgrupavel {
  id: number
  tecnicoId: number
  clienteId: number | null
  data: string // 'YYYY-MM-DD'
  relatorioGrupoId?: string | null
}

export interface ResultadoGrupo {
  status: StatusGrupo
  grupoKey: string
  grupoTipo: TipoGrupo
  dueDate: string // 'YYYY-MM-DD' - dia em que o relatorio e cobrado
  isDueDay: boolean // se este evento e o dia de cobranca
  tamanhoGrupo: number // quantidade de dias/eventos no grupo
}

// Retorna a segunda-feira (inicio da semana util) da data informada, no formato YYYY-MM-DD.
function semanaSegSex(dataStr: string): string {
  const d = new Date(dataStr + "T00:00:00")
  const dow = d.getDay() // 0=Dom .. 6=Sab
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMonday)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`
}

// Retorna a sexta-feira (fim da semana util) da data informada, no formato YYYY-MM-DD.
// Usado como dia de cobranca do relatorio semanal unico (grupo fixo).
function fimSemanaSegSex(dataStr: string): string {
  const monday = new Date(semanaSegSex(dataStr) + "T00:00:00")
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return `${friday.getFullYear()}-${String(friday.getMonth() + 1).padStart(2, "0")}-${String(friday.getDate()).padStart(2, "0")}`
}

export function chaveParFixo(tecnicoId: number, clienteId: number): string {
  return `${tecnicoId}:${clienteId}`
}

// Calcula os grupos e o status de cada evento.
// IMPORTANTE: passe TODOS os eventos que exigem relatorio (inclusive dias futuros
// dentro do periodo carregado), para que o dia de cobranca (dueDate) seja calculado
// corretamente e nao se marque um dia intermediario como pendente antes da hora.
export function calcularGruposRelatorio(params: {
  eventos: EventoAgrupavel[]
  paresFixos: Set<string> // chaveParFixo(tecnicoId, clienteId)
  temRelatorio: (eventoId: number) => boolean
  hojeStr: string // 'YYYY-MM-DD'
}): Map<number, ResultadoGrupo> {
  const { eventos, paresFixos, temRelatorio, hojeStr } = params

  // 1) Agrupar
  const grupos = new Map<string, { tipo: TipoGrupo; eventos: EventoAgrupavel[] }>()

  const chaveDoEvento = (e: EventoAgrupavel): { key: string; tipo: TipoGrupo } => {
    if (e.relatorioGrupoId) {
      return { key: `esp:${e.relatorioGrupoId}`, tipo: "esporadico" }
    }
    if (e.clienteId != null && paresFixos.has(chaveParFixo(e.tecnicoId, e.clienteId))) {
      return { key: `fix:${e.tecnicoId}:${e.clienteId}:${semanaSegSex(e.data)}`, tipo: "fixo" }
    }
    return { key: `ind:${e.id}`, tipo: "individual" }
  }

  for (const e of eventos) {
    const { key, tipo } = chaveDoEvento(e)
    if (!grupos.has(key)) grupos.set(key, { tipo, eventos: [] })
    grupos.get(key)!.eventos.push(e)
  }

  // 2) Calcular status por evento
  const resultado = new Map<number, ResultadoGrupo>()

  grupos.forEach((grupo, grupoKey) => {
    const datas = grupo.eventos.map((e) => e.data)
    const maxEvento = datas.reduce((max, d) => (d > max ? d : max), datas[0])
    const hasReport = grupo.eventos.some((e) => temRelatorio(e.id))

    // Data de cobranca do grupo:
    //  - fixo (relatorio semanal unico): SEMPRE a sexta-feira da semana util (fim da semana),
    //    mesmo que o ultimo dia trabalhado tenha sido antes (ex.: ultima visita na quinta).
    //  - esporadico/individual: o ultimo dia com evento do grupo.
    const dueDate = grupo.tipo === "fixo" ? fimSemanaSegSex(datas[0]) : maxEvento

    // Dia "representante" que se torna pendencia quando vencido.
    //  - fixo: a sexta, se houver evento nela; senao, apenas depois da semana encerrada
    //    (hoje > sexta) usamos o ultimo evento p/ nao esconder relatorio faltante.
    //    Enquanto a semana nao encerra e nao ha evento na sexta, nao ha dia de cobranca ainda.
    //  - esporadico/individual: o ultimo dia com evento.
    let dueDayDate: string | null
    if (grupo.tipo === "fixo") {
      const temEventoNaSexta = datas.some((d) => d === dueDate)
      if (temEventoNaSexta) {
        dueDayDate = dueDate
      } else if (hojeStr > dueDate) {
        dueDayDate = maxEvento
      } else {
        dueDayDate = null
      }
    } else {
      dueDayDate = dueDate
    }

    for (const e of grupo.eventos) {
      let status: StatusGrupo
      const isDueDay = dueDayDate !== null && e.data === dueDayDate
      if (hasReport) {
        status = "ok"
      } else if (!isDueDay) {
        status = "agrupado"
      } else {
        status = hojeStr >= dueDate ? "pendente" : "aguardando"
      }
      resultado.set(e.id, {
        status,
        grupoKey,
        grupoTipo: grupo.tipo,
        dueDate,
        isDueDay,
        tamanhoGrupo: grupo.eventos.length,
      })
    }
  })

  return resultado
}
