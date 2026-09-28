export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Space_Model', {
    id_space_model: {
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
    id_model: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Model',
        key: 'id_model'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('Space_Model');
}
