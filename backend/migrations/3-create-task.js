export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Task', {
    id_task: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_account: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Account',
        key: 'id_account'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    id_model: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Model',
        key: 'id_model'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    date: {
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
    recurrence: {
      type: Sequelize.STRING,
      defaultValue: 'none'
    },
    done: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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
  await queryInterface.dropTable('Task');
}
