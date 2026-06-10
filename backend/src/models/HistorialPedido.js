import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HistorialPedido = sequelize.define('HistorialPedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pedidoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'pedidos', key: 'id' },
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  valorAnterior: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('valorAnterior');
      return raw ? JSON.parse(raw) : null;
    },
    set(val) {
      this.setDataValue('valorAnterior', val ? JSON.stringify(val) : null);
    },
  },
  valorNuevo: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('valorNuevo');
      return raw ? JSON.parse(raw) : null;
    },
    set(val) {
      this.setDataValue('valorNuevo', val ? JSON.stringify(val) : null);
    },
  },
}, {
  tableName: 'historial_pedidos',
  timestamps: false,
});

export default HistorialPedido;
