import React, { useState, forwardRef } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Modal, useMediaQuery } from '@mui/material';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiEventos } from '../../utils/Fetch';
import { jwtDecode } from 'jwt-decode';
import { ArrowBack } from '@mui/icons-material';
import TaskIcon from '@mui/icons-material/Task';





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



  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '80%', sm: 600 },
        height: '50%',
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
            bgcolor: 'background.paper',
            flexDirection: 'column', // Los elementos estarán en columna
            alignItems: 'center',
            boxShadow: 24,
            borderRadius: 4,
            height: '60%',
            mt: 2, // Margen superior
            width: '100%', // Asegura que las barras se ajusten al contenedor
          }}
        >
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
              width: '100%', // Ocupa todo el ancho del contenedor
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
              width: '100%', // Ocupa todo el ancho del contenedor
              maxWidth: '400px', // Ancho máximo para evitar que sean demasiado grandes
            }}
          >
            Baja
          </Button>
        </Box>
      )}




      {current === 'down' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 4,
            bgcolor: 'background.paper',
            alignItems: 'center',
            height: 400,
            gap: 2,
          }}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              label="Descripción"
              value={taskDescription || "Equipo vendido"} // Valor predeterminado
              disabled // Campo no editable
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Condición</InputLabel>
              <Select
                value={condicion || "no operativo"} // Valor predeterminado
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
                value={falla || "dado de baja"} // Valor predeterminado
                disabled // Campo no editable
              >
                <MenuItem value="dado de baja">Dado de baja</MenuItem>
              </Select>
            </FormControl>
          </form>

          <Button
            variant="contained"
            color="error"
            startIcon={<PowerOffIcon />}
            sx={{
              fontSize: '16px',
              padding: '10px 20px',
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
              padding: '10px 20px',
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Volver
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
            width: { xs: '90%', sm: 600 },
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

    </Box>

  );
});

export default FormEquipament;


