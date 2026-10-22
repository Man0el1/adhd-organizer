import { Model } from './modelModel.js';
import { Task } from './taskModel.js';
import { Task_Model } from './taskModelModel.js';
import { TaskCalendar } from './TaskTypes/taskCalendarModel.js';

// Extensão de Calendário (1 : 1) TODO: mudar para ter fim de data, em eventos diarios por exemplo
Task.hasOne(TaskCalendar, { foreignKey: 'id_task', as: 'calendar', onDelete: 'CASCADE' });
TaskCalendar.belongsTo(Task, { foreignKey: 'id_task', as: 'task' });

// ==========================================

Task.belongsToMany(Model, {
  through: Task_Model,
  foreignKey: 'id_task',
  otherKey: 'id_model',
  as: 'models',
  onDelete: 'CASCADE'
});

Model.belongsToMany(Task, {
  through: Task_Model,
  foreignKey: 'id_model',
  otherKey: 'id_task',
  as: 'tasks',
  onDelete: 'CASCADE'
});
