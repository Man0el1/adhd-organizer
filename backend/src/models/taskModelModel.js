import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Task_Model = sequelize.define('Task_Model', {
  id_task_model: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_task: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Task',
      key: 'id_task'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  id_model: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Model',
      key: 'id_model'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'Task_Model',
  timestamps: false
});
