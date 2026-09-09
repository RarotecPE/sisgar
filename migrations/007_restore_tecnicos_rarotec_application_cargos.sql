-- Migration 007: Restaura cargos da aplicação para técnicos da Rarotec
-- O cargo de técnicos pertence ao Sisgar (aplicação), enquanto o RaroNexus controla autenticação/ativo.

-- Atualizar cargos específicos da aplicação conforme registros históricos
UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Analista de Sistemas', "cargos" = ARRAY['Analista de Sistemas']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'helena@rarotec.com.br';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Coordenadora', "cargos" = ARRAY['Coordenadora']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'mikaellybrandao@rarotec.com.br';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Diretoria', "cargos" = ARRAY['Diretoria']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'rafaelle@rarotec.com.br';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Diretoria', "cargos" = ARRAY['Diretoria']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'comercial@rarotec.com.br';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Coordenação', "cargos" = ARRAY['Coordenação', 'Estagiário']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'rodrigosouza.souzabarbosa1@gmail.com';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Financeiro', "cargos" = ARRAY['Financeiro']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'financeiro@rarotec.com.br';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Administrador', "cargos" = ARRAY['Administrador']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'admin@rarotec.com.br' OR LOWER("email") = 'admin.homolog@rarotec.com';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Estagiário', "cargos" = ARRAY['Estagiário']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'mendesf84@gmail.com';

UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Analista de Sistemas', "cargos" = ARRAY['Analista de Sistemas']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE LOWER("email") = 'ewerton@rarotec.com.br';

-- Para demais técnicos que ficaram com 'Inativo' ou vazios, atribuir 'Funcionário' como cargo padrão da aplicação
UPDATE "public"."tecnicos_rarotec"
SET "cargo" = 'Funcionário', "cargos" = ARRAY['Funcionário']::text[], "updated_at" = CURRENT_TIMESTAMP
WHERE "cargo" = 'Inativo' OR "cargo" IS NULL OR "cargos" = ARRAY['Inativo']::text[];

