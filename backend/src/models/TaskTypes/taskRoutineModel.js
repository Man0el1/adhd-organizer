import { DataTypes } from 'sequelize';
import sequelize from '../../database/sequelize.js';

export const TaskRoutine = sequelize.define(
  'TaskRoutine',
  {
    id_task_routine: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_task: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Task',
        key: 'id_task',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    period: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'morning', // 'morning' | 'afternoon' | 'night'
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'TaskRoutine',
    timestamps: true,
  }
);
