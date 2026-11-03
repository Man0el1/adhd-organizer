export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('UserModel', {
    id_user_model: {
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
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    order_index: {
      type: Sequelize.INTEGER,
      defaultValue: 0
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
  await queryInterface.dropTable('UserModel');
}
