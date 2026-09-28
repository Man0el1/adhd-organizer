import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Task = sequelize.define('Task', {
  id_task: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_space: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Space',
      key: 'id_space'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Task',
  timestamps: true
});
