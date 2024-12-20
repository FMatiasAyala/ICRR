import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Paper, Grid, ImageList } from '@mui/material';
import EquipamentModal from '../Modal/EquipamentModal';
import NewTask from '../Modal/NewTask';
import NewMaintenance from '../Modal/NewMaintenance';

const EquipamentsList = ({ estadoEquipos, equipos, equipo, tecnicos, salas, reloadEquipos }) => {

  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const reload = () => {
    reloadEquipos(); // Después de crear la tarea, recargamos los equipos
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
    if (searchTerm) {
      setFilteredEquipos(
        equipos.filter((equipo) =>
          equipo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredEquipos(equipos);
    }
  }, [searchTerm, equipos]);

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
      <Grid item xs={12} md={4.5} container spacing={1}>
        <Grid item xs={12} sm={5}>
          <NewTask onEventCreate={reload} equipo={equipo} salas={salas}/> {/* Llamar a handleTaskCreate aquí */}
        </Grid>
        <Grid item xs={12} sm={7}>
          <NewMaintenance onMaintenanceCreate={reload} equipos={equipos} tecnicos={tecnicos} salas={salas}/> {/* Llamar a handleMaintenanceCreate */}
        </Grid>
      </Grid>
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
            gridTemplateColumns: {sm: 'repeat(3, 1fr)'},
            gap: '16px',
            alignItems: 'start',
          
          }}
        >

          {Object.keys(groupedEquipos).map((servicio) => (
            <Box
              key={servicio}
              sx={{
                gridColumn: 'span 1',
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {servicio}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                }}
              >
                {groupedEquipos[servicio].map((equipo) => (

                  <Card
                    key={equipo.id}
                    onClick={() => handleOpenModal(equipo)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: getHoverColorByEstado(estadoEquipos[equipo.id]) },
                      height: 'auto',
                      minWidth: '150px',
                      minHeight: '100px',
                      backgroundColor: getColorByEstado(estadoEquipos[equipo.id]),
                      
                    }}
                  >
                    <CardContent sx={{ padding: '8px' }}>
                      <Typography variant="body2" align="center">
                        {equipo.modelo}
                      </Typography>
                      {salas &&
                        salas
                          .filter((sala) => sala.ubicacion === equipo.sala)  // Filtramos las salas antes de mapear
                          .map((sala) => (
                            <Typography
                              key={sala.id}
                              variant="body2"
                              color="text.secondary"
                              fontSize="12px"
                              fontWeight = 'bold'
                            >
                              {`${sala.sala} - ${sala.filial}`}
                            </Typography>
                          ))
                      }

                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {selectedEquipo && (
        <EquipamentModal
          open={modalOpen}
          handleClose={handleCloseModal}
          equipo={selectedEquipo}
          estadoActual={estadoEquipos[selectedEquipo.id]}
          tecnico={tecnicos.find((tecnico) => tecnico.descripcion === selectedEquipo.contrato)}
          onEventCreate ={reload}
          tecnicos = {tecnicos}
        />
      )}
    </>
  );
};

export default EquipamentsList;
