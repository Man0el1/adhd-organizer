import { DataTypes } from 'sequelize';
import sequelize from '../../database/sequelize.js';

export const TaskSchedule = sequelize.define('TaskSchedule', {
  id_task_schedule: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_task_schedule'
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
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  recurrence: {
    type: DataTypes.STRING,
    defaultValue: 'none' // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  }
}, {
  tableName: 'TaskSchedule',
  timestamps: true
});

// Alias para compatibilidade temporária se necessário
export const TaskCalendar = TaskSchedule;
export default TaskSchedule;
