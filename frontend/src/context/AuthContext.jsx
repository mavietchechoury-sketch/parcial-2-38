import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedUsuario = sessionStorage.getItem('usuario');
    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
    setCargando(false);
  }, []);

  function iniciarSesion(tokenRecibido, usuarioRecibido) {
    sessionStorage.setItem('token', tokenRecibido);
    sessionStorage.setItem('usuario', JSON.stringify(usuarioRecibido));
    setToken(tokenRecibido);
    setUsuario(usuarioRecibido);
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
