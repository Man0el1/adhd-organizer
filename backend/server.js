import express from 'express';
import sequelize from './src/database/sequelize.js';
import routes from './src/routes.js';
import './src/models/associations.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Banco de dados conectado com sucesso');
    await sequelize.sync();

    app.listen(8080, () => {
      console.log('Servidor rodando na porta 8080');
    });
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
  }
})();
