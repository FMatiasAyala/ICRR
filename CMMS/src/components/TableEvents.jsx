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
  Typography
} from '@mui/material';

const TableEvents = ({ estadoEquipo, equipo, sala }) => {
  const obtenerEquipo = (id) => {
    const equipos = equipo.find((e) => e.id === id);
    return equipos ? equipos.modelo : 'Equipo no encontrado';
  };

  const obtenerSala = (id_equipo) => {
    const equipos = equipo.find((e) => e.id === id_equipo);
    const salas = sala.find((s) => s.id_sala === equipos?.sala);
    return salas ? salas.sala : "Sala no encontrada";
  };

  const filtrarPorEstado = (estado) => {
    return estadoEquipo
      .filter((item) => item.estado.toLowerCase() === estado.toLowerCase())
      .sort((a, b) => new Date(b.desde) - new Date(a.desde))
      .slice(0, 3);
  };

  const estados = [
    { nombre: 'Operativo', color: '#4CAF50' },
    { nombre: 'No Operativo', color: '#F44336' },
    { nombre: 'Revision', color: '#FFC107' }
  ];

  return (
    <Box
      sx={{
        maxHeight: '400px',
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
        Ultimos Eventos
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: '8px', maxHeight: '350px', overflowY: 'auto' }}>
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
            {estados.map(({ nombre, color }, estadoIndex) => {
              const registros = filtrarPorEstado(nombre);

              return (
                <React.Fragment key={estadoIndex}>
                  {registros.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{
                        backgroundColor: color,
                        color: '#fff',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '12px',
                        padding: '4px'
                      }}>
                        {nombre}
                      </TableCell>
                    </TableRow>
                  )}
                  {registros.map((estado, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                    >
                      <TableCell sx={{ fontSize: '12px', padding: '4px' }}>{estado.descripcion}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>{estado.estado}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>{`${obtenerEquipo(estado.id_equipo)}(${obtenerSala(estado.id_equipo)})`}</TableCell>
                      <TableCell sx={{ fontSize: '12px', padding: '4px' }}>{new Date(estado.desde).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableEvents;
