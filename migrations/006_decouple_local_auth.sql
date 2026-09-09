-- Desvinculacao de credenciais e autenticacao local do Sisgar.
-- O Sisgar opera 100% via SSO do RaroNexus. Senhas locais e tabelas de autenticacao legadas nao sao mais utilizadas.

-- 1. Torna a senha opcional e remove a coluna de senha local da tabela usuarios
ALTER TABLE "public"."usuarios" ALTER COLUMN "senha_hash" DROP NOT NULL;
ALTER TABLE "public"."usuarios" DROP COLUMN IF EXISTS "senha_hash";

-- 2. Limpeza de tabelas legadas do Better-Auth/NextAuth nao utilizadas pelo Sisgar
DROP TABLE IF EXISTS "public"."account" CASCADE;
DROP TABLE IF EXISTS "public"."session" CASCADE;
DROP TABLE IF EXISTS "public"."user" CASCADE;
DROP TABLE IF EXISTS "public"."verification" CASCADE;
DROP TABLE IF EXISTS "public"."invitation" CASCADE;
DROP TABLE IF EXISTS "public"."member" CASCADE;
DROP TABLE IF EXISTS "public"."organization" CASCADE;
DROP TABLE IF EXISTS "public"."jwks" CASCADE;

