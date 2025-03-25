import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Divider,
  Typography,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
  useMediaQuery,
  Snackbar, Alert,
  Grid
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ClearIcon from '@mui/icons-material/Clear';
import { apiMantenimiento, apiMantenimientoPostpone } from '../utils/Fetch';
import NewMaintenance from './NewMaintenance';
import CardsMantenimientoMobile from './CardsMantenimientoMobile';

const CardsMantenimiento = ({ equipos, salas, tecnicos, reload }) => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comentarios, setComentarios] = useState(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null);
  const [newFecha, setNewFecha] = useState('');
  const [newHoraDesde, setNewHoraDesde] = useState('');
  const [newHoraHasta, setNewHoraHasta] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [currentTab, setCurrentTab] = useState('main'); // 'done' | 'postpone' | null

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const obtenerMantenimientos = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiMantenimiento);
      const data = await response.json();
      setMantenimientos(data);
    } catch (error) {
      console.error('Error al obtener los mantenimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerMantenimientos()
  }, []);

  const obtenerNombreEquipo = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);
    return equipo ? equipo.modelo : 'Equipo no encontrado';
  };


  const handleDoneMantenimiento = async (id_mantenimiento, nuevoEstado) => {

    const doneMantenimiento = { ...mantenimientos, comentario: comentarios, estado: nuevoEstado };

    try {
      const responseDone = await fetch(`${apiMantenimiento}${id_mantenimiento}`, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doneMantenimiento),
      });
      if (responseDone.ok) {
        setMantenimientos((prevMantenimientos) =>
          prevMantenimientos.map((mantenimiento) =>
            mantenimiento.id_mantenimiento === id_mantenimiento
              ? { ...mantenimiento, estado: nuevoEstado }
              : mantenimiento
          )

        );
        setSnackbarMessage("Mantenimiento confirmado correctamente");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        setComentarios(null);
        console.log('Mantenimiento actualizado');
      } else {
        console.error('Error al actualizar el mantenimiento:', responseDone.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }

  };

  const handleOpenForm = (mantenimiento, tab) => {
    setCurrentTab(tab); // 'done' o 'postpone'
    setSelectedMantenimiento(mantenimiento);
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
        setMantenimientos((prevMantenimientos) =>
          prevMantenimientos.map((mantenimiento) =>
            mantenimiento.id_mantenimiento === selectedMantenimiento.id_mantenimiento
              ? { ...mantenimiento, estado: 'POSTERGADO', nueva_fecha: newFecha }
              : mantenimiento
          )
        );
        // Aquí iría la lógica para reprogramar el mantenimiento
        setSnackbarMessage("Mantenimiento reprogramado correctamente");
        setSnackbarSeverity("info");
        setOpenSnackbar(true);
        setSelectedMantenimiento(null);
        console.log('Mantenimiento postergado');
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
    <Box display="flex" justifyContent="center" mt={{ xs: 2, md: 4 }} px={{ xs: 2, md: 0 }}>
      {mantenimientosProgramados.length > 0 && (
        <Box
          sx={{ 
            top: '50%',
            left: '50%',
            width: isMobile ? '95%' : isTablet ? '80%' : (handleOpenForm) ? 1000 : 800, 
            bgcolor: 'background.paper',
            boxShadow: 4,
            p: 2,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            maxHeight: '50vh',
            overflowY: 'auto', 
            overflowX: 'hidden', 
          }}
        >
          {currentTab === 'main' && (
            <Box sx={{ flex: 1 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                    Listado de Mantenimientos Programados
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <NewMaintenance onMaintenanceCreate={reload} equipos={equipos} tecnicos={tecnicos} salas={salas} />
                </Grid>
              </Grid>
              {isMobile ? (
                <CardsMantenimientoMobile mantenimientosProgramados={mantenimientosProgramados} obtenerNombreEquipo={obtenerNombreEquipo} handleOpenForm={handleOpenForm} />
              ) : (
                <Table size={isMobile ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow key={mantenimientosProgramados.id_mantenimiento}
                    >
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px', wordBreak: 'break-word', whiteSpace: 'normal' }}>Equipo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Tipo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Detalle</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Fecha</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Horario</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mantenimientosProgramados.length > 0 ? (
                      mantenimientosProgramados.map((mantenimiento) => (
                        <TableRow key={mantenimiento.id_mantenimiento} sx={{
                          color: '#fff',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          fontSize: '12px',
                          padding: '4px'
                        }}>
                          <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>{obtenerNombreEquipo(mantenimiento.id_equipo)}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>{mantenimiento.tipo}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>{mantenimiento.detalle}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>{new Date(mantenimiento.fecha).toLocaleDateString()}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>
                            {new Date(`2024-11-01T${mantenimiento.desde}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(`2024-11-01T${mantenimiento.hasta}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '12px', padding: '4px' }}>
                            <IconButton onClick={() => handleOpenForm(mantenimiento, 'done')} color="primary">
                              <DoneIcon />
                            </IconButton>
                            <IconButton onClick={() => handleOpenForm(mantenimiento, 'postpone')} color="secondary">
                              <ScheduleIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={6}>No hay mantenimientos programados disponibles</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
          {(currentTab === 'done' || currentTab === 'postpone') && (
            <Box sx={{ flex: 1, pl: isMobile ? 0 : 4, pt: isMobile ? 2 : 0 }}>
              <IconButton color="primary" onClick={() => setCurrentTab('main')}>
                <ClearIcon />
              </IconButton>

              {currentTab === 'done' && (
                <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}
                  >
                    Equipo: {obtenerNombreEquipo(selectedMantenimiento.id_equipo)}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <TextField
                    label="Comentario"
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontWeight: 'bold',
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': { backgroundColor: 'primary.dark' }
                    }}
                    onClick={() => handleDoneMantenimiento(selectedMantenimiento.id_mantenimiento, 'REALIZADO')}
                  >
                    Confirmar Mantenimiento
                  </Button>
                </Card>
              )}


              {currentTab === 'postpone' && (
                <>
                  <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                    Reprogramar Mantenimiento
                  </Typography>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}
                  >
                    Equipo: {obtenerNombreEquipo(selectedMantenimiento.id_equipo)}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <TextField
                    label="Nueva Fecha"
                    type="date"
                    fullWidth
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Hora Desde"
                    type="time"
                    fullWidth
                    value={newHoraDesde}
                    onChange={(e) => setNewHoraDesde(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Hora Hasta"
                    type="time"
                    fullWidth
                    value={newHoraHasta}
                    onChange={(e) => setNewHoraHasta(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button variant="contained" color="primary" fullWidth onClick={handlePostpone}>
                    Guardar Cambios
                  </Button>
                </>
              )}
            </Box>
          )}

          <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
            <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </Box>
  );
};

export default CardsMantenimiento;
