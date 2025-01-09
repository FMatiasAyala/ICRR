import React, { useState, forwardRef } from 'react';
import { Box, Typography, TextField, Button, Autocomplete, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiMantenimiento } from '../../utils/Fetch';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';

const FormEquipamentM = forwardRef(({ equipos, tecnicos, handleClose, onEventCreate }, ref) => {
    const [taskDescription, setTaskDescription] = useState('');
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [selectedEquipo, setSelectedEquipo] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [tipoMantenimiento, setTipoMantenimiento] = useState(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [startTime, setStartTime] = useState(null); // "Desde"
    const [endTime, setEndTime] = useState(null); // "Hasta"
    const handleDateChange = (newValue) => {
        const currentDate = new Date();
        const chosenDate = new Date(newValue);

        // Ajustamos ambas fechas para que la hora sea 00:00:00
        currentDate.setHours(0, 0, 0, 0);
        chosenDate.setHours(0, 0, 0, 0);

        // Validamos si la fecha es anterior o igual a la actual
        if (chosenDate < currentDate) {
            setSnackbarMessage("No se puede seleccionar una fecha anterior al día actual.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } else if (chosenDate.getTime() === currentDate.getTime()) {
            setSnackbarMessage("No se puede seleccionar la fecha actual.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } else {
            setSelectedDate(newValue); // Si es válida, actualizamos la fecha seleccionada
        }
    };



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
            desde: startTime ? format(startTime, "HH:mm") : null, // Hora de inicio
            hasta: endTime ? format(endTime, "HH:mm") : null, // Hora de fin
            empresa: selectedTechnician?.empresa || null,
            descripcion: tipoMantenimiento || null,
            comentario: taskDescription || null,
            id_tecnico: selectedTechnician?.id_tecnico || null,
            id_equipo: equipos.id,
            estado: 'PROGRAMADO',
            id_usuario: userId
        };

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
                setSnackbarOpen(true);
                onEventCreate();
            } else if (response.status === 400) {
                setSnackbarMessage('No se puede asignar una fecha anterior a la actual.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } catch (error) {
            setSnackbarMessage('Error en la solicitud.');
            setSnackbarSeverity('error');
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


    return (
        <Box
            ref={ref}
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 600 },
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 4,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}

        >
            <Typography variant="h6" mb={2}>Cargar Nuevo Mantenimiento</Typography>
            <form onSubmit={handleSubmit}>
                {/* Bloque Descripción */}
                <Box>
                    <FormControl fullWidth
                    sx={{ marginBottom: '5px' }}>
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
                        multiline
                        sx={{ marginBottom: '5px' }}
                        rows={4}
                        required
                    />
                </Box>

                {/* Bloque Selección de Técnico */}
                <Box>
                    <Autocomplete
                        options={tecnicos}
                        sx={{ marginBottom: '5px' }}
                        value={selectedTechnician}
                        onChange={(event, newValue) => setSelectedTechnician(newValue)}
                        getOptionLabel={(option) => option?.nombre || ""}
                        renderInput={(params) => (
                            <TextField {...params} label="Seleccionar Técnico" required />
                        )}
                    />
                </Box>

                {/* Bloque Selección de Fecha y Horas */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{ display: 'flex', gap: 2 }}>

                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <DatePicker
                            label="Fecha"
                            value={selectedDate}
                            onChange={handleDateChange}
                            disableOpenPicker
                            renderInput={(params) => (
                                <TextField {...params} fullWidth required />
                            )}
                        />
                        <TimePicker
                            label="Hora de Inicio"
                            value={startTime}
                            onChange={(newValue) => setStartTime(newValue)}
                            ampm={false}
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
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" color="primary" type="submit">Guardar</Button>
                    <Button variant="outlined" color="secondary" onClick={handleClose}>Cancelar</Button>
                </Box>
            </form>
            {/* Snackbar */}
            <Snackbar open={snackbarOpen} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    )
})


export default FormEquipamentM;