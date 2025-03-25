import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const TableEvents = ({ ultimoEquipo, equipo, sala }) => {
  const obtenerEquipo = (id) => {
    const equipos = equipo.find((e) => e.id === id);
    return equipos ? equipos.modelo : 'Equipo no encontrado';
  };

  const obtenerSala = (id_equipo) => {
    const equipos = equipo.find((e) => e.id === id_equipo);
    const salas = sala.find((s) => s.id_sala === equipos?.sala);
    return salas ? salas.sala : "Sala no encontrada";
  };

  const filtrarPorEstado = () => {
    const eventosPorEstado = {
      'OPERATIVO': [],
      'NO OPERATIVO': [],
      'REVISION': []
    };
  
    // Agrupar eventos por estado
    ultimoEquipo.forEach(evento => {
      if (eventosPorEstado[evento.estado]) {
        eventosPorEstado[evento.estado].push(evento);
      }
    });
  
    // Ordenar y tomar solo los últimos 4 de cada tipo
    const eventosFiltrados = Object.values(eventosPorEstado).flatMap(eventos =>
      eventos
        .sort((a, b) => new Date(b.desde) - new Date(a.desde)) // Ordenar por fecha
        .slice(0, 4) // Tomar los últimos 4
    );
  
    return eventosFiltrados;
  };
  

  const obtenerColorEstado = (estado) => {
    const colores = {
      'OPERATIVO': '#4CAF50',
      'NO OPERATIVO': '#F44336',
      'REVISION': '#FFC107',
    };
    return colores[estado] || '#BDBDBD'; // Color gris si el estado no coincide
  };

  return (
    <Box
      sx={{
        maxHeight: '600px',
        overflowY: 'auto',
        background: '#fafafa',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '12px'
      }}
    >
      <Typography
        variant="subtitle1"
        align="center"
        sx={{
          marginBottom: 1,
          fontWeight: 'bold',
          color: '#333',
          fontSize: '14px'
        }}
      >
        Últimos Eventos
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', maxHeight: '500px', overflowY: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1E1E1E' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Descripción</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }} align="center">Estado</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }} align="center">Equipo</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }} align="center">Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrarPorEstado().map((estado, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                <TableCell sx={{ fontSize: '12px', padding: '4px' }}>{estado.descripcion}</TableCell>
                <TableCell 
                  align="center" 
                  sx={{
                    fontSize: '12px',
                    padding: '4px',
                    backgroundColor: obtenerColorEstado(estado.estado),
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '4px'
                  }}
                >
                  {estado.estado}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>
                  {`${obtenerEquipo(estado.id_equipo)} (${obtenerSala(estado.id_equipo)})`}
                </TableCell>
                <TableCell sx={{ fontSize: '12px', padding: '4px' }}>
                  {new Date(estado.desde).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableEvents;
