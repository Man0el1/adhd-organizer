import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import { Account } from './accountModel.js';
import { Space } from './spaceModel.js';

export const Task = sequelize.define('Task', {
  id_task: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Account,
      key: 'id_account',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  id_space: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Space,
      key: 'id_space',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  // Add other task fields here, e.g., title, description, status, etc.
},{
  tableName: "Task",
  timestamps: true
});
