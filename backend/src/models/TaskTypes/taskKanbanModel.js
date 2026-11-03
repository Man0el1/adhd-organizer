import { DataTypes } from 'sequelize';
import sequelize from '../../database/sequelize.js';

export const TaskKanban = sequelize.define('TaskKanban', {
  id_task_kanban: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_task_kanban'
  },
  id_task: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Task',
      key: 'id_task'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  column_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'todo' // 'todo' | 'in_progress' | 'done'
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'TaskKanban',
  timestamps: true
});

export default TaskKanban;
