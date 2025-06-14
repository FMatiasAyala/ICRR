import React from 'react';
import { Box, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';

const UpsDashboard = ({ salas, ups }) => {
  const getSala = (idSala) => {
    const sala = salas.find((sala) => sala.id_sala === idSala);
    return sala ? sala.sala : 'Desconocida';
  };

  const getSalaSector = (idSala) => {
    const sala = salas.find((sala) => sala.id_sala === idSala);
    return sala ? sala.sector : 'Desconocido';
  };

  const upsPorServicio = ups.reduce((result, equipo) => {
    const servicio = getSalaSector(equipo.ubicacion);
    if (!result[servicio]) {
      result[servicio] = [];
    }
    result[servicio].push(equipo);
    return result;
  }, {});

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 2 tablas por fila
        gap: 4, // Espaciado entre las tablas
        width: '100%',
        padding: 2,
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr', // En pantallas pequeñas, 1 tabla por fila
        },
      }}
    >
      {Object.entries(upsPorServicio).map(([servicio, equipos]) => (
        <Box
          key={servicio}
          sx={{
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: 2,
            backgroundColor: '#f5f5f5', // Gris claro suave
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Sombra suave
            '&:hover': {
              backgroundColor: '#e0e0e0', // Color ligeramente más oscuro al pasar el cursor
            },
            transition: 'background-color 0.3s ease', // Suaviza el cambio de color al hacer hover
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: '#004d99', fontWeight: 'bold', textAlign: 'center', mb: 2 }}
          >
            Servicio: {servicio}
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 250 }} aria-label={`tabla-${servicio}`}>
              <TableHead>
                <TableRow>
                  <TableCell>Marca</TableCell>
                  <TableCell align="right">Potencia</TableCell>
                  <TableCell align="right">Serial</TableCell>
                  <TableCell align="right">Ubicación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipos.map((equipo) => (
                  <TableRow key={equipo.id}>
                    <TableCell>{equipo.marca}</TableCell>
                    <TableCell align="right">{equipo.potencia}</TableCell>
                    <TableCell align="right">{equipo.serial}</TableCell>
                    <TableCell align="right">{getSala(equipo.ubicacion)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

export default UpsDashboard;
