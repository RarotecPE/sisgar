-- Permite vincular um usuario local do Sisgar a um e-mail diferente no RaroNexus.
-- Quando vazio, o Sisgar continua usando usuarios.email como fallback de vinculacao.

ALTER TABLE "public"."usuarios"
ADD COLUMN IF NOT EXISTS "nexus_email" varchar(255);

CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_nexus_email_unique"
ON "public"."usuarios" (LOWER("nexus_email"))
WHERE "nexus_email" IS NOT NULL AND BTRIM("nexus_email") <> '';