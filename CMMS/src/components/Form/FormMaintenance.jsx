import React, { useState, forwardRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Autocomplete, Snackbar, Alert, FormControl, InputLabel, MenuItem, Select, Backdrop, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiMantenimiento } from '../utils/Fetch';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import enGB from 'date-fns/locale/en-GB';
import { useWebSocketContext } from '../hooks/useWebSocketContext';

const FormMaintenance = forwardRef(({ equipos, salas, tecnihandleClose }, ref) => {
  const { state: { tecnicos } } = useWebSocketContext();
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tipoMantenimiento, setTipoMantenimiento] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [startTime, setStartTime] = useState(null); // "Desde"
  const [endTime, setEndTime] = useState(null); // "Hasta"
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    let userId = null;

    useEffect(() => {
      console.log('Técnicos actualizados:', tecnicos);
    }, [tecnicos]);


    if (token) {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Asumiendo que el id del usuario está en el payload del token
    }
    const nuevoMantenimiento = {
      fecha: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      desde: startTime ? format(startTime, "HH:mm") : null, // Hora de inicio
      hasta: endTime ? format(endTime, "HH:mm") : null, // Hora de fin
      empresa: selectedTechnician?.empresa || null,
      tipo: tipoMantenimiento || null,
      detalle: taskDescription || null,
      id_tecnico: selectedTechnician?.id_tecnico || null,
      id_equipo: selectedEquipo?.id || null,
      estado: 'PROGRAMADO',
      id_usuario: userId
    };
    setLoading(true);
    try {
      const response = await fetch(apiMantenimiento, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoMantenimiento),
      });

      if (response.ok) {
        setSnackbarMessage('Mantenimiento guardado correctamente.');
        setSnackbarSeverity('success');
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
      tecnihandleClose();
      setSnackbarOpen(true);
    }

    setTaskDescription('');
    setSelectedTechnician(null);
    setSelectedEquipo(null);
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };


  return (<Box
    ref={ref}
    sx={{
      position: 'absolute',
      overflowY: 'auto',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '80%', md: 600 },
      height: { xs: '90%', md: 600 },
      bgcolor: 'background.paper',
      boxShadow: 24,
      borderRadius: 4,
      p: { xs: 2, sm: 4 }, // Padding dinámico para móviles
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      scrollbarWidth: 'none', // Oculta la barra en Firefox
      '&::-webkit-scrollbar': {
        display: 'none' // Oculta la barra en Chrome, Safari y Edge
      }
    }}
  >
    <Backdrop
      open={loading}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(3px)',
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
    <Typography variant="h6" align="center">Cargar Nuevo Mantenimiento</Typography>
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth>
        <InputLabel>Tipo de Mantenimiento</InputLabel>
        <Select
          value={tipoMantenimiento}
          onChange={(e) => setTipoMantenimiento(e.target.value)}
          required
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
        margin="normal"
        multiline
        rows={4}
      />

      {/* Autocomplete de técnico */}
      <Autocomplete
        options={tecnicos}
        value={selectedTechnician}
        onChange={(event, newValue) => setSelectedTechnician(newValue)}
        getOptionLabel={(option) => option?.nombre + (option?.apellido ? ' ' + option.apellido : '')}
        renderInput={(params) => (
          <TextField {...params} label="Seleccionar Técnico" margin="normal" required />
        )}
      />

      {/* Autocomplete de equipo */}
      <Autocomplete
        options={equipos}
        value={selectedEquipo}
        onChange={(event, newValue) => setSelectedEquipo(newValue)}
        isOptionEqualToValue={(option, value) => option.id === value.id} // Comparar por ID único
        getOptionLabel={(option) => `${option.modelo} - ${option.siglas_servicio} (${salas.find(sala => sala.id_ubicacion === option.id_ubicacion)?.sala || 'Desconocida'})`}
        renderInput={(params) => (
          <TextField {...params} label="Seleccionar Equipo" margin="normal" required />
        )}
      />

      {/* Selector de fecha */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
          <DatePicker
            label="Fecha"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            inputFormat="dd/mm/yyyy" // Formato dd/MM/yyyy
            disableOpenPicker
            renderInput={(params) => (
              <TextField {...params} fullWidth required />
            )}
          />
          <TimePicker
            label="Hora de Inicio"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
            ampm={false} // Formato de 24 horas
            disableOpenPicker
            renderInput={(params) => (
              <TextField {...params} fullWidth required />
            )}
          />
          <TimePicker
            label="Hora de Fin"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
            ampm={false} // Formato de 24 horas
            disableOpenPicker
            renderInput={(params) => (
              <TextField {...params} fullWidth required />
            )}
          />
        </Box>
      </LocalizationProvider>

      {/* Bloque Botones */}
      <Box mt={3} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" gap={2}>
        <Button variant="contained" color="primary" type="submit" fullWidth={true}>Guardar</Button>
        <Button variant="outlined" color="secondary" onClick={tecnihandleClose} fullWidth={true}>Cancelar</Button>
      </Box>
    </form>

    {/* Snackbar para mensajes */}
    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
      <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </Box>
  )
})


export default FormMaintenance;