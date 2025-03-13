import React, { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import MaintenanceModal from './Maintenance/MaintenanceModal';

const CardsMantenimiento = ({ equipos, mantenimiento, salas }) => {
  const [open, setOpen] = useState(false);



  const handleOpen = () => {
    if (mantenimiento.length > 0) {
      setOpen(true);
    }
  };


  const handleClose = () => setOpen(false);

  // Función para obtener el color en base al estado (programado o realizado)
  const getColorByEstado = (estado) => {
    return estado === 'PROGRAMADO' ? '#ff9800' : '#4caf50'; // Naranja para programado, Verde para realizado
  };

  // Filtrar solo los mantenimientos programados
  const mantenimientosProgramados = mantenimiento.filter(
    (mantenimiento) => mantenimiento.estado === 'PROGRAMADO'
  ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Función para obtener el nombre del equipo a partir del id_equipo
  const obtenerNombreEquipo = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);  // Buscar el equipo por id
    return equipo ? equipo.modelo : 'Equipo no encontrado';  // Devolver el nombre o un mensaje por defecto
  };



  return (
    <Box display="flex" justifyContent="center" mt={{ xs: 2, md: 4 }} px={{ xs: 2, md: 0 }}>
    <Card
      onClick={handleOpen}
      sx={{
        width: { xs: '100%', sm: 300, md: 350 },
        cursor: 'pointer',
        borderRadius: '16px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
        },
        bgcolor: '#f5f5f5',
        color: '#424242',
        p: { xs: 2, md: 3 }, // Padding más pequeño en pantallas pequeñas
      }}
    >
      <CardContent>
        <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: '#00796b', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
          Próximos Mantenimientos
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mt: 1, color: '#616161' }}>
          {mantenimientosProgramados.filter((mantenimiento) => mantenimiento.estado === 'PROGRAMADO').length > 0 ? (
            `${mantenimientosProgramados.filter((mantenimiento) => mantenimiento.estado === 'PROGRAMADO').length} equipo(s)`
          ) : (
            'No hay equipos en mantenimiento'
          )}
        </Typography>
  
        {/* Mostrar el detalle del primer equipo en la tarjeta */}
        {mantenimientosProgramados.length > 0 && (
          <Box mt={2}>
            <Typography variant="body1" align="center" sx={{ color: getColorByEstado(mantenimientosProgramados[0].estado), fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Estado: {mantenimientosProgramados[0].estado}
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#757575', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              Empresa: {mantenimientosProgramados[0].empresa}
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#757575', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              Equipo: {obtenerNombreEquipo(mantenimientosProgramados[0].id_equipo)}
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#757575', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              Fecha: {new Date(mantenimientosProgramados[0].fecha).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#757575', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              Horario: {new Date(`2024-11-01T${mantenimientosProgramados[0].desde}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})} - {new Date(`2024-11-01T${mantenimientosProgramados[0].hasta}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  
    {/* Modal separado */}
    {mantenimientosProgramados.length > 0 && (
      <MaintenanceModal open={open} handleClose={handleClose} mantenimientos={mantenimiento} equipos={equipos} salas={salas} />
    )}
  </Box>  
  );
};

export default CardsMantenimiento;
