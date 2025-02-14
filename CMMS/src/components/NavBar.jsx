// src/components/NavBar.jsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const NavBar = ({ onMenuClick, handleLogout, user }) => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#1E1E1E',
        boxShadow: 'none',
        padding: { xs: '0 8px', sm: '0 16px' }, // Reducir padding en móviles
      }}
    >
      <Toolbar sx={{ minHeight: '56px', justifyContent: 'space-between' }}>
        {/* Botón Menú */}
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{
            color: '#FFFFFF',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Título */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            color: '#FFFFFF',
            textAlign: 'center',
            flexGrow: 1,
            display: { xs: 'none', sm: 'block' }, // Ocultar en móviles pequeños
          }}
        >
          Sistemas - ICRR
        </Typography>

        {/* Información y botones */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 }, // Reducir espacio en móviles
          }}
        >
          {/* Nombre y rol del usuario */}
          <Typography
            variant="body2"
            sx={{
              color: '#CCCCCC',
              fontWeight: 500,
              display: { xs: 'none', md: 'block' }, // Ocultar en pantallas pequeñas
            }}
          >
            {user.name} {user.lastname} - {user.role}
          </Typography>

          {/* Botón Home */}
          <IconButton
            onClick={() => navigate('/cmms')}
            sx={{
              bgcolor: '#00796b',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#00780b' },
              borderRadius: '8px',
              padding: { xs: '4px', sm: '6px 16px' }, // Botón más pequeño en móviles
            }}
          >
            <HomeIcon />
          </IconButton>

          {/* Botón Cerrar Sesión */}
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              bgcolor: '#D32F2F',
              color: '#FFFFFF',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#B71C1C' },
              borderRadius: '8px',
              padding: { xs: '4px 12px', sm: '6px 16px' }, // Botón más pequeño en móviles
              textTransform: 'none',
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
