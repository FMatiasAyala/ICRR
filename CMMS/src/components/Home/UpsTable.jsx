import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';


const UpsTable = ({ salas, ups}) => {

  const getSala = (idSala) => {
    const sala = salas.find((sala)=> sala.ubicacion === idSala);
    return sala? sala.sala : 'Desconocida';
  }
  const getSalaSector = (idSala) => {
    const sala = salas.find((sala)=> sala.ubicacion === idSala);
    return sala? sala.sector : 'Desconocida';
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <TableContainer component={Paper} sx={{ width: '80%' }}> {/* Ajusta el ancho como necesites */}
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>MODELO</TableCell>
              <TableCell align="right">MARCA</TableCell>
              <TableCell align="right">POTENCIA</TableCell>
              <TableCell align="right">SERIAL</TableCell>
              <TableCell align="right">SERVICO</TableCell>
              <TableCell align="right">UBICACION</TableCell>
              <TableCell align="right">ACCIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ups.map((equipo) => (
              <TableRow
                key={equipo.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {equipo.modelo}
                </TableCell>
                <TableCell align="right">{equipo.marca}</TableCell>
                <TableCell align="right">{equipo.potencia}</TableCell>
                <TableCell align="right">{equipo.serial}</TableCell>
                <TableCell align="right">{getSalaSector(equipo.ubicacion)}</TableCell>
                <TableCell align="right">{getSala(equipo.ubicacion)}</TableCell>
                <TableCell align="right">
                {/* Botones o íconos para las acciones */}
                <IconButton onClick={() => handleAddMaintenance(equipo.id)}>
                  <EventIcon titleAccess="Agregar mantenimiento" />
                </IconButton>
                <IconButton onClick={() => handleAddEvent(equipo.id)}>
                  <EditIcon titleAccess="Agregar evento" />
                </IconButton>
                <IconButton onClick={() => handleNotifyMovement(equipo.id)}>
                  <NotificationsActiveIcon titleAccess="Notificar movimiento" />
                </IconButton>
                <IconButton onClick={() => handleChangeState(equipo.id)}>
                  <SettingsIcon titleAccess="Cambiar estado" />
                </IconButton>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UpsTable;
