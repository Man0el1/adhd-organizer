-- ====================================================================
-- FocusMod - Script de Correção e Conexão de Relacionamentos (ERD)
-- Este script limpa a tabela legada 'Space', adiciona a coluna de usuário
-- em Task e garante que todas as tabelas estejam conectadas no ERD do pgAdmin.
-- ====================================================================

-- 1. Remove tabela legada 'Space' (e sua chave estrangeira antiga em Task caso exista)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Space') THEN
    DROP TABLE "Space" CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'id_space') THEN
    ALTER TABLE "Task" DROP COLUMN id_space CASCADE;
  END IF;
END $$;

-- 2. Tabela de Contas de Usuários (Account)
CREATE TABLE IF NOT EXISTS "Account" (
  id_account SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela Catálogo de Modelos Base (Model)
CREATE TABLE IF NOT EXISTS "Model" (
  id_model SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description TEXT
);

-- 4. Tabela de Tarefas (Task) conectada diretamente a Account e a Model (1 Tarefa = 1 Modelo)
CREATE TABLE IF NOT EXISTS "Task" (
  id_task SERIAL PRIMARY KEY,
  id_account INTEGER REFERENCES "Account"(id_account) ON DELETE CASCADE ON UPDATE CASCADE,
  id_model INTEGER REFERENCES "Model"(id_model) ON DELETE SET NULL ON UPDATE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  recurrence VARCHAR(50) DEFAULT 'none',
  done BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garante que id_account e id_model existam em Task
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'id_account') THEN
    ALTER TABLE "Task" ADD COLUMN id_account INTEGER REFERENCES "Account"(id_account) ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'id_model') THEN
    ALTER TABLE "Task" ADD COLUMN id_model INTEGER REFERENCES "Model"(id_model) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- Se existir a tabela associativa legada Task_Model, migra o id_model para a Task e remove a tabela
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Task_Model') THEN
    UPDATE "Task" t
    SET id_model = tm.id_model
    FROM "Task_Model" tm
    WHERE t.id_task = tm.id_task AND t.id_model IS NULL;

    DROP TABLE IF EXISTS "Task_Model" CASCADE;
  END IF;
END $$;


-- 6. Tabela de Modelos / Instâncias configuradas por cada Usuário (UserModel)
CREATE TABLE IF NOT EXISTS "UserModel" (
  id_user_model SERIAL PRIMARY KEY,
  id_account INTEGER NOT NULL REFERENCES "Account"(id_account) ON DELETE CASCADE ON UPDATE CASCADE,
  id_model INTEGER REFERENCES "Model"(id_model) ON DELETE SET NULL ON UPDATE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Extensão 1:1 para eventos específicos de Calendário (TaskCalendar)
CREATE TABLE IF NOT EXISTS "TaskCalendar" (
  id_taskCalendar SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Conclusão por Ocorrência / Data (TaskCompletion)
CREATE TABLE IF NOT EXISTS "TaskCompletion" (
  id_completion SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  id_account INTEGER NOT NULL REFERENCES "Account"(id_account) ON DELETE CASCADE ON UPDATE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_task_date UNIQUE (id_task, date)
);


-- Seed de modelos base (se não existirem)
INSERT INTO "Model" (id_model, name, type, description)
VALUES 
  (1, 'Agenda Visual', 'routine', 'Linha do tempo e blocos de horário'),
  (2, 'Calendário', 'calendario', 'Visão mensal de prazos e compromissos'),
  (3, 'Pomodoro', 'pomodoro', 'Temporizador de foco consciente e pausas'),
  (4, 'Brain Dump', 'brain-dump', 'Captura rápida de ideias sem prazos')
ON CONFLICT (id_model) DO NOTHING;
