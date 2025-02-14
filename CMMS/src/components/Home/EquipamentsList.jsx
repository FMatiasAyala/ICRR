import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, useMediaQuery } from '@mui/material';
import EquipamentModal from '../Modal/EquipamentModal';
import NewTask from '../Modal/NewTask';
import NewMaintenance from '../Modal/NewMaintenance';
import { CheckCircle, Cancel, ReportProblem } from '@mui/icons-material';

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
      {user.role === 'sistemas' && (
        <Grid item xs={12} md={4.5} container spacing={1}>
          <Grid item xs={12} sm={5}>
            <NewTask onEventCreate={reload} equipo={equipo} salas={salas} />
          </Grid>
          <Grid item xs={12} sm={7}>
            <NewMaintenance onMaintenanceCreate={reload} equipos={equipos} tecnicos={tecnicos} salas={salas} tecnicosEquipo={tecnicosEquipo} />
          </Grid>
        </Grid>
      )}
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
          {Object.keys(groupedEquipos).map((servicio) => {
            const equiposEnServicio = groupedEquipos[servicio] || [];
            const countOperativo = equiposEnServicio.filter((equipo) => estadoEquipos[equipo.id] === 'OPERATIVO').length;
            const countNoOperativo = equiposEnServicio.filter((equipo) => estadoEquipos[equipo.id] === 'NO OPERATIVO').length;
            const countRevision = equiposEnServicio.filter((equipo) => estadoEquipos[equipo.id] === 'REVISION').length;

            return isMobile ? (
              <Accordion>
                <AccordionSummary>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {servicio} -
                  </Typography>
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                  <Typography>{countOperativo}</Typography>
                  <Cancel sx={{ color: '#F44336' }} />
                  <Typography>{countNoOperativo}</Typography>
                  <ReportProblem sx={{ color: '#FFB74D' }} />
                  <Typography>{countRevision}</Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: '16px',
                      }}
                    >
                      {groupedEquipos[servicio].filter((equipo) => equipo.tipo === 'MODALITY').map((equipo) => (
                        <Card
                          key={equipo.id}
                          onClick={() => handleOpenModal(equipo)}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: getHoverColorByEstado(estadoEquipos[equipo.id]) },
                            height: 'auto',
                            minWidth: { xs: '100%', sm: '180px' },
                            minHeight: '120px',
                            backgroundColor: getColorByEstado(estadoEquipos[equipo.id]),
                            borderRadius: '8px',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:active': { transform: 'scale(0.98)' },
                          }}
                        >
                          <CardContent sx={{ padding: '8px' }}>
                            <Typography variant="body2" align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '14px', sm: '12px' } }}>
                              {equipo.modelo}
                            </Typography>
                            {salas &&
                              salas
                                .filter((sala) => sala.ubicacion === equipo.sala)
                                .map((sala) => (
                                  <Typography
                                    key={sala.id}
                                    variant="body2"
                                    color="text.secondary"
                                    fontSize={{ xs: '12px', sm: '10px' }}
                                    fontWeight="bold"
                                  >
                                    {`${sala.sala} - ${sala.filial}`}
                                  </Typography>
                                ))}
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>) : (
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
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: '16px',
                  }}
                >
                  {groupedEquipos[servicio].filter((equipo) => equipo.tipo === 'MODALITY').map((equipo) => (
                    <Card
                      key={equipo.id}
                      onClick={() => handleOpenModal(equipo)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: getHoverColorByEstado(estadoEquipos[equipo.id]) },
                        height: 'auto',
                        minWidth: { xs: '100%', sm: '180px' },
                        minHeight: '120px',
                        backgroundColor: getColorByEstado(estadoEquipos[equipo.id]),
                        borderRadius: '8px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease-in-out',
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      <CardContent sx={{ padding: '8px' }}>
                        <Typography variant="body2" align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '14px', sm: '12px' } }}>
                          {equipo.modelo}
                        </Typography>
                        {salas &&
                          salas
                            .filter((sala) => sala.ubicacion === equipo.sala)
                            .map((sala) => (
                              <Typography
                                key={sala.id}
                                variant="body2"
                                color="text.secondary"
                                fontSize={{ xs: '12px', sm: '10px' }}
                                fontWeight="bold"
                              >
                                {`${sala.sala} - ${sala.filial}`}
                              </Typography>
                            ))}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )
          })}
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
