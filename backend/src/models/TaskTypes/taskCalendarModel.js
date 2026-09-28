import { DataTypes } from 'sequelize';
import sequelize from '../../database/sequelize.js';

export const TaskCalendar = sequelize.define('TaskCalendar', {
  id_taskCalendar: {
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
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  }
}, {
  tableName: 'TaskCalendar',
  timestamps: true
});
