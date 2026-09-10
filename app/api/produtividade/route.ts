import { NextRequest, NextResponse } from "next/server"
import { getSession, resolveTecnicoRarotecId } from "@/lib/auth"
import { sql } from "@/lib/db"
import { isGestor } from "@/lib/permissions"
import { garantirExecucoesChecklist, normalizarCompetencia } from "@/lib/responsabilidades"

function numeroOuNull(value: string | null): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

// Converte "YYYY-MM" (ou "YYYY-MM-DD") na competência normalizada (1º dia do mês).
function competenciaDeYYYYMM(value: string): string {
  const [ano, mes] = value.split("-").map(Number)
  return normalizarCompetencia(ano, mes)
}

export async function GET(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const hoje = new Date()
  const inicioParam = request.nextUrl.searchParams.get("inicio")
  const fimParam = request.nextUrl.searchParams.get("fim")
  let compInicio: string
  let compFim: string
  try {
    if (inicioParam && fimParam) {
      // Modo período: intervalo de competências (inclusive).
      compInicio = competenciaDeYYYYMM(inicioParam)
      compFim = competenciaDeYYYYMM(fimParam)
      if (compInicio > compFim) [compInicio, compFim] = [compFim, compInicio]
    } else {
      const ano = Number(request.nextUrl.searchParams.get("ano") || hoje.getUTCFullYear())
      const mes = Number(request.nextUrl.searchParams.get("mes") || hoje.getUTCMonth() + 1)
      compInicio = normalizarCompetencia(ano, mes)
      compFim = compInicio
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Competência inválida" }, { status: 400 })
  }

  const gestor = isGestor(user.nome, user.cargo)
  const tecnicoLogadoId = await resolveTecnicoRarotecId(user)
  const tecnicoId = gestor ? numeroOuNull(request.nextUrl.searchParams.get("tecnico_id")) : tecnicoLogadoId
  if (!gestor && !tecnicoId) return NextResponse.json({ gestor: false, resumo: {}, tecnicos: [], clientes: [], modulos: [] })

  const clienteId = numeroOuNull(request.nextUrl.searchParams.get("cliente_id"))
  const modulo = request.nextUrl.searchParams.get("modulo")?.trim() || null
  const municipio = request.nextUrl.searchParams.get("municipio")?.trim() || null
  const competenciaAtual = normalizarCompetencia(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1)
  // Garante as execuções do mês corrente quando ele estiver dentro do intervalo pedido.
  if (competenciaAtual >= compInicio && competenciaAtual <= compFim) {
    await garantirExecucoesChecklist(competenciaAtual, tecnicoId)
  }

  const base = await sql`
    SELECT
      e.id AS execucao_id,
      e.status AS execucao_status,
      e.tecnico_rarotec_id,
      t.nome AS tecnico_nome,
      r.cliente_id,
      COALESCE(c.nome_fantasia, c.razao_social) AS cliente_nome,
      c.cidade AS cliente_cidade,
      c.estado AS cliente_estado,
      r.modulo,
      i.status AS item_status,
      i.obrigatorio AS item_obrigatorio
    FROM checklist_execucoes e
    JOIN responsaveis_modulos r ON r.id = e.responsabilidade_id
    JOIN tecnicos_rarotec t ON t.id = e.tecnico_rarotec_id
    JOIN clientes c ON c.id = r.cliente_id
    JOIN checklist_execucao_itens i ON i.execucao_id = e.id
    WHERE e.competencia BETWEEN ${compInicio}::date AND ${compFim}::date
      AND r.nao_aplicavel = false
      AND (${gestor}::boolean OR e.tecnico_rarotec_id = ${tecnicoLogadoId})
      AND (${tecnicoId}::integer IS NULL OR e.tecnico_rarotec_id = ${tecnicoId})
      AND (${clienteId}::integer IS NULL OR r.cliente_id = ${clienteId})
      AND (${modulo}::text IS NULL OR LOWER(r.modulo) = LOWER(${modulo}))
      AND (${municipio}::text IS NULL OR c.cidade = ${municipio})
  `

  type Linha = {
    execucao_id: number
    execucao_status: string
    tecnico_rarotec_id: number
    tecnico_nome: string
    cliente_id: number
    cliente_nome: string
    cliente_cidade: string | null
    cliente_estado: string | null
    modulo: string
    item_status: string
    item_obrigatorio: boolean
  }
  const linhas = base as Linha[]

  function agregar(chave: (linha: Linha) => string, rotulo: (linha: Linha) => Record<string, unknown>) {
    const grupos = new Map<string, Record<string, unknown> & {
      atendidos: number; nao_atendidos: number; pendentes: number; nao_se_aplica: number; pendencia_externa: number; execucoes: Set<number>; concluidas: Set<number>
    }>()
    for (const linha of linhas) {
      const key = chave(linha)
      const atual = grupos.get(key) || {
        ...rotulo(linha), atendidos: 0, nao_atendidos: 0, pendentes: 0, nao_se_aplica: 0, pendencia_externa: 0,
        execucoes: new Set<number>(), concluidas: new Set<number>(),
      }
      atual.execucoes.add(Number(linha.execucao_id))
      if (linha.execucao_status === "concluido") atual.concluidas.add(Number(linha.execucao_id))
      // Nota: "pendencia_externa" fica de fora dos contadores que compõem "aplicaveis",
      // portanto não penaliza o índice de produtividade (é registrada em coluna própria).
      if (linha.item_status === "atendido") atual.atendidos += 1
      else if (linha.item_status === "nao_atendido") atual.nao_atendidos += 1
      else if (linha.item_status === "nao_se_aplica") atual.nao_se_aplica += 1
      else if (linha.item_status === "pendencia_externa") atual.pendencia_externa += 1
      else if (linha.item_obrigatorio) atual.pendentes += 1
      grupos.set(key, atual)
    }
    return [...grupos.values()].map((grupo) => {
      const aplicaveis = grupo.atendidos + grupo.nao_atendidos + grupo.pendentes
      return {
        ...grupo,
        execucoes: grupo.execucoes.size,
        concluidas: grupo.concluidas.size,
        produtividade: aplicaveis > 0 ? Math.round((grupo.atendidos / aplicaveis) * 1000) / 10 : 0,
      }
    }).sort((a, b) => Number(b.produtividade) - Number(a.produtividade))
  }

  const resumoLista = agregar(() => "geral", () => ({}))
  const resumo = resumoLista[0] || {
    atendidos: 0, nao_atendidos: 0, pendentes: 0, nao_se_aplica: 0, pendencia_externa: 0,
    execucoes: 0, concluidas: 0, produtividade: 0,
  }

  // Municípios distintos presentes nas execuções (para o filtro na tela).
  const municipios = Array.from(
    new Map(
      linhas
        .filter((l) => l.cliente_cidade)
        .map((l) => [l.cliente_cidade as string, [l.cliente_cidade, l.cliente_estado].filter(Boolean).join(" - ")]),
    ),
    ([value, label]) => ({ value, label }),
  ).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))

  return NextResponse.json({
    gestor,
    competencia: compInicio,
    inicio: compInicio,
    fim: compFim,
    resumo,
    municipios,
    tecnicos: agregar((l) => String(l.tecnico_rarotec_id), (l) => ({ id: l.tecnico_rarotec_id, nome: l.tecnico_nome })),
    clientes: agregar((l) => String(l.cliente_id), (l) => ({ id: l.cliente_id, nome: l.cliente_nome })),
    modulos: agregar((l) => l.modulo, (l) => ({ nome: l.modulo })),
  })
}
