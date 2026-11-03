export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('TaskCalendar', {
    id_taskCalendar: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_task: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Task',
        key: 'id_task'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    start_date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    start_time: {
      type: Sequelize.TIME,
      allowNull: true
    },
    end_time: {
      type: Sequelize.TIME,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('TaskCalendar');
}
