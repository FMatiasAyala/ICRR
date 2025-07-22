import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { useWebSocketContext } from './WebSocket/useWebSocketContext';

const Cards = () => {
  const { state: { estadoEquipos } } = useWebSocketContext();
  const equiposArray = Object.values(estadoEquipos || {});

  const countEstado = (estado) => equiposArray.filter(item => item === estado).length;

  const estados = [
    {
      key: 'OPERATIVO',
      label: 'Operativos',
      icon: <CheckCircleIcon sx={{ fontSize: 36, color: '#2e7d32' }} />,
      bg: '#e8f5e9',
      color: '#1b5e20',
    },
    {
      key: 'NO OPERATIVO',
      label: 'No Operativos',
      icon: <ReportProblemIcon sx={{ fontSize: 36, color: '#c62828' }} />,
      bg: '#ffebee',
      color: '#b71c1c',
    },
    {
      key: 'REVISION',
      label: 'En Revisión',
      icon: <BuildCircleIcon sx={{ fontSize: 36, color: '#f9a825' }} />,
      bg: '#fffde7',
      color: '#f57f17',
    },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      sx={{ px: 1, pt: 1 }}
    >
      {estados.map(({ key, label, icon, bg, color }) => (
        <Card
          key={key}
          sx={{
            backgroundColor: bg,
            borderRadius: 3,
            boxShadow: 3,
            mb: 2,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.01)',
              boxShadow: 6,
            },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 2,
              px: 2,
            }}
          >
            {icon}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mt: 0.5 }}>
                {countEstado(key)} equipos
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Cards;
