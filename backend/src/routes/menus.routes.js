import { Router } from 'express';
import { listar } from '../controllers/menus.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, listar);

export default router;
