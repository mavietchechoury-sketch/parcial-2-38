const TURNOS_VALIDOS = ['almuerzo', 'cena'];

function validateCrearPedido(req, res, next) {
  const { menuId, fecha, cantidad, turnoEntrega, puntoRetiro } = req.body;
  const errores = [];

  if (!menuId) errores.push('menuId es requerido');
  if (!fecha || String(fecha).trim() === '') errores.push('fecha es requerida');
  if (cantidad === undefined || cantidad === null) {
    errores.push('cantidad es requerida');
  } else if (!Number.isInteger(Number(cantidad)) || Number(cantidad) <= 0) {
    errores.push('cantidad debe ser un número entero mayor a 0');
  }
  if (!turnoEntrega || String(turnoEntrega).trim() === '') errores.push('turnoEntrega es requerido');
  if (!puntoRetiro || String(puntoRetiro).trim() === '') errores.push('puntoRetiro es requerido');

  if (turnoEntrega && !TURNOS_VALIDOS.includes(turnoEntrega)) {
    errores.push('turnoEntrega debe ser almuerzo o cena');
  }

  if (errores.length > 0) {
    return res.status(400).json({ error: errores.join(', ') });
  }

  next();
}

function validateEditarPedido(req, res, next) {
  const camposPermitidos = ['menuId', 'fecha', 'cantidad', 'turnoEntrega', 'puntoRetiro', 'observaciones'];
  const camposEnviados = Object.keys(req.body).filter((k) => camposPermitidos.includes(k));

  if (camposEnviados.length === 0) {
    return res.status(400).json({ error: 'Debe enviar al menos un campo para editar' });
  }

  const { turnoEntrega } = req.body;
  if (turnoEntrega && !TURNOS_VALIDOS.includes(turnoEntrega)) {
    return res.status(400).json({ error: 'turnoEntrega debe ser almuerzo o cena' });
  }

  next();
}

module.exports = { validateCrearPedido, validateEditarPedido };
