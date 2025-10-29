import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Layout from './components/Home/Layout';
import './App.css';
import StackedNotifications from './components/WebSocket/FloatingNotification';
import { jwtDecode } from 'jwt-decode';
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // No hay token => redirigir a login
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    // Verificar si el token expiró
    if (decoded.exp && decoded.exp < now) {
      console.warn("Token expirado, cerrando sesión automáticamente");
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }

    // Token válido => mostrar contenido
    return children;

  } catch (err) {
    console.error("Error al decodificar token:", err);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
}

function App() {
  return (
    <Router>
      <StackedNotifications />
      <Routes>
        {/* Ruta pública para Login */}
        <Route path="/" element={<Login />} />
        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout /> {/* Usa el Layout para gestionar rutas protegidas */}
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
