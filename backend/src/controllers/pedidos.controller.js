import * as pedidosService from '../services/pedidos.service.js';

// GET /api/pedidos?fecha=&estado=&menuId=&tipo=&page=&limit=&sortBy=&order=
async function listar(req, res, next) {
  try {
    const { fecha, estado, menuId, tipo, page, limit, sortBy, order } = req.query;
    const { id: usuarioId, rol } = req.usuario;
    const resultado = await pedidosService.listarPedidos({
      fecha, estado, menuId, tipo, page, limit, sortBy, order, usuarioId, rol,
    });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

// GET /api/pedidos/resumen
async function resumen(req, res, next) {
  try {
    const data = await pedidosService.obtenerResumen();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/pedidos/:id
async function detalle(req, res, next) {
  try {
    const pedido = await pedidosService.obtenerPedido(req.params.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

// GET /api/pedidos/:id/historial
async function historial(req, res, next) {
  try {
    const registros = await pedidosService.obtenerHistorial(req.params.id);
    res.json(registros);
  } catch (err) {
    next(err);
  }
}

// POST /api/pedidos
async function crear(req, res, next) {
  try {
    const { menuId, fecha, cantidad, turnoEntrega, puntoRetiro, observaciones } = req.body;
    const usuarioId = req.usuario.id;

    const pedido = await pedidosService.crearPedido({
      menuId, usuarioId, fecha, cantidad, turnoEntrega, puntoRetiro, observaciones,
    });
    res.status(201).json(pedido);
  } catch (err) {
    next(err);
  }
}

// PUT /api/pedidos/:id
async function editar(req, res, next) {
  try {
    const { menuId, cantidad, turnoEntrega, puntoRetiro, observaciones } = req.body;
    const usuarioId = req.usuario.id;
    const pedido = await pedidosService.editarPedido(
      req.params.id,
      { menuId, cantidad, turnoEntrega, puntoRetiro, observaciones },
      usuarioId
    );
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/pedidos/:id/cancelar
async function cancelar(req, res, next) {
  try {
    const pedido = await pedidosService.cambiarEstado(req.params.id, 'cancelado', req.usuario.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/pedidos/:id/confirmar
async function confirmar(req, res, next) {
  try {
    const pedido = await pedidosService.cambiarEstado(req.params.id, 'confirmado', req.usuario.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/pedidos/:id/entregar
async function entregar(req, res, next) {
  try {
    const pedido = await pedidosService.cambiarEstado(req.params.id, 'entregado', req.usuario.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

export { listar, resumen, detalle, historial, crear, editar, cancelar, confirmar, entregar };
