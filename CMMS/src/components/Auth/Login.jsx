import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiUser } from '../../utils/Fetch';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Hacer la solicitud al backend usando fetch
      const response = await fetch(apiUser, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Manejar la respuesta de la API
      if (response.ok) {
        const data = await response.json();
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token);
        navigate('/cmms');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      setError('Hubo un problema al intentar iniciar sesión');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        mt={8}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar Sesión
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Usuario"
            variant="outlined"
            margin="normal"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Contraseña"
            variant="outlined"
            margin="normal"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            sx={{ mt: 2 }}
          >
            Iniciar Sesión
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
