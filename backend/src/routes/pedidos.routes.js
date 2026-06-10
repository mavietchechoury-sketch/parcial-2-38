import { Router } from 'express';
import { listar, resumen, detalle, historial, crear, editar, cancelar, confirmar, entregar } from '../controllers/pedidos.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authorizeRole, authorizeOwnerOrAdmin } from '../middlewares/authorization.middleware.js';
import { validateCrearPedido, validateEditarPedido } from '../middlewares/validation.middleware.js';

const router = Router();

// IMPORTANTE: /resumen debe ir antes de /:id para que no sea interpretado como un id
router.get('/resumen', authenticateToken, authorizeRole('admin'), resumen);

router.get('/', authenticateToken, listar);
router.get('/:id', authenticateToken, detalle);
router.get('/:id/historial', authenticateToken, historial);

router.post('/', authenticateToken, validateCrearPedido, crear);
router.put('/:id', authenticateToken, authorizeOwnerOrAdmin, validateEditarPedido, editar);

router.patch('/:id/cancelar', authenticateToken, authorizeOwnerOrAdmin, cancelar);
router.patch('/:id/confirmar', authenticateToken, authorizeRole('admin'), confirmar);
router.patch('/:id/entregar', authenticateToken, authorizeRole('admin'), entregar);

export default router;
