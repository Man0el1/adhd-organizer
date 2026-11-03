import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const UserModel = sequelize.define('UserModel', {
  id_user_model: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Account',
      key: 'id_account',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  id_model: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Model',
      key: 'id_model',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'UserModel',
  timestamps: true,
});
