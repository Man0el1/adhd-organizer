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
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Model',
  timestamps: false
});
