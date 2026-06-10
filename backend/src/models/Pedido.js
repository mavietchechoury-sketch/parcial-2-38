const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  menuId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'menus', key: 'id' },
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  turnoEntrega: {
    type: DataTypes.ENUM('almuerzo', 'cena'),
    allowNull: false,
  },
  puntoRetiro: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'cancelado', 'entregado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  observaciones: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'pedidos',
  timestamps: true,
});

module.exports = Pedido;
