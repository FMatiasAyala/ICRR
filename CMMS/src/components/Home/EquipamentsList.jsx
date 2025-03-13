import React, { useEffect, useState } from 'react';
import { Box, Paper, Grid, useMediaQuery } from '@mui/material';
import EquipamentModal from '../Modal/EquipamentModal';
import NewTask from '../Task/NewTask';
import NewMaintenance from '../Maintenance/NewMaintenance';
import DashboardDesktop from './Dashboard/DashboardDesktop';
import DashboardMobile from './Dashboard/DashboardMobile';

const EquipamentsList = ({ estadoEquipos, equipos, equipo, tecnicos, salas, reloadEquipos, user, mantenimiento, tecnicosEquipo }) => {
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width:600px)');


  const reload = () => {
    reloadEquipos();
  };

  const handleOpenModal = (equipo) => {
    setSelectedEquipo(equipo);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEquipo(null);
  };

  useEffect(() => {
    setFilteredEquipos(equipos);
  }, [equipos]);

  const groupedEquipos = filteredEquipos.reduce((acc, equipo) => {
    const servicio = equipo.servicio;
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
  if (!estadoEquipos || estadoEquipos.length === 0) {
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
         {(isMobile?(
          <DashboardMobile
          groupedEquipos={groupedEquipos}
          handleOpenModal={handleOpenModal}
          getHoverColorByEstado={getHoverColorByEstado}
          getColorByEstado={getColorByEstado}
          salas={salas}
          estadoEquipos={estadoEquipos}
          />
          
         ):( <DashboardDesktop
          groupedEquipos={groupedEquipos}
          handleOpenModal={handleOpenModal}
          getHoverColorByEstado={getHoverColorByEstado}
          getColorByEstado={getColorByEstado}
          salas={salas}
          estadoEquipos={estadoEquipos}
          />))}
        </Box>
      </Paper>

      {selectedEquipo && (
        <EquipamentModal
          open={modalOpen}
          handleClose={handleCloseModal}
          equipo={selectedEquipo}
          estadoActual={estadoEquipos[selectedEquipo.id]}
          tecnicos={tecnicos?.filter((tecnico) => tecnico.id_tecnico === selectedEquipo.id_tecnico)}
          onEventCreate={reload}
          mantenimiento={mantenimiento.filter((mantenimiento) => mantenimiento.id_equipo === selectedEquipo.id)}
          user={user}
        />
      )}
    </>
  );
};

export default EquipamentsList;
