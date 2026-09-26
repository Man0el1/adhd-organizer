import express from 'express';
const route = express.Router();

//controllers
import { accountExists } from './controllers/loginController.js';
import { createAccount } from './controllers/registerController.js';
//middlewares
import { blockLoggedIn } from './middlewares/blockLoggedIn.js';
import { requireToken } from './middlewares/requireToken.js';

route.post('/api/login', blockLoggedIn, accountExists);

route.post('/api/register', blockLoggedIn, createAccount);

export default route;
