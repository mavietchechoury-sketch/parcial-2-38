const { Router } = require('express');
const menusController = require('../controllers/menus.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', authenticateToken, menusController.listar);

module.exports = router;
