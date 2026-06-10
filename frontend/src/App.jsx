import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import PedidosPage from './pages/PedidosPage';
import DetallePedidoPage from './pages/DetallePedidoPage';
import FormularioPedidoPage from './pages/FormularioPedidoPage';
import ResumenPage from './pages/ResumenPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/pedidos" element={
            <RutaProtegida><PedidosPage /></RutaProtegida>
          } />
          <Route path="/pedidos/nuevo" element={
            <RutaProtegida><FormularioPedidoPage /></RutaProtegida>
          } />
          <Route path="/pedidos/:id" element={
            <RutaProtegida><DetallePedidoPage /></RutaProtegida>
          } />
          <Route path="/pedidos/:id/editar" element={
            <RutaProtegida><FormularioPedidoPage /></RutaProtegida>
          } />
          <Route path="/resumen" element={
            <RutaProtegida rolRequerido="admin"><ResumenPage /></RutaProtegida>
          } />

          <Route path="/" element={<Navigate to="/pedidos" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
