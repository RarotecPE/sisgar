import { NextResponse } from "next/server"
import { getSession, resolveTecnicoRarotecId } from "@/lib/auth"
import { sql } from "@/lib/db"
import { isGestor } from "@/lib/permissions"
import { normalizarCompetencia } from "@/lib/responsabilidades"

// Avisos de checklist para o dashboard, escopados pela sessão:
// técnico vê apenas os módulos sob sua responsabilidade; gestor vê o consolidado.
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const gestor = isGestor(user.nome, user.cargo)
  const tecnicoId = gestor ? null : await resolveTecnicoRarotecId(user)

  // Sem vínculo de técnico e sem ser gestor: nada a mostrar.
  if (!gestor && !tecnicoId) {
    return NextResponse.json({
      gestor: false,
      competencia_atual: null,
      resumo: { vencidas: 0, mes_atual: 0, sem_observacao: 0, pendencia_externa: 0 },
      vencidas: [],
    })
  }

  const hoje = new Date()
  const competenciaAtual = normalizarCompetencia(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1)

  // Uma linha por execução com pendências, classificando cada tipo de alerta.
  // - vencidas: execução de competência anterior à atual com itens obrigatórios pendentes
  // - mes_atual: execução da competência atual com itens obrigatórios pendentes
  // - sem_observacao: itens "não atendido" que exigem observação e estão sem ela
  // - pendencia_externa: itens aguardando terceiros
  const linhas = await sql`
    SELECT
      e.id AS execucao_id,
      TO_CHAR(e.competencia, 'YYYY-MM') AS competencia,
      e.competencia < ${competenciaAtual}::date AS vencida,
      COALESCE(c.nome_fantasia, c.razao_social) AS cliente_nome,
      c.cidade AS cliente_cidade,
      c.estado AS cliente_estado,
      r.modulo,
      t.nome AS tecnico_nome,
      COUNT(*) FILTER (WHERE i.obrigatorio AND i.status = 'pendente') AS pendentes,
      COUNT(*) FILTER (WHERE i.status = 'nao_atendido' AND i.exige_observacao_negativa AND (i.observacao IS NULL OR btrim(i.observacao) = '')) AS sem_observacao,
      COUNT(*) FILTER (WHERE i.status = 'pendencia_externa') AS pendencia_externa
    FROM checklist_execucoes e
    JOIN responsaveis_modulos r ON r.id = e.responsabilidade_id
    JOIN clientes c ON c.id = r.cliente_id
    LEFT JOIN tecnicos_rarotec t ON t.id = e.tecnico_rarotec_id
    JOIN checklist_execucao_itens i ON i.execucao_id = e.id
    WHERE r.ativo = true
      AND r.nao_aplicavel = false
      AND (${tecnicoId}::integer IS NULL OR e.tecnico_rarotec_id = ${tecnicoId})
    GROUP BY e.id, e.competencia, c.id, r.modulo, t.nome
    HAVING
      COUNT(*) FILTER (WHERE i.obrigatorio AND i.status = 'pendente') > 0
      OR COUNT(*) FILTER (WHERE i.status = 'nao_atendido' AND i.exige_observacao_negativa AND (i.observacao IS NULL OR btrim(i.observacao) = '')) > 0
      OR COUNT(*) FILTER (WHERE i.status = 'pendencia_externa') > 0
    ORDER BY e.competencia ASC, COALESCE(c.nome_fantasia, c.razao_social)
  `

  const items = linhas.map((linha) => ({
    execucao_id: Number(linha.execucao_id),
    competencia: linha.competencia as string,
    vencida: Boolean(linha.vencida),
    cliente_nome: linha.cliente_nome as string,
    cliente_cidade: linha.cliente_cidade as string | null,
    cliente_estado: linha.cliente_estado as string | null,
    modulo: linha.modulo as string,
    tecnico_nome: (linha.tecnico_nome as string | null) ?? "Sem responsável",
    pendentes: Number(linha.pendentes),
    sem_observacao: Number(linha.sem_observacao),
    pendencia_externa: Number(linha.pendencia_externa),
  }))

  const resumo = {
    vencidas: items.filter((item) => item.vencida && item.pendentes > 0).length,
    mes_atual: items.filter((item) => !item.vencida && item.pendentes > 0).length,
    sem_observacao: items.reduce((total, item) => total + item.sem_observacao, 0),
    pendencia_externa: items.reduce((total, item) => total + item.pendencia_externa, 0),
  }

  return NextResponse.json({
    gestor,
    competencia_atual: competenciaAtual,
    resumo,
    // Lista detalhada das vencidas para o banner persistente e o card do dashboard.
    vencidas: items.filter((item) => item.vencida && item.pendentes > 0),
    externas: items.filter((item) => item.pendencia_externa > 0),
  })
}
