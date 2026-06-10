import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Menu from './Menu.js';
import Pedido from './Pedido.js';
import HistorialPedido from './HistorialPedido.js';

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

export { sequelize, Usuario, Menu, Pedido, HistorialPedido };
