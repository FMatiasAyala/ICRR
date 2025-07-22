import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiUser } from '../utils/Fetch';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(apiUser, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/cmms');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError('Error al intentar iniciar sesión');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#e3f2fd', // celeste claro institucional
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            mb: 1,
          }}
        >
          Sistemas - ICRR
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Accedé al panel de gestión
        </Typography>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <TextField
            label="Usuario"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />

          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, py: 1 }}
          >
            Iniciar Sesión
          </Button>
        </form>

        <Typography
          variant="caption"
          sx={{ mt: 3, color: 'text.secondary', fontSize: '0.7rem' }}
        >
          © 2025 Área de Sistemas · ICRR. Todos los derechos reservados.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
