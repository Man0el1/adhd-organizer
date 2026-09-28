export async function up(queryInterface) {
  await queryInterface.bulkInsert('Model', [
    { name: 'Example', type: 'Example', description: 'example',},
  ]);
}
export async function down(queryInterface) {
  await queryInterface.bulkDelete('Model', null, {});
}
