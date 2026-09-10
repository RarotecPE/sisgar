import { sql } from "@/lib/db"

export function normalizarCompetencia(ano: number, mes: number): string {
  if (!Number.isInteger(ano) || ano < 2020 || ano > 2100) {
    throw new Error("Ano inválido")
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error("Mês inválido")
  }
  return `${ano}-${String(mes).padStart(2, "0")}-01`
}

/**
 * Cria os checklists pendentes e congela o texto dos itens para a competência.
 * Alterações futuras no modelo não modificam meses que já foram gerados.
 */
export async function garantirExecucoesChecklist(
  competencia: string,
  tecnicoId: number | null = null,
) {
  await sql`
    INSERT INTO checklist_execucoes (
      responsabilidade_id,
      competencia,
      tecnico_rarotec_id
    )
    SELECT
      r.id,
      ${competencia}::date,
      r.tecnico_rarotec_id
    FROM responsaveis_modulos r
    JOIN clientes c ON c.id = r.cliente_id AND c.ativo = true
    JOIN tecnicos_rarotec t ON t.id = r.tecnico_rarotec_id AND t.ativo = true
    WHERE r.ativo = true
      AND r.nao_aplicavel = false
      AND (${tecnicoId}::integer IS NULL OR r.tecnico_rarotec_id = ${tecnicoId})
    ON CONFLICT (responsabilidade_id, competencia) DO NOTHING
  `

  await sql`
    INSERT INTO checklist_execucao_itens (
      execucao_id,
      modelo_item_id,
      titulo,
      descricao,
      modulo,
      ordem,
      obrigatorio,
      exige_observacao_negativa
    )
    SELECT
      e.id,
      m.id,
      m.titulo,
      m.descricao,
      m.modulo,
      m.ordem,
      m.obrigatorio,
      m.exige_observacao_negativa
    FROM checklist_execucoes e
    JOIN responsaveis_modulos r ON r.id = e.responsabilidade_id
    JOIN checklist_modelos_itens m
      ON m.ativo = true
      AND (m.modulo IS NULL OR LOWER(m.modulo) = LOWER(r.modulo))
      AND m.created_at <= e.created_at
    WHERE e.competencia = ${competencia}::date
      AND (${tecnicoId}::integer IS NULL OR e.tecnico_rarotec_id = ${tecnicoId})
    ON CONFLICT (execucao_id, modelo_item_id) DO NOTHING
  `
}

export async function recalcularStatusExecucao(execucaoId: number) {
  await sql`
    UPDATE checklist_execucoes e
    SET
      status = resumo.novo_status,
      finalizado_at = CASE
        WHEN resumo.novo_status = 'concluido' THEN COALESCE(e.finalizado_at, NOW())
        ELSE NULL
      END,
      updated_at = NOW()
    FROM (
      SELECT
        execucao_id,
        CASE
          WHEN COUNT(*) FILTER (WHERE status = 'pendente') = COUNT(*) THEN 'pendente'
          WHEN COUNT(*) FILTER (WHERE status = 'pendente' AND obrigatorio = true) > 0 THEN 'em_andamento'
          ELSE 'concluido'
        END AS novo_status
      FROM checklist_execucao_itens
      WHERE execucao_id = ${execucaoId}
      GROUP BY execucao_id
    ) resumo
    WHERE e.id = resumo.execucao_id
  `
}

export async function podeAcessarExecucao(
  execucaoId: number,
  tecnicoId: number | null,
  gestor: boolean,
): Promise<boolean> {
  if (gestor) return true
  if (!tecnicoId) return false

  const rows = await sql`
    SELECT 1
    FROM checklist_execucoes
    WHERE id = ${execucaoId}
      AND tecnico_rarotec_id = ${tecnicoId}
    LIMIT 1
  `
  return rows.length > 0
}
