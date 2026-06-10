const { Menu } = require('../models');
const { Op } = require('sequelize');

async function listarMenus({ fecha, tipo, activo } = {}) {
  const where = {};
  if (fecha) where.fecha = fecha;
  if (tipo) where.tipo = tipo;
  if (activo !== undefined) where.activo = activo === 'true' || activo === true;

  return Menu.findAll({ where, order: [['fecha', 'ASC'], ['nombre', 'ASC']] });
}

module.exports = { listarMenus };
