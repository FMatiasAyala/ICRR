import React from 'react';
import { Box, Typography, Modal, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

const TaskModal = ({ open, handleClose, currentTasks, equipos, salas }) => {
  const obtenerEquipo = (id_equipo) => {
    const equipo = equipos.find((equipo) => equipo.id === id_equipo);
    return equipo ? equipo.modelo : "Equipo no encontrado";
  };

  const obtenerSala = (id_equipo) => {
    const equipo = equipos.find((equipo) => equipo.id === id_equipo);
    const sala = salas.find((sala) => sala.ubicacion === equipo?.sala);
    return sala ? sala.sala : "Sala no encontrada";
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '60%' }, // Ajusta el ancho en diferentes pantallas
          maxHeight: '80vh', // Evita que el modal sea demasiado alto
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: { xs: 2, md: 4 }, // Padding responsivo
          borderRadius: '12px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { display: 'none' } // Oculta la barra de desplazamiento en Chrome/Safari/Edge
        }}
      >
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Close />
        </IconButton>
        <Typography variant="h6" align="center" sx={{ mb: 2, fontSize: { xs: '16px', md: '20px' } }}>
          Listado de Equipos
        </Typography>
        <Table size="small"> {/* Hace la tabla más compacta en pantallas pequeñas */}
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '12px', md: '14px' } }}>Equipo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '12px', md: '14px' } }}>Evento</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '12px', md: '14px' } }}>Sala</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '12px', md: '14px' } }}>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTasks.map((task, index) => (
              <TableRow key={index}>
                <TableCell align="center">{obtenerEquipo(task.id_equipo)}</TableCell>
                <TableCell align="center">{task.descripcion}</TableCell>
                <TableCell align="center">{obtenerSala(task.id_equipo)}</TableCell>
                <TableCell align="center">{new Date(task.desde).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Modal>
  );
};

export default TaskModal;
