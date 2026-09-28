import { Account } from './accountModel.js';
import { Space } from './spaceModel.js';
import { Model } from './modelModel.js';
import { Space_Model } from './spaceModelModel.js';
import { Task } from './taskModel.js';
import { TaskCalendar } from './TaskTypes/taskCalendarModel.js';

Account.hasMany(Space, { foreignKey: 'id_account',as: 'spaces' });

Space.belongsTo(Account, { foreignKey: 'id_account',as: 'account' });

// ==========================================

Space.hasMany(Task, { foreignKey: 'id_space',as: 'tasks' });

Task.belongsTo(Space, { foreignKey: 'id_space', as: 'space'});

// ==========================================

Task.hasOne(TaskCalendar, { foreignKey: 'id_task', as: 'calendar' });

TaskCalendar.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

// ==========================================

Space.belongsToMany(Model, {
  through: Space_Model,
  foreignKey: 'id_space',
  otherKey: 'id_model',
  as: 'models'
});

Model.belongsToMany(Space, {
  through: Space_Model,
  foreignKey: 'id_model',
  otherKey: 'id_space',
  as: 'spaces'
});

