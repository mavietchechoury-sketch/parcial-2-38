require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const menusRoutes = require('./src/routes/menus.routes');
const pedidosRoutes = require('./src/routes/pedidos.routes');
const errorHandler = require('./src/middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.use(errorHandler);

module.exports = app;
