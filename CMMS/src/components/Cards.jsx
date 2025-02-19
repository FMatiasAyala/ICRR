import React, { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import TaskModal from './Task/TaskModal';

const Cards = ({ equipo, sala, estadoEquipo }) => {
  const [open, setOpen] = useState(false);
  const [currentTasks, setCurrentTasks] = useState([]);

  const handleOpen = (tasks) => {
    const taskOrdenados = tasks.sort((a, b) => new Date(b.desde) - new Date(a.desde));
    setCurrentTasks(taskOrdenados);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const countEstado = (estado) => estadoEquipo.filter(item => item.estado === estado).length;

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }} // En móviles en columna, en pantallas grandes en fila
      gap={{ xs: 2, sm: 3 }}
      justifyContent="center"
      alignItems="center"
      width="100%"
      p={{ xs: 1, sm: 2 }}
    >
      {['OPERATIVO', 'NO OPERATIVO', 'REVISION'].map((estado, index) => (
        <Card
          key={index}
          onClick={() => handleOpen(estadoEquipo.filter(item => item.estado === estado))}
          sx={{
            width: { xs: '90%', sm: '30%' }, // En móviles ocupa el 90%, en pantallas grandes un tercio
            maxWidth: 400,
            cursor: 'pointer',
            borderRadius: '16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
            },
            bgcolor: '#f5f5f5',
            color: '#424242',
          }}
        >
          <CardContent>
            <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: '#00796b' }}>
              {estado === 'OPERATIVO' ? 'Operativos' : estado === 'NO OPERATIVO' ? 'No Operativos' : 'En Revisión'}
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: '#616161' }}>
              {countEstado(estado)} equipos
            </Typography>
          </CardContent>
        </Card>
      ))}

      <TaskModal open={open} handleClose={handleClose} currentTasks={currentTasks} equipos={equipo} salas={sala} />
    </Box>
  );
};

export default Cards;
