import { DataTypes } from 'sequelize';
import sequelize, { isDatabaseConnected } from '../database/sequelize.js';

export const Model = sequelize.define('Model', {
  id_model: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Model',
  timestamps: false
});

export const BASE_MODELS_SEED = [
  { id_model: 1, name: 'Agenda Visual', type: 'routine', description: 'Linha do tempo e blocos de horário' },
  { id_model: 2, name: 'Calendário', type: 'calendario', description: 'Visão mensal de prazos e compromissos' },
  { id_model: 3, name: 'Pomodoro', type: 'pomodoro', description: 'Temporizador de foco consciente e pausas' },
  { id_model: 4, name: 'Brain Dump', type: 'brain-dump', description: 'Captura rápida de ideias sem prazos' },
  { id_model: 5, name: 'Microtarefas', type: 'microtasks', description: 'Divisão de tarefas em etapas curtas e gerenciáveis' },
  { id_model: 6, name: 'Kanban', type: 'kanban', description: 'Fluxo visual em colunas: A Fazer, Em Progresso e Concluído' },
  { id_model: 7, name: 'Matriz de Prioridades', type: 'priority-matrix', description: 'Organização por importância e urgência' },
  { id_model: 8, name: 'Rastreador de Hábitos', type: 'habits', description: 'Acompanhamento de hábitos com frequência e histórico' },
  { id_model: 9, name: 'Rotinas Diárias', type: 'daily-routines', description: 'Sequências de atividades por períodos do dia com checklist diário' },
];

export const seedDefaultModels = async () => {
  if (!(await isDatabaseConnected())) return;

  try {
    for (const item of BASE_MODELS_SEED) {
      const existing = await Model.findOne({ where: { type: item.type } });
      if (!existing) {
        await Model.create({
          name: item.name,
          type: item.type,
          description: item.description,
        });
      }
    }

    // Corrige tarefas existentes que foram salvas com id_model = NULL quando a tabela Model estava vazia
    const allModels = await Model.findAll({ raw: true });
    const typeToId = {};
    allModels.forEach((m) => {
      typeToId[m.type] = m.id_model;
    });

    if (typeToId['habits']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL AND id_task IN (SELECT id_task FROM "TaskHabit")`,
        { replacements: { idModel: typeToId['habits'] } }
      ).catch(() => {});
    }
    if (typeToId['daily-routines']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL AND id_task IN (SELECT id_task FROM "TaskRoutine")`,
        { replacements: { idModel: typeToId['daily-routines'] } }
      ).catch(() => {});
    }
    if (typeToId['kanban']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL AND id_task IN (SELECT id_task FROM "TaskKanban")`,
        { replacements: { idModel: typeToId['kanban'] } }
      ).catch(() => {});
    }
    if (typeToId['priority-matrix']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL AND id_task IN (SELECT id_task FROM "TaskMatrix")`,
        { replacements: { idModel: typeToId['priority-matrix'] } }
      ).catch(() => {});
    }
    if (typeToId['microtasks']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL AND id_task IN (SELECT id_task FROM "Subtask")`,
        { replacements: { idModel: typeToId['microtasks'] } }
      ).catch(() => {});
    }
    if (typeToId['routine']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL AND id_task IN (SELECT id_task FROM "TaskSchedule" WHERE start_time IS NOT NULL)`,
        { replacements: { idModel: typeToId['routine'] } }
      ).catch(() => {});
    }
    if (typeToId['calendario']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL AND id_task IN (SELECT id_task FROM "TaskSchedule")`,
        { replacements: { idModel: typeToId['calendario'] } }
      ).catch(() => {});
    }
    if (typeToId['brain-dump']) {
      await sequelize.query(
        `UPDATE "Task" SET id_model = :idModel WHERE id_model IS NULL`,
        { replacements: { idModel: typeToId['brain-dump'] } }
      ).catch(() => {});
    }
  } catch (err) {
    console.warn('Aviso ao semear modelos base:', err.message);
  }
};
