const { Router } = require('express');
const pedidosController = require('../controllers/pedidos.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRole, authorizeOwnerOrAdmin } = require('../middlewares/authorization.middleware');
const { validateCrearPedido, validateEditarPedido } = require('../middlewares/validation.middleware');

const router = Router();

// IMPORTANTE: /resumen debe ir antes de /:id para que no sea interpretado como un id
router.get('/resumen', authenticateToken, authorizeRole('admin'), pedidosController.resumen);

router.get('/', authenticateToken, pedidosController.listar);
router.get('/:id', authenticateToken, pedidosController.detalle);
router.get('/:id/historial', authenticateToken, pedidosController.historial);

router.post('/', authenticateToken, validateCrearPedido, pedidosController.crear);
router.put('/:id', authenticateToken, authorizeOwnerOrAdmin, validateEditarPedido, pedidosController.editar);

router.patch('/:id/cancelar', authenticateToken, authorizeOwnerOrAdmin, pedidosController.cancelar);
router.patch('/:id/confirmar', authenticateToken, authorizeRole('admin'), pedidosController.confirmar);
router.patch('/:id/entregar', authenticateToken, authorizeRole('admin'), pedidosController.entregar);

module.exports = router;
