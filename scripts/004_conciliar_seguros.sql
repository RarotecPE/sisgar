-- 004_conciliar_seguros.sql
-- Conciliação automática APENAS dos pendentes 100% seguros:
-- cliente e módulo já resolvidos e faltando somente o funcionário responsável,
-- que é definido por correspondência ÚNICA de primeiro nome em tecnicos_rarotec.
-- Idempotente: reexecutar não duplica vínculos nem reprocessa importados.
BEGIN;

-- 1) Define o técnico quando o primeiro nome da planilha casa com exatamente 1 cadastro ativo.
UPDATE responsaveis_importacao ri
SET
  tecnico_rarotec_id = (
    SELECT MIN(t.id)
    FROM tecnicos_rarotec t
    WHERE t.ativo = true
      AND sisgar_normalizar(t.nome) LIKE
          sisgar_normalizar(SPLIT_PART(TRIM(ri.responsavel_origem), ' ', 1)) || '%'
    HAVING COUNT(*) = 1
  ),
  updated_at = NOW()
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NOT NULL
  AND ri.modulo_destino IS NOT NULL
  AND ri.tecnico_rarotec_id IS NULL
  AND ri.responsavel_origem IS NOT NULL
  AND TRIM(ri.responsavel_origem) <> '';

-- 2) Cria o vínculo definitivo para as linhas agora completas (sem duplicar).
INSERT INTO responsaveis_modulos (
  cliente_id, modulo, orgao_id, tecnico_rarotec_id, observacoes
)
SELECT
  ri.cliente_id,
  ri.modulo_destino,
  ri.orgao_id,
  ri.tecnico_rarotec_id,
  'Conciliação automática segura (primeiro nome único) da carga inicial'
FROM responsaveis_importacao ri
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NOT NULL
  AND ri.modulo_destino IS NOT NULL
  AND ri.tecnico_rarotec_id IS NOT NULL
  -- Nunca resolver automaticamente conflitos da planilha (mesmo cliente/módulo/abrangência
  -- com responsáveis diferentes) — esses ficam para decisão manual na tela de conciliação.
  AND NOT EXISTS (
    SELECT 1 FROM responsaveis_importacao outro
    WHERE outro.id <> ri.id
      AND outro.status = 'pendente'
      AND outro.cliente_id = ri.cliente_id
      AND outro.modulo_destino = ri.modulo_destino
      AND outro.orgao_id IS NOT DISTINCT FROM ri.orgao_id
      AND outro.tecnico_rarotec_id IS DISTINCT FROM ri.tecnico_rarotec_id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM responsaveis_modulos r
    WHERE r.ativo = true
      AND r.cliente_id = ri.cliente_id
      AND LOWER(r.modulo) = LOWER(ri.modulo_destino)
      AND r.orgao_id IS NOT DISTINCT FROM ri.orgao_id
  );

-- 3) Marca como importado o que passou a ter vínculo ativo correspondente.
UPDATE responsaveis_importacao ri
SET status = 'importado', observacao = NULL, updated_at = NOW()
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NOT NULL
  AND ri.modulo_destino IS NOT NULL
  AND ri.tecnico_rarotec_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM responsaveis_importacao outro
    WHERE outro.id <> ri.id
      AND outro.status = 'pendente'
      AND outro.cliente_id = ri.cliente_id
      AND outro.modulo_destino = ri.modulo_destino
      AND outro.orgao_id IS NOT DISTINCT FROM ri.orgao_id
      AND outro.tecnico_rarotec_id IS DISTINCT FROM ri.tecnico_rarotec_id
  )
  AND EXISTS (
    SELECT 1
    FROM responsaveis_modulos r
    WHERE r.ativo = true
      AND r.cliente_id = ri.cliente_id
      AND LOWER(r.modulo) = LOWER(ri.modulo_destino)
      AND r.orgao_id IS NOT DISTINCT FROM ri.orgao_id
  );

COMMIT;
