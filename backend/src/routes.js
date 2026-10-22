import express from 'express';
const route = express.Router();

// Controllers
import { accountExists } from './controllers/loginController.js';
import { createAccount } from './controllers/registerController.js';
import { getTasks, getTodayCounts, createTask, deleteTask, toggleTask, completeTask } from './controllers/taskController.js';
import { getUserModels, updateUserModels } from './controllers/userModelController.js';

// Middlewares
import { blockLoggedIn } from './middlewares/blockLoggedIn.js';

// Auth routes
route.post('/api/login', blockLoggedIn, accountExists);
route.post('/api/register', blockLoggedIn, createAccount);

// Task routes
route.get('/api/tasks', getTasks);
route.get('/api/tasks/today-counts', getTodayCounts);
route.post('/api/tasks', createTask);
route.delete('/api/tasks/:id', deleteTask);
route.patch('/api/tasks/:id/toggle', toggleTask);
route.patch('/api/tasks/:id/complete', completeTask);

// User models preference routes (salvos no backend)
route.get('/api/user/models', getUserModels);
route.put('/api/user/models', updateUserModels);

export default route;
