BEGIN;

CREATE TABLE IF NOT EXISTS responsaveis_modulos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  orgao_id INTEGER REFERENCES orgaos_cliente(id) ON DELETE CASCADE,
  tecnico_rarotec_id INTEGER NOT NULL REFERENCES tecnicos_rarotec(id),
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_responsavel_modulo_cliente
  ON responsaveis_modulos (cliente_id, LOWER(modulo))
  WHERE orgao_id IS NULL AND ativo = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_responsavel_modulo_orgao
  ON responsaveis_modulos (cliente_id, LOWER(modulo), orgao_id)
  WHERE orgao_id IS NOT NULL AND ativo = TRUE;

CREATE INDEX IF NOT EXISTS idx_responsaveis_modulos_tecnico
  ON responsaveis_modulos (tecnico_rarotec_id);

CREATE INDEX IF NOT EXISTS idx_responsaveis_modulos_cliente_modulo
  ON responsaveis_modulos (cliente_id, modulo);

CREATE TABLE IF NOT EXISTS responsaveis_modulos_historico (
  id SERIAL PRIMARY KEY,
  responsabilidade_id INTEGER,
  cliente_id INTEGER NOT NULL,
  modulo TEXT NOT NULL,
  orgao_id INTEGER,
  tecnico_anterior_id INTEGER,
  tecnico_novo_id INTEGER,
  acao TEXT NOT NULL CHECK (acao IN ('criacao', 'alteracao', 'exclusao')),
  observacoes TEXT,
  alterado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  alterado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responsaveis_historico_contexto
  ON responsaveis_modulos_historico (cliente_id, modulo, orgao_id, alterado_em DESC);

CREATE TABLE IF NOT EXISTS responsaveis_importacao (
  id SERIAL PRIMARY KEY,
  origem TEXT NOT NULL,
  municipio TEXT NOT NULL,
  uf TEXT,
  modulo_origem TEXT NOT NULL,
  responsavel_origem TEXT,
  email_origem TEXT,
  telefone_origem TEXT,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  orgao_id INTEGER REFERENCES orgaos_cliente(id) ON DELETE SET NULL,
  tecnico_rarotec_id INTEGER REFERENCES tecnicos_rarotec(id) ON DELETE SET NULL,
  modulo_destino TEXT,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'pronto', 'importado', 'ignorado')),
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_responsaveis_importacao_origem
  ON responsaveis_importacao (
    origem,
    municipio,
    COALESCE(uf, ''),
    modulo_origem,
    COALESCE(responsavel_origem, ''),
    COALESCE(email_origem, '')
  );

CREATE OR REPLACE FUNCTION validar_responsavel_orgao_cliente()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.orgao_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM orgaos_cliente o
    WHERE o.id = NEW.orgao_id
      AND o.cliente_id = NEW.cliente_id
  ) THEN
    RAISE EXCEPTION 'O órgão informado não pertence ao cliente da responsabilidade';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_responsavel_orgao_cliente ON responsaveis_modulos;
CREATE TRIGGER trg_validar_responsavel_orgao_cliente
  BEFORE INSERT OR UPDATE OF cliente_id, orgao_id
  ON responsaveis_modulos
  FOR EACH ROW
  EXECUTE FUNCTION validar_responsavel_orgao_cliente();

CREATE TABLE IF NOT EXISTS checklist_modelos_itens (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  modulo TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
  exige_observacao_negativa BOOLEAN NOT NULL DEFAULT TRUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_modelos_ativos
  ON checklist_modelos_itens (ativo, modulo, ordem);

CREATE TABLE IF NOT EXISTS checklist_execucoes (
  id SERIAL PRIMARY KEY,
  responsabilidade_id INTEGER NOT NULL REFERENCES responsaveis_modulos(id) ON DELETE CASCADE,
  competencia DATE NOT NULL,
  tecnico_rarotec_id INTEGER NOT NULL REFERENCES tecnicos_rarotec(id),
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'em_andamento', 'concluido')),
  observacao_geral TEXT,
  finalizado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (responsabilidade_id, competencia),
  CONSTRAINT checklist_competencia_primeiro_dia
    CHECK (EXTRACT(DAY FROM competencia) = 1)
);

CREATE INDEX IF NOT EXISTS idx_checklist_execucoes_competencia
  ON checklist_execucoes (competencia, tecnico_rarotec_id, status);

CREATE TABLE IF NOT EXISTS checklist_execucao_itens (
  id SERIAL PRIMARY KEY,
  execucao_id INTEGER NOT NULL REFERENCES checklist_execucoes(id) ON DELETE CASCADE,
  modelo_item_id INTEGER REFERENCES checklist_modelos_itens(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  modulo TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
  exige_observacao_negativa BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'atendido', 'nao_atendido', 'nao_se_aplica')),
  observacao TEXT,
  respondido_em TIMESTAMPTZ,
  updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (execucao_id, modelo_item_id)
);

CREATE INDEX IF NOT EXISTS idx_checklist_itens_status
  ON checklist_execucao_itens (execucao_id, status);

-- Guarda linhas antigas que ainda não podem ser ligadas com segurança a um módulo e responsável.
CREATE TABLE IF NOT EXISTS checklist_legado_importacao (
  id SERIAL PRIMARY KEY,
  municipio TEXT NOT NULL,
  uf TEXT,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  atividade TEXT NOT NULL,
  status_origem TEXT,
  data_conclusao DATE,
  observacoes TEXT,
  responsabilidade_id INTEGER REFERENCES responsaveis_modulos(id) ON DELETE SET NULL,
  importado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_checklist_legado_linha
  ON checklist_legado_importacao (municipio, uf, ano, mes, atividade);

INSERT INTO checklist_modelos_itens
  (titulo, modulo, ordem, obrigatorio, exige_observacao_negativa)
SELECT item.titulo, item.modulo, item.ordem, TRUE, TRUE
FROM (VALUES
  ('Monitorar a alimentação do sistema pelo cliente, verificando possível ausência ou má alimentação.', NULL::TEXT, 10),
  ('Verificar se os clientes utilizam os principais recursos e benefícios do sistema do módulo atuante.', NULL::TEXT, 20),
  ('Acompanhar as integrações, quando aplicável.', NULL::TEXT, 30),
  ('Monitorar a necessidade de treinamentos e atualizações.', NULL::TEXT, 40),
  ('Informar ao cliente sobre as principais implementações do módulo.', NULL::TEXT, 50),
  ('Acompanhar e gerenciar as demandas de programação e/ou técnicas.', NULL::TEXT, 60),
  ('No portal da transparência, acompanhar mensalmente as pendências, encaminhá-las ao responsável e enviar o Integra por e-mail.', 'Portal da Transparência', 70)
) AS item(titulo, modulo, ordem)
WHERE NOT EXISTS (
  SELECT 1
  FROM checklist_modelos_itens existente
  WHERE LOWER(existente.titulo) = LOWER(item.titulo)
    AND COALESCE(LOWER(existente.modulo), '') = COALESCE(LOWER(item.modulo), '')
);

COMMIT;
