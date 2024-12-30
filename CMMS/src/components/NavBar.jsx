// src/components/NavBar.jsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const NavBar = ({ onMenuClick, handleLogout }) => {
  const token = localStorage.getItem('token');
  let userName = null;
  let userLastname = null;
  const navigate = useNavigate(); // Inicializar el hook


  if (token) {
    const decodedToken = jwtDecode(token);
    userName = decodedToken.name;
    userLastname = decodedToken.lastname;
  }

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#1E1E1E',
        boxShadow: 'none',
        padding: '0 16px',
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{
            color: '#FFFFFF',
            marginRight: '16px',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            color: '#FFFFFF',
            flexGrow: 1, // Centro del texto
            textAlign: 'center',
          }}
        >
          Sistemas - ICRR
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: '#CCCCCC',
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {userName} {userLastname}
          </Typography>
          <IconButton
            variant="contained"
            color="secondary"
            onClick={() => navigate('/cmms')}
            sx={{
              bgcolor: '#00796b',
              color: '#FFFFFF',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#00780b',
              },
              borderRadius: '8px',
              padding: '6px 16px',
              textTransform: 'none',
            }}
          >
            <HomeIcon/>
          </IconButton>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            sx={{
              bgcolor: '#D32F2F',
              color: '#FFFFFF',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#B71C1C',
              },
              borderRadius: '8px',
              padding: '6px 16px',
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
