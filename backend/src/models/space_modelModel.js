import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import { Account } from './accountModel.js';
import { Space } from './spaceModel.js';

export const Space_Model = sequelize.define('Space_Model', {
  id_space_model: {
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
},{
  tableName: "Space_Model",
  timestamps: false
});
