import { DataTypes } from 'sequelize';
import sequelize from '../../database/sequelize.js';

export const TaskHabit = sequelize.define(
  'TaskHabit',
  {
    id_task_habit: {
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
    frequency: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'daily',
    },
    target_days: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [0, 1, 2, 3, 4, 5, 6],
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '#10b981',
    },
  },
  {
    tableName: 'TaskHabit',
    timestamps: true,
  }
);
