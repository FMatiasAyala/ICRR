import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery } from '@mui/material';
import { apiDatosContrato, apiEventosFiltrados, apiTecnicosEquipo } from '../utils/Fetch';
import FormEquipamentModal from './FormEquipamentModal';
import FormMaintenanceModal from '../Maintenance/FormMaintenanceModal';
import FileDownloadButton from '../hooks/FileDownloadButton';

const EquipamentModal = ({ open, handleClose, equipo, estadoActual, tecnico, onEventCreate, tecnicos, user, mantenimiento }) => {
  const [tecnicosEquipo, setTecnicosEquipo] = useState([])
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
      case 'REALIZADO':
        return { bgColor: '#c8e6c9', borderColor: '#43a047', textColor: '#2e7d32' };
      // Verde
      case 'NO OPERATIVO':
        return { bgColor: '#ffcdd2', borderColor: '#e53935', textColor: '#b71c1c' }; // Rojo
      case 'PROGRAMADO':
        return { bgColor: '#ffcdd2', borderColor: '#e53935', textColor: '#b71c1c' }; // Rojo
      case 'REVISION':
        return { bgColor: '#fff9c4', borderColor: '#fbc02d', textColor: '#f57f17' }; // Amarillo
      case 'POSTERGADO':
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
    const fetchTecnicosEquipo = async () => {

      try {
        const response = await fetch(`${apiTecnicosEquipo}${equipo.id}`);
        if (!response.ok) {
          throw new Error(`Error en la respuesta del servidor: ${response.status}`);
        }
        const data = await response.json();
        setTecnicosEquipo(data);
      } catch (error) {
        console.error('Error al cargar los técnicos del equipo:', error);
      }
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
      fetchTecnicosEquipo();
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
              {equipo.serial_number && (
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
                      <strong>SERIAL NUMBER:</strong> {equipo.serial_number}
                    </Typography>
                  </Box>
                </Grid>)}
              {equipo.compra_año && (
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
                      <strong>COMPRA AÑO:</strong> {equipo.compra_año}
                    </Typography>
                  </Box>
                </Grid>)}
            </Grid>
            {user.role === 'sistemas' && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexDirection:  'row' }}>
                <FormEquipamentModal equipo={equipo} onEventCreate={onEventCreate} />
                <FormMaintenanceModal equipos={equipo} tecnicos={tecnicosEquipo} onEventCreate={onEventCreate} />
              </Box>)
            }
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Button
                variant="contained"
                onClick={() => handleTabChange('maintenance')}
                sx={{ bgcolor: '#00796b', color: '#fff' }}
              >
                HISTORIAL DE MANTENIMIENTOS
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

        {currentTab === 'maintenance' && (
          <Box sx={{ p: 3, bgcolor: '#f4f6f8', borderRadius: 2 }}>

            <Button
              onClick={() => handleTabChange('main')}
              sx={{
                mt: { xs: 1, md: 2 }, // Menos margen en móvil
                fontSize: { xs: '12px', md: '14px' }, // Texto más pequeño en móvil
                padding: { xs: '6px 10px', md: '10px 20px' }, // Padding menor en móvil
                width: { xs: '100%', sm: 'auto' }, // Ocupa todo el ancho en móviles
                color: '#ffffff',
                bgcolor: '#388e3c',
                '&:hover': { bgcolor: '#2e7d32' },
              }}
            >
              Volver a Detalles del Equipo
            </Button>
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ color: '#388e3c', mb: 2 }}
            >
              Información del Técnico
            </Typography>

            {tecnicosEquipo.length > 0 && (


              tecnicosEquipo.map((tecnico) => <Box sx={{ mt: 3, p: 2, bgcolor: '#ffffff', borderRadius: 1, boxShadow: 1 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Nombre:</strong> {tecnico?.nombre || 'No disponible'} {tecnico?.apellido || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Empresa:</strong> {tecnico?.empresa || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Contacto:</strong> {tecnico?.numero || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Equipo que cubre:</strong> {tecnico?.cobertura || 'No disponible'}
                </Typography>
              </Box>)
            )
            }

            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ color: '#004d99', mt: 4 }}
            >
              Historial de Mantenimientos
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                mt: 2,
                maxHeight: 300, // Para agregar scroll si hay muchos eventos
                overflowY: 'auto',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Comentario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(mantenimiento.length > 0) ? (
                    mantenimiento
                      .slice() // Crear una copia del array para no mutarlo directamente
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha descendente
                      .map((man) => (
                        <TableRow key={man.id_mantenimiento}>
                          <TableCell>{new Date(man.fecha).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{man.tipo}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 'bold',
                              }}
                            >
                              {man.comentario || 'Sin comentario'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{man.estado}</TableCell>

                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No hay mantenimiento disponibles.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

              </Table>
            </TableContainer>
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
