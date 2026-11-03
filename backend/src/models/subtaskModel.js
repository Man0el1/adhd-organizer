import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

export const Subtask = sequelize.define('Subtask', {
  id_subtask: {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  done: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'Subtask',
  timestamps: true
});

export default Subtask;
