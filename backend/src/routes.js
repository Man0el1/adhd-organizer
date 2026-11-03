import express from 'express';
import './models/associations.js';
const route = express.Router();

import { accountExists } from './controllers/loginController.js';
import { createAccount } from './controllers/registerController.js';
import { getTasks, getTodayCounts, createTask, deleteTask, updateTask, toggleTask, completeTask } from './controllers/taskController.js';
import { getUserModels, updateUserModels } from './controllers/userModelController.js';
import { getUserProfile, updateUserTimezone, updateUserProfile } from './controllers/userProfileController.js';

// Middlewares
import { blockLoggedIn } from './middlewares/blockLoggedIn.js';
import { checkToken } from './middlewares/checkToken.js';

// Auth routes
route.post('/api/login', blockLoggedIn, accountExists);
route.post('/api/register', blockLoggedIn, createAccount);

// User profile & timezone routes (rotas protegidas com checkToken)
route.get('/api/user/profile', checkToken, getUserProfile);
route.patch('/api/user/timezone', checkToken, updateUserTimezone);
route.put('/api/user/profile', checkToken, updateUserProfile);

// Task routes (rotas protegidas com checkToken)
route.get('/api/tasks', checkToken, getTasks);
route.get('/api/tasks/today-counts', checkToken, getTodayCounts);
route.post('/api/tasks', checkToken, createTask);
route.delete('/api/tasks/:id', checkToken, deleteTask);
route.put('/api/tasks/:id', checkToken, updateTask);
route.patch('/api/tasks/:id', checkToken, updateTask);
route.patch('/api/tasks/:id/toggle', checkToken, toggleTask);
route.put('/api/tasks/:id/toggle', checkToken, toggleTask);
route.patch('/api/tasks/:id/complete', checkToken, completeTask);
route.put('/api/tasks/:id/complete', checkToken, completeTask);


// User models preference routes (rotas protegidas com checkToken)
route.get('/api/user/models', checkToken, getUserModels);
route.put('/api/user/models', checkToken, updateUserModels);

export default route;
