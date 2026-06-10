import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

async function register({ nombre, email, password, rol }) {
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    const err = new Error('Ya existe un usuario con ese email');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    nombre,
    email,
    passwordHash,
    rol: rol || 'usuario',
    activo: true,
  });

  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

async function login({ email, password }) {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  if (!usuario.activo) {
    const err = new Error('Usuario inactivo');
    err.status = 401;
    throw err;
  }

  const valida = await bcrypt.compare(password, usuario.passwordHash);
  if (!valida) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  return { token, usuario: payload };
}

export { register, login };
