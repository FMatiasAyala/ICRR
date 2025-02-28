import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, Grid, useMediaQuery } from '@mui/material';
import { apiDatosContrato, apiEventosFiltrados, apiTecnicosEquipo } from '../utils/Fetch';
import FormEquipamentModal from './FormEquipamentModal';
import FormMaintenanceModal from '../Maintenance/FormMaintenanceModal';
import CurrentMaintenance from './TabEquipament/CurrentMaintenance';
import CurrentEvents from './TabEquipament/CurrentEvents';
import CurrentContrato from './TabEquipament/CurrentContrato';

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
          <CurrentMaintenance tecnicosEquipo={tecnicosEquipo} mantenimiento={mantenimiento} handleTabChange={handleTabChange} estadoActual={estadoActual}/>        
        )}


        {currentTab === 'events' && (
          <CurrentEvents eventos = {eventos} handleTabChange={handleTabChange} textColor={textColor}/>
        )}

        {currentTab === 'contracts' && (
          <CurrentContrato  contratos={contratos} equipo={equipo} handleTabChange={handleTabChange}/>
        )}
      </Box>
    </Modal >
  );
};

export default EquipamentModal;
