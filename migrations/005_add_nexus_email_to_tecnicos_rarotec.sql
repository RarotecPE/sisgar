-- Permite vincular um técnico local do Sisgar a um e-mail diferente no RaroNexus.
-- Quando vazio, o Sisgar continua usando tecnicos_rarotec.email como fallback de vinculacao.

ALTER TABLE "public"."tecnicos_rarotec"
ADD COLUMN IF NOT EXISTS "nexus_email" varchar(255);

CREATE UNIQUE INDEX IF NOT EXISTS "tecnicos_rarotec_nexus_email_unique"
ON "public"."tecnicos_rarotec" (LOWER("nexus_email"))
WHERE "nexus_email" IS NOT NULL AND BTRIM("nexus_email") <> '';

