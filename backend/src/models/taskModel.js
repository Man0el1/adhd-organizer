import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Task = sequelize.define('Task', {
  id_task: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Account',
      key: 'id_account'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  id_model: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Model',
      key: 'id_model'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'end_time'
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
