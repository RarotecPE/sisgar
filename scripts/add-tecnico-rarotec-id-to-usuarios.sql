-- Script para adicionar coluna tecnico_rarotec_id na tabela usuarios
-- Isso permite vincular um usuário a um técnico da Rarotec

-- Adicionar a coluna tecnico_rarotec_id
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS tecnico_rarotec_id INTEGER REFERENCES tecnicos_rarotec(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_tecnico_rarotec_id ON usuarios(tecnico_rarotec_id);

-- Vincular os usuarios existentes aos tecnicos correspondentes pelo nome
UPDATE usuarios u
SET tecnico_rarotec_id = t.id
FROM tecnicos_rarotec t
WHERE LOWER(u.nome) LIKE '%' || LOWER(t.nome) || '%'
  AND u.tecnico_rarotec_id IS NULL;
