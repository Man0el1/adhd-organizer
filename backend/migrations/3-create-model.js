export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Model', {
    id_model: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('Model');
}
