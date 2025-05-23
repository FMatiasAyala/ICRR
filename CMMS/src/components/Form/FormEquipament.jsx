import React, { useState, forwardRef } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, useMediaQuery, IconButton } from '@mui/material';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { apiBajaEquipo, apiEventos } from '../utils/Fetch';
import { jwtDecode } from 'jwt-decode';
import TaskIcon from '@mui/icons-material/Task';
import { Cancel } from '@mui/icons-material';





const FormEquipament = forwardRef(({ open, handleClose, onEventCreate, equipo }, ref) => {

  const [taskDescription, setTaskDescription] = useState('');
  const [falla, setFalla] = useState('');
  const [condicion, setCondicion] = useState('');
  const [current, setCurrentTab] = useState('options');

  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const handleTab = (tab) => {
    setCurrentTab(tab);
  }

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
      id_equipo: equipo.id, // Enviar el ID del equipo
      estado: condicion,
      tipo_falla: falla,
      id_usuario: userId // El estado seleccionado
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

  const handleSubmitDown = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Asumiendo que el ID del usuario está en el token
    }

    const nuevaTarea = {
      descripcion: taskDescription,
      id_equipo: equipo.id,
      estado: "no operativo",
      tipo_falla: "dado de baja",
      id_usuario: userId,
    };

    try {
      // Solicitud para dar de baja el equipo
      const responseDown = await fetch(apiBajaEquipo, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_equipo: equipo.id }), // Enviar como objeto
      });

      if (responseDown.ok) {
        const data = await responseDown.json();
        console.log('Equipo dado de baja:', data);
      } else {
        const errorData = await responseDown.json();
        console.error('Error al dar de baja el equipo:', errorData);
        return; // Detener si hay error
      }

      // Solicitud para guardar la tarea
      const responseTask = await fetch(apiEventos, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaTarea),
      });

      if (responseTask.ok) {
        const data = await responseTask.json();
        console.log('Tarea guardada correctamente:', data);
      } else {
        const errorData = await responseTask.json();
        console.error('Error al guardar la tarea:', errorData);
        return; // Detener si hay error
      }

      // Llamar a onEventCreate si todo fue exitoso
      onEventCreate();
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      // Resetear campos y cerrar modal
      setTaskDescription('');
      setFalla('');
      setCondicion('');
      handleClose();
    }
  };




  return (
    <Box
      sx={{
        position: 'absolute',
        bgcolor: 'background.paper',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '80%', md: 600 },
        height: { xs: '60%', md: '50%' },
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        p: 4,
        borderRadius: '12px',
      }}>

      {current === 'options' && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2, // Espaciado entre las barras
            flexDirection: 'column', // Los elementos estarán en columna
            alignItems: 'center',
            mt: 8,
            height: '60%',
            width: '100%',
          }}
        >
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Cancel />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleTab('task')}
            startIcon={<TaskIcon />} // Ícono a la izquierda
            sx={{
              fontSize: '18px',
              padding: '15px 20px',
              borderRadius: '8px',
              textTransform: 'none',
              width: { xs: '80%', md: '100%' }, // Ocupa todo el ancho del contenedor
              maxWidth: '400px', // Ancho máximo para evitar que sean demasiado grandes
            }}
          >
            Nuevo evento
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleTab('down')}
            startIcon={<PowerOffIcon />} // Ícono a la izquierda
            sx={{
              fontSize: '18px',
              padding: '15px 20px',
              borderRadius: '8px',
              textTransform: 'none',
              width: { xs: '80%', md: '100%' }, // Ocupa todo el ancho del contenedor
              maxWidth: '400px', // Ancho máximo para evitar que sean demasiado grandes
            }}
          >
            Baja
          </Button>
        </Box>
      )}
      {current === 'task' && (
        <Box
          ref={ref}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            width: { xs: '100%', sm: 600 },
            borderRadius: 4,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
          tabIndex={-1}
        >

          <Typography variant="h6">Cargar Nuevo Evento</Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Descripción"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              fullWidth
              required
              margin="normal"
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Condición</InputLabel>
              <Select
                value={condicion}
                onChange={(e) => setCondicion(e.target.value)}
                required
                sx={{ marginBottom: '5px' }}
              >
                <MenuItem value="operativo">Operativo</MenuItem>
                <MenuItem value="no operativo">No Operativo</MenuItem>
                <MenuItem value="revision">Revisión</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo de Evento</InputLabel>
              <Select
                value={falla}
                onChange={(e) => setFalla(e.target.value)}
                required
              >
                <MenuItem value="estado inicial">Estado inicial</MenuItem>
                <MenuItem value="electrica">Eléctrica</MenuItem>
                <MenuItem value="electronica">Electrónica</MenuItem>
                <MenuItem value="mecanica">Mecánica</MenuItem>
                <MenuItem value="software">Software</MenuItem>
              </Select>
            </FormControl>
            <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="contained" color="primary" type="submit">Guardar</Button>
              <Button variant="outlined" color="secondary" onClick={() => handleTab('options')}>Volver</Button>
            </Box>
          </form>
        </Box>
      )}

      {current === 'down' && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            width: { xs: '100%', sm: 600 },
            borderRadius: 4,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6">Baja de equipo</Typography>
          <form onSubmit={handleSubmitDown}>
            <TextField
              label="Descripcion"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}// Valor predeterminado
              fullWidth
              margin="normal"
              required
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Condición</InputLabel>
              <Select
                value={"no operativo"} // Valor predeterminado
                disabled // Campo no editable
                sx={{ marginBottom: '5px' }}
              >
                <MenuItem value="operativo">Operativo</MenuItem>
                <MenuItem value="no operativo">No Operativo</MenuItem>
                <MenuItem value="revision">Revisión</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo de Evento</InputLabel>
              <Select
                value={"dado de baja"} // Valor predeterminado
                disabled // Campo no editable
              >
                <MenuItem value="dado de baja">Dado de baja</MenuItem>
              </Select>
            </FormControl>
            <Box mt={2} display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                color="error"
                type='submit'
                startIcon={<PowerOffIcon />}
                sx={{
                  fontSize: '16px',
                  padding: '10px 10px',
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                Dar de baja
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleTab('options')}
                sx={{
                  fontSize: '16px',
                  padding: '10px 10px',
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                Volver
              </Button>
            </Box>
          </form>
        </Box>
      )}


    </Box>

  );
});

export default FormEquipament;


