import * as pedidosService from '../services/pedidos.service.js';

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

async function resumen(req, res, next) {
  try {
    const data = await pedidosService.obtenerResumen();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function detalle(req, res, next) {
  try {
    const pedido = await pedidosService.obtenerPedido(req.params.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

async function historial(req, res, next) {
  try {
    const registros = await pedidosService.obtenerHistorial(req.params.id);
    res.json(registros);
  } catch (err) {
    next(err);
  }
}

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

async function cancelar(req, res, next) {
  try {
    const pedido = await pedidosService.cambiarEstado(req.params.id, 'cancelado', req.usuario.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

async function confirmar(req, res, next) {
  try {
    const pedido = await pedidosService.cambiarEstado(req.params.id, 'confirmado', req.usuario.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

async function entregar(req, res, next) {
  try {
    const pedido = await pedidosService.cambiarEstado(req.params.id, 'entregado', req.usuario.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

export { listar, resumen, detalle, historial, crear, editar, cancelar, confirmar, entregar };
