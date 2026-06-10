import * as menusService from '../services/menus.service.js';

async function listar(req, res, next) {
  try {
    const { fecha, tipo, activo } = req.query;
    const menus = await menusService.listarMenus({ fecha, tipo, activo });
    res.json(menus);
  } catch (err) {
    next(err);
  }
}

export { listar };
