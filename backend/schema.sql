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

-- 7. Tabela de Extensão 1:0..1 para Agendamento Temporal (TaskSchedule)
CREATE TABLE IF NOT EXISTS "TaskSchedule" (
  id_task_schedule SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL UNIQUE REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  recurrence VARCHAR(50) DEFAULT 'none',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migração segura de TaskCalendar e dados temporais de Task para TaskSchedule
DO $$
BEGIN
  -- Se existir a tabela legada TaskCalendar, migra os registros para TaskSchedule
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'TaskCalendar') THEN
    INSERT INTO "TaskSchedule" (id_task, start_date, end_date, start_time, end_time, recurrence)
    SELECT tc.id_task, tc.start_date, tc.end_date, tc.start_time, tc.end_time, 'none'
    FROM "TaskCalendar" tc
    ON CONFLICT (id_task) DO NOTHING;

    DROP TABLE IF EXISTS "TaskCalendar" CASCADE;
  END IF;

  -- Se existirem tarefas com data em Task que ainda não estão em TaskSchedule, migra-as
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'date') THEN
    INSERT INTO "TaskSchedule" (id_task, start_date, end_date, start_time, end_time, recurrence)
    SELECT t.id_task, t.date, t.date, t.start_time, t.end_time, COALESCE(t.recurrence, 'none')
    FROM "Task" t
    WHERE t.date IS NOT NULL
    ON CONFLICT (id_task) DO NOTHING;
  END IF;
END $$;

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
  (4, 'Brain Dump', 'brain-dump', 'Captura rápida de ideias sem prazos'),
  (5, 'Microtarefas', 'microtasks', 'Divisão de tarefas em etapas curtas e gerenciáveis'),
  (6, 'Kanban', 'kanban', 'Fluxo visual em colunas: A Fazer, Em Progresso e Concluído'),
  (7, 'Matriz de Prioridades', 'priority-matrix', 'Organização por importância e urgência'),
  (8, 'Rastreador de Hábitos', 'habits', 'Acompanhamento de hábitos com frequência e histórico'),
  (9, 'Rotinas Diárias', 'daily-routines', 'Sequências de atividades por períodos do dia com checklist diário')
ON CONFLICT (id_model) DO NOTHING;

-- 9. Tabela de Extensão 1:1 para Kanban (TaskKanban)
CREATE TABLE IF NOT EXISTS "TaskKanban" (
  id_task_kanban SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL UNIQUE REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  column_id VARCHAR(50) NOT NULL DEFAULT 'todo',
  order_index INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de Extensão 1:1 para Matriz de Prioridades (TaskMatrix)
CREATE TABLE IF NOT EXISTS "TaskMatrix" (
  id_task_matrix SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL UNIQUE REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  urgency BOOLEAN NOT NULL DEFAULT TRUE,
  importance BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabela de Subtarefas para Microtarefas (Subtask)
CREATE TABLE IF NOT EXISTS "Subtask" (
  id_subtask SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(255) NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Tabela de Extensão 1:1 para Rastreador de Hábitos (TaskHabit)
CREATE TABLE IF NOT EXISTS "TaskHabit" (
  id_task_habit SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL UNIQUE REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
  target_days JSON DEFAULT '[0, 1, 2, 3, 4, 5, 6]',
  color VARCHAR(50) DEFAULT '#10b981',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Tabela de Extensão 1:1 para Rotinas Diárias (TaskRoutine)
CREATE TABLE IF NOT EXISTS "TaskRoutine" (
  id_task_routine SERIAL PRIMARY KEY,
  id_task INTEGER NOT NULL UNIQUE REFERENCES "Task"(id_task) ON DELETE CASCADE ON UPDATE CASCADE,
  period VARCHAR(50) NOT NULL DEFAULT 'morning',
  order_index INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

