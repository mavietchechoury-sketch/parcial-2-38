const { Op } = require('sequelize');
const { Pedido, Menu, Usuario, HistorialPedido } = require('../models');

const ESTADOS_ACTIVOS = ['pendiente', 'confirmado'];

const TRANSICIONES_VALIDAS = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['cancelado', 'entregado'],
  cancelado: [],
  entregado: [],
};

async function calcularCupoUsado(menuId, fecha, excluirPedidoId = null) {
  const where = {
    menuId,
    fecha,
    estado: { [Op.in]: ESTADOS_ACTIVOS },
  };
  if (excluirPedidoId) where.id = { [Op.ne]: excluirPedidoId };

  const resultado = await Pedido.sum('cantidad', { where });
  return resultado || 0;
}

async function registrarHistorial({ pedidoId, usuarioId, accion, valorAnterior, valorNuevo }) {
  await HistorialPedido.create({
    pedidoId,
    usuarioId,
    accion,
    fechaHora: new Date(),
    valorAnterior,
    valorNuevo,
  });
}

async function listarPedidos({ fecha, estado, menuId, tipo, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC', usuarioId, rol }) {
  const where = {};
  if (fecha) where.fecha = fecha;
  if (estado) where.estado = estado;
  if (menuId) where.menuId = menuId;
  if (rol !== 'admin') where.usuarioId = usuarioId;

  const include = [
    { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] },
    { model: Menu, as: 'menu', attributes: ['id', 'nombre', 'tipo', 'precio', 'fecha'] },
  ];

  if (tipo) {
    include[1].where = { tipo };
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const validSortFields = ['createdAt', 'fecha', 'estado', 'total', 'cantidad'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { count, rows } = await Pedido.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset,
    order: [[sortField, sortOrder]],
    distinct: true,
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit)),
    pedidos: rows,
  };
}

async function obtenerPedido(id) {
  const pedido = await Pedido.findByPk(id, {
    include: [
      { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] },
      { model: Menu, as: 'menu' },
    ],
  });
  if (!pedido) {
    const err = new Error('Pedido no encontrado');
    err.status = 404;
    throw err;
  }
  return pedido;
}

async function obtenerHistorial(pedidoId) {
  await obtenerPedido(pedidoId);
  return HistorialPedido.findAll({
    where: { pedidoId },
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] }],
    order: [['fechaHora', 'DESC']],
  });
}

async function crearPedido({ menuId, usuarioId, fecha, cantidad, turnoEntrega, puntoRetiro, observaciones }) {
  if (!cantidad || cantidad <= 0) {
    const err = new Error('La cantidad debe ser mayor a cero');
    err.status = 400;
    throw err;
  }

  const menu = await Menu.findByPk(menuId);
  if (!menu) {
    const err = new Error('El menú seleccionado no existe');
    err.status = 404;
    throw err;
  }
  if (!menu.activo) {
    const err = new Error('El menú seleccionado no está activo');
    err.status = 400;
    throw err;
  }
  if (menu.fecha !== fecha) {
    const err = new Error(`El menú solo está disponible para la fecha ${menu.fecha}`);
    err.status = 400;
    throw err;
  }

  const cupoUsado = await calcularCupoUsado(menuId, fecha);
  const cupoDisponible = menu.cupoDiario - cupoUsado;
  if (cantidad > cupoDisponible) {
    const err = new Error(`No hay cupo disponible para el menú seleccionado. Cupo disponible: ${cupoDisponible}`);
    err.status = 400;
    throw err;
  }

  const total = cantidad * menu.precio;

  const pedido = await Pedido.create({
    menuId,
    usuarioId,
    fecha,
    cantidad,
    turnoEntrega,
    puntoRetiro,
    total,
    estado: 'pendiente',
    observaciones: observaciones || null,
  });

  await registrarHistorial({
    pedidoId: pedido.id,
    usuarioId,
    accion: 'creacion',
    valorAnterior: null,
    valorNuevo: { estado: 'pendiente', cantidad, menuId, total },
  });

  return obtenerPedido(pedido.id);
}

async function editarPedido(id, { menuId, cantidad, turnoEntrega, puntoRetiro, observaciones }, usuarioId) {
  const pedido = await obtenerPedido(id);

  if (pedido.estado === 'entregado') {
    const err = new Error('No se puede modificar un pedido entregado');
    err.status = 400;
    throw err;
  }
  if (pedido.estado === 'cancelado') {
    const err = new Error('No se puede modificar un pedido cancelado');
    err.status = 400;
    throw err;
  }

  const valorAnterior = {
    menuId: pedido.menuId,
    cantidad: pedido.cantidad,
    turnoEntrega: pedido.turnoEntrega,
    puntoRetiro: pedido.puntoRetiro,
    observaciones: pedido.observaciones,
    total: pedido.total,
  };

  const nuevoMenuId = menuId || pedido.menuId;
  const nuevaCantidad = cantidad !== undefined ? cantidad : pedido.cantidad;

  if (nuevaCantidad <= 0) {
    const err = new Error('La cantidad debe ser mayor a cero');
    err.status = 400;
    throw err;
  }

  const menu = await Menu.findByPk(nuevoMenuId);
  if (!menu) {
    const err = new Error('El menú seleccionado no existe');
    err.status = 404;
    throw err;
  }
  if (!menu.activo) {
    const err = new Error('El menú seleccionado no está activo');
    err.status = 400;
    throw err;
  }

  const cupoUsado = await calcularCupoUsado(nuevoMenuId, pedido.fecha, id);
  const cupoDisponible = menu.cupoDiario - cupoUsado;
  if (nuevaCantidad > cupoDisponible) {
    const err = new Error(`No hay cupo disponible. Cupo disponible: ${cupoDisponible}`);
    err.status = 400;
    throw err;
  }

  const nuevoTotal = nuevaCantidad * menu.precio;

  await pedido.update({
    menuId: nuevoMenuId,
    cantidad: nuevaCantidad,
    turnoEntrega: turnoEntrega || pedido.turnoEntrega,
    puntoRetiro: puntoRetiro || pedido.puntoRetiro,
    observaciones: observaciones !== undefined ? observaciones : pedido.observaciones,
    total: nuevoTotal,
  });

  await registrarHistorial({
    pedidoId: id,
    usuarioId,
    accion: 'edicion',
    valorAnterior,
    valorNuevo: {
      menuId: nuevoMenuId,
      cantidad: nuevaCantidad,
      turnoEntrega: turnoEntrega || pedido.turnoEntrega,
      puntoRetiro: puntoRetiro || pedido.puntoRetiro,
      observaciones: observaciones !== undefined ? observaciones : pedido.observaciones,
      total: nuevoTotal,
    },
  });

  return obtenerPedido(id);
}

async function cambiarEstado(id, nuevoEstado, usuarioId) {
  const pedido = await obtenerPedido(id);
  const estadoActual = pedido.estado;

  if (!TRANSICIONES_VALIDAS[estadoActual].includes(nuevoEstado)) {
    const err = new Error(`Transición de estado no permitida: ${estadoActual} -> ${nuevoEstado}`);
    err.status = 400;
    throw err;
  }

  const valorAnterior = { estado: estadoActual };
  await pedido.update({ estado: nuevoEstado });

  await registrarHistorial({
    pedidoId: id,
    usuarioId,
    accion: nuevoEstado === 'confirmado' ? 'confirmacion'
      : nuevoEstado === 'cancelado' ? 'cancelacion'
      : 'entrega',
    valorAnterior,
    valorNuevo: { estado: nuevoEstado },
  });

  return obtenerPedido(id);
}

async function obtenerResumen() {
  const { sequelize } = require('../models');
  const { QueryTypes } = require('sequelize');

  const pedidosPorEstado = await Pedido.findAll({
    attributes: ['estado', [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']],
    group: ['estado'],
    raw: true,
  });

  const importeConfirmado = await Pedido.sum('total', {
    where: { estado: 'confirmado' },
  }) || 0;

  const menus = await Menu.findAll({ where: { activo: true } });
  const cuposPorMenu = await Promise.all(
    menus.map(async (menu) => {
      const usado = await calcularCupoUsado(menu.id, menu.fecha);
      return {
        menuId: menu.id,
        nombre: menu.nombre,
        fecha: menu.fecha,
        cupoDiario: menu.cupoDiario,
        cupoUsado: usado,
        cupoRestante: menu.cupoDiario - usado,
      };
    })
  );

  const pedidosPendientesPorFecha = await Pedido.findAll({
    where: { estado: 'pendiente' },
    attributes: ['fecha', [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']],
    group: ['fecha'],
    order: [['fecha', 'ASC']],
    raw: true,
  });

  return {
    pedidosPorEstado,
    importeConfirmado,
    cuposPorMenu,
    pedidosPendientesPorFecha,
  };
}

module.exports = {
  listarPedidos,
  obtenerPedido,
  obtenerHistorial,
  crearPedido,
  editarPedido,
  cambiarEstado,
  obtenerResumen,
};
