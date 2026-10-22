import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Task = sequelize.define('Task', {
  id_task: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
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
  },
  done: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'Task',
  timestamps: true
});
