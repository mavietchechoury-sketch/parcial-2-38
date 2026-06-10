import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/authService';

export default function LoginPage() {
  const [modo, setModo] = useState('login');
  const [apiError, setApiError] = useState('');
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit(data) {
    setApiError('');
    try {
      if (modo === 'login') {
        const res = await login({ email: data.email, password: data.password });
        iniciarSesion(res.data.token, res.data.usuario);
        navigate('/pedidos');
      } else {
        await register({ nombre: data.nombre, email: data.email, password: data.password });
        setModo('login');
        setApiError('');
        alert('Registro exitoso. Ahora podés iniciar sesión.');
      }
    } catch (err) {
      setApiError(err.response?.data?.error || 'Error al procesar la solicitud');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <h2>{modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {modo === 'register' && (
            <div className="form-group">
              <label>Nombre</label>
              <input {...reg('nombre', { required: 'El nombre es requerido' })} placeholder="Tu nombre completo" />
              {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...reg('email', { required: 'El email es requerido' })}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              {...reg('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              placeholder="••••••••"
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? 'Procesando...' : (modo === 'login' ? 'Ingresar' : 'Registrarme')}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          {modo === 'login' ? (
            <>¿No tenés cuenta? <button className="btn btn-secondary btn-sm" onClick={() => { setModo('register'); setApiError(''); }}>Registrate</button></>
          ) : (
            <>¿Ya tenés cuenta? <button className="btn btn-secondary btn-sm" onClick={() => { setModo('login'); setApiError(''); }}>Iniciá sesión</button></>
          )}
        </p>

        <div className="alert alert-info" style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
          <strong>Usuarios de prueba:</strong><br />
          Admin: admin@viandas.com / admin123<br />
          Usuario: maria@viandas.com / user123
        </div>
      </div>
    </div>
  );
}
