import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('clasico', 'vegetariano', 'vegano', 'sin_tacc'),
    allowNull: false,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  cupoDiario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'menus',
  timestamps: true,
});

export default Menu;
