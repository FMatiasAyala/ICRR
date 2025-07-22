import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Construction } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const PaginaEnMantenimiento = () => {
  return (
    <Container maxWidth="sm">
      <Paper
        elevation={4}
        sx={{
          p: 4,
          mt: 10,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ff6b6b, #f06595)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Construction
          sx={{
            fontSize: 80,
            mb: 2,
            animation: `${bounce} 2s infinite`,
          }}
        />
        <Typography variant="h4" gutterBottom>
          Página en mantenimiento
        </Typography>
        <Typography variant="body1">
          Estamos laburando para mejorar tu experiencia. Vuelve más tarde y vas a ver magia 🛠️✨
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaginaEnMantenimiento;
