import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Space_Model = sequelize.define('Space_Model', {
  id_space_model: {
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
  id_model: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Model',
      key: 'id_model'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'Space_Model',
  timestamps: false
});
