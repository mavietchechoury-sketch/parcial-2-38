import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import { sequelize, Usuario, Menu, Pedido } from '../src/models/index.js';

let tokenAdmin, tokenUser, adminId, userId, menuId, pedidoId, pedidoEntregadoId;
const hoy = new Date().toISOString().split('T')[0];

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await Usuario.create({
    nombre: 'Admin Test', email: 'admin@test.com', passwordHash: adminHash, rol: 'admin', activo: true,
  });
  const user = await Usuario.create({
    nombre: 'User Test', email: 'user@test.com', passwordHash: userHash, rol: 'usuario', activo: true,
  });
  adminId = admin.id;
  userId = user.id;

  const menu = await Menu.create({
    nombre: 'Menu Test', descripcion: 'Descripcion test', fecha: hoy,
    tipo: 'clasico', precio: 1000, cupoDiario: 5, activo: true,
  });
  menuId = menu.id;

  // Login admin
  const resAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'admin123' });
  tokenAdmin = resAdmin.body.token;

  // Login user
  const resUser = await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'user123' });
  tokenUser = resUser.body.token;

  // Crear un pedido base para tests de detalle/edición
  const resPedido = await request(app)
    .post('/api/pedidos')
    .set('Authorization', `Bearer ${tokenUser}`)
    .send({ menuId, fecha: hoy, cantidad: 1, turnoEntrega: 'almuerzo', puntoRetiro: 'Buffet A' });
  pedidoId = resPedido.body.id;

  // Crear un pedido y llevarlo a estado entregado
  const p2 = await Pedido.create({
    menuId, usuarioId: userId, fecha: hoy, cantidad: 1,
    turnoEntrega: 'cena', puntoRetiro: 'Buffet B', total: 1000, estado: 'entregado',
  });
  pedidoEntregadoId = p2.id;
});

afterAll(async () => {
  await sequelize.close();
});

// 1. Login correcto e inválido
describe('POST /api/auth/login', () => {
  test('login correcto devuelve token y usuario', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario).toHaveProperty('rol', 'admin');
    expect(res.body.usuario).not.toHaveProperty('passwordHash');
  });

  test('login inválido devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// 2. Listado de pedidos con y sin filtros
describe('GET /api/pedidos', () => {
  test('lista pedidos sin filtros (como admin)', async () => {
    const res = await request(app).get('/api/pedidos').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pedidos');
    expect(Array.isArray(res.body.pedidos)).toBe(true);
    expect(res.body).toHaveProperty('total');
  });

  test('lista pedidos con filtro por estado', async () => {
    const res = await request(app)
      .get('/api/pedidos?estado=pendiente')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    res.body.pedidos.forEach((p) => expect(p.estado).toBe('pendiente'));
  });
});

// 3. Detalle de pedido existente e inexistente
describe('GET /api/pedidos/:id', () => {
  test('detalle de pedido existente', async () => {
    const res = await request(app)
      .get(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', pedidoId);
  });

  test('detalle de pedido inexistente devuelve 404', async () => {
    const res = await request(app)
      .get('/api/pedidos/99999')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// 4. Creación válida de un pedido
describe('POST /api/pedidos - creación válida', () => {
  test('crea un pedido correctamente', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ menuId, fecha: hoy, cantidad: 1, turnoEntrega: 'cena', puntoRetiro: 'Recepción' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('total', 1000);
    expect(res.body).toHaveProperty('estado', 'pendiente');
  });
});

// 5. Creación inválida por cantidad <= 0
describe('POST /api/pedidos - cantidad inválida', () => {
  test('rechaza pedido con cantidad 0', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ menuId, fecha: hoy, cantidad: 0, turnoEntrega: 'almuerzo', puntoRetiro: 'Buffet A' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/cantidad/i);
  });

  test('rechaza pedido con cantidad negativa', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ menuId, fecha: hoy, cantidad: -3, turnoEntrega: 'almuerzo', puntoRetiro: 'Buffet A' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// 6. Creación inválida por cupo diario insuficiente
describe('POST /api/pedidos - cupo insuficiente', () => {
  test('rechaza pedido cuando se supera el cupo diario', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ menuId, fecha: hoy, cantidad: 100, turnoEntrega: 'almuerzo', puntoRetiro: 'Buffet A' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/cupo/i);
  });
});

// 7. Acceso sin JWT a ruta protegida
describe('Acceso sin JWT', () => {
  test('GET /api/pedidos sin token devuelve 401', async () => {
    const res = await request(app).get('/api/pedidos');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/pedidos sin token devuelve 401', async () => {
    const res = await request(app).post('/api/pedidos').send({ menuId, fecha: hoy, cantidad: 1 });
    expect(res.status).toBe(401);
  });
});

// 8. Acceso con JWT de usuario a acción solo de admin
describe('Autorización por rol', () => {
  test('usuario normal no puede acceder a /resumen (403)', async () => {
    const res = await request(app)
      .get('/api/pedidos/resumen')
      .set('Authorization', `Bearer ${tokenUser}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('admin puede acceder a /resumen (200)', async () => {
    const res = await request(app)
      .get('/api/pedidos/resumen')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });
});

// 9. Edición inválida que supera el cupo disponible
describe('PUT /api/pedidos/:id - edición inválida por cupo', () => {
  test('rechaza edición que supera el cupo', async () => {
    const res = await request(app)
      .put(`/api/pedidos/${pedidoId}`)
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ cantidad: 999 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/cupo/i);
  });
});

// 10. Transición de estado no permitida
describe('Transición de estado no permitida', () => {
  test('no se puede editar un pedido entregado', async () => {
    const res = await request(app)
      .put(`/api/pedidos/${pedidoEntregadoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cantidad: 2 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/entregado/i);
  });

  test('no se puede confirmar un pedido ya entregado', async () => {
    const res = await request(app)
      .patch(`/api/pedidos/${pedidoEntregadoId}/confirmar`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
