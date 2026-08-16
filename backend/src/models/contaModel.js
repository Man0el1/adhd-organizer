import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Conta = sequelize.define('Conta', {
  id_Conta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  }
},{
  tableName: "Conta",
  timestamps: false
});
