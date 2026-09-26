import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import { Account } from './accountModel.js';

export const Space = sequelize.define('Space', {
  id_space: {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},{
  tableName: "Space",
  timestamps: true
});
