import React, { useState, forwardRef, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Autocomplete, Snackbar, Alert,
  FormControl, InputLabel, MenuItem, Select, Backdrop, CircularProgress
} from '@mui/material';
import {
  DatePicker, TimePicker, LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiMantenimiento } from '../utils/Fetch';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import enGB from 'date-fns/locale/en-GB';
import { useWebSocketContext } from '../WebSocket/useWebSocketContext';

const FormMaintenance = forwardRef(({ equipos, salas, tecnihandleClose }, ref) => {
  const { state: { tecnicos } } = useWebSocketContext();
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tipoMantenimiento, setTipoMantenimiento] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    console.log('Técnicos actualizados:', tecnicos);
  }, [tecnicos]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    }

    const nuevoMantenimiento = {
      fecha: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      desde: startTime ? format(startTime, "HH:mm") : null,
      hasta: endTime ? format(endTime, "HH:mm") : null,
      empresa: selectedTechnician?.empresa || null,
      tipo: tipoMantenimiento,
      detalle: taskDescription,
      id_tecnico: selectedTechnician?.id_tecnico || null,
      id_equipo: selectedEquipo?.id || null,
      estado: 'PROGRAMADO',
      id_usuario: userId
    };

    setLoading(true);
    try {
      const response = await fetch(apiMantenimiento, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoMantenimiento),
      });

      if (response.ok) {
        tecnihandleClose();
      } else if (response.status === 400) {
        setSnackbarMessage('No se puede asignar una fecha anterior a la actual.');
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('Error inesperado al guardar mantenimiento.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Error de conexión con el servidor.');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }

    // Reset
    setTaskDescription('');
    setSelectedTechnician(null);
    setSelectedEquipo(null);
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 500, md: 600 },
        maxHeight: '95%',
        overflowY: 'auto',
        bgcolor: '#fefefe',
        boxShadow: 10,
        borderRadius: 4,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: '#00796b' }}>
        Cargar Nuevo Mantenimiento
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de Mantenimiento</InputLabel>
          <Select
            value={tipoMantenimiento}
            onChange={(e) => setTipoMantenimiento(e.target.value)}
            required
            label="Tipo de Mantenimiento"
          >
            <MenuItem value="PREVENTIVO">Preventivo</MenuItem>
            <MenuItem value="CORRECTIVO">Correctivo</MenuItem>
            <MenuItem value="ACTUALIZACION">Actualización</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Comentario"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        <Autocomplete
          key={tecnicos.id_tecnico}
          options={tecnicos}
          value={selectedTechnician}
          onChange={(_, newValue) => setSelectedTechnician(newValue)}
          getOptionLabel={(option) => (option?.apellido || '')+ ' ' + option?.nombre + ' - '+(option?.empresa)}
          renderInput={(params) => (
            <TextField {...params} label="Seleccionar Técnico" required sx={{ mb: 2 }} />
          )}
        />

        <Autocomplete
          options={equipos}
          value={selectedEquipo}
          onChange={(_, newValue) => setSelectedEquipo(newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) =>
            `${option.modelo} - ${option.siglas_servicio} (${salas.find(s => s.id_ubicacion === option.id_ubicacion)?.sala || 'Desconocida'})`
          }
          renderInput={(params) => (
            <TextField {...params} label="Seleccionar Equipo" required sx={{ mb: 2 }} />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DatePicker
              label="Fecha"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              format="dd/MM/yyyy"
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
            <Box display="flex" gap={2}>
              <TimePicker
                label="Hora de Inicio"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                ampm={false}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
              <TimePicker
                label="Hora de Fin"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                ampm={false}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Box>
          </Box>
        </LocalizationProvider>

        <Box mt={3} display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            sx={{
              py: 1.3,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: 3,
              textTransform: 'none',
            }}
          >
            Guardar
          </Button>
          <Button
            onClick={tecnihandleClose}
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{
              py: 1.3,
              borderRadius: 2,
              fontWeight: 500,
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
        </Box>
      </form>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default FormMaintenance;
