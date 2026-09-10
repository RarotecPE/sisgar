BEGIN;

CREATE OR REPLACE FUNCTION sisgar_normalizar(valor TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT LOWER(
    REGEXP_REPLACE(
      TRANSLATE(
        COALESCE(valor, ''),
        'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ',
        'AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn'
      ),
      '[^a-zA-Z0-9]+',
      ' ',
      'g'
    )
  );
$$;

INSERT INTO responsaveis_importacao (
  origem, municipio, uf, modulo_origem,
  responsavel_origem, email_origem, telefone_origem
)
VALUES
  ('Contabilidade', 'Bezerros', 'PE', 'Contabilidade', 'Manoel', 'manoel@rarotec.com.br', '81 9 9675-5248'),
  ('Contabilidade', 'Cortês', 'PE', 'Contabilidade', 'Lúcio', 'luciomonteiro@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Dois Riachos', 'AL', 'Contabilidade', 'Maurício', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Ilha de Itamaracá', 'PE', 'Contabilidade', 'Maurício', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Ingazeira', 'PE', 'Contabilidade', 'Lúcio', 'luciomonteiro@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Jatobá', 'PE', 'Contabilidade', 'Michaelly', 'mikaellybrandao@rarotec.com.br', '81 9 7121-9876'),
  ('Contabilidade', 'Jurema', 'PE', 'Contabilidade', 'Alan', 'alanfernandes@rarotec.com.br', '81 9 9662-1997'),
  ('Contabilidade', 'Lagoa do Ouro', 'PE', 'Contabilidade', 'Lúcio', 'luciomonteiro@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Lajedo', 'PE', 'Contabilidade', 'Alan', 'alanfernandes@rarotec.com.br', '81 9 9662-1997'),
  ('Contabilidade', 'Manari', 'PE', 'Contabilidade', 'Lúcio', 'luciomonteiro@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Paulista', 'PE', 'Contabilidade', 'Michaelly', 'mikaellybrandao@rarotec.com.br', '81 9 7121-9876'),
  ('Contabilidade', 'Pesqueira', 'PE', 'Contabilidade', 'Michaelly', 'mikaellybrandao@rarotec.com.br', '81 9 7121-9876'),
  ('Contabilidade', 'Saloá', 'PE', 'Contabilidade', 'Maurício', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Solidão', 'PE', 'Contabilidade', 'Alan', 'alanfernandes@rarotec.com.br', '81 9 9662-1997'),
  ('Contabilidade', 'São José da Coroa Grande', 'PE', 'Contabilidade', 'Alan', 'alanfernandes@rarotec.com.br', '81 9 9662-1997'),
  ('Contabilidade', 'Tacaratu', 'PE', 'Contabilidade', 'Alan', 'alanfernandes@rarotec.com.br', '81 9 9662-1997'),
  ('Contabilidade', 'Tupanatinga', 'PE', 'Contabilidade', 'Lúcio', 'luciomonteiro@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'Vertente do Lério', 'PE', 'Contabilidade', 'Manoel', 'manoel@rarotec.com.br', '81 9 9675-5248'),
  ('Contabilidade', 'Águas Belas', 'PE', 'Contabilidade', 'Michaelly', 'mikaellybrandao@rarotec.com.br', '81 9 7121-9876'),
  ('Contabilidade', 'Bezerros', 'PE', 'Contabilidade', 'Michaelly', 'mikaellybrandao@rarotec.com.br', '81 9 7121-9876'),
  ('Contabilidade', 'CONISA', 'AL', 'Contabilidade', 'Mauricio', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'CODEAM', 'PE', 'Contabilidade', 'Mauricio', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Contabilidade', 'COMUPE', 'PE', 'Contabilidade', 'Mauricio', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Protocolo', 'Dois Riachos', 'PE', 'Protocolo', 'Mauricio', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Protocolo', 'Tacaratu', 'PE', 'Protocolo', 'Mauricio', 'mauricio@rarotec.com.br', '79 9 9105-4797'),
  ('Recursos Humanos', 'Bezerros', 'PE', 'Recursos Humanos', 'JAIRO', 'jairofilho@rarotec.com.br', NULL),
  ('Recursos Humanos', 'Cabo de Santo Agostinho', 'PE', 'Recursos Humanos', 'GERLANE', 'gerlane@rarotec.com.br', '81983012836'),
  ('Recursos Humanos', 'Cachoeirinha', 'PE', 'Recursos Humanos', 'LARISSA', NULL, NULL),
  ('Recursos Humanos', 'Camaragibe', 'PE', 'Recursos Humanos', 'MAURO', 'mauro@rarotec.com.br', '81984511102'),
  ('Recursos Humanos', 'Cortês', 'PE', 'Recursos Humanos', 'JAIRO', 'jairofilho@rarotec.com.br', NULL),
  ('Recursos Humanos', 'Igarassu', 'PE', 'Recursos Humanos', 'GERLANE', 'gerlane@rarotec.com.br', '81983012836'),
  ('Recursos Humanos', 'Ilha de Itamaracá', 'PE', 'Recursos Humanos', 'MARIA HELENA', 'helena@rarotec.com,br', '81988056992'),
  ('Recursos Humanos', 'Câmara de Ipojuca', 'PE', 'Recursos Humanos', 'MAURO', 'mauro@rarotec.com.br', '81984511102'),
  ('Recursos Humanos', 'Jaboatão dos Guararapes', 'PE', 'Recursos Humanos', 'Iago', 'Iagofolgadodantas@gmail.com', '7988382386'),
  ('Recursos Humanos', 'Jatobá', 'PE', 'Recursos Humanos', 'EUGENIO', 'eugenio@rarotec.com.br', '87991288334'),
  ('Recursos Humanos', 'Jurema', 'PE', 'Recursos Humanos', 'LARISSA', NULL, NULL),
  ('Recursos Humanos', 'Manari', 'PE', 'Recursos Humanos', 'EUGENIO', 'eugenio@rarotec.com.br', '87991288334'),
  ('Recursos Humanos', 'Paulista', 'PE', 'Recursos Humanos', 'MARIA HELENA', 'helena@rarotec.com,br', '81988056992'),
  ('Recursos Humanos', 'Pesqueira', 'PE', 'Recursos Humanos', 'LARISSA', NULL, NULL),
  ('Recursos Humanos', 'Câmara de Pombos', 'PE', 'Recursos Humanos', 'MANOEL', NULL, NULL),
  ('Recursos Humanos', 'Sirinhaém', 'PE', 'Recursos Humanos', 'MAURO', 'mauro@rarotec.com.br', '81984511102'),
  ('Recursos Humanos', 'São José da Coroa Grande', 'PE', 'Recursos Humanos', 'JAIRO', 'jairofilho@rarotec.com.br', NULL),
  ('Recursos Humanos', 'Vertente do Lério', 'PE', 'Recursos Humanos', 'GERLANE', 'gerlane@rarotec.com.br', '81983012836'),
  ('Recursos Humanos', 'Águas Belas', 'PE', 'Recursos Humanos', 'EUGENIO', 'eugenio@rarotec.com.br', '87991288334'),
  ('Recursos Humanos', 'Solidão', 'PE', 'Recursos Humanos', 'JAIRO', 'jairofilho@rarotec.com.br', NULL),
  ('Recursos Humanos', 'Tacaratu', 'PE', 'Recursos Humanos', 'EUGENIO', 'eugenio@rarotec.com.br', '87991288334'),
  ('Recursos Humanos', 'Câmara de Tupanatinga', 'PE', 'Recursos Humanos', 'EUGENIO', 'eugenio@rarotec.com.br', '87991288334'),
  ('Almoxarifado', 'Cabo de Santo Agostinho', 'PE', 'Almoxarifado', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Almoxarifado', 'Cachoeirinha', 'PE', 'Almoxarifado', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Almoxarifado', 'Catende', 'PE', 'Almoxarifado', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Almoxarifado', 'Ipojuca', 'PE', 'Almoxarifado', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Almoxarifado', 'Jatobá', 'PE', 'Almoxarifado', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Almoxarifado', 'Manari', 'PE', 'Almoxarifado', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Almoxarifado', 'Panelas', 'PE', 'Almoxarifado', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Almoxarifado', 'Paulista', 'PE', 'Almoxarifado', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Almoxarifado', 'Pesqueira', 'PE', 'Almoxarifado', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Almoxarifado', 'Sirinhaém', 'PE', 'Almoxarifado', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Almoxarifado', 'Tacaratu', 'PE', 'Almoxarifado', '-', NULL, NULL),
  ('Almoxarifado', 'Águas Belas', 'PE', 'Almoxarifado', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Almoxarifado', 'Fundo de Saúde da Ilha de Itamaracá', 'PE', 'Almoxarifado', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Contratos e Convênios', 'Bezerros', 'PE', 'Contratos e Convênios', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Contratos e Convênios', 'Cachoeirinha', 'PE', 'Contratos e Convênios', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Contratos e Convênios', 'Dois Riachos', 'PE', 'Contratos e Convênios', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Contratos e Convênios', 'Câmara de Ipojuca', 'PE', 'Contratos e Convênios', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Contratos e Convênios', 'Jatobá', 'PE', 'Contratos e Convênios', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Contratos e Convênios', 'João Alfredo', 'PE', 'Contratos e Convênios', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Contratos e Convênios', 'Lagoa do Ouro', 'PE', 'Contratos e Convênios', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Contratos e Convênios', 'Panelas', 'PE', 'Contratos e Convênios', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Contratos e Convênios', 'Paulista', 'PE', 'Contratos e Convênios', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Contratos e Convênios', 'Pesqueira', 'PE', 'Contratos e Convênios', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Contratos e Convênios', 'Sirinhaém', 'PE', 'Contratos e Convênios', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Contratos e Convênios', 'São José da Coroa Grande', 'PE', 'Contratos e Convênios', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Contratos e Convênios', 'Tacaratu', 'PE', 'Contratos e Convênios', '-', NULL, NULL),
  ('Contratos e Convênios', 'Vertente do Lério', 'PE', 'Contratos e Convênios', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Contratos e Convênios', 'Jurema', 'PE', 'Contratos e Convênios', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Contratos e Convênios', 'Ilha de Itamaracá', 'PE', 'Contratos e Convênios', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Frota de Veículos', 'Cachoeirinha', 'PE', 'Frota de Veículos', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Frota de Veículos', 'SAAE Catende', 'PE', 'Frota de Veículos', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Frota de Veículos', 'Fundo de Saúde de Ilha de Itamaracá', 'PE', 'Frota de Veículos', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Frota de Veículos', 'Jatobá', 'PE', 'Frota de Veículos', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Frota de Veículos', 'Pesqueira', 'PE', 'Frota de Veículos', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Frota de Veículos', 'Sirinhaém', 'PE', 'Frota de Veículos', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Frota de Veículos', 'Tacaratu', 'PE', 'Frota de Veículos', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Frota de Veículos', 'Vertente do Lério', 'PE', 'Frota de Veículos', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Licitação e Pregão Gerencial', 'Bezerros', 'PE', 'Licitação e Pregão Gerencial', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Licitação e Pregão Gerencial', 'Cachoeirinha', 'PE', 'Licitação e Pregão Gerencial', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Licitação e Pregão Gerencial', 'Dois Riachos', 'PE', 'Licitação e Pregão Gerencial', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Licitação e Pregão Gerencial', 'Ilha de Itamaracá', 'PE', 'Licitação e Pregão Gerencial', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Licitação e Pregão Gerencial', 'Câmara de Ipojuca', 'PE', 'Licitação e Pregão Gerencial', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Licitação e Pregão Gerencial', 'Jatobá', 'PE', 'Licitação e Pregão Gerencial', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Licitação e Pregão Gerencial', 'João Alfredo', 'PE', 'Licitação e Pregão Gerencial', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Licitação e Pregão Gerencial', 'Lagoa do Ouro', 'PE', 'Licitação e Pregão Gerencial', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Licitação e Pregão Gerencial', 'Panelas', 'PE', 'Licitação e Pregão Gerencial', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Licitação e Pregão Gerencial', 'Pesqueira', 'PE', 'Licitação e Pregão Gerencial', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Licitação e Pregão Gerencial', 'Sirinhaém', 'PE', 'Licitação e Pregão Gerencial', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Licitação e Pregão Gerencial', 'São José da Coroa Grande', 'PE', 'Licitação e Pregão Gerencial', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Licitação e Pregão Gerencial', 'Tacaratu', 'PE', 'Licitação e Pregão Gerencial', '-', NULL, NULL),
  ('Licitação e Pregão Gerencial', 'Vertente do Lério', 'PE', 'Licitação e Pregão Gerencial', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Licitação e Pregão Gerencial', 'Conisa AL', 'PE', 'Licitação e Pregão Gerencial', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Patrimônio', 'Bezerros', 'PE', 'Patrimônio', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Patrimônio', 'Cabo de Santo Agostinho', 'PE', 'Patrimônio', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Patrimônio', 'Cachoeirinha', 'PE', 'Patrimônio', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Patrimônio', 'Cortês', 'PE', 'Patrimônio', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Patrimônio', 'Frei Miguelinho', 'PE', 'Patrimônio', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Patrimônio', 'Ilha de Itamaracá', 'PE', 'Patrimônio', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('Patrimônio', 'Câmara de Ipojuca', 'PE', 'Patrimônio', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Patrimônio', 'Jatobá', 'PE', 'Patrimônio', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Patrimônio', 'Lagoa do Ouro', 'PE', 'Patrimônio', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Patrimônio', 'câmara de Lajedo', 'PE', 'Patrimônio', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Patrimônio', 'Palmares', 'PE', 'Patrimônio', 'MANOEL', 'manoel@rarotec.com.br', '81 9675-5248'),
  ('Patrimônio', 'Paulista', 'PE', 'Patrimônio', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Patrimônio', 'Pesqueira', 'PE', 'Patrimônio', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Patrimônio', 'Câmara de Pombos', 'PE', 'Patrimônio', 'MANOEL', 'manoel@rarotec.com.br', '81 9675-5248'),
  ('Patrimônio', 'Câmara de Saloá', 'PE', 'Patrimônio', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('Patrimônio', 'Sirinhaém', 'PE', 'Patrimônio', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Patrimônio', 'Tacaratu', 'PE', 'Patrimônio', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Patrimônio', 'Tupanatinga', 'PE', 'Patrimônio', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Patrimônio', 'Vertente do Lério', 'PE', 'Patrimônio', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('Patrimônio', 'Águas Belas', 'PE', 'Patrimônio', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('PORTAL DE TRANSPARÊNCIA', 'Bezerros', 'PE', 'Portal de Transparência', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('PORTAL DE TRANSPARÊNCIA', 'São José da Coroa Grande', 'PE', 'Portal de Transparência', 'DANIELE', 'danielle@rarotec.com.br', '81 8850-8760'),
  ('PORTAL DE TRANSPARÊNCIA', 'Cabo de Santo Agostinho', 'PE', 'Portal de Transparência', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('PORTAL DE TRANSPARÊNCIA', 'Tacaratu', 'PE', 'Portal de Transparência', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('PORTAL DE TRANSPARÊNCIA', 'Jurema', 'PE', 'Portal de Transparência', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('PORTAL DE TRANSPARÊNCIA', 'Jatobá', 'PE', 'Portal de Transparência', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('PORTAL DE TRANSPARÊNCIA', 'Paulista', 'PE', 'Portal de Transparência', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('PORTAL DE TRANSPARÊNCIA', 'Câmara de Paulista', 'PE', 'Portal de Transparência', 'EWERTON', 'ewerton@rarotec.com.br', '81 9 9158-2219'),
  ('PORTAL DE TRANSPARÊNCIA', 'Câmara de Pesqueira', 'PE', 'Portal de Transparência', 'FELIPE', 'felipesantos@rarotec.com.br', '81 9931-6127'),
  ('PORTAL DE TRANSPARÊNCIA', 'Câmara de Tacaratu', 'PE', 'Portal de Transparência', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('PORTAL DE TRANSPARÊNCIA', 'Câmara de Ipojuca', 'PE', 'Portal de Transparência', 'JEFERSON', 'jeferson@rarotec.com.br', '79 9932-5624'),
  ('Tributos', 'Aliança', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Cortês', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Sitemas de Águas -  Cortês', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Ibimirim', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Ingazeira', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Jatobá', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Manari', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Tacaratu', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Tributos', 'Vertente do Lério', 'PE', 'PM', 'Tributos', NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Aliança', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Cortês', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Ibimirim', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Ingazeira', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Jatobá', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Manari', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Tacaratu', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Nota Fiscal Eletrônica', 'Vertente do Lério', 'PE', 'Nota Fiscal Eletrônica', NULL, NULL, NULL),
  ('Diário Oficial', 'Tacaratu', 'PE', 'Diário Oficial', NULL, NULL, NULL),
  ('Assine Aqui', 'Jaboatão dos Guararapes', 'PE', 'Assine Aqui', NULL, NULL, NULL),
  ('GED', 'Ibimirim', 'PE', 'GED', NULL, NULL, NULL),
  ('GED', 'Jaboatão dos Guararapes', 'PE', 'GED', NULL, NULL, NULL),
  ('GED', 'Panelas', 'PE', 'GED', NULL, NULL, NULL),
  ('GED', 'Pesqueira', 'PE', 'GED', NULL, NULL, NULL),
  ('GED', 'Tacaratu', 'PE', 'GED', NULL, NULL, NULL),
  ('Previdência Complementar - RH', 'Câmara de Ipojuca', 'PE', 'Previdência Complementar - RH', NULL, NULL, NULL),
  ('Previdência Complementar - RH', 'Jaboatão dos Guararapes', 'PE', 'Previdência Complementar - RH', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Linhas sem uma pessoa identificável permanecem visíveis na fila, mas não são importadas.
UPDATE responsaveis_importacao
SET
  status = 'ignorado',
  observacao = 'Responsável ausente ou inválido na planilha de origem',
  updated_at = NOW()
WHERE status = 'pendente'
  AND (
    NULLIF(TRIM(COALESCE(responsavel_origem, '')), '') IS NULL
    OR TRIM(responsavel_origem) = '-'
    OR sisgar_normalizar(responsavel_origem) IN ('tributos', 'responsavel')
  );

-- E-mail é a chave principal. O nome só é usado quando encontra exatamente um técnico.
UPDATE responsaveis_importacao ri
SET
  tecnico_rarotec_id = COALESCE(
    (
      SELECT MIN(t.id)
      FROM tecnicos_rarotec t
      WHERE LOWER(TRIM(t.email)) = LOWER(TRIM(REPLACE(ri.email_origem, ',br', '.br')))
      HAVING COUNT(*) = 1
    ),
    (
      SELECT MIN(t.id)
      FROM tecnicos_rarotec t
      WHERE sisgar_normalizar(t.nome) = sisgar_normalizar(ri.responsavel_origem)
      HAVING COUNT(*) = 1
    )
  ),
  updated_at = NOW()
WHERE ri.status = 'pendente';

-- ENTIDADES ESPECIAIS: no cadastro do Sisgar, Câmara/SAAE/Fundo/Instituto são CLIENTES
-- próprios (não órgãos), identificados pelo nome fantasia + a cidade extraída do rótulo
-- da planilha. Cada bloco exige match ÚNICO (HAVING COUNT(*) = 1) para nunca atribuir
-- um responsável a um cliente errado; casos ambíguos permanecem pendentes.

-- Câmaras: "Câmara de X" -> cliente cujo nome fantasia começa com "Câmara " na cidade X.
UPDATE responsaveis_importacao ri
SET
  cliente_id = (
    SELECT MIN(c.id)
    FROM clientes c
    WHERE c.ativo = true
      AND sisgar_normalizar(c.nome_fantasia) LIKE 'camara %'
      AND sisgar_normalizar(c.cidade) = TRIM(
        REGEXP_REPLACE(sisgar_normalizar(ri.municipio), '^camara( de| da| do)? ', '')
      )
    HAVING COUNT(*) = 1
  ),
  updated_at = NOW()
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NULL
  AND sisgar_normalizar(ri.municipio) LIKE 'camara %';

-- SAAE / Sistemas de Águas: "Sistema de Águas - X" / "SAAE X" -> autarquia de água na cidade X.
UPDATE responsaveis_importacao ri
SET
  cliente_id = (
    SELECT MIN(c.id)
    FROM clientes c
    WHERE c.ativo = true
      AND (
        sisgar_normalizar(c.nome_fantasia) LIKE 'saae %'
        OR sisgar_normalizar(c.nome_fantasia) LIKE 'sistema%agua%'
        OR sisgar_normalizar(c.nome_fantasia) LIKE 'compesa%'
      )
      AND sisgar_normalizar(c.cidade) = TRIM(
        REGEXP_REPLACE(
          sisgar_normalizar(ri.municipio),
          '^(saae|sistemas?|sitemas?)( de)?( aguas?)? ', ''
        )
      )
    HAVING COUNT(*) = 1
  ),
  updated_at = NOW()
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NULL
  AND sisgar_normalizar(ri.municipio) ~ '^(saae|sistema|sitema)';

-- Fundos / Institutos: cliente cujo nome fantasia corresponde exatamente ao rótulo informado.
UPDATE responsaveis_importacao ri
SET
  cliente_id = (
    SELECT MIN(c.id)
    FROM clientes c
    WHERE c.ativo = true
      AND sisgar_normalizar(c.nome_fantasia) = sisgar_normalizar(ri.municipio)
    HAVING COUNT(*) = 1
  ),
  updated_at = NOW()
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NULL
  AND sisgar_normalizar(ri.municipio) ~ '^(fundo|instituto)';

-- Municípios "puros" (sem prefixo de entidade) são a PREFEITURA daquela cidade.
-- Filtramos por nome fantasia "Prefeitura ..." (excluindo cadastros de Estagiários)
-- para desambiguar entre os vários clientes que compartilham a mesma cidade.
UPDATE responsaveis_importacao ri
SET
  cliente_id = (
    SELECT MIN(c.id)
    FROM clientes c
    WHERE c.ativo = true
      AND sisgar_normalizar(c.cidade) = sisgar_normalizar(ri.municipio)
      AND sisgar_normalizar(c.nome_fantasia) LIKE 'prefeitura %'
      AND sisgar_normalizar(c.nome_fantasia) NOT LIKE '%estagiario%'
    HAVING COUNT(*) = 1
  ),
  updated_at = NOW()
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NULL
  AND sisgar_normalizar(ri.municipio) !~ '^(camara|fundo|instituto|saae|sistema|sitema)';

-- Concilia os nomes antigos dos módulos com os módulos efetivamente cadastrados no Sisgar.
UPDATE responsaveis_importacao ri
SET
  modulo_destino = (
    SELECT MIN(lista.modulo)
    FROM (
      SELECT cm.modulo
      FROM clientes_modulos cm
      WHERE ri.orgao_id IS NULL AND cm.cliente_id = ri.cliente_id
      UNION ALL
      SELECT om.modulo
      FROM orgaos_modulos om
      WHERE ri.orgao_id IS NOT NULL AND om.orgao_id = ri.orgao_id
    ) lista
    WHERE CASE sisgar_normalizar(ri.modulo_origem)
      WHEN 'assine aqui' THEN sisgar_normalizar(lista.modulo) = 'assinatura digital'
      WHEN 'ged' THEN sisgar_normalizar(lista.modulo) IN ('ged', 'gerenciador eletronico de documentos', 'processos e documentos digitais')
      WHEN 'portal de transparencia' THEN sisgar_normalizar(lista.modulo) = 'portal da transparencia'
      ELSE sisgar_normalizar(lista.modulo) = sisgar_normalizar(ri.modulo_origem)
    END
    HAVING COUNT(*) = 1
  ),
  updated_at = NOW()
WHERE ri.status = 'pendente'
  AND ri.cliente_id IS NOT NULL;

UPDATE responsaveis_importacao
SET
  status = 'pronto',
  observacao = NULL,
  updated_at = NOW()
WHERE status = 'pendente'
  AND cliente_id IS NOT NULL
  AND tecnico_rarotec_id IS NOT NULL
  AND modulo_destino IS NOT NULL;

-- Divergências da própria planilha não são resolvidas por ordem de aparição.
UPDATE responsaveis_importacao ri
SET
  status = 'pendente',
  observacao = 'Conflito na base: mais de um responsável para o mesmo cliente, módulo e abrangência',
  updated_at = NOW()
WHERE ri.status = 'pronto'
  AND EXISTS (
    SELECT 1
    FROM responsaveis_importacao outro
    WHERE outro.id <> ri.id
      AND outro.status = 'pronto'
      AND outro.cliente_id = ri.cliente_id
      AND outro.modulo_destino = ri.modulo_destino
      AND outro.orgao_id IS NOT DISTINCT FROM ri.orgao_id
      AND outro.tecnico_rarotec_id <> ri.tecnico_rarotec_id
  );

UPDATE responsaveis_importacao
SET
  observacao = CONCAT_WS('; ',
    CASE WHEN cliente_id IS NULL THEN 'Cliente/órgão não conciliado' END,
    CASE WHEN tecnico_rarotec_id IS NULL THEN 'Funcionário não conciliado' END,
    CASE WHEN modulo_destino IS NULL THEN 'Módulo não conciliado com o cadastro do cliente' END
  ),
  updated_at = NOW()
WHERE status = 'pendente';

INSERT INTO responsaveis_modulos (
  cliente_id, modulo, orgao_id, tecnico_rarotec_id, observacoes
)
SELECT
  ri.cliente_id,
  ri.modulo_destino,
  ri.orgao_id,
  ri.tecnico_rarotec_id,
  'Carga inicial conciliada da planilha Controle de Responsáveis'
FROM responsaveis_importacao ri
WHERE ri.status = 'pronto'
  AND NOT EXISTS (
    SELECT 1
    FROM responsaveis_modulos r
    WHERE r.ativo = true
      AND r.cliente_id = ri.cliente_id
      AND LOWER(r.modulo) = LOWER(ri.modulo_destino)
      AND r.orgao_id IS NOT DISTINCT FROM ri.orgao_id
  );

UPDATE responsaveis_importacao ri
SET status = 'importado', updated_at = NOW()
WHERE ri.status = 'pronto'
  AND EXISTS (
    SELECT 1
    FROM responsaveis_modulos r
    WHERE r.ativo = true
      AND r.cliente_id = ri.cliente_id
      AND LOWER(r.modulo) = LOWER(ri.modulo_destino)
      AND r.orgao_id IS NOT DISTINCT FROM ri.orgao_id
  );

COMMIT;

-- Relatório de conferência: deve ser revisado antes de corrigir manualmente os pendentes.
SELECT
  status,
  COUNT(*) AS quantidade
FROM responsaveis_importacao
GROUP BY status
ORDER BY status;

SELECT
  municipio, uf, modulo_origem, responsavel_origem, email_origem, observacao
FROM responsaveis_importacao
WHERE status IN ('pendente', 'ignorado')
ORDER BY modulo_origem, municipio;
