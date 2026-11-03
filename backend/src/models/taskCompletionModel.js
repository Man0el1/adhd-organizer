import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const TaskCompletion = sequelize.define('TaskCompletion', {
  id_completion: {
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
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Account',
      key: 'id_account'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'TaskCompletion',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id_task', 'date']
    }
  ]
});

export default TaskCompletion;
