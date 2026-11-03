import { Account } from './accountModel.js';
import { Model } from './modelModel.js';
import { Task } from './taskModel.js';
import { TaskSchedule } from './TaskTypes/taskScheduleModel.js';
import { TaskKanban } from './TaskTypes/taskKanbanModel.js';
import { TaskMatrix } from './TaskTypes/taskMatrixModel.js';
import { TaskHabit } from './TaskTypes/taskHabitModel.js';
import { TaskRoutine } from './TaskTypes/taskRoutineModel.js';
import { Subtask } from './subtaskModel.js';
import { UserModel } from './userModelModel.js';
import { TaskCompletion } from './taskCompletionModel.js';

// Relações de Conta (Account)
Account.hasMany(Task, { foreignKey: 'id_account', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Account, { foreignKey: 'id_account', as: 'account' });

Account.hasMany(UserModel, { foreignKey: 'id_account', as: 'userModels', onDelete: 'CASCADE' });
UserModel.belongsTo(Account, { foreignKey: 'id_account', as: 'account' });

// Conclusão de Ocorrências (TaskCompletion)
Task.hasMany(TaskCompletion, { foreignKey: 'id_task', as: 'completions', onDelete: 'CASCADE' });
TaskCompletion.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

Account.hasMany(TaskCompletion, { foreignKey: 'id_account', as: 'taskCompletions', onDelete: 'CASCADE' });
TaskCompletion.belongsTo(Account, { foreignKey: 'id_account', as: 'account' });

// Regra de negócio: Cada tarefa pertence a um único Modelo (1 : N)
Model.hasMany(Task, { foreignKey: 'id_model', as: 'tasks', onDelete: 'SET NULL' });
Task.belongsTo(Model, { foreignKey: 'id_model', as: 'model' });

// UserModel (instâncias dos modelos de cada usuário) relacionado ao Model base
UserModel.belongsTo(Model, { foreignKey: 'id_model', as: 'baseModel', onDelete: 'SET NULL' });
Model.hasMany(UserModel, { foreignKey: 'id_model', as: 'userInstances', onDelete: 'SET NULL' });

// Extensão de Agendamento Temporal (1 : 0..1)
Task.hasOne(TaskSchedule, { foreignKey: 'id_task', as: 'schedule', onDelete: 'CASCADE' });
TaskSchedule.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

// Extensão Kanban (1 : 1)
Task.hasOne(TaskKanban, { foreignKey: 'id_task', as: 'kanban', onDelete: 'CASCADE' });
TaskKanban.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

// Extensão Matriz de Prioridades (1 : 1)
Task.hasOne(TaskMatrix, { foreignKey: 'id_task', as: 'matrix', onDelete: 'CASCADE' });
TaskMatrix.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });
// Subtarefas para Microtarefas (1 : N)
Task.hasMany(Subtask, { foreignKey: 'id_task', as: 'subtasks', onDelete: 'CASCADE' });
Subtask.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

// Extensão Rastreador de Hábitos (1 : 1)
Task.hasOne(TaskHabit, { foreignKey: 'id_task', as: 'habit', onDelete: 'CASCADE' });
TaskHabit.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

// Extensão Rotinas Diárias (1 : 1)
Task.hasOne(TaskRoutine, { foreignKey: 'id_task', as: 'dailyRoutine', onDelete: 'CASCADE' });
TaskRoutine.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

export {
  Account,
  Model,
  Task,
  TaskSchedule,
  TaskKanban,
  TaskMatrix,
  Subtask,
  TaskHabit,
  TaskRoutine,
  UserModel,
  TaskCompletion,
};
