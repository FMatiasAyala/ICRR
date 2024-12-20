import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery } from '@mui/material';
import EventIcon from '@mui/icons-material/Event'; // Para el ícono de eventos
import DescriptionIcon from '@mui/icons-material/Description';
import { apiDatosContrato, apiEventosFiltrados } from '../../utils/Fetch';
import FormEquipamentModal from './FormEquipamentModal';
import FormMaintenanceModal from './FormMaintenanceModal';
import FileDownloadButton from '../hooks/FileDownloadButton';

const EquipamentModal = ({ open, handleClose, equipo, estadoActual, tecnico, onEventCreate, tecnicos }) => {
  const [eventos, setEventos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [currentTab, setCurrentTab] = useState('main'); // 'main', 'technician', 'events', 'contracts'

  const handleTabChange = (tab) => {
    setCurrentTab(tab);

  };
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  // Colores según el estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'OPERATIVO':
        return { bgColor: '#c8e6c9', borderColor: '#43a047', textColor: '#2e7d32' }; // Verde
      case 'NO OPERATIVO':
        return { bgColor: '#ffcdd2', borderColor: '#e53935', textColor: '#b71c1c' }; // Rojo
      case 'REVISION':
        return { bgColor: '#fff9c4', borderColor: '#fbc02d', textColor: '#f57f17' }; // Amarillo
      default:
        return { bgColor: '#e0e0e0', borderColor: '#757575', textColor: '#424242' }; // Gris
    }
  };

  const { bgColor, borderColor, textColor } = obtenerColorEstado(estadoActual);
  const mostrarInfoTecnico = tecnico && equipo.contrato === tecnico.descripcion;

  useEffect(() => {

    const fecthDatosContrato = async () => {

      try {
        const response = await fetch(`${apiDatosContrato}?id_equipo=${equipo.id}`);
        if (!response.ok) {
          throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }
        const data = await response.json();
        setContratos(data);
      } catch (error) {
        console.error("Error al cargar los datos del contrato:", error);
      };
    }


    const fetchEventosFiltrados = async () => {
      try {
        const response = await fetch(`${apiEventosFiltrados}?id_equipo=${equipo.id}`);
        if (!response.ok) {
          throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      }
    };

    if (open && equipo && equipo.id) {
      fetchEventosFiltrados();
      fecthDatosContrato();
    }
  }, [equipo, open]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isSmallScreen ? '90%' : '40%',
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
        }}
      >
        {currentTab === 'main' && (
          <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#004d99' }}>
              Detalles del Equipo
            </Typography>

            <Grid container spacing={2}>
              {/* Detalles del equipo */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#bbdefb',
                    boxShadow: 1,
                    borderRadius: '8px',
                    borderLeft: '5px solid #1e88e5',
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                    <strong>Modelo:</strong> {equipo.modelo}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#bbdefb',
                    boxShadow: 1,
                    borderRadius: '8px',
                    borderLeft: '5px solid #1e88e5',
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                    <strong>MARCA:</strong> {equipo.marca}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#bbdefb',
                    boxShadow: 1,
                    borderRadius: '8px',
                    borderLeft: '5px solid #1e88e5',
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                    <strong>IP:</strong> {equipo.ip}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: bgColor,
                    boxShadow: 1,
                    borderRadius: '8px',
                    borderLeft: `5px solid ${borderColor}`,
                  }}
                >
                  <Typography variant="body1" sx={{ color: textColor }}>
                    <strong>Estado:</strong> {estadoActual}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#bbdefb',
                    boxShadow: 1,
                    borderRadius: '8px',
                    borderLeft: '5px solid #1e88e5',
                  }}
                >
                  <Typography variant="body1" sx={{ color: '#1e88e5' }}>
                    <strong>AETITLE:</strong> {equipo.aetitle}
                  </Typography>
                </Box>
              </Grid>
              {/* Otros datos aquí */}
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexDirection: isSmallScreen ? 'column' : 'row' }}>
              <FormEquipamentModal  equipo={equipo} onEventCreate={onEventCreate} />
              <FormMaintenanceModal equipos={equipo} tecnicos={tecnicos} onEventCreate={onEventCreate} />
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleTabChange('technician')}
                sx={{ bgcolor: '#00796b', color: '#fff' }}
              >
                Ver Técnico
              </Button>
              <Button
                variant="contained"
                onClick={() => handleTabChange('events')}
                sx={{ bgcolor: '#00796b', color: '#fff' }}
              >
                Ver Eventos
              </Button>
              <Button
                variant="contained"
                onClick={() => handleTabChange('contracts')}
                sx={{ bgcolor: '#00796b', color: '#fff' }}
              >
                Ver Contratos
              </Button>
              <Button variant="contained" onClick={handleClose}>
                Cerrar
              </Button>
            </Box>
          </Box>
        )}

        {currentTab === 'technician' && (
          <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#388e3c' }}>
              Información del Técnico
            </Typography>
            <Button onClick={() => handleTabChange('main')} sx={{ mt: 4 }}>
              Volver a Detalles del Equipo
            </Button>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1">
                <strong>Nombre:</strong> {tecnico?.nombre}
              </Typography>
              <Typography variant="body1">
                <strong>Empresa:</strong> {tecnico?.empresa}
              </Typography>
              <Typography variant="body1">
                <strong>Contacto:</strong> {tecnico?.numero}
              </Typography>
              <Typography variant="body1">
                <strong>Equipo que cubre:</strong> {tecnico?.cobertura}
              </Typography>
            </Box>
          </Box>
        )}

        {currentTab === 'events' && (
          <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#004d99' }}>
              Historial de Eventos
            </Typography>
            <Button onClick={() => handleTabChange('main')} sx={{ mt: 4 }}>
              Volver a Detalles del Equipo
            </Button>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2}>No hay eventos disponibles.</TableCell>
                    </TableRow>
                  ) : (
                    eventos.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell>{new Date(evento.desde).toLocaleDateString()}</TableCell>
                        <TableCell>{evento.descripcion}</TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ color: textColor }}>
                            {evento.estado}
                          </Typography>

                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </Box>
        )}

        {currentTab === 'contracts' && (

          <Box
            sx={{
              p: 3,
              bgcolor: '#e3f2fd',
              boxShadow: 3,
              borderRadius: '12px',
              border: '2px solid #1565c0',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ color: '#0d47a1', fontWeight: 'bold', mb: 3 }}
            >
              Detalles del Contrato
            </Typography>

            {contratos.length === 0 ? (

              <Typography
                variant="body1"
                align="center"
                sx={{ color: '#b71c1c', fontWeight: 'bold', mt: 2 }}
              >
                No hay datos del contrato disponibles.
              </Typography>
            ) : (
              contratos.map((contrato) => (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '1rem',
                          color: '#0d47a1',
                          fontWeight: '500',
                        }}
                      >
                        <strong>Observacion:</strong> {contrato.descripcion}
                      </Typography>
                    </Box>

                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Actualizacion:</strong> {contrato.actualizacion}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Cobertura partes:</strong> {contrato.cobertura_partes}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Cobertura mano de obra:</strong> {contrato.cobertura_manoDeObra}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >

                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Desde:</strong> {new Date(contrato.desde).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Hasta:</strong> {new Date(contrato.hasta).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              ))
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <FileDownloadButton equipo={equipo} />
              <Button
                onClick={() => handleTabChange('main')}
                variant="contained"
                sx={{
                  bgcolor: '#1565c0',
                  color: '#fff',
                  ':hover': { bgcolor: '#0d47a1' },
                  borderRadius: '8px',
                  ml: 2,
                }}
              >
                Volver
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal >
  );
};

export default EquipamentModal;
