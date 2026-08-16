import express from 'express';
import sequelize from './src/database/sequelize.js';
import routes from './src/routes.js';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('message', (message) => {
    console.log(message);
    io.emit('message', `${socket.id.substr(0,2)}: ${message}`)
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Banco de dados conectado com sucesso');

    server.listen(8080, () => {
      console.log('Servidor rodando na porta 8080');
    });
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
  }
})();
