import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.routes.js';
import menusRoutes from './src/routes/menus.routes.js';
import pedidosRoutes from './src/routes/pedidos.routes.js';
import errorHandler from './src/middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.use(errorHandler);

export default app;
