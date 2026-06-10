const { Pedido } = require('../models');

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tenés permisos para realizar esta acción' });
    }
    next();
  };
}

async function authorizeOwnerOrAdmin(req, res, next) {
  try {
    if (req.usuario.rol === 'admin') return next();

    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      const err = new Error('Pedido no encontrado');
      err.status = 404;
      return next(err);
    }

    if (pedido.usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: 'No tenés permisos para modificar este pedido' });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authorizeRole, authorizeOwnerOrAdmin };
