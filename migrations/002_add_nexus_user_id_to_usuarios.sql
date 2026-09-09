-- Vincula usuarios locais do Sisgar aos usuarios do RaroNexus.
-- Aplicar somente depois da baseline 001 em bancos novos.

ALTER TABLE "public"."usuarios"
ADD COLUMN IF NOT EXISTS "nexus_user_id" uuid;

CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_nexus_user_id_unique"
ON "public"."usuarios" ("nexus_user_id")
WHERE "nexus_user_id" IS NOT NULL;