const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Menu = require('./Menu');
const Pedido = require('./Pedido');
const HistorialPedido = require('./HistorialPedido');

// Usuario 1:N Pedido
Usuario.hasMany(Pedido, { foreignKey: 'usuarioId', as: 'pedidos' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Menu 1:N Pedido
Menu.hasMany(Pedido, { foreignKey: 'menuId', as: 'pedidos' });
Pedido.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });

// Pedido 1:N HistorialPedido
Pedido.hasMany(HistorialPedido, { foreignKey: 'pedidoId', as: 'historial' });
HistorialPedido.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido' });

// Usuario 1:N HistorialPedido
Usuario.hasMany(HistorialPedido, { foreignKey: 'usuarioId', as: 'historialAcciones' });
HistorialPedido.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

module.exports = { sequelize, Usuario, Menu, Pedido, HistorialPedido };
