import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Divider,
  Typography,
  Modal,
  IconButton,
  TextField,
  Button,
  Grid,
  Chip
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { apiMantenimiento, apiMantenimientoPostpone } from '../utils/Fetch';
import NewMaintenance from './NuevoMantenimiento';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useWebSocketContext } from '../WebSocket/useWebSocketContext';

const CardsMantenimiento = ({ salas }) => {
  const { state: { mantenimiento: mantenimientos, tecnicos, equipos } } = useWebSocketContext();
  const [comentarios, setComentarios] = useState(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null);
  const [newFecha, setNewFecha] = useState('');
  const [newHoraDesde, setNewHoraDesde] = useState('');
  const [newHoraHasta, setNewHoraHasta] = useState('');
  const [currentTab, setCurrentTab] = useState('main');
  const [openListado, setOpenListado] = useState(false);

  const obtenerNombreEquipo = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);
    return equipo ? equipo.modelo : 'Equipo no encontrado';
  };
  const obtenerSerial = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);
    return equipo ? equipo.serial_number : 'Equipo sin serial number';
  };

  const handleDoneMantenimiento = async (id_mantenimiento, nuevoEstado) => {
    const doneMantenimiento = {
      comentario: comentarios,
      estado: nuevoEstado
    };

    try {
      const responseDone = await fetch(`${apiMantenimiento}${id_mantenimiento}`, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doneMantenimiento),
      });
      if (responseDone.ok) {
        setComentarios(null);
        setCurrentTab(null);
      } else {
        console.error('Error al actualizar el mantenimiento:', responseDone.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }

  };

  const handleOpenForm = (man, tab) => {
    setCurrentTab(tab); // 'done' o 'postpone'
    setSelectedMantenimiento(man);
  };

  const handlePostpone = async () => {
    if (!selectedMantenimiento) return;

    try {
      const response = await fetch(`${apiMantenimientoPostpone}${selectedMantenimiento.id_mantenimiento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'POSTERGADO',
          fecha: newFecha,
          desde: newHoraDesde,
          hasta: newHoraHasta,
        }),
      });
      if (response.ok) {
        setSelectedMantenimiento(null);
        setCurrentTab(null)
      } else {
        console.error('Error al postergar el mantenimiento:', response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  const mantenimientosProgramados = mantenimientos.filter(
    (mantenimiento) => mantenimiento.estado === 'PROGRAMADO' || mantenimiento.estado === 'POSTERGADO'
  );



  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 4,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Modal
        open={Boolean(currentTab && selectedMantenimiento)}
        onClose={() => {
          setSelectedMantenimiento(null);
          setCurrentTab(null);
        }}
        aria-labelledby="modal-titulo"
        aria-describedby="modal-descripcion"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 3,
            width: { xs: '90%', sm: 500 },
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {currentTab === 'done' ? 'Confirmar Mantenimiento' : 'Reprogramar Mantenimiento'}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Equipo: <strong>{obtenerNombreEquipo(selectedMantenimiento?.id_equipo)}</strong>
          </Typography>
          <Typography variant="body2">Tipo: {selectedMantenimiento?.tipo}</Typography>
          <Typography variant="body2" gutterBottom>Detalle: {selectedMantenimiento?.detalle}</Typography>

          {currentTab === 'done' && (
            <>
              <TextField
                label="Comentario"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 2, mb: 2 }}
              />

              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => {
                  handleDoneMantenimiento(selectedMantenimiento.id_mantenimiento, 'REALIZADO');
                }}
              >
                Confirmar Mantenimiento
              </Button>
            </>
          )}

          {currentTab === 'postpone' && (
            <>
              <TextField
                label="Nueva Fecha"
                type="date"
                value={newFecha}
                onChange={(e) => setNewFecha(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={1} mb={2}>
                <TextField
                  label="Desde"
                  type="time"
                  value={newHoraDesde}
                  onChange={(e) => setNewHoraDesde(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Hasta"
                  type="time"
                  value={newHoraHasta}
                  onChange={(e) => setNewHoraHasta(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={() => {
                  handlePostpone();
                }}
              >
                Reprogramar Mantenimiento
              </Button>
            </>
          )}

          <Button
            variant="text"
            onClick={() => {
              setSelectedMantenimiento(null);
              setCurrentTab(null);
            }}
            fullWidth
            sx={{ mt: 1 }}
          >
            Cancelar
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openListado}
        onClose={() => setOpenListado(false)}
        aria-labelledby="modal-listado-titulo"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 3,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Todos los mantenimientos programados
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {mantenimientosProgramados.length === 0 ? (
            <Typography>No hay mantenimientos.</Typography>
          ) : (
            <Grid container spacing={2}>
              {mantenimientosProgramados.map((man) => (
                <Grid item xs={12} sm={6} md={4} key={man.id_mantenimiento}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderLeft: '4px solid #1976d2',
                      backgroundColor: '#f9f9f9',
                      boxShadow: 1,
                    }}
                  >
                    <Chip
                      label={man.estado}
                      color={man.estado === 'POSTERGADO' ? 'warning' : 'primary'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {obtenerNombreEquipo(man.id_equipo)}
                    </Typography>
                    <Typography variant="body2">Serial Number: <strong>{obtenerSerial(man.id_equipo)}</strong></Typography>
                    <Typography variant="body2">Tipo: <strong>{man.tipo}</strong></Typography>
                    <Typography variant="body2">Detalle: {man.detalle}</Typography>
                    <Typography variant="body2">Fecha: {new Date(man.fecha).toLocaleDateString('es-AR')}</Typography>
                    <Typography variant="body2">Horario: {man.desde} - {man.hasta}</Typography>
                    <Box display="flex" justifyContent="space-between">
                      <IconButton
                        onClick={() => handleOpenForm(man, 'done')}
                        size="small"
                        color="success"
                      >
                        <DoneIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenForm(man, 'postpone')}
                        size="small"
                        color="warning"
                      >
                        <ScheduleIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>

              ))}
            </Grid>
          )}

          <Box mt={2} textAlign="right">
            <Button variant="outlined" onClick={() => setOpenListado(false)}>
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>




      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={600}>
          Proximos mantenimientos
        </Typography>
        <NewMaintenance equipos={equipos} salas={salas} />
        <IconButton onClick={() => setOpenListado(true)}>
          <VisibilityIcon />
        </IconButton>

      </Box>


      <Divider />

      {mantenimientosProgramados.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay mantenimientos programados.
        </Typography>
      ) : (
        <Box
          sx={{
            overflowY: 'auto',
            maxHeight: '65vh',
            pr: 1,
          }}
        >
          {mantenimientosProgramados.map((man) => (
            <Card
              key={man.id_mantenimiento}
              variant="outlined"
              sx={{
                mb: 2,
                p: 2,
                borderLeft: '4px solid #1976d2',
                backgroundColor: '#f9f9f9',
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {obtenerNombreEquipo(man.id_equipo)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                S/N: <strong>{obtenerSerial(man.id_equipo)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Tipo: <strong>{man.tipo}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Detalle: {man.detalle}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Fecha: {new Date(man.fecha).toLocaleDateString('es-AR')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Horario: {man.desde} - {man.hasta}
              </Typography>

              <Box display="flex" justifyContent="space-between">
                <IconButton
                  onClick={() => handleOpenForm(man, 'done')}
                  size="small"
                  color="success"
                >
                  <DoneIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleOpenForm(man, 'postpone')}
                  size="small"
                  color="warning"
                >
                  <ScheduleIcon />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>

  );
};

export default CardsMantenimiento;
