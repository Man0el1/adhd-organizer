import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Account = sequelize.define('Account', {
  id_account: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
},{
  tableName: "Account",
  timestamps: true
});
