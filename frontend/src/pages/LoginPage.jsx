import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { autenticar, registrar } from '../services/authService';

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
        const res = await autenticar({ email: data.email, password: data.password });
        iniciarSesion(res.data.token, res.data.usuario);
        navigate('/pedidos');
      } else {
        await registrar({ nombre: data.nombre, email: data.email, password: data.password });
        setModo('login');
        setApiError('');
        alert('Registro exitoso. Ahora podés iniciar sesión.');
      }
    } catch (err) {
      setApiError(err.response?.data?.error || 'Error al procesar la solicitud');
    }
  }

  return (
    <div className="login-shell">
      <div className="login-visual" aria-hidden="true" />

      <main className="login-panel">
        <div className="login-card">
          <div className="login-logo">
            <span className="brand-mark">V</span>
            <span>Viandas</span>
          </div>

          <h1 className="login-title">Gestión de Viandas</h1>
          <p className="login-subtitle">
            {modo === 'login'
              ? 'Iniciá sesión para gestionar tus pedidos'
              : 'Creá tu cuenta para gestionar tus pedidos'}
          </p>

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

          <p className="auth-switch">
            {modo === 'login' ? (
              <>¿No tenés cuenta? <button className="link-button" onClick={() => { setModo('register'); setApiError(''); }}>Registrate</button></>
            ) : (
              <>¿Ya tenés cuenta? <button className="link-button" onClick={() => { setModo('login'); setApiError(''); }}>Iniciá sesión</button></>
            )}
          </p>

        </div>
      </main>
    </div>
  );
}
