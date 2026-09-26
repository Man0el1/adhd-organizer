import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Model = sequelize.define('Model', {
  id_model: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, //change to ENUM later
    allowNull: false,
  },
  description: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
},{
  tableName: "Model",
  timestamps: false
});
