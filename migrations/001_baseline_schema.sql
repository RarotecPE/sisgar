/*
 Navicat Premium Dump SQL

 Source Server         : Rarotec_postgres
 Source Server Type    : PostgreSQL
 Source Server Version : 150018 (150018)
 Source Host           : 108.61.158.43:5432
 Source Catalog        : sisgar_homolog
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 150018 (150018)
 File Encoding         : 65001

 Date: 09/09/2026 15:33:43
*/


-- ----------------------------
-- Sequence structure for aditivos_contrato_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."aditivos_contrato_id_seq";
CREATE SEQUENCE "public"."aditivos_contrato_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for agenda_abonos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."agenda_abonos_id_seq";
CREATE SEQUENCE "public"."agenda_abonos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for agenda_solicitacoes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."agenda_solicitacoes_id_seq";
CREATE SEQUENCE "public"."agenda_solicitacoes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for agenda_trabalhista_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."agenda_trabalhista_id_seq";
CREATE SEQUENCE "public"."agenda_trabalhista_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for apuracao_modelos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."apuracao_modelos_id_seq";
CREATE SEQUENCE "public"."apuracao_modelos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for apuracao_relatorios_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."apuracao_relatorios_id_seq";
CREATE SEQUENCE "public"."apuracao_relatorios_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for clientes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."clientes_id_seq";
CREATE SEQUENCE "public"."clientes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for clientes_modulos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."clientes_modulos_id_seq";
CREATE SEQUENCE "public"."clientes_modulos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for contratos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."contratos_id_seq";
CREATE SEQUENCE "public"."contratos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for departamentos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."departamentos_id_seq";
CREATE SEQUENCE "public"."departamentos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for documentos_institucionais_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."documentos_institucionais_id_seq";
CREATE SEQUENCE "public"."documentos_institucionais_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for documentos_institucionais_notas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."documentos_institucionais_notas_id_seq";
CREATE SEQUENCE "public"."documentos_institucionais_notas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for documentos_medicos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."documentos_medicos_id_seq";
CREATE SEQUENCE "public"."documentos_medicos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for documentos_medicos_mensagens_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."documentos_medicos_mensagens_id_seq";
CREATE SEQUENCE "public"."documentos_medicos_mensagens_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for orgaos_cliente_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."orgaos_cliente_id_seq";
CREATE SEQUENCE "public"."orgaos_cliente_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for orgaos_modulos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."orgaos_modulos_id_seq";
CREATE SEQUENCE "public"."orgaos_modulos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ouve_anexos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ouve_anexos_id_seq";
CREATE SEQUENCE "public"."ouve_anexos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ouve_manifestacoes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ouve_manifestacoes_id_seq";
CREATE SEQUENCE "public"."ouve_manifestacoes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ouve_respostas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ouve_respostas_id_seq";
CREATE SEQUENCE "public"."ouve_respostas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for pesquisas_satisfacao_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."pesquisas_satisfacao_id_seq";
CREATE SEQUENCE "public"."pesquisas_satisfacao_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for relatorios_anexos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."relatorios_anexos_id_seq";
CREATE SEQUENCE "public"."relatorios_anexos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for relatorios_visitas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."relatorios_visitas_id_seq";
CREATE SEQUENCE "public"."relatorios_visitas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tecnico_clientes_fixos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tecnico_clientes_fixos_id_seq";
CREATE SEQUENCE "public"."tecnico_clientes_fixos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tecnicos_clientes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tecnicos_clientes_id_seq";
CREATE SEQUENCE "public"."tecnicos_clientes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tecnicos_rarotec_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tecnicos_rarotec_id_seq";
CREATE SEQUENCE "public"."tecnicos_rarotec_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for temas_relatorio_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."temas_relatorio_id_seq";
CREATE SEQUENCE "public"."temas_relatorio_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for usuarios_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."usuarios_id_seq";
CREATE SEQUENCE "public"."usuarios_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS "public"."account";
CREATE TABLE "public"."account" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "accountId" text COLLATE "pg_catalog"."default" NOT NULL,
  "providerId" text COLLATE "pg_catalog"."default" NOT NULL,
  "userId" uuid NOT NULL,
  "accessToken" text COLLATE "pg_catalog"."default",
  "refreshToken" text COLLATE "pg_catalog"."default",
  "idToken" text COLLATE "pg_catalog"."default",
  "accessTokenExpiresAt" timestamptz(6),
  "refreshTokenExpiresAt" timestamptz(6),
  "scope" text COLLATE "pg_catalog"."default",
  "password" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz(6) NOT NULL
)
;

-- ----------------------------
-- Table structure for aditivos_contrato
-- ----------------------------
DROP TABLE IF EXISTS "public"."aditivos_contrato";
CREATE TABLE "public"."aditivos_contrato" (
  "id" int4 NOT NULL DEFAULT nextval('aditivos_contrato_id_seq'::regclass),
  "contrato_id" int4,
  "numero_aditivo" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "data_aditivo" date NOT NULL,
  "descricao" text COLLATE "pg_catalog"."default",
  "valor_adicional" numeric(10,2),
  "arquivo_url" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for agenda_abonos
-- ----------------------------
DROP TABLE IF EXISTS "public"."agenda_abonos";
CREATE TABLE "public"."agenda_abonos" (
  "id" int4 NOT NULL DEFAULT nextval('agenda_abonos_id_seq'::regclass),
  "agenda_evento_id" int4 NOT NULL,
  "tecnico_id" int4 NOT NULL,
  "motivo" text COLLATE "pg_catalog"."default" NOT NULL,
  "abonado_por" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for agenda_solicitacoes
-- ----------------------------
DROP TABLE IF EXISTS "public"."agenda_solicitacoes";
CREATE TABLE "public"."agenda_solicitacoes" (
  "id" int4 NOT NULL DEFAULT nextval('agenda_solicitacoes_id_seq'::regclass),
  "agenda_evento_id" int4,
  "tecnico_solicitante_id" int4 NOT NULL,
  "tipo_solicitacao" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "descricao" text COLLATE "pg_catalog"."default",
  "dados_alteracao" jsonb,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'pendente'::character varying,
  "aprovado_por" int4,
  "data_aprovacao" timestamptz(6),
  "motivo_rejeicao" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for agenda_trabalhista
-- ----------------------------
DROP TABLE IF EXISTS "public"."agenda_trabalhista";
CREATE TABLE "public"."agenda_trabalhista" (
  "id" int4 NOT NULL DEFAULT nextval('agenda_trabalhista_id_seq'::regclass),
  "tecnico_rarotec_id" int4,
  "cliente_id" int4,
  "titulo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "descricao" text COLLATE "pg_catalog"."default",
  "data_inicio" timestamp(6) NOT NULL,
  "data_fim" timestamp(6),
  "tipo" varchar(50) COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'agendado'::character varying,
  "local" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "relatorio_grupo_id" varchar(40) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for app_config
-- ----------------------------
DROP TABLE IF EXISTS "public"."app_config";
CREATE TABLE "public"."app_config" (
  "chave" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "valor" text COLLATE "pg_catalog"."default",
  "updated_at" timestamptz(6) DEFAULT now(),
  "updated_by" int4
)
;

-- ----------------------------
-- Table structure for apuracao_modelos
-- ----------------------------
DROP TABLE IF EXISTS "public"."apuracao_modelos";
CREATE TABLE "public"."apuracao_modelos" (
  "id" int4 NOT NULL DEFAULT nextval('apuracao_modelos_id_seq'::regclass),
  "cliente_id" int4,
  "contrato_id" int4,
  "nome" text COLLATE "pg_catalog"."default" NOT NULL,
  "sigla_orgao" text COLLATE "pg_catalog"."default",
  "numero_contrato_texto" text COLLATE "pg_catalog"."default",
  "destinatario_nome" text COLLATE "pg_catalog"."default",
  "destinatario_cargo" text COLLATE "pg_catalog"."default",
  "itens" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "modo_valor" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'global'::text,
  "valor_global" numeric(14,2),
  "texto_padrao" text COLLATE "pg_catalog"."default",
  "observacoes_padrao" text COLLATE "pg_catalog"."default",
  "modalidade_remoto" bool NOT NULL DEFAULT true,
  "modalidade_presencial" bool NOT NULL DEFAULT false,
  "ultimo_numero" int4 NOT NULL DEFAULT 0,
  "ativo" bool NOT NULL DEFAULT true,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "municipio" text COLLATE "pg_catalog"."default",
  "cliente_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "itens_servico" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "emissao_automatica" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Table structure for apuracao_relatorios
-- ----------------------------
DROP TABLE IF EXISTS "public"."apuracao_relatorios";
CREATE TABLE "public"."apuracao_relatorios" (
  "id" int4 NOT NULL DEFAULT nextval('apuracao_relatorios_id_seq'::regclass),
  "modelo_id" int4,
  "cliente_id" int4,
  "numero" int4 NOT NULL,
  "numero_texto" text COLLATE "pg_catalog"."default",
  "competencia" text COLLATE "pg_catalog"."default" NOT NULL,
  "exercicio" int4 NOT NULL,
  "data_emissao" date NOT NULL DEFAULT CURRENT_DATE,
  "sigla_orgao" text COLLATE "pg_catalog"."default",
  "numero_contrato_texto" text COLLATE "pg_catalog"."default",
  "destinatario_nome" text COLLATE "pg_catalog"."default",
  "destinatario_cargo" text COLLATE "pg_catalog"."default",
  "itens" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "modo_valor" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'global'::text,
  "valor_global" numeric(14,2),
  "valor_total" numeric(14,2),
  "texto" text COLLATE "pg_catalog"."default",
  "observacoes" text COLLATE "pg_catalog"."default",
  "modalidade_remoto" bool NOT NULL DEFAULT true,
  "modalidade_presencial" bool NOT NULL DEFAULT false,
  "origem" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'padrao'::text,
  "visitas_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "imagens" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "anexos_pdf" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'rascunho'::text,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "municipio" text COLLATE "pg_catalog"."default",
  "cliente_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "itens_servico" jsonb NOT NULL DEFAULT '[]'::jsonb
)
;

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS "public"."clientes";
CREATE TABLE "public"."clientes" (
  "id" int4 NOT NULL DEFAULT nextval('clientes_id_seq'::regclass),
  "razao_social" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nome_fantasia" varchar(255) COLLATE "pg_catalog"."default",
  "cnpj" varchar(18) COLLATE "pg_catalog"."default",
  "inscricao_estadual" varchar(20) COLLATE "pg_catalog"."default",
  "endereco" text COLLATE "pg_catalog"."default",
  "cidade" varchar(100) COLLATE "pg_catalog"."default",
  "estado" varchar(2) COLLATE "pg_catalog"."default",
  "cep" varchar(10) COLLATE "pg_catalog"."default",
  "telefone" varchar(20) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "website" varchar(255) COLLATE "pg_catalog"."default",
  "logo_url" text COLLATE "pg_catalog"."default",
  "observacoes" text COLLATE "pg_catalog"."default",
  "ativo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for clientes_modulos
-- ----------------------------
DROP TABLE IF EXISTS "public"."clientes_modulos";
CREATE TABLE "public"."clientes_modulos" (
  "id" int4 NOT NULL DEFAULT nextval('clientes_modulos_id_seq'::regclass),
  "cliente_id" int4 NOT NULL,
  "modulo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "adicionado_por" int4,
  "adicionado_por_nome" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for contratos
-- ----------------------------
DROP TABLE IF EXISTS "public"."contratos";
CREATE TABLE "public"."contratos" (
  "id" int4 NOT NULL DEFAULT nextval('contratos_id_seq'::regclass),
  "cliente_id" int4,
  "numero_contrato" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "data_inicio" date NOT NULL,
  "data_fim" date,
  "valor_total" numeric(10,2),
  "descricao" text COLLATE "pg_catalog"."default",
  "arquivo_url" text COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'ativo'::character varying,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "orgao_id" int4
)
;

-- ----------------------------
-- Table structure for departamentos
-- ----------------------------
DROP TABLE IF EXISTS "public"."departamentos";
CREATE TABLE "public"."departamentos" (
  "id" int4 NOT NULL DEFAULT nextval('departamentos_id_seq'::regclass),
  "nome" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for documentos_institucionais
-- ----------------------------
DROP TABLE IF EXISTS "public"."documentos_institucionais";
CREATE TABLE "public"."documentos_institucionais" (
  "id" int4 NOT NULL DEFAULT nextval('documentos_institucionais_id_seq'::regclass),
  "categoria" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "titulo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "descricao" text COLLATE "pg_catalog"."default",
  "blob_pathname" text COLLATE "pg_catalog"."default",
  "nome_arquivo" varchar(255) COLLATE "pg_catalog"."default",
  "tipo_arquivo" varchar(100) COLLATE "pg_catalog"."default",
  "tamanho" int4,
  "setor" varchar(255) COLLATE "pg_catalog"."default",
  "usuario_alvo_id" int4,
  "usuario_alvo_nome" varchar(255) COLLATE "pg_catalog"."default",
  "data_documento" date,
  "created_by" int4,
  "created_by_nome" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for documentos_institucionais_notas
-- ----------------------------
DROP TABLE IF EXISTS "public"."documentos_institucionais_notas";
CREATE TABLE "public"."documentos_institucionais_notas" (
  "id" int4 NOT NULL DEFAULT nextval('documentos_institucionais_notas_id_seq'::regclass),
  "documento_id" int4 NOT NULL,
  "autor_id" int4,
  "autor_nome" varchar(255) COLLATE "pg_catalog"."default",
  "nota" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for documentos_medicos
-- ----------------------------
DROP TABLE IF EXISTS "public"."documentos_medicos";
CREATE TABLE "public"."documentos_medicos" (
  "id" int4 NOT NULL DEFAULT nextval('documentos_medicos_id_seq'::regclass),
  "tecnico_rarotec_id" int4 NOT NULL,
  "tipo" varchar(40) COLLATE "pg_catalog"."default" NOT NULL,
  "data_inicio" date NOT NULL,
  "data_fim" date NOT NULL,
  "descricao" text COLLATE "pg_catalog"."default",
  "blob_pathname" text COLLATE "pg_catalog"."default",
  "nome_arquivo" varchar(255) COLLATE "pg_catalog"."default",
  "tipo_arquivo" varchar(120) COLLATE "pg_catalog"."default",
  "tamanho" int4,
  "agenda_evento_id" int4,
  "created_by" int4,
  "created_at" timestamptz(6) DEFAULT now(),
  "status_validacao" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'pendente'::character varying,
  "validado_por" int4,
  "validado_por_nome" varchar(255) COLLATE "pg_catalog"."default",
  "validado_em" timestamptz(6),
  "motivo_validacao" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for documentos_medicos_mensagens
-- ----------------------------
DROP TABLE IF EXISTS "public"."documentos_medicos_mensagens";
CREATE TABLE "public"."documentos_medicos_mensagens" (
  "id" int4 NOT NULL DEFAULT nextval('documentos_medicos_mensagens_id_seq'::regclass),
  "documento_id" int4 NOT NULL,
  "autor_id" int4,
  "autor_nome" varchar(255) COLLATE "pg_catalog"."default",
  "autor_papel" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'gestor'::character varying,
  "mensagem" text COLLATE "pg_catalog"."default" NOT NULL,
  "anexo_pathname" text COLLATE "pg_catalog"."default",
  "anexo_nome" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for invitation
-- ----------------------------
DROP TABLE IF EXISTS "public"."invitation";
CREATE TABLE "public"."invitation" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" uuid NOT NULL,
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "role" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default" NOT NULL,
  "expiresAt" timestamptz(6) NOT NULL,
  "createdAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "inviterId" uuid NOT NULL
)
;

-- ----------------------------
-- Table structure for jwks
-- ----------------------------
DROP TABLE IF EXISTS "public"."jwks";
CREATE TABLE "public"."jwks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "publicKey" text COLLATE "pg_catalog"."default" NOT NULL,
  "privateKey" text COLLATE "pg_catalog"."default" NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "expiresAt" timestamptz(6)
)
;

-- ----------------------------
-- Table structure for member
-- ----------------------------
DROP TABLE IF EXISTS "public"."member";
CREATE TABLE "public"."member" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "role" text COLLATE "pg_catalog"."default" NOT NULL,
  "createdAt" timestamptz(6) NOT NULL
)
;

-- ----------------------------
-- Table structure for organization
-- ----------------------------
DROP TABLE IF EXISTS "public"."organization";
CREATE TABLE "public"."organization" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "slug" text COLLATE "pg_catalog"."default" NOT NULL,
  "logo" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "metadata" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for orgaos_cliente
-- ----------------------------
DROP TABLE IF EXISTS "public"."orgaos_cliente";
CREATE TABLE "public"."orgaos_cliente" (
  "id" int4 NOT NULL DEFAULT nextval('orgaos_cliente_id_seq'::regclass),
  "cliente_id" int4,
  "tipo" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "nome" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cnpj" varchar(18) COLLATE "pg_catalog"."default",
  "endereco" text COLLATE "pg_catalog"."default",
  "cidade" varchar(100) COLLATE "pg_catalog"."default",
  "estado" varchar(2) COLLATE "pg_catalog"."default",
  "telefone" varchar(20) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "ativo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for orgaos_modulos
-- ----------------------------
DROP TABLE IF EXISTS "public"."orgaos_modulos";
CREATE TABLE "public"."orgaos_modulos" (
  "id" int4 NOT NULL DEFAULT nextval('orgaos_modulos_id_seq'::regclass),
  "orgao_id" int4 NOT NULL,
  "modulo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "adicionado_por" int4,
  "adicionado_por_nome" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for ouve_anexos
-- ----------------------------
DROP TABLE IF EXISTS "public"."ouve_anexos";
CREATE TABLE "public"."ouve_anexos" (
  "id" int4 NOT NULL DEFAULT nextval('ouve_anexos_id_seq'::regclass),
  "manifestacao_id" int4 NOT NULL,
  "blob_pathname" text COLLATE "pg_catalog"."default" NOT NULL,
  "nome_arquivo" varchar(255) COLLATE "pg_catalog"."default",
  "tipo_arquivo" varchar(120) COLLATE "pg_catalog"."default",
  "tamanho" int4,
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for ouve_manifestacoes
-- ----------------------------
DROP TABLE IF EXISTS "public"."ouve_manifestacoes";
CREATE TABLE "public"."ouve_manifestacoes" (
  "id" int4 NOT NULL DEFAULT nextval('ouve_manifestacoes_id_seq'::regclass),
  "codigo" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo_sigilo" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "natureza" varchar(40) COLLATE "pg_catalog"."default" NOT NULL,
  "categoria" varchar(30) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo_vida" varchar(40) COLLATE "pg_catalog"."default" NOT NULL,
  "mensagem" text COLLATE "pg_catalog"."default" NOT NULL,
  "setor" varchar(255) COLLATE "pg_catalog"."default",
  "autor_id" int4,
  "autor_nome" varchar(255) COLLATE "pg_catalog"."default",
  "autor_email" varchar(255) COLLATE "pg_catalog"."default",
  "autor_cargo" varchar(100) COLLATE "pg_catalog"."default",
  "status" varchar(30) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'aberta'::character varying,
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for ouve_respostas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ouve_respostas";
CREATE TABLE "public"."ouve_respostas" (
  "id" int4 NOT NULL DEFAULT nextval('ouve_respostas_id_seq'::regclass),
  "manifestacao_id" int4 NOT NULL,
  "autor_id" int4,
  "autor_nome" varchar(255) COLLATE "pg_catalog"."default",
  "mensagem" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for pesquisas_satisfacao
-- ----------------------------
DROP TABLE IF EXISTS "public"."pesquisas_satisfacao";
CREATE TABLE "public"."pesquisas_satisfacao" (
  "id" int4 NOT NULL DEFAULT nextval('pesquisas_satisfacao_id_seq'::regclass),
  "relatorio_visita_id" int4,
  "cliente_id" int4,
  "nota_atendimento" int4,
  "nota_qualidade" int4,
  "nota_tempo" int4,
  "comentarios" text COLLATE "pg_catalog"."default",
  "data_resposta" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for project_config
-- ----------------------------
DROP TABLE IF EXISTS "public"."project_config";
CREATE TABLE "public"."project_config" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "endpoint_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "trusted_origins" jsonb NOT NULL,
  "social_providers" jsonb NOT NULL,
  "email_provider" jsonb,
  "email_and_password" jsonb,
  "allow_localhost" bool NOT NULL,
  "plugin_configs" jsonb,
  "webhook_config" jsonb
)
;

-- ----------------------------
-- Table structure for relatorios_anexos
-- ----------------------------
DROP TABLE IF EXISTS "public"."relatorios_anexos";
CREATE TABLE "public"."relatorios_anexos" (
  "id" int4 NOT NULL DEFAULT nextval('relatorios_anexos_id_seq'::regclass),
  "relatorio_id" int4,
  "nome_arquivo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo_arquivo" varchar(100) COLLATE "pg_catalog"."default",
  "url" text COLLATE "pg_catalog"."default" NOT NULL,
  "tamanho" int4,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for relatorios_visitas
-- ----------------------------
DROP TABLE IF EXISTS "public"."relatorios_visitas";
CREATE TABLE "public"."relatorios_visitas" (
  "id" int4 NOT NULL DEFAULT nextval('relatorios_visitas_id_seq'::regclass),
  "tecnico_rarotec_id" int4,
  "cliente_id" int4,
  "tecnico_cliente_id" int4,
  "data_visita" date NOT NULL,
  "hora_inicio" time(6),
  "hora_fim" time(6),
  "tipo_servico" varchar(100) COLLATE "pg_catalog"."default",
  "descricao_servico" text COLLATE "pg_catalog"."default",
  "observacoes" text COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'pendente'::character varying,
  "assinatura_url" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "tema_id" int4,
  "estado" varchar(2) COLLATE "pg_catalog"."default" DEFAULT 'PE'::character varying,
  "municipio" varchar(255) COLLATE "pg_catalog"."default",
  "orgao_atendido" varchar(255) COLLATE "pg_catalog"."default",
  "modulos" jsonb,
  "tecnicos_rarotec_ids" jsonb,
  "tema" varchar(100) COLLATE "pg_catalog"."default",
  "data_relatorio" date,
  "historico" text COLLATE "pg_catalog"."default",
  "numero_autenticacao" varchar(50) COLLATE "pg_catalog"."default",
  "tecnicos_cliente_info" jsonb,
  "criado_por_id" int4,
  "criado_por_nome" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for session
-- ----------------------------
DROP TABLE IF EXISTS "public"."session";
CREATE TABLE "public"."session" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "expiresAt" timestamptz(6) NOT NULL,
  "token" text COLLATE "pg_catalog"."default" NOT NULL,
  "createdAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz(6) NOT NULL,
  "ipAddress" text COLLATE "pg_catalog"."default",
  "userAgent" text COLLATE "pg_catalog"."default",
  "userId" uuid NOT NULL,
  "impersonatedBy" text COLLATE "pg_catalog"."default",
  "activeOrganizationId" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for tecnico_clientes_fixos
-- ----------------------------
DROP TABLE IF EXISTS "public"."tecnico_clientes_fixos";
CREATE TABLE "public"."tecnico_clientes_fixos" (
  "id" int4 NOT NULL DEFAULT nextval('tecnico_clientes_fixos_id_seq'::regclass),
  "tecnico_rarotec_id" int4 NOT NULL,
  "cliente_id" int4 NOT NULL,
  "created_at" timestamptz(6) DEFAULT now()
)
;

-- ----------------------------
-- Table structure for tecnicos_clientes
-- ----------------------------
DROP TABLE IF EXISTS "public"."tecnicos_clientes";
CREATE TABLE "public"."tecnicos_clientes" (
  "id" int4 NOT NULL DEFAULT nextval('tecnicos_clientes_id_seq'::regclass),
  "cliente_id" int4,
  "nome" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cpf" varchar(14) COLLATE "pg_catalog"."default",
  "cargo" varchar(100) COLLATE "pg_catalog"."default",
  "departamento" varchar(100) COLLATE "pg_catalog"."default",
  "telefone" varchar(20) COLLATE "pg_catalog"."default",
  "celular" varchar(20) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "foto_url" text COLLATE "pg_catalog"."default",
  "ativo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "orgao_id" int4
)
;

-- ----------------------------
-- Table structure for tecnicos_rarotec
-- ----------------------------
DROP TABLE IF EXISTS "public"."tecnicos_rarotec";
CREATE TABLE "public"."tecnicos_rarotec" (
  "id" int4 NOT NULL DEFAULT nextval('tecnicos_rarotec_id_seq'::regclass),
  "nome" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cpf" varchar(14) COLLATE "pg_catalog"."default",
  "rg" varchar(20) COLLATE "pg_catalog"."default",
  "data_nascimento" date,
  "endereco" text COLLATE "pg_catalog"."default",
  "cidade" varchar(100) COLLATE "pg_catalog"."default",
  "estado" varchar(2) COLLATE "pg_catalog"."default",
  "cep" varchar(10) COLLATE "pg_catalog"."default",
  "telefone" varchar(20) COLLATE "pg_catalog"."default",
  "celular" varchar(20) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "cargo" varchar(100) COLLATE "pg_catalog"."default",
  "data_admissao" date,
  "foto_url" text COLLATE "pg_catalog"."default",
  "ativo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "departamentos" text[] COLLATE "pg_catalog"."default" DEFAULT '{}'::text[],
  "setores" text[] COLLATE "pg_catalog"."default" DEFAULT '{}'::text[],
  "cargos" text[] COLLATE "pg_catalog"."default" DEFAULT '{}'::text[]
)
;

-- ----------------------------
-- Table structure for temas_relatorio
-- ----------------------------
DROP TABLE IF EXISTS "public"."temas_relatorio";
CREATE TABLE "public"."temas_relatorio" (
  "id" int4 NOT NULL DEFAULT nextval('temas_relatorio_id_seq'::regclass),
  "nome" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "modulo" varchar(100) COLLATE "pg_catalog"."default",
  "descricao" text COLLATE "pg_catalog"."default",
  "ativo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS "public"."user";
CREATE TABLE "public"."user" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "emailVerified" bool NOT NULL,
  "image" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "role" text COLLATE "pg_catalog"."default",
  "banned" bool,
  "banReason" text COLLATE "pg_catalog"."default",
  "banExpires" timestamptz(6)
)
;

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS "public"."usuarios";
CREATE TABLE "public"."usuarios" (
  "id" int4 NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
  "nome" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "senha_hash" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cargo" varchar(100) COLLATE "pg_catalog"."default",
  "ativo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "apuracao_mensal" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Table structure for verification
-- ----------------------------
DROP TABLE IF EXISTS "public"."verification";
CREATE TABLE "public"."verification" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "identifier" text COLLATE "pg_catalog"."default" NOT NULL,
  "value" text COLLATE "pg_catalog"."default" NOT NULL,
  "expiresAt" timestamptz(6) NOT NULL,
  "createdAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."aditivos_contrato_id_seq"
OWNED BY "public"."aditivos_contrato"."id";
SELECT setval('"public"."aditivos_contrato_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."agenda_abonos_id_seq"
OWNED BY "public"."agenda_abonos"."id";
SELECT setval('"public"."agenda_abonos_id_seq"', 48, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."agenda_solicitacoes_id_seq"
OWNED BY "public"."agenda_solicitacoes"."id";
SELECT setval('"public"."agenda_solicitacoes_id_seq"', 207, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."agenda_trabalhista_id_seq"
OWNED BY "public"."agenda_trabalhista"."id";
SELECT setval('"public"."agenda_trabalhista_id_seq"', 1816, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."apuracao_modelos_id_seq"
OWNED BY "public"."apuracao_modelos"."id";
SELECT setval('"public"."apuracao_modelos_id_seq"', 7, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."apuracao_relatorios_id_seq"
OWNED BY "public"."apuracao_relatorios"."id";
SELECT setval('"public"."apuracao_relatorios_id_seq"', 33, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."clientes_id_seq"
OWNED BY "public"."clientes"."id";
SELECT setval('"public"."clientes_id_seq"', 200, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."clientes_modulos_id_seq"
OWNED BY "public"."clientes_modulos"."id";
SELECT setval('"public"."clientes_modulos_id_seq"', 664, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."contratos_id_seq"
OWNED BY "public"."contratos"."id";
SELECT setval('"public"."contratos_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."departamentos_id_seq"
OWNED BY "public"."departamentos"."id";
SELECT setval('"public"."departamentos_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."documentos_institucionais_id_seq"
OWNED BY "public"."documentos_institucionais"."id";
SELECT setval('"public"."documentos_institucionais_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."documentos_institucionais_notas_id_seq"
OWNED BY "public"."documentos_institucionais_notas"."id";
SELECT setval('"public"."documentos_institucionais_notas_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."documentos_medicos_id_seq"
OWNED BY "public"."documentos_medicos"."id";
SELECT setval('"public"."documentos_medicos_id_seq"', 8, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."documentos_medicos_mensagens_id_seq"
OWNED BY "public"."documentos_medicos_mensagens"."id";
SELECT setval('"public"."documentos_medicos_mensagens_id_seq"', 7, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."orgaos_cliente_id_seq"
OWNED BY "public"."orgaos_cliente"."id";
SELECT setval('"public"."orgaos_cliente_id_seq"', 7, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."orgaos_modulos_id_seq"
OWNED BY "public"."orgaos_modulos"."id";
SELECT setval('"public"."orgaos_modulos_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ouve_anexos_id_seq"
OWNED BY "public"."ouve_anexos"."id";
SELECT setval('"public"."ouve_anexos_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ouve_manifestacoes_id_seq"
OWNED BY "public"."ouve_manifestacoes"."id";
SELECT setval('"public"."ouve_manifestacoes_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ouve_respostas_id_seq"
OWNED BY "public"."ouve_respostas"."id";
SELECT setval('"public"."ouve_respostas_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."pesquisas_satisfacao_id_seq"
OWNED BY "public"."pesquisas_satisfacao"."id";
SELECT setval('"public"."pesquisas_satisfacao_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."relatorios_anexos_id_seq"
OWNED BY "public"."relatorios_anexos"."id";
SELECT setval('"public"."relatorios_anexos_id_seq"', 92, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."relatorios_visitas_id_seq"
OWNED BY "public"."relatorios_visitas"."id";
SELECT setval('"public"."relatorios_visitas_id_seq"', 229, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tecnico_clientes_fixos_id_seq"
OWNED BY "public"."tecnico_clientes_fixos"."id";
SELECT setval('"public"."tecnico_clientes_fixos_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tecnicos_clientes_id_seq"
OWNED BY "public"."tecnicos_clientes"."id";
SELECT setval('"public"."tecnicos_clientes_id_seq"', 88, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tecnicos_rarotec_id_seq"
OWNED BY "public"."tecnicos_rarotec"."id";
SELECT setval('"public"."tecnicos_rarotec_id_seq"', 34, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."temas_relatorio_id_seq"
OWNED BY "public"."temas_relatorio"."id";
SELECT setval('"public"."temas_relatorio_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."usuarios_id_seq"
OWNED BY "public"."usuarios"."id";
SELECT setval('"public"."usuarios_id_seq"', 34, true);

-- ----------------------------
-- Indexes structure for table account
-- ----------------------------
CREATE INDEX "account_userId_idx" ON "public"."account" USING btree (
  "userId" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table account
-- ----------------------------
ALTER TABLE "public"."account" ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table aditivos_contrato
-- ----------------------------
ALTER TABLE "public"."aditivos_contrato" ADD CONSTRAINT "aditivos_contrato_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table agenda_abonos
-- ----------------------------
ALTER TABLE "public"."agenda_abonos" ADD CONSTRAINT "agenda_abonos_agenda_evento_id_tecnico_id_key" UNIQUE ("agenda_evento_id", "tecnico_id");

-- ----------------------------
-- Primary Key structure for table agenda_abonos
-- ----------------------------
ALTER TABLE "public"."agenda_abonos" ADD CONSTRAINT "agenda_abonos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table agenda_solicitacoes
-- ----------------------------
ALTER TABLE "public"."agenda_solicitacoes" ADD CONSTRAINT "agenda_solicitacoes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table agenda_trabalhista
-- ----------------------------
ALTER TABLE "public"."agenda_trabalhista" ADD CONSTRAINT "agenda_trabalhista_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table app_config
-- ----------------------------
ALTER TABLE "public"."app_config" ADD CONSTRAINT "app_config_pkey" PRIMARY KEY ("chave");

-- ----------------------------
-- Indexes structure for table apuracao_modelos
-- ----------------------------
CREATE INDEX "idx_apur_mod_cliente" ON "public"."apuracao_modelos" USING btree (
  "cliente_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table apuracao_modelos
-- ----------------------------
ALTER TABLE "public"."apuracao_modelos" ADD CONSTRAINT "apuracao_modelos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table apuracao_relatorios
-- ----------------------------
CREATE INDEX "idx_apur_rel_cliente" ON "public"."apuracao_relatorios" USING btree (
  "cliente_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "idx_apur_rel_competencia" ON "public"."apuracao_relatorios" USING btree (
  "competencia" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_apur_rel_exercicio" ON "public"."apuracao_relatorios" USING btree (
  "exercicio" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table apuracao_relatorios
-- ----------------------------
ALTER TABLE "public"."apuracao_relatorios" ADD CONSTRAINT "apuracao_relatorios_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "clientes_cnpj_key" UNIQUE ("cnpj");

-- ----------------------------
-- Primary Key structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table clientes_modulos
-- ----------------------------
ALTER TABLE "public"."clientes_modulos" ADD CONSTRAINT "clientes_modulos_cliente_id_modulo_key" UNIQUE ("cliente_id", "modulo");

-- ----------------------------
-- Primary Key structure for table clientes_modulos
-- ----------------------------
ALTER TABLE "public"."clientes_modulos" ADD CONSTRAINT "clientes_modulos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table contratos
-- ----------------------------
ALTER TABLE "public"."contratos" ADD CONSTRAINT "contratos_numero_contrato_key" UNIQUE ("numero_contrato");

-- ----------------------------
-- Primary Key structure for table contratos
-- ----------------------------
ALTER TABLE "public"."contratos" ADD CONSTRAINT "contratos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table departamentos
-- ----------------------------
ALTER TABLE "public"."departamentos" ADD CONSTRAINT "departamentos_nome_key" UNIQUE ("nome");

-- ----------------------------
-- Primary Key structure for table departamentos
-- ----------------------------
ALTER TABLE "public"."departamentos" ADD CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table documentos_institucionais
-- ----------------------------
CREATE INDEX "idx_docinst_categoria" ON "public"."documentos_institucionais" USING btree (
  "categoria" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_docinst_setor" ON "public"."documentos_institucionais" USING btree (
  "setor" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_docinst_usuario_alvo" ON "public"."documentos_institucionais" USING btree (
  "usuario_alvo_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table documentos_institucionais
-- ----------------------------
ALTER TABLE "public"."documentos_institucionais" ADD CONSTRAINT "documentos_institucionais_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table documentos_institucionais_notas
-- ----------------------------
ALTER TABLE "public"."documentos_institucionais_notas" ADD CONSTRAINT "documentos_institucionais_notas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table documentos_medicos
-- ----------------------------
CREATE INDEX "idx_documentos_medicos_tecnico" ON "public"."documentos_medicos" USING btree (
  "tecnico_rarotec_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table documentos_medicos
-- ----------------------------
ALTER TABLE "public"."documentos_medicos" ADD CONSTRAINT "documentos_medicos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table documentos_medicos_mensagens
-- ----------------------------
ALTER TABLE "public"."documentos_medicos_mensagens" ADD CONSTRAINT "documentos_medicos_mensagens_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table invitation
-- ----------------------------
CREATE INDEX "invitation_email_idx" ON "public"."invitation" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "invitation_organizationId_idx" ON "public"."invitation" USING btree (
  "organizationId" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table invitation
-- ----------------------------
ALTER TABLE "public"."invitation" ADD CONSTRAINT "invitation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table jwks
-- ----------------------------
ALTER TABLE "public"."jwks" ADD CONSTRAINT "jwks_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table member
-- ----------------------------
CREATE INDEX "member_organizationId_idx" ON "public"."member" USING btree (
  "organizationId" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "member_userId_idx" ON "public"."member" USING btree (
  "userId" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table member
-- ----------------------------
ALTER TABLE "public"."member" ADD CONSTRAINT "member_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table organization
-- ----------------------------
CREATE UNIQUE INDEX "organization_slug_uidx" ON "public"."organization" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table organization
-- ----------------------------
ALTER TABLE "public"."organization" ADD CONSTRAINT "organization_slug_key" UNIQUE ("slug");

-- ----------------------------
-- Primary Key structure for table organization
-- ----------------------------
ALTER TABLE "public"."organization" ADD CONSTRAINT "organization_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table orgaos_cliente
-- ----------------------------
ALTER TABLE "public"."orgaos_cliente" ADD CONSTRAINT "orgaos_cliente_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table orgaos_modulos
-- ----------------------------
ALTER TABLE "public"."orgaos_modulos" ADD CONSTRAINT "orgaos_modulos_orgao_id_modulo_key" UNIQUE ("orgao_id", "modulo");

-- ----------------------------
-- Primary Key structure for table orgaos_modulos
-- ----------------------------
ALTER TABLE "public"."orgaos_modulos" ADD CONSTRAINT "orgaos_modulos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ouve_anexos
-- ----------------------------
ALTER TABLE "public"."ouve_anexos" ADD CONSTRAINT "ouve_anexos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ouve_manifestacoes
-- ----------------------------
CREATE INDEX "idx_ouve_codigo" ON "public"."ouve_manifestacoes" USING btree (
  "codigo" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ouve_manifestacoes
-- ----------------------------
ALTER TABLE "public"."ouve_manifestacoes" ADD CONSTRAINT "ouve_manifestacoes_codigo_key" UNIQUE ("codigo");

-- ----------------------------
-- Primary Key structure for table ouve_manifestacoes
-- ----------------------------
ALTER TABLE "public"."ouve_manifestacoes" ADD CONSTRAINT "ouve_manifestacoes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ouve_respostas
-- ----------------------------
ALTER TABLE "public"."ouve_respostas" ADD CONSTRAINT "ouve_respostas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Checks structure for table pesquisas_satisfacao
-- ----------------------------
ALTER TABLE "public"."pesquisas_satisfacao" ADD CONSTRAINT "pesquisas_satisfacao_nota_atendimento_check" CHECK (nota_atendimento >= 1 AND nota_atendimento <= 5);
ALTER TABLE "public"."pesquisas_satisfacao" ADD CONSTRAINT "pesquisas_satisfacao_nota_qualidade_check" CHECK (nota_qualidade >= 1 AND nota_qualidade <= 5);
ALTER TABLE "public"."pesquisas_satisfacao" ADD CONSTRAINT "pesquisas_satisfacao_nota_tempo_check" CHECK (nota_tempo >= 1 AND nota_tempo <= 5);

-- ----------------------------
-- Primary Key structure for table pesquisas_satisfacao
-- ----------------------------
ALTER TABLE "public"."pesquisas_satisfacao" ADD CONSTRAINT "pesquisas_satisfacao_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table project_config
-- ----------------------------
ALTER TABLE "public"."project_config" ADD CONSTRAINT "project_config_endpoint_id_key" UNIQUE ("endpoint_id");

-- ----------------------------
-- Primary Key structure for table project_config
-- ----------------------------
ALTER TABLE "public"."project_config" ADD CONSTRAINT "project_config_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table relatorios_anexos
-- ----------------------------
ALTER TABLE "public"."relatorios_anexos" ADD CONSTRAINT "relatorios_anexos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table relatorios_visitas
-- ----------------------------
CREATE INDEX "idx_relatorios_numero_autenticacao" ON "public"."relatorios_visitas" USING btree (
  "numero_autenticacao" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table relatorios_visitas
-- ----------------------------
ALTER TABLE "public"."relatorios_visitas" ADD CONSTRAINT "relatorios_visitas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table session
-- ----------------------------
CREATE INDEX "session_userId_idx" ON "public"."session" USING btree (
  "userId" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table session
-- ----------------------------
ALTER TABLE "public"."session" ADD CONSTRAINT "session_token_key" UNIQUE ("token");

-- ----------------------------
-- Primary Key structure for table session
-- ----------------------------
ALTER TABLE "public"."session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table tecnico_clientes_fixos
-- ----------------------------
ALTER TABLE "public"."tecnico_clientes_fixos" ADD CONSTRAINT "tecnico_clientes_fixos_tecnico_rarotec_id_cliente_id_key" UNIQUE ("tecnico_rarotec_id", "cliente_id");

-- ----------------------------
-- Primary Key structure for table tecnico_clientes_fixos
-- ----------------------------
ALTER TABLE "public"."tecnico_clientes_fixos" ADD CONSTRAINT "tecnico_clientes_fixos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table tecnicos_clientes
-- ----------------------------
ALTER TABLE "public"."tecnicos_clientes" ADD CONSTRAINT "tecnicos_clientes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table tecnicos_rarotec
-- ----------------------------
ALTER TABLE "public"."tecnicos_rarotec" ADD CONSTRAINT "tecnicos_rarotec_cpf_key" UNIQUE ("cpf");

-- ----------------------------
-- Primary Key structure for table tecnicos_rarotec
-- ----------------------------
ALTER TABLE "public"."tecnicos_rarotec" ADD CONSTRAINT "tecnicos_rarotec_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table temas_relatorio
-- ----------------------------
ALTER TABLE "public"."temas_relatorio" ADD CONSTRAINT "temas_relatorio_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table user
-- ----------------------------
ALTER TABLE "public"."user" ADD CONSTRAINT "user_email_key" UNIQUE ("email");

-- ----------------------------
-- Primary Key structure for table user
-- ----------------------------
ALTER TABLE "public"."user" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_email_key" UNIQUE ("email");

-- ----------------------------
-- Primary Key structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table verification
-- ----------------------------
CREATE INDEX "verification_identifier_idx" ON "public"."verification" USING btree (
  "identifier" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table verification
-- ----------------------------
ALTER TABLE "public"."verification" ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table account
-- ----------------------------
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table aditivos_contrato
-- ----------------------------
ALTER TABLE "public"."aditivos_contrato" ADD CONSTRAINT "aditivos_contrato_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table agenda_trabalhista
-- ----------------------------
ALTER TABLE "public"."agenda_trabalhista" ADD CONSTRAINT "agenda_trabalhista_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."agenda_trabalhista" ADD CONSTRAINT "agenda_trabalhista_tecnico_rarotec_id_fkey" FOREIGN KEY ("tecnico_rarotec_id") REFERENCES "public"."tecnicos_rarotec" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table apuracao_modelos
-- ----------------------------
ALTER TABLE "public"."apuracao_modelos" ADD CONSTRAINT "apuracao_modelos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table apuracao_relatorios
-- ----------------------------
ALTER TABLE "public"."apuracao_relatorios" ADD CONSTRAINT "apuracao_relatorios_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."apuracao_relatorios" ADD CONSTRAINT "apuracao_relatorios_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "public"."apuracao_modelos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table clientes_modulos
-- ----------------------------
ALTER TABLE "public"."clientes_modulos" ADD CONSTRAINT "clientes_modulos_adicionado_por_fkey" FOREIGN KEY ("adicionado_por") REFERENCES "public"."usuarios" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."clientes_modulos" ADD CONSTRAINT "clientes_modulos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table contratos
-- ----------------------------
ALTER TABLE "public"."contratos" ADD CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."contratos" ADD CONSTRAINT "contratos_orgao_id_fkey" FOREIGN KEY ("orgao_id") REFERENCES "public"."orgaos_cliente" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table documentos_institucionais_notas
-- ----------------------------
ALTER TABLE "public"."documentos_institucionais_notas" ADD CONSTRAINT "documentos_institucionais_notas_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos_institucionais" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table documentos_medicos_mensagens
-- ----------------------------
ALTER TABLE "public"."documentos_medicos_mensagens" ADD CONSTRAINT "documentos_medicos_mensagens_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos_medicos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table invitation
-- ----------------------------
ALTER TABLE "public"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table member
-- ----------------------------
ALTER TABLE "public"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table orgaos_cliente
-- ----------------------------
ALTER TABLE "public"."orgaos_cliente" ADD CONSTRAINT "orgaos_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table orgaos_modulos
-- ----------------------------
ALTER TABLE "public"."orgaos_modulos" ADD CONSTRAINT "orgaos_modulos_adicionado_por_fkey" FOREIGN KEY ("adicionado_por") REFERENCES "public"."usuarios" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."orgaos_modulos" ADD CONSTRAINT "orgaos_modulos_orgao_id_fkey" FOREIGN KEY ("orgao_id") REFERENCES "public"."orgaos_cliente" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ouve_anexos
-- ----------------------------
ALTER TABLE "public"."ouve_anexos" ADD CONSTRAINT "ouve_anexos_manifestacao_id_fkey" FOREIGN KEY ("manifestacao_id") REFERENCES "public"."ouve_manifestacoes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ouve_respostas
-- ----------------------------
ALTER TABLE "public"."ouve_respostas" ADD CONSTRAINT "ouve_respostas_manifestacao_id_fkey" FOREIGN KEY ("manifestacao_id") REFERENCES "public"."ouve_manifestacoes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table pesquisas_satisfacao
-- ----------------------------
ALTER TABLE "public"."pesquisas_satisfacao" ADD CONSTRAINT "pesquisas_satisfacao_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."pesquisas_satisfacao" ADD CONSTRAINT "pesquisas_satisfacao_relatorio_visita_id_fkey" FOREIGN KEY ("relatorio_visita_id") REFERENCES "public"."relatorios_visitas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table relatorios_anexos
-- ----------------------------
ALTER TABLE "public"."relatorios_anexos" ADD CONSTRAINT "relatorios_anexos_relatorio_id_fkey" FOREIGN KEY ("relatorio_id") REFERENCES "public"."relatorios_visitas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table relatorios_visitas
-- ----------------------------
ALTER TABLE "public"."relatorios_visitas" ADD CONSTRAINT "relatorios_visitas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."relatorios_visitas" ADD CONSTRAINT "relatorios_visitas_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "public"."usuarios" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."relatorios_visitas" ADD CONSTRAINT "relatorios_visitas_tecnico_cliente_id_fkey" FOREIGN KEY ("tecnico_cliente_id") REFERENCES "public"."tecnicos_clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."relatorios_visitas" ADD CONSTRAINT "relatorios_visitas_tecnico_rarotec_id_fkey" FOREIGN KEY ("tecnico_rarotec_id") REFERENCES "public"."tecnicos_rarotec" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."relatorios_visitas" ADD CONSTRAINT "relatorios_visitas_tema_id_fkey" FOREIGN KEY ("tema_id") REFERENCES "public"."temas_relatorio" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table session
-- ----------------------------
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tecnicos_clientes
-- ----------------------------
ALTER TABLE "public"."tecnicos_clientes" ADD CONSTRAINT "tecnicos_clientes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."tecnicos_clientes" ADD CONSTRAINT "tecnicos_clientes_orgao_id_fkey" FOREIGN KEY ("orgao_id") REFERENCES "public"."orgaos_cliente" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
