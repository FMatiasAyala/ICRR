import React from 'react';
import { Box, Typography, Modal, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';


const TaskModal = ({ open, handleClose, currentTasks, equipos, salas }) => {


  const obtenerEquipo = (id_equipo) => {
    const equipo = equipos.find((equipo) => equipo.id === id_equipo);
    return equipo ? equipo.modelo : "Equipo no encontrado";
  }


  const obtenerSala = (id_equipo) => {
    const equipo = equipos.find((equipo) => equipo.id === id_equipo);
    const sala = salas.find((sala) => sala.ubicacion === equipo.sala);
    return sala ? sala.sala : "sala no encontrada";
  }




  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
          overflowY: 'auto',
          scrollbarWidth: 'none',  // Firefox: ocultar la barra
          '&::-webkit-scrollbar': {
            display: 'none',  // Chrome, Safari y Edge: ocultar la barra
          }
        }}
      >
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Listado de Equipos
        </Typography>
        <Table>

          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Equipo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Evento</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Sala</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
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
