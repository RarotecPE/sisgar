-- Migration 004: Atualiza o cargo para 'Inativo' em usuários e técnicos inativos
-- Garante que qualquer registro desativado ou não autorizado pelo RaroNexus tenha cargo 'Inativo'

UPDATE "public"."usuarios"
SET "cargo" = 'Inativo',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "ativo" = false;

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Inativo',
    "cargos" = ARRAY['Inativo']::text[],
    "updated_at" = CURRENT_TIMESTAMP
WHERE "ativo" = false;

