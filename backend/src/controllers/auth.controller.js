const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }
    const usuario = await authService.register({ nombre, email, password, rol });
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    const resultado = await authService.login({ email, password });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
