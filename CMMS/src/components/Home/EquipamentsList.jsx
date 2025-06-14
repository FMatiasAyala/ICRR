import React, { useEffect, useState } from 'react';
import { Box, Paper, useMediaQuery } from '@mui/material';
import DashboardDesktop from './Dashboard/DashboardDesktop';
import DashboardMobile from './Dashboard/DashboardMobile';
import { useWebSocketContext } from '../hooks/useWebSocketContext';


const EquipamentsList = ({ estadoEquipos, salas, onEquipoSeleccionado }) => {
  const { state: { equipos } } = useWebSocketContext()
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    setFilteredEquipos(equipos);
  }, [equipos]);

  const groupedEquipos = filteredEquipos.reduce((acc, equipo) => {
    const servicio = equipo.siglas_servicio;
    if (!acc[servicio]) {
      acc[servicio] = [];
    }
    acc[servicio].push(equipo);
    return acc;
  }, {});

  const getColorByEstado = (estado) => {
    switch (estado) {
      case 'OPERATIVO':
        return '#81C784';
      case 'NO OPERATIVO':
        return '#E57373';
      case 'REVISION':
        return '#FFD54F';
      default:
        return '#F5F5F5';
    }
  };

  const getHoverColorByEstado = (estado) => {
    switch (estado) {
      case 'OPERATIVO':
        return '#4CAF50';
      case 'NO OPERATIVO':
        return '#F44336';
      case 'REVISION':
        return '#FFB74D';
      default:
        return '#E0E0E0';
    }
  };
  if (!estadoEquipos || Object.keys(estadoEquipos).length === 0) {
    return <p>No hay datos disponibles o están cargando...</p>;
  }


  return (
    <>
      <Paper
        sx={{
          p: 2,
          width: '100%',
          maxHeight: 'auto',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {(isMobile ? (
            <DashboardMobile
              groupedEquipos={groupedEquipos}
              handleOpenModal={onEquipoSeleccionado}
              getHoverColorByEstado={getHoverColorByEstado}
              getColorByEstado={getColorByEstado}
              salas={salas}
              estadoEquipos={estadoEquipos}
            />

          ) : (<DashboardDesktop
            groupedEquipos={groupedEquipos}
            handleOpenModal={onEquipoSeleccionado}
            getHoverColorByEstado={getHoverColorByEstado}
            getColorByEstado={getColorByEstado}
            salas={salas}
            estadoEquipos={estadoEquipos}
          />))}
        </Box>
      </Paper>
    </>
  );
};

export default EquipamentsList;
