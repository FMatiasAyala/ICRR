import React, { useState, forwardRef } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { apiEventos } from '../utils/Fetch';
import { jwtDecode } from 'jwt-decode';


const FormTask = forwardRef(({ handleClose, onEventCreate, equipo, salas, estadoEquipos }, ref) => {

  const [taskDescription, setTaskDescription] = useState('');
  const [falla, setFalla] = useState('');
  const [idEquipo, setIdEquipo] = useState('');
  const [condicion, setCondicion] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Para manejar la búsqueda
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null); // Para mostrar la info del equipo seleccionado
  const [estadoActual, setEstadoActual] = useState([]); // Para almacenar el estado anterior del equipo


 /*  const fetchEventos = async () => {
    try {
      const response = await fetch(apiEventos);
      const data = await response.json();
      setEstadoActual(data)
    } catch (error) {
      console.error('Error obteniendo equipos:', error);
    }
  }; */


  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Asumiendo que el id del usuario está en el payload del token
    }

    const nuevaTarea = {
      descripcion: taskDescription,
      id_equipo: idEquipo, // Enviar el ID del equipo
      estado: condicion,
      tipo_falla: falla,
      id_usuario: userId  // El estado seleccionado
    };
    try {
      const response = await fetch(apiEventos, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaTarea),
      });


      if (response.ok) {
        console.log('Tarea guardada correctamente');
        fetchEventos();
        onEventCreate();
        handleClose();

      } else {
        console.error('Error al guardar la tarea');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }

    // Resetear los campos del formulario
    setTaskDescription('');
    setFalla('');
    setCondicion('');
    handleClose();
  };

  // Filtrar equipos según el término de búsqueda por nombre, servicio 
  const filteredEquipos = Array.isArray(equipo) ? equipo.filter(equipo =>
    equipo?.modelo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equipo?.servicio?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];


  // Mostrar info del equipo seleccionado
  const handleEquipoSeleccionado = (equipoId) => {
    if (equipoId) {
      const equipoEncontrado = equipo.find(e => e.id === equipoId);
      
      setIdEquipo(equipoId);
      setEquipoSeleccionado(equipoEncontrado);
      setCondicion(estadoActual.find(e => e.id_equipo === equipoId)?.estado); // Obtener el estado anterior del equipo
      console.log(condicion);
    }
  };


  

  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '600px' }, // Ancho dinámico
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 4,
        p: { xs: 2, sm: 4 }, // Padding ajustado en pantallas pequeñas
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" align="center">Cargar Nuevo Evento</Typography>
      <form onSubmit={handleSubmit}>
        {/* Buscador de equipos junto al select */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={2} mb={2}>
          <TextField
            label="Buscar por nombre, sala o servicio"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Seleccionar Equipo</InputLabel>
            <Select
              value={idEquipo}
              onChange={(e) => handleEquipoSeleccionado(e.target.value)}
              required
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                    overflowY: 'auto',
                  },
                },
              }}
            >
              {filteredEquipos.map((equipo) => (
                <MenuItem key={equipo.id} value={equipo.id}>
                  {equipo.modelo} ({salas.find(sala => sala.id_sala === equipo.sala)?.sala || 'Desconocida'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Mostrar información del equipo seleccionado */}
        {equipoSeleccionado && (
          <Box
            mb={2}
            sx={{
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: 2,
              marginBottom: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
              gap: 2,
            }}
          >
            <Typography variant="body1"><strong>Nombre del equipo:</strong> {equipoSeleccionado.modelo}</Typography>
            <Typography variant="body1"><strong>Sala:</strong> {salas.find(sala => sala.id_sala === equipoSeleccionado.sala)?.sala || 'Sin sala'}</Typography>
            <Typography variant="body1"><strong>Estado:</strong> {condicion}</Typography>
          </Box>
        )}

        <TextField
          label="Descripción"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          fullWidth
          required
          margin="normal"
          multiline
          rows={4}
        />

        <FormControl fullWidth>
          <InputLabel>Condición</InputLabel>
          <Select
            value={condicion}
            onChange={(e) => setCondicion(e.target.value)}
            required
          >
            <MenuItem value="operativo">Operativo</MenuItem>
            <MenuItem value="no operativo">No Operativo</MenuItem>
            <MenuItem value="revision">Revisión</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Tipo de evento</InputLabel>
          <Select
            value={falla}
            onChange={(e) => setFalla(e.target.value)}
            required
          >
            <MenuItem value="estado inicial">Estado inicial</MenuItem>
            <MenuItem value="electronica">Eletrónica</MenuItem>
            <MenuItem value="electrica">Eléctrica</MenuItem>
            <MenuItem value="mecanica">Mecánica</MenuItem>
            <MenuItem value="software">Software</MenuItem>
          </Select>
        </FormControl>
        <Box mt={2} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" gap={2}>
          <Button variant="contained" color="primary" type="submit" fullWidth={true}>Guardar</Button>
          <Button variant="outlined" color="secondary" onClick={handleClose} fullWidth={true}>Cancelar</Button>
        </Box>
      </form>
    </Box>
  );
});

export default FormTask;


