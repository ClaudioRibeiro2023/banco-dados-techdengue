-- TechDengue Warehouse Bootstrap (template)
-- IMPORTANTE: Este arquivo é um template. Para execução automatizada e segura,
-- utilize scripts/auto_pipeline.ps1 (ele não grava a senha em disco e não loga segredos).
-- Se executar manualmente, substitua <SENHA_FORTE> por uma senha robusta ANTES de rodar.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'td_writer') THEN
    CREATE ROLE td_writer;
  END IF;
END $$;

-- Ajuste o DATABASE alvo se necessário (ex.: techdengue_wh)
GRANT CONNECT ON DATABASE postgres TO td_writer;
GRANT USAGE, CREATE ON SCHEMA public TO td_writer;
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO td_writer;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO td_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE ON TABLES TO td_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO td_writer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'td_app') THEN
    CREATE USER td_app WITH ENCRYPTED PASSWORD '<SENHA_FORTE>' LOGIN;
  END IF;
END $$;

GRANT td_writer TO td_app;
