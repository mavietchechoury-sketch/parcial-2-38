const menusService = require('../services/menus.service');

async function listar(req, res, next) {
  try {
    const { fecha, tipo, activo } = req.query;
    const menus = await menusService.listarMenus({ fecha, tipo, activo });
    res.json(menus);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
