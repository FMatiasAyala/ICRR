import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Layout from './components/Home/Layout';
import './App.css';
import StackedNotifications from './components/hooks/FloatingNotification';
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Verificar token en localStorage
  return token ? children : <Navigate to="/" />; // Redirigir a Login si no hay token
};

function App() {
  return (
    <Router>
      <StackedNotifications/>
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
