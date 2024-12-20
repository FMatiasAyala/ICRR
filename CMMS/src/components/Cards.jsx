import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { apiEquipos, apiEventos, apiSalas } from '../utils/Fetch';
import TaskModal from './Modal/TaskModal';

const Cards = ({equipo, sala, estadoEquipo}) => {
  const [open, setOpen] = useState(false);
  const [currentTasks, setCurrentTasks] = useState([]);


  const handleOpen = (tasks) => {
    const taskOrdenados = tasks.sort((a, b) => new Date(b.desde) - new Date(a.desde));
    setCurrentTasks(taskOrdenados);
    setOpen(true);
  };

  const handleClose = async () => {
    setOpen(false);
  };


  const countEstado = (estado) => {
    return estadoEquipo.filter(item => item.estado === estado).length;
  };



  return (
<Box
  display="flex"
  flexDirection={{ xs: 'column', sm: 'row' }} // Cambia a columna en pantallas pequeñas
  gap={2}
  justifyContent="center"
>
  <Card
    onClick={() => handleOpen(estadoEquipo.filter(item => item.estado === 'OPERATIVO'))}
    sx={{
      width: { xs: '100%', sm: 400 }, // Ancho completo en pantallas pequeñas
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
        Operativos
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ color: '#616161' }}>
        {countEstado('OPERATIVO')} equipos
      </Typography>
    </CardContent>
  </Card>

  <Card
    onClick={() => handleOpen(estadoEquipo.filter(item => item.estado === 'NO OPERATIVO'))}
    sx={{
      width: { xs: '100%', sm: 400 },
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
        No Operativos
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ color: '#616161' }}>
        {countEstado('NO OPERATIVO')} equipos
      </Typography>
    </CardContent>
  </Card>

  <Card
    onClick={() => handleOpen(estadoEquipo.filter(item => item.estado === 'REVISION'))}
    sx={{
      width: { xs: '100%', sm: 400 },
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
        En Revisión
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ color: '#616161' }}>
        {countEstado('REVISION')} equipos
      </Typography>
    </CardContent>
  </Card>

  <TaskModal open={open} handleClose={handleClose} currentTasks={currentTasks} equipos={equipo} salas={sala} />
</Box>

  );
};

export default Cards;
