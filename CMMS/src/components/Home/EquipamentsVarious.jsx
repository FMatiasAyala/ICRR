import React, { useEffect, useState } from 'react';
import { apiEquipos } from '../../utils/Fetch';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';



const EquipamentsVarious = ({equipos, salas}) => {

  const getSala = (idSala) => {
    const sala = salas.find((sala)=> sala.ubicacion === idSala);
    return sala? sala.sala : 'Desconocida';
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <TableContainer component={Paper} sx={{ width: '80%' }}> {/* Ajusta el ancho como necesites */}
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>MODELO</TableCell>
              <TableCell align="right">MARCA</TableCell>
              <TableCell align="right">SERVICIO</TableCell>
              <TableCell align="right">UBICACION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipos.filter((equipo) => equipo.tipo === "UPS").map((equipo) => (
              <TableRow
                key={equipo.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {equipo.modelo}
                </TableCell>
                <TableCell align="right">{equipo.marca}</TableCell>
                <TableCell align="right">{equipo.servicio}</TableCell>
                <TableCell align="right">{getSala(equipo.sala)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EquipamentsVarious;
