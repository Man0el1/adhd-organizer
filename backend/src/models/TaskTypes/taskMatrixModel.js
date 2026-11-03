import { DataTypes } from 'sequelize';
import sequelize from '../../database/sequelize.js';

export const TaskMatrix = sequelize.define('TaskMatrix', {
  id_task_matrix: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_task_matrix'
  },
  id_task: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Task',
      key: 'id_task'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  urgency: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  importance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'TaskMatrix',
  timestamps: true
});

export default TaskMatrix;
