import { Account } from './accountModel.js';
import { Model } from './modelModel.js';
import { Task } from './taskModel.js';
import { TaskCalendar } from './TaskTypes/taskCalendarModel.js';
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

// Extensão de Calendário (1 : 1)
Task.hasOne(TaskCalendar, { foreignKey: 'id_task', as: 'calendar', onDelete: 'CASCADE' });
TaskCalendar.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

