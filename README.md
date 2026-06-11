# Gestión de Pedidos de Viandas con Cupos Diarios
TP Previo Parcial 2 — DDS 2026 — Curso 3K2

## Instrucciones para ejecutar

### Backend
```bash
cd backend
npm install
npm run seed       # Carga datos iniciales (obligatorio la primera vez)
npm start          # Puerto 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Puerto 5173
```
Abrir http://localhost:5173

---

## Usuarios de prueba

| Rol     | Email                  | Contraseña |
|---------|------------------------|------------|
| Admin   | admin@viandas.com      | admin123   |
| Usuario | maria@viandas.com      | user123    |
| Usuario | carlos@viandas.com     | user123    |

---

## Endpoints principales del backend

| Método | Ruta                          | Auth     | Descripción                          |
|--------|-------------------------------|----------|--------------------------------------|
| POST   | /api/auth/register            | Libre    | Registrar usuario                    |
| POST   | /api/auth/login               | Libre    | Login → devuelve JWT                 |
| GET    | /api/menus                    | JWT      | Listar menús (filtros: fecha, tipo)  |
| GET    | /api/pedidos                  | JWT      | Listar pedidos con filtros y paginar |
| GET    | /api/pedidos/resumen          | Admin    | Resumen administrativo               |
| GET    | /api/pedidos/:id              | JWT      | Detalle de un pedido                 |
| GET    | /api/pedidos/:id/historial    | JWT      | Historial de cambios del pedido      |
| POST   | /api/pedidos                  | JWT      | Crear pedido                         |
| PUT    | /api/pedidos/:id              | JWT      | Editar pedido                        |
| PATCH  | /api/pedidos/:id/cancelar     | JWT      | Cancelar pedido                      |
| PATCH  | /api/pedidos/:id/confirmar    | Admin    | Confirmar pedido                     |
| PATCH  | /api/pedidos/:id/entregar     | Admin    | Marcar como entregado                |

### Query params para GET /api/pedidos
- `fecha`, `estado`, `menuId`, `tipo` → filtros combinables
- `page`, `limit` → paginación
- `sortBy`, `order` → ordenamiento

---

## Rutas del frontend

| Ruta                  | Acceso         | Descripción                       |
|-----------------------|----------------|-----------------------------------|
| /login                | Libre          | Login y registro                  |
| /pedidos              | JWT            | Listado de pedidos con filtros    |
| /pedidos/nuevo        | JWT            | Crear pedido                      |
| /pedidos/:id          | JWT            | Detalle + historial               |
| /pedidos/:id/editar   | JWT            | Editar pedido                     |
| /resumen              | Admin          | Panel administrativo              |
| *                     | —              | Página 404                        |

---

## Cálculo del cupo disponible

```
cupo_disponible = menu.cupoDiario - SUM(cantidad) 
                  WHERE menuId = X AND fecha = Y 
                  AND estado IN ('pendiente', 'confirmado')
```

Los pedidos `cancelado` y `entregado` **no consumen cupo**.  
La validación ocurre en `pedidos.service.js → calcularCupoUsado()`.

---

## JWT, roles y permisos

- Al hacer login, el backend genera un JWT firmado con `JWT_SECRET` (expira en 24h).
- El payload contiene: `{ id, nombre, email, rol }`. **No incluye contraseña.**
- El frontend almacena el token en `sessionStorage` y lo inyecta via interceptor de Axios en el header `Authorization: Bearer <token>`.
- **Rol `usuario`:** puede crear, ver y cancelar sus propios pedidos.
- **Rol `admin`:** puede ver todos los pedidos, confirmar, cancelar, entregar, y acceder al resumen.
- Las rutas de escritura protegidas devuelven **401** sin token y **403** con token pero rol insuficiente.

---

## Máquina de estados del pedido

```
pendiente ──► confirmado ──► entregado
    │               │
    └──► cancelado ◄┘
```
- No se puede modificar un pedido en estado `entregado` o `cancelado`.

---

## Ejecutar pruebas

```bash
cd backend
npm test
```

Los 10 tests cubren: login correcto/inválido, listado con/sin filtros, detalle existente/inexistente, creación válida, cantidad inválida, cupo insuficiente, acceso sin JWT, acceso con rol insuficiente, edición con cupo superado, transición de estado no permitida.

---

## Persistencia

Se usa SQLite con Sequelize. La base de datos se guarda en `backend/database.sqlite` y persiste entre reinicios. En tests se usa `:memory:` para aislamiento.

## Estructura y división de responsabilidades

El proyecto está dividido en dos módulos independientes con responsabilidades claras:

**Backend** (`backend/`) — Mavie y Emi
- `src/models/` — modelos Sequelize: Usuario, Menu, Pedido, HistorialPedido
- `src/routes/` — definición de rutas con express.Router()
- `src/controllers/` — reciben el request, delegan al service, devuelven respuesta
- `src/services/` — lógica de negocio: validación de cupo, cálculo de total, historial
- `src/middlewares/` — autenticación JWT, autorización por rol/propietario, validación de entrada, manejo centralizado de errores
- `seeders/seed.js` — datos iniciales de prueba
- `tests/pedidos.test.js` — pruebas automatizadas con Jest y Supertest

**Frontend** (`frontend/`) — Ale y Mili
- `src/context/AuthContext.jsx` — estado global de autenticación (usuario, token, rol)
- `src/components/RutaProtegida.jsx` — protección de rutas por autenticación y rol
- `src/services/` — capa Axios separada por recurso (auth, pedidos, menús)
- `src/pages/` — pantallas: Login, Pedidos, Formulario, Detalle, Resumen, NotFound

**Persistencia:** SQLite con Sequelize. La base de datos se recrea con `npm run seed`. En tests se usa `:memory:` para aislamiento.

---

## Limitaciones conocidas

- La semilla recalcula la BD con `force: true`, por lo que borra datos existentes al ejecutarse.
- No se implementó paginación del historial (todos los registros se devuelven en orden DESC).
- Las contraseñas están hasheadas con bcrypt (salt 10). Los usuarios semilla tienen contraseñas conocidas documentadas en este README.
