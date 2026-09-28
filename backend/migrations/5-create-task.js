export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Task', {
    id_task: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_space: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Space',
        key: 'id_space'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
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
