require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Menu, Pedido, HistorialPedido } = require('../src/models');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Tablas recreadas');

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const [admin, user1, user2] = await Promise.all([
    Usuario.create({ nombre: 'Admin Sistema', email: 'admin@viandas.com', passwordHash: adminHash, rol: 'admin', activo: true }),
    Usuario.create({ nombre: 'Maria Lopez', email: 'maria@viandas.com', passwordHash: userHash, rol: 'usuario', activo: true }),
    Usuario.create({ nombre: 'Carlos Gomez', email: 'carlos@viandas.com', passwordHash: userHash, rol: 'usuario', activo: true }),
  ]);
  console.log('Usuarios creados');

  const hoy = new Date().toISOString().split('T')[0];
  const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const pasado = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const menus = await Menu.bulkCreate([
    { nombre: 'Milanesa con ensalada', descripcion: 'Milanesa de pollo con guarnición de ensalada fresca', fecha: hoy, tipo: 'clasico', precio: 4500, cupoDiario: 20, activo: true },
    { nombre: 'Tarta de verduras', descripcion: 'Tarta casera de verduras de estación', fecha: hoy, tipo: 'vegetariano', precio: 3800, cupoDiario: 15, activo: true },
    { nombre: 'Bowl vegano', descripcion: 'Bowl de arroz integral con legumbres y vegetales salteados', fecha: hoy, tipo: 'vegano', precio: 4200, cupoDiario: 10, activo: true },
    { nombre: 'Pollo grillado sin gluten', descripcion: 'Pechuga de pollo grillada con papas al horno', fecha: manana, tipo: 'sin_tacc', precio: 5000, cupoDiario: 12, activo: true },
    { nombre: 'Pasta con salsa', descripcion: 'Pasta fresca con salsa bolognesa casera', fecha: manana, tipo: 'clasico', precio: 4000, cupoDiario: 25, activo: true },
    { nombre: 'Ensalada proteica vegana', descripcion: 'Mix de legumbres, semillas y vegetales', fecha: pasado, tipo: 'vegano', precio: 3500, cupoDiario: 8, activo: true },
  ]);
  console.log('Menús creados');

  const pedidosData = [
    { menuId: menus[0].id, usuarioId: user1.id, fecha: hoy, cantidad: 2, turnoEntrega: 'almuerzo', puntoRetiro: 'Campus - Buffet A', total: 9000, estado: 'pendiente', observaciones: 'Sin sal' },
    { menuId: menus[0].id, usuarioId: user2.id, fecha: hoy, cantidad: 1, turnoEntrega: 'almuerzo', puntoRetiro: 'Campus - Buffet B', total: 4500, estado: 'confirmado', observaciones: null },
    { menuId: menus[1].id, usuarioId: user1.id, fecha: hoy, cantidad: 3, turnoEntrega: 'cena', puntoRetiro: 'Oficina 201', total: 11400, estado: 'pendiente', observaciones: 'Sin cebolla' },
    { menuId: menus[1].id, usuarioId: user2.id, fecha: hoy, cantidad: 1, turnoEntrega: 'almuerzo', puntoRetiro: 'Recepción', total: 3800, estado: 'cancelado', observaciones: null },
    { menuId: menus[2].id, usuarioId: user1.id, fecha: hoy, cantidad: 2, turnoEntrega: 'almuerzo', puntoRetiro: 'Campus - Buffet A', total: 8400, estado: 'confirmado', observaciones: null },
    { menuId: menus[2].id, usuarioId: user2.id, fecha: hoy, cantidad: 1, turnoEntrega: 'cena', puntoRetiro: 'Oficina 101', total: 4200, estado: 'entregado', observaciones: null },
    { menuId: menus[3].id, usuarioId: user1.id, fecha: manana, cantidad: 1, turnoEntrega: 'almuerzo', puntoRetiro: 'Campus - Buffet A', total: 5000, estado: 'pendiente', observaciones: null },
    { menuId: menus[3].id, usuarioId: user2.id, fecha: manana, cantidad: 2, turnoEntrega: 'cena', puntoRetiro: 'Campus - Buffet B', total: 10000, estado: 'confirmado', observaciones: 'Poco condimento' },
    { menuId: menus[4].id, usuarioId: user1.id, fecha: manana, cantidad: 3, turnoEntrega: 'almuerzo', puntoRetiro: 'Recepción', total: 12000, estado: 'pendiente', observaciones: null },
    { menuId: menus[4].id, usuarioId: user2.id, fecha: manana, cantidad: 1, turnoEntrega: 'almuerzo', puntoRetiro: 'Oficina 201', total: 4000, estado: 'cancelado', observaciones: null },
    { menuId: menus[5].id, usuarioId: user1.id, fecha: pasado, cantidad: 2, turnoEntrega: 'cena', puntoRetiro: 'Campus - Buffet A', total: 7000, estado: 'pendiente', observaciones: null },
    { menuId: menus[5].id, usuarioId: user2.id, fecha: pasado, cantidad: 1, turnoEntrega: 'almuerzo', puntoRetiro: 'Recepción', total: 3500, estado: 'confirmado', observaciones: 'Extra dressing' },
  ];

  const pedidos = await Pedido.bulkCreate(pedidosData);
  console.log('Pedidos creados');

  const historialData = pedidos.map((p) => ({
    pedidoId: p.id,
    usuarioId: p.usuarioId,
    accion: 'creacion',
    fechaHora: new Date(),
    valorAnterior: null,
    valorNuevo: JSON.stringify({ estado: p.estado, cantidad: p.cantidad }),
  }));

  const confirmados = pedidos.filter((p) => ['confirmado', 'entregado'].includes(p.estado));
  confirmados.forEach((p) => {
    historialData.push({
      pedidoId: p.id,
      usuarioId: admin.id,
      accion: 'confirmacion',
      fechaHora: new Date(),
      valorAnterior: JSON.stringify({ estado: 'pendiente' }),
      valorNuevo: JSON.stringify({ estado: 'confirmado' }),
    });
  });

  const entregados = pedidos.filter((p) => p.estado === 'entregado');
  entregados.forEach((p) => {
    historialData.push({
      pedidoId: p.id,
      usuarioId: admin.id,
      accion: 'entrega',
      fechaHora: new Date(),
      valorAnterior: JSON.stringify({ estado: 'confirmado' }),
      valorNuevo: JSON.stringify({ estado: 'entregado' }),
    });
  });

  await HistorialPedido.bulkCreate(historialData);
  console.log('Historial creado');

  console.log('\n=== SEMILLA COMPLETADA ===');
  console.log('Admin:   admin@viandas.com / admin123');
  console.log('Usuario: maria@viandas.com / user123');
  console.log('Usuario: carlos@viandas.com / user123');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
